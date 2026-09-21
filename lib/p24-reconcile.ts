import "server-only";

import { flushAtelierSave } from "@/lib/data/atelier-persist";
import { flushOrdersSave } from "@/lib/data/order-persist";
import { updateOrderStatusInStore } from "@/lib/data/runtime-store";
import {
  getP24TransactionBySessionId,
  isP24TransactionPaid,
  verifyP24Transaction,
  type P24TransactionLookup,
} from "@/lib/p24";
import { p24MethodLabel } from "@/lib/p24-methods";
import type { PaymentOutcomeKey } from "@/lib/payment-outcome";
import { notifyCustomerOrderStatus } from "@/lib/resend";
import { notifyStudioOrderPaid } from "@/lib/studio-notify";
import type { StoredOrder } from "@/lib/types";

export type ReconcileResult = {
  order: StoredOrder;
  outcome: PaymentOutcomeKey;
  transaction: P24TransactionLookup | null;
};

function sessionCandidates(order: StoredOrder) {
  return [
    order.p24SessionId,
    order.orderNumber,
    typeof order.payload.p24SessionId === "string" ? order.payload.p24SessionId : undefined,
  ].filter((value, index, all): value is string => Boolean(value) && all.indexOf(value) === index);
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

/**
 * After return from Przelewy24 (live or sandbox): ask P24 for the session and
 * map it to a customer outcome (paid / awaiting transfer / error / …).
 */
export async function reconcilePendingOrderPayment(order: StoredOrder): Promise<ReconcileResult> {
  if (order.status !== "pending" && order.status !== "cancelled") {
    return { order, outcome: "paid", transaction: null };
  }
  if (order.status === "cancelled") {
    return { order, outcome: "none", transaction: null };
  }

  let sawTx = false;
  let amountMismatch = false;
  let verifyFailed = false;
  let latest: P24TransactionLookup | null = null;

  for (const sessionId of sessionCandidates(order)) {
    const tx = await getP24TransactionBySessionId(sessionId);
    if (!tx) continue;
    sawTx = true;
    latest = tx;

    if (tx.amount !== order.totalAmountInCents) {
      amountMismatch = true;
      continue;
    }

    if (!isP24TransactionPaid(tx.status)) {
      // status 0 = no payment yet / waiting for traditional transfer
      continue;
    }

    const verified = await verifyP24Transaction({
      sessionId: tx.sessionId,
      orderId: tx.orderId,
      amount: tx.amount,
    });
    if (!verified) {
      verifyFailed = true;
      continue;
    }

    const paid = await markPaid(order, tx);
    // Only claim paid after status is persisted as paid.
    if (paid.status !== "paid") {
      return { order: paid, outcome: "error", transaction: tx };
    }
    return { order: paid, outcome: "paid", transaction: tx };
  }

  if (amountMismatch) {
    return { order, outcome: "amount", transaction: latest };
  }
  if (verifyFailed) {
    return { order, outcome: "error", transaction: latest };
  }
  if (sawTx && latest && latest.status === 0) {
    // Session exists but unpaid — classic “Oczekiwanie na wpłatę” / “Brak wpłaty”.
    // Prefer awaiting when payment method looks like slow transfer (no method yet → none/retry).
    return {
      order,
      outcome: latest.paymentMethod ? "awaiting" : "none",
      transaction: latest,
    };
  }
  if (sawTx) {
    return { order, outcome: "retry", transaction: latest };
  }

  // No P24 session found yet (webhook/register lag) — keep awaiting with refresh.
  return { order, outcome: "awaiting", transaction: null };
}
