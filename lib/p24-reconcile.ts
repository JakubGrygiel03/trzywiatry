import "server-only";

import { flushAtelierSave } from "@/lib/data/atelier-persist";
import { flushOrdersSave } from "@/lib/data/order-persist";
import { updateOrderStatusInStore } from "@/lib/data/runtime-store";
import { getP24TransactionBySessionId, verifyP24Transaction, type P24TransactionLookup } from "@/lib/p24";
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

/** P24 method 136 = traditional transfer (money can lag). */
const P24_TRADITIONAL_TRANSFER = 136;

function sessionCandidates(order: StoredOrder) {
  return [
    order.p24SessionId,
    order.orderNumber,
    typeof order.payload.p24SessionId === "string" ? order.payload.p24SessionId : undefined,
  ].filter((value, index, all): value is string => Boolean(value) && all.indexOf(value) === index);
}

function p24AmountMatches(p24Amount: number, orderCents: number) {
  if (p24Amount === orderCents) return true;
  // Rare P24 payloads use zł instead of grosze.
  return p24Amount > 0 && p24Amount * 100 === orderCents;
}

function outcomeFromUnpaid(tx: P24TransactionLookup): PaymentOutcomeKey {
  // 1 = payment advanced (not settled) — classic “czekamy na wpływ”.
  if (tx.status === 1) return "awaiting";
  // 3 = returned / refunded.
  if (tx.status === 3) return "error";
  if (tx.status !== 0) return "retry";
  if (!tx.paymentMethod) return "none";
  if (tx.paymentMethod === P24_TRADITIONAL_TRANSFER) return "awaiting";
  // Method chosen but status still 0: rejected BLIK/card or sandbox “Błąd płatności”.
  return "error";
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

    // Status 2 = payment made. Only then can we mark paid or flag a wrong amount.
    if (tx.status === 2) {
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
    return { order, outcome: outcomeFromUnpaid(latestUnpaid), transaction: latestUnpaid };
  }
  if (settledMismatch) {
    return { order, outcome: "amount", transaction: settledMismatch };
  }
  if (verifyFailed) {
    return { order, outcome: "error", transaction: verifyFailed };
  }
  return { order, outcome: "awaiting", transaction: null };
}
