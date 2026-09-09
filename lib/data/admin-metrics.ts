import { cache } from "react";
import type { AdminBadges } from "@/components/admin/shell/admin-nav-config";
import {
  getAllProducts,
  getAllWorkshops,
  getPublishedProducts,
  getSettings,
  remainingSeats,
} from "@/lib/data/queries";
import { ensureOrdersHydrated } from "@/lib/data/order-persist";
import { runtimeStore } from "@/lib/data/runtime-store";
import type { OrderStatus } from "@/lib/types";

const OPEN_ORDER_STATUSES: OrderStatus[] = ["pending", "paid", "processing"];

export function getAdminBadges(): AdminBadges {
  ensureOrdersHydrated();
  const catalog = getAllProducts();
  const lowStock = catalog.filter((product) =>
    product.variants.some(
      (variant) => variant.stockQuantity > 0 && variant.stockQuantity <= product.lowStockThreshold,
    ),
  ).length;

  const orders = runtimeStore.orders.filter((order) => OPEN_ORDER_STATUSES.includes(order.status)).length;
  const b2b = runtimeStore.b2b.length;

  return { orders, lowStock, b2b };
}

export const getDashboardMetrics = cache(function getDashboardMetrics() {
  ensureOrdersHydrated();
  const catalog = getAllProducts();
  const published = getPublishedProducts();
  const orders = [...runtimeStore.orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const revenue = orders.reduce((sum, order) => sum + order.totalAmountInCents, 0);
  const aov = orders.length ? revenue / orders.length : 0;

  const lowStockProducts = catalog.filter((product) =>
    product.variants.some(
      (variant) => variant.stockQuantity > 0 && variant.stockQuantity <= product.lowStockThreshold,
    ),
  );

  const outOfStock = catalog.filter((product) =>
    product.variants.every((variant) => variant.stockQuantity <= 0),
  );

  const statusCounts = orders.reduce(
    (acc, order) => {
      acc[order.status] = (acc[order.status] ?? 0) + 1;
      return acc;
    },
    {} as Partial<Record<OrderStatus, number>>,
  );

  const tightWorkshops = getAllWorkshops().filter((workshop) => remainingSeats(workshop) <= 2);

  return {
    orderCount: orders.length,
    revenue,
    aov,
    publishedCount: published.length,
    draftCount: catalog.length - published.length,
    lowStockProducts,
    outOfStockCount: outOfStock.length,
    recentOrders: orders.slice(0, 6),
    statusCounts,
    tightWorkshops,
    b2bCount: runtimeStore.b2b.length,
    settings: getSettings(),
  };
});
