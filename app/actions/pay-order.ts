"use server";

import { redirect } from "next/navigation";
import { buildP24Session, hasP24Credentials, registerP24Transaction } from "@/lib/p24";
import { ensureOrdersHydrated } from "@/lib/data/order-persist";
import { getOrderByNumber } from "@/lib/data/runtime-store";
import { getRequestOrigin } from "@/lib/request-origin";

function confirmPath(orderNumber: string, orderId: string, extra: Record<string, string> = {}) {
  const params = new URLSearchParams({ order: orderNumber, k: orderId, ...extra });
  return `/zamowienie/potwierdzenie?${params}`;
}

/** Restarts P24 for a pending order from the thank-you page. */
export async function startPendingOrderPayment(formData: FormData) {
  const orderNumber = String(formData.get("orderNumber") ?? "");
  const orderId = String(formData.get("orderId") ?? "");
  await ensureOrdersHydrated();
  const order = getOrderByNumber(orderNumber);
  const origin = await getRequestOrigin();

  if (!order || order.id !== orderId || order.status !== "pending") {
    redirect(confirmPath(orderNumber || "brak", orderId || "brak"));
  }

  if (!hasP24Credentials()) {
    redirect(`${origin}${confirmPath(order.orderNumber, order.id, { pay: "0" })}`);
  }

  const registered = await registerP24Transaction(
    buildP24Session({
      sessionId: order.orderNumber,
      amountInCents: order.totalAmountInCents,
      email: order.customerEmail,
      description: `Trzy Wiatry ${order.orderNumber}`,
      urlReturn: `${origin}${confirmPath(order.orderNumber, order.id)}`,
      urlStatus: `${origin}/api/webhooks/p24`,
    }),
  );

  if (registered.ok) redirect(registered.redirectUrl);
  redirect(`${origin}${confirmPath(order.orderNumber, order.id, { pay: "0" })}`);
}
