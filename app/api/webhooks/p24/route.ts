import { NextRequest, NextResponse } from "next/server";
import { ensureOrdersHydrated, flushOrdersSave } from "@/lib/data/order-persist";
import { flushAtelierSave } from "@/lib/data/atelier-persist";
import { getOrderByNumber, updateOrderStatusInStore } from "@/lib/data/runtime-store";
import { p24NotificationValid, type P24Notification } from "@/lib/p24";
import { notifyCustomerOrderStatus } from "@/lib/resend";

/**
 * Przelewy24 status webhook.
 * CRC must match; then flip pending → paid (admin starts packing from there).
 */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as P24Notification | null;
  if (!body) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  if (!p24NotificationValid(body)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const sessionId = body.sessionId ?? body.p24_session_id;
  if (!sessionId) {
    return NextResponse.json({ error: "missing session" }, { status: 400 });
  }

  await ensureOrdersHydrated();
  const order = getOrderByNumber(sessionId);
  if (!order) {
    return NextResponse.json({ error: "unknown session" }, { status: 404 });
  }

  if (body.amount != null && Number(body.amount) !== order.totalAmountInCents) {
    return NextResponse.json({ error: "amount mismatch" }, { status: 400 });
  }

  if (order.status === "pending") {
    const updated = updateOrderStatusInStore(order.id, "paid");
    if (updated) {
      await flushOrdersSave();
      await flushAtelierSave();
      await notifyCustomerOrderStatus(updated);
    }
  }

  return NextResponse.json({ ok: true, received: true });
}
