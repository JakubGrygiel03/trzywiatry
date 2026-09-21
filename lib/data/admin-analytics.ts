import { cache } from "react";
import { ensureOrdersHydrated } from "@/lib/data/order-persist";
import { runtimeStore } from "@/lib/data/runtime-store";
import {
  orderPaymentDisplay,
  paymentMethodBucket,
  type PaymentMethodBucket,
} from "@/lib/p24-methods";
import type { OrderStatus, StoredOrder } from "@/lib/types";

/** Statuses that count as real studio revenue (money in / packing). */
const PAID_STATUSES: OrderStatus[] = ["paid", "processing", "shipped", "completed"];

function isPaid(order: StoredOrder) {
  return PAID_STATUSES.includes(order.status);
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return startOfDay(d);
}

export type MethodBreakdownRow = {
  bucket: PaymentMethodBucket;
  orderCount: number;
  totalInCents: number;
  share: number;
};

export type DailyRevenueRow = {
  date: string;
  label: string;
  totalInCents: number;
  orderCount: number;
};

export type AnalyticsSnapshot = {
  paidRevenueInCents: number;
  paidOrderCount: number;
  aovInCents: number;
  pendingInCents: number;
  pendingCount: number;
  cancelledCount: number;
  allOrderCount: number;
  last7RevenueInCents: number;
  last30RevenueInCents: number;
  byMethod: MethodBreakdownRow[];
  daily: DailyRevenueRow[];
  recentPaid: Array<{
    id: string;
    orderNumber: string;
    createdAt: string;
    totalInCents: number;
    method: string;
    status: OrderStatus;
  }>;
};

export const getAnalyticsSnapshot = cache(async function getAnalyticsSnapshot(): Promise<AnalyticsSnapshot> {
  await ensureOrdersHydrated();
  const orders = [...runtimeStore.orders];
  const paid = orders.filter(isPaid);
  const pending = orders.filter((o) => o.status === "pending");

  const paidRevenueInCents = paid.reduce((s, o) => s + o.totalAmountInCents, 0);
  const paidOrderCount = paid.length;
  const aovInCents = paidOrderCount ? Math.round(paidRevenueInCents / paidOrderCount) : 0;

  const since7 = daysAgo(7).getTime();
  const since30 = daysAgo(30).getTime();
  const last7RevenueInCents = paid
    .filter((o) => new Date(o.paidAt ?? o.createdAt).getTime() >= since7)
    .reduce((s, o) => s + o.totalAmountInCents, 0);
  const last30RevenueInCents = paid
    .filter((o) => new Date(o.paidAt ?? o.createdAt).getTime() >= since30)
    .reduce((s, o) => s + o.totalAmountInCents, 0);

  const methodMap = new Map<PaymentMethodBucket, { count: number; total: number }>();
  for (const order of orders) {
    const bucket = paymentMethodBucket(
      orderPaymentDisplay(order),
      order.status,
      order.paymentProvider,
    );
    const cur = methodMap.get(bucket) ?? { count: 0, total: 0 };
    cur.count += 1;
    if (isPaid(order)) cur.total += order.totalAmountInCents;
    methodMap.set(bucket, cur);
  }

  const byMethod: MethodBreakdownRow[] = [...methodMap.entries()]
    .map(([bucket, { count, total }]) => ({
      bucket,
      orderCount: count,
      totalInCents: total,
      share: paidRevenueInCents > 0 ? total / paidRevenueInCents : 0,
    }))
    .sort((a, b) => b.totalInCents - a.totalInCents || b.orderCount - a.orderCount);

  // Last 14 calendar days of paid revenue
  const dailyMap = new Map<string, { total: number; count: number }>();
  for (let i = 13; i >= 0; i--) {
    const d = daysAgo(i);
    const key = d.toISOString().slice(0, 10);
    dailyMap.set(key, { total: 0, count: 0 });
  }
  for (const order of paid) {
    const key = new Date(order.paidAt ?? order.createdAt).toISOString().slice(0, 10);
    const row = dailyMap.get(key);
    if (!row) continue;
    row.total += order.totalAmountInCents;
    row.count += 1;
  }
  const fmt = new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "short" });
  const daily: DailyRevenueRow[] = [...dailyMap.entries()].map(([date, row]) => ({
    date,
    label: fmt.format(new Date(date + "T12:00:00")),
    totalInCents: row.total,
    orderCount: row.count,
  }));

  const recentPaid = [...paid]
    .sort(
      (a, b) =>
        new Date(b.paidAt ?? b.createdAt).getTime() - new Date(a.paidAt ?? a.createdAt).getTime(),
    )
    .slice(0, 12)
    .map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      createdAt: o.paidAt ?? o.createdAt,
      totalInCents: o.totalAmountInCents,
      method: orderPaymentDisplay(o),
      status: o.status,
    }));

  return {
    paidRevenueInCents,
    paidOrderCount,
    aovInCents,
    pendingInCents: pending.reduce((s, o) => s + o.totalAmountInCents, 0),
    pendingCount: pending.length,
    cancelledCount: orders.filter((o) => o.status === "cancelled").length,
    allOrderCount: orders.length,
    last7RevenueInCents,
    last30RevenueInCents,
    byMethod,
    daily,
    recentPaid,
  };
});
