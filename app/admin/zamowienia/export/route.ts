import { NextRequest, NextResponse } from "next/server";
import { assertAdminSession } from "@/lib/admin-guard";
import { ensureOrdersHydrated } from "@/lib/data/order-persist";
import { runtimeStore } from "@/lib/data/runtime-store";
import { filterOrders, monthWindow, ordersInWindow, ordersToCsv } from "@/lib/reports/orders-csv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  await assertAdminSession();
  await ensureOrdersHydrated();

  const q = request.nextUrl.searchParams.get("q") ?? "";
  const month = request.nextUrl.searchParams.get("month") ?? "";
  let orders = [...runtimeStore.orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  if (month) orders = ordersInWindow(orders, monthWindow(month));
  orders = filterOrders(orders, q);

  const csv = ordersToCsv(orders);
  const stamp = month || new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="trzywiatry-zamowienia-${stamp}.csv"`,
    },
  });
}
