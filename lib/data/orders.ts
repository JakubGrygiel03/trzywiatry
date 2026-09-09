import "server-only";
import { CUSTOMER_OPEN_STATUSES } from "@/lib/constants";
import { ensureOrdersHydrated } from "@/lib/data/order-persist";
import { getOrderById, runtimeStore } from "@/lib/data/runtime-store";
import type { StoredOrder } from "@/lib/types";

export function orderBelongsToCustomer(
  order: StoredOrder,
  user: { id: string; email: string },
) {
  if (order.userId && order.userId === user.id) return true;
  return order.customerEmail.toLowerCase() === user.email.toLowerCase();
}

export function getOrdersForCustomer(user: { id: string; email: string }): StoredOrder[] {
  ensureOrdersHydrated();
  return runtimeStore.orders
    .filter((order) => orderBelongsToCustomer(order, user))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getCustomerOrder(id: string, user: { id: string; email: string }): StoredOrder | null {
  ensureOrdersHydrated();
  const order = getOrderById(id);
  if (!order || !orderBelongsToCustomer(order, user)) return null;
  return order;
}

export function splitCustomerOrders(orders: StoredOrder[]) {
  const open = orders.filter((order) => CUSTOMER_OPEN_STATUSES.includes(order.status));
  const history = orders.filter((order) => !CUSTOMER_OPEN_STATUSES.includes(order.status));
  return { open, history };
}
