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

/** Map an unpaid P24 session to a distinct customer screen. */
function outcomeFromUnpaid(tx: P24TransactionLookup): PaymentOutcomeKey {
  if (tx.status === 3) return "error";
  if (tx.status === 1 || isTraditionalTransfer(tx.paymentMethod)) return "awaiting";
  if (!tx.paymentMethod) return "none";
  return "error";
}

function sessionCandidates(order: StoredOrder) {
  return [
    order.p24SessionId,
    order.orderNumber,
    typeof order.payload.p24SessionId === "string" ? order.payload.p24SessionId : undefined,
  ].filter((value, index, all): value is string => Boolean(value) && all.indexOf(value) === index);
}

function p24AmountMatches(p24Amount: number, orderCents: number) {
  if (p24Amount === orderCents) return true;
  return p24Amount > 0 && p24Amount * 100 === orderCents;
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
 * After return from Przelewy24: map the latest session to a customer outcome.
 * “Nieprawidłowa kwota” only when P24 reports a settled payment with the wrong sum.
 */
export async function reconcilePendingOrderPayment(order: StoredOrder): Promise<ReconcileResult> {
  if (order.status !== "pending" && order.status !== "cancelled") {
    return { order, outcome: "paid", transaction: null };
  }
  if (order.status === "cancelled") {
    return { order, outcome: "none", transaction: null };
  }

  let latestUnpaid: P24TransactionLookup | null = null;
  let settledMismatch: P24TransactionLookup | null = null;
  let verifyFailed: P24TransactionLookup | null = null;

  for (const sessionId of sessionCandidates(order)) {
    const tx = await getP24TransactionBySessionId(sessionId);
    if (!tx) continue;

    const match = p24AmountMatches(tx.amount, order.totalAmountInCents);

    // Status 2 = settled. Traditional transfer still waits for admin to tick “Opłacone”.
    if (tx.status === 2) {
      if (isTraditionalTransfer(tx.paymentMethod)) {
        latestUnpaid = latestUnpaid ?? tx;
        continue;
      }
      if (!match) {
        settledMismatch = settledMismatch ?? tx;
        continue;
      }
      const verified = await verifyP24Transaction({
        sessionId: tx.sessionId,
        orderId: tx.orderId,
        amount: order.totalAmountInCents,
      });
      if (!verified) {
        verifyFailed = verifyFailed ?? tx;
        continue;
      }
      const paid = await markPaid(order, tx);
      if (paid.status !== "paid") {
        return { order: paid, outcome: "error", transaction: tx };
      }
      return { order: paid, outcome: "paid", transaction: tx };
    }

    latestUnpaid = latestUnpaid ?? tx;
  }

  if (latestUnpaid) {
    const outcome = outcomeFromUnpaid(latestUnpaid);
    let next = order;
    if (outcome === "awaiting" && latestUnpaid.paymentMethod) {
      const stamped = updateOrderStatusInStore(order.id, "pending", undefined, {
        paymentProvider: "p24",
        paymentMethodId: latestUnpaid.paymentMethod,
        paymentMethodLabel: p24MethodLabel(latestUnpaid.paymentMethod),
        p24SessionId: latestUnpaid.sessionId,
      });
      if (stamped) {
        next = stamped;
        await flushOrdersSave();
      }
    }
    return { order: next, outcome, transaction: latestUnpaid };
  }
  if (settledMismatch) {
    return { order, outcome: "amount", transaction: settledMismatch };
  }
  if (verifyFailed) {
    return { order, outcome: "error", transaction: verifyFailed };
  }
  if (isTraditionalTransfer(order.paymentMethodId)) {
    return { order, outcome: "awaiting", transaction: null };
  }
  return { order, outcome: "none", transaction: null };
}
