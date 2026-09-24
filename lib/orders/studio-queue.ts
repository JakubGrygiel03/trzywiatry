import type { StoredOrder } from "@/lib/types";

const ABANDONED_OUTCOMES = new Set(["none", "error", "retry"]);

function payloadOutcome(order: StoredOrder) {
  const raw = order.payload?.p24Outcome;
  return typeof raw === "string" ? raw : "";
}

/** Customer backed out of P24 or never paid — keep the order for them, not in the studio queue. */
export function isAbandonedCheckout(order: StoredOrder) {
  if (order.status !== "pending") return false;
  return ABANDONED_OUTCOMES.has(payloadOutcome(order));
}

export function isStudioQueueOrder(order: StoredOrder) {
  if (order.status === "cancelled") return false;
  if (isAbandonedCheckout(order)) return false;
  return order.status === "pending" || order.status === "paid" || order.status === "processing";
}
