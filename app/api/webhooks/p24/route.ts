import { NextRequest, NextResponse } from "next/server";
import { ensureOrdersHydrated, flushOrdersSave } from "@/lib/data/order-persist";
import { flushAtelierSave } from "@/lib/data/atelier-persist";
import { getOrderByNumber, updateOrderStatusInStore } from "@/lib/data/runtime-store";
import { p24NotificationValid, verifyP24Transaction, type P24Notification } from "@/lib/p24";
import { notifyCustomerOrderStatus } from "@/lib/resend";
import { notifyStudioOrderPaid } from "@/lib/studio-notify";

async function readNotification(request: NextRequest): Promise<P24Notification | null> {
  const json = (await request.clone().json().catch(() => null)) as P24Notification | null;
  if (json && (json.sessionId || json.p24_session_id)) return json;

  const form = await request.formData().catch(() => null);
  if (!form) return json;
  const sessionId = String(form.get("sessionId") ?? form.get("p24_session_id") ?? "");
  if (!sessionId) return json;
  return {
    merchantId: Number(form.get("merchantId") ?? 0),
    posId: Number(form.get("posId") ?? 0),
    sessionId,
    amount: Number(form.get("amount") ?? 0),
    originAmount: Number(form.get("originAmount") ?? form.get("amount") ?? 0),
    currency: String(form.get("currency") ?? "PLN"),
    orderId: Number(form.get("orderId") ?? 0),
    methodId: Number(form.get("methodId") ?? 0),
    statement: String(form.get("statement") ?? ""),
    sign: String(form.get("sign") ?? ""),
  };
}

/**
 * Przelewy24 status webhook.
 * CRC must match, then PUT verify — P24 only settles after verify.
 */
export async function POST(request: NextRequest) {
  const body = await readNotification(request);
  if (!body) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  if (!p24NotificationValid(body)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const sessionId = body.sessionId ?? body.p24_session_id;
  if (!sessionId || body.orderId == null || body.amount == null) {
    return NextResponse.json({ error: "missing session" }, { status: 400 });
  }

  await ensureOrdersHydrated();
  const order = getOrderByNumber(sessionId);
  if (!order) {
    return NextResponse.json({ error: "unknown session" }, { status: 404 });
  }

  if (Number(body.amount) !== order.totalAmountInCents) {
    return NextResponse.json({ error: "amount mismatch" }, { status: 400 });
  }

  const verified = await verifyP24Transaction({
    sessionId,
    orderId: Number(body.orderId),
    amount: Number(body.amount),
  });
  if (!verified) {
    return NextResponse.json({ error: "verify failed" }, { status: 502 });
  }

  if (order.status === "pending") {
    const updated = updateOrderStatusInStore(order.id, "paid");
    if (updated) {
      await flushOrdersSave();
      await flushAtelierSave();
      await Promise.all([notifyCustomerOrderStatus(updated), notifyStudioOrderPaid(updated)]);
    }
  }

  return NextResponse.json({ ok: true, received: true });
}
