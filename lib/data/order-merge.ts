import type { OrderStatus, StoredOrder } from "@/lib/types";

const STATUS_RANK: Record<OrderStatus, number> = {
  cancelled: 0,
  pending: 1,
  paid: 2,
  processing: 3,
  shipped: 4,
  completed: 5,
};

function pickOrder(a: StoredOrder, b: StoredOrder) {
  const rankA = STATUS_RANK[a.status] ?? 0;
  const rankB = STATUS_RANK[b.status] ?? 0;
  if (rankA !== rankB) return rankA > rankB ? a : b;
  return a.updatedAt >= b.updatedAt ? a : b;
}

/** Union by order number so a stale serverless write cannot delete TW-0002. */
export function mergeOrderLists(sources: StoredOrder[][]) {
  const byNumber = new Map<string, StoredOrder>();
  for (const list of sources) {
    for (const order of list) {
      const key = order.orderNumber.trim().toUpperCase();
      if (!key) continue;
      const prev = byNumber.get(key);
      byNumber.set(key, prev ? pickOrder(prev, order) : order);
    }
  }
  return [...byNumber.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function orderNumberFromP24Session(sessionId: string) {
  return sessionId.match(/^(TW-\d+)/i)?.[1]?.toUpperCase() ?? null;
}
