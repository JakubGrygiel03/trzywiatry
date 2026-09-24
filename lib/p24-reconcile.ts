import "server-only";

import { flushAtelierSave } from "@/lib/data/atelier-persist";
import { flushOrdersSave } from "@/lib/data/order-persist";
import { updateOrderStatusInStore } from "@/lib/data/runtime-store";
import { getP24TransactionBySessionId, verifyP24Transaction, type P24TransactionLookup } from "@/lib/p24";
import { p24MethodLabel, isTraditionalTransfer } from "@/lib/p24-methods";
import type { PaymentOutcomeKey } from "@/lib/payment-outcome";
import { notifyCustomerOrderStatus } from "@/lib/resend";
import { notifyStudioOrderPaid } from "@/lib/studio-notify";
import type { StoredOrder } from "@/lib/types";

export type ReconcileResult = {
  order: StoredOrder;
  outcome: PaymentOutcomeKey;
  transaction: P24TransactionLookup | null;
};

/**
 * Unpaid P24 GET (status 0 / 3). Official codes:
 * 0 = no funds yet · 3 = rejected / returned.
 * Sandbox “Oczekiwanie na wpłatę” is 0 with a method — not a failed BLIK.
 */
function outcomeFromUnpaid(tx: P24TransactionLookup): PaymentOutcomeKey {
  if (isTraditionalTransfer(tx.paymentMethod)) return "awaiting";
  if (tx.status === 3) return "error";
  if (!tx.paymentMethod) return "none";
  return "awaiting";
}

/** Only the latest register() session. Falling back to orderNumber re-reads the first failed try. */
function latestSessionId(order: StoredOrder) {
  const fromField = order.p24SessionId?.trim();
  const fromPayload =
    typeof order.payload.p24SessionId === "string" ? order.payload.p24SessionId.trim() : "";
  return fromField || fromPayload || order.orderNumber;
}

function p24AmountMatches(p24Amount: number, orderCents: number) {
  if (p24Amount === orderCents) return true;
  return p24Amount > 0 && p24Amount * 100 === orderCents;
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

/**
 * Status 1 = funds at P24, merchant verify still pending (sandbox “Zapłać” before webhook).
 * Status 2 = already verified. Traditional transfer stays awaiting for the studio tick.
 */
async function settleCapturedPayment(
  order: StoredOrder,
  tx: P24TransactionLookup,
): Promise<ReconcileResult> {
  if (isTraditionalTransfer(tx.paymentMethod)) {
    return stampUnpaid(order, tx, "awaiting");
  }
  if (!p24AmountMatches(tx.amount, order.totalAmountInCents)) {
    return { order, outcome: "amount", transaction: tx };
  }
  const verified = await verifyP24Transaction({
    sessionId: tx.sessionId,
    orderId: tx.orderId,
    amount: order.totalAmountInCents,
  });
  if (!verified) {
    return stampUnpaid(order, tx, "awaiting");
  }
  const paid = await markPaid(order, tx);
  if (paid.status !== "paid") {
    return stampUnpaid(order, tx, "awaiting");
  }
  return { order: paid, outcome: "paid", transaction: tx };
}

/**
 * After return from Przelewy24: map the latest session to a customer outcome.
 * “Nieprawidłowa kwota” only when P24 reports a captured payment with the wrong sum.
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

  if (tx) {
    if (tx.status === 1 || tx.status === 2) {
      return settleCapturedPayment(order, tx);
    }
    return stampUnpaid(order, tx, outcomeFromUnpaid(tx));
  }

  if (isTraditionalTransfer(order.paymentMethodId)) {
    return { order, outcome: "awaiting", transaction: null };
  }
  if (order.payload.p24Outcome === "awaiting") {
    return { order, outcome: "awaiting", transaction: null };
  }
  return { order, outcome: "none", transaction: null };
}
