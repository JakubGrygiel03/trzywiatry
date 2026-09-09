import { NextRequest, NextResponse } from "next/server";
import { ensureOrdersHydrated, saveOrdersToDisk } from "@/lib/data/order-persist";
import { runtimeStore, updateOrderStatusInStore } from "@/lib/data/runtime-store";
import { notifyCustomerOrderStatus } from "@/lib/resend";

/**
 * Przelewy24 status webhook.
 * When live keys are connected: verify CRC, then flip order to paid / processing.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    sessionId?: string;
    p24_session_id?: string;
  } | null;

  if (!body) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const sessionId = body.sessionId ?? body.p24_session_id;
  if (!sessionId) {
    return NextResponse.json({ error: "missing session" }, { status: 400 });
  }

  ensureOrdersHydrated();
  const order = runtimeStore.orders.find((item) => item.orderNumber === sessionId);
  if (order && (order.status === "pending" || order.status === "paid")) {
    const updated = updateOrderStatusInStore(order.id, "processing");
    if (updated) {
      saveOrdersToDisk();
      await notifyCustomerOrderStatus(updated);
    }
  }

  return NextResponse.json({ ok: true, received: true });
}
