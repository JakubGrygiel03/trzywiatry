import "server-only";

import { flushAtelierSave } from "@/lib/data/atelier-persist";
import { flushOrdersSave } from "@/lib/data/order-persist";
import { updateOrderStatusInStore } from "@/lib/data/runtime-store";
import { getP24TransactionBySessionId, verifyP24Transaction, type P24TransactionLookup } from "@/lib/p24";
import { p24MethodLabel, isTraditionalTransfer, isDelayedPaymentMethod } from "@/lib/p24-methods";
import {
  outcomeFromUnpaidSnapshot,
  p24AmountMatches,
} from "@/lib/p24-session-outcome";
import type { PaymentOutcomeKey } from "@/lib/payment-outcome";
import { notifyCustomerOrderStatus } from "@/lib/resend";
import { notifyStudioOrderPaid } from "@/lib/studio-notify";
import type { StoredOrder } from "@/lib/types";

export type ReconcileResult = {
  order: StoredOrder;
  outcome: PaymentOutcomeKey;
  transaction: P24TransactionLookup | null;
};

function latestSessionId(order: StoredOrder) {
  const fromField = order.p24SessionId?.trim();
  const fromPayload =
    typeof order.payload.p24SessionId === "string" ? order.payload.p24SessionId.trim() : "";
  return fromField || fromPayload || "";
}

function attemptCount(order: StoredOrder) {
  const raw = order.payload.p24AttemptCount;
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

async function lookupSession(sessionId: string) {
  const first = await getP24TransactionBySessionId(sessionId);
  if (first) return first;
  await new Promise((resolve) => setTimeout(resolve, 400));
  return getP24TransactionBySessionId(sessionId);
}

async function markPaid(order: StoredOrder, tx: P24TransactionLookup): Promise<StoredOrder> {
  const methodId = tx.paymentMethod || undefined;
  const updated = updateOrderStatusInStore(order.id, "paid", undefined, {
    paymentProvider: "p24",
    paymentId: String(tx.orderId),
    paymentMethodId: methodId,
    paymentMethodLabel: p24MethodLabel(methodId),
    p24SessionId: tx.sessionId,
  });
  if (!updated) return order;
  await flushOrdersSave();
  await flushAtelierSave();
  await Promise.all([notifyCustomerOrderStatus(updated), notifyStudioOrderPaid(updated)]);
  return updated;
}

async function stampUnpaid(
  order: StoredOrder,
  tx: P24TransactionLookup,
  outcome: PaymentOutcomeKey,
): Promise<ReconcileResult> {
  const stamped = updateOrderStatusInStore(order.id, "pending", undefined, {
    paymentProvider: "p24",
    paymentMethodId: tx.paymentMethod || undefined,
    paymentMethodLabel: tx.paymentMethod ? p24MethodLabel(tx.paymentMethod) : undefined,
    p24SessionId: tx.sessionId,
    p24Outcome: outcome,
  });
  if (stamped) await flushOrdersSave();
  return { order: stamped ?? order, outcome, transaction: tx };
}

/** Status 1/2: Zapłać (verify) vs Oczekiwanie (verify refused) vs Nieprawidłowa kwota. */
async function settleCapturedPayment(
  order: StoredOrder,
  tx: P24TransactionLookup,
): Promise<ReconcileResult> {
  if (isTraditionalTransfer(tx.paymentMethod)) {
    return stampUnpaid(order, tx, "awaiting");
  }
  if (!p24AmountMatches(tx.amount, order.totalAmountInCents)) {
    if (tx.status === 2) return { order, outcome: "amount", transaction: tx };
    return stampUnpaid(order, tx, "awaiting");
  }
  const verified = await verifyP24Transaction({
    sessionId: tx.sessionId,
    orderId: tx.orderId,
    amount: order.totalAmountInCents,
  });
  if (!verified) {
    // Status 1 + delayed / no method = sandbox “Oczekiwanie”. Instant method = “Błąd płatności”.
    if (tx.status === 2) return stampUnpaid(order, tx, "error");
    if (!tx.paymentMethod || isDelayedPaymentMethod(tx.paymentMethod)) {
      return stampUnpaid(order, tx, "awaiting");
    }
    return stampUnpaid(order, tx, "error");
  }
  const paid = await markPaid(order, tx);
  if (paid.status !== "paid") {
    return stampUnpaid(order, tx, "awaiting");
  }
  return { order: paid, outcome: "paid", transaction: tx };
}

/**
 * Latest registered session only. Each sandbox button maps to its own screen.
 * A later “Zapłać ponownie” must not reuse the previous outcome stamp.
 */
export async function reconcilePendingOrderPayment(order: StoredOrder): Promise<ReconcileResult> {
  if (order.status !== "pending" && order.status !== "cancelled") {
    return { order, outcome: "paid", transaction: null };
  }
  if (order.status === "cancelled") {
    return { order, outcome: "none", transaction: null };
  }

  const sessionId = latestSessionId(order);
  const tx = sessionId ? await lookupSession(sessionId) : null;
  const attempts = attemptCount(order);

  if (tx) {
    if (tx.status === 1 || tx.status === 2) {
      return settleCapturedPayment(order, tx);
    }
    return stampUnpaid(order, tx, outcomeFromUnpaidSnapshot(tx, attempts));
  }

  if (isTraditionalTransfer(order.paymentMethodId)) {
    return { order, outcome: "awaiting", transaction: null };
  }
  return { order, outcome: attempts > 1 ? "retry" : "none", transaction: null };
}
