"use server";

import { redirect } from "next/navigation";
import { buildP24Session, registerP24Transaction } from "@/lib/p24";
import { resolvePaymentAccess } from "@/lib/payment-access";
import { ensureOrdersHydrated } from "@/lib/data/order-persist";
import { getOrderByNumber } from "@/lib/data/runtime-store";
import { getPublicSiteUrl } from "@/lib/site-url";

function confirmPath(orderNumber: string, orderId: string, extra: Record<string, string> = {}) {
  const params = new URLSearchParams({ order: orderNumber, k: orderId, ...extra });
  return `/zamowienie/potwierdzenie?${params}`;
}

/** Restarts P24 for a pending order from the thank-you page. */
export async function startPendingOrderPayment(formData: FormData) {
  const orderNumber = String(formData.get("orderNumber") ?? "");
  const orderId = String(formData.get("orderId") ?? "");
  await ensureOrdersHydrated({ force: true });
  const order = getOrderByNumber(orderNumber);
  const origin = getPublicSiteUrl();

  if (!order || order.id !== orderId || order.status !== "pending") {
    redirect(confirmPath(orderNumber || "brak", orderId || "brak"));
  }

  if (!(await resolvePaymentAccess()).canPay) {
    redirect(`${origin}${confirmPath(order.orderNumber, order.id, { pay: "0" })}`);
  }

  // Unique session per retry — P24 rejects reusing the same sessionId after a failed attempt.
  const sessionId = `${order.orderNumber}-${Date.now().toString(36)}`;

  const registered = await registerP24Transaction(
    buildP24Session({
      sessionId,
      amountInCents: order.totalAmountInCents,
      email: order.customerEmail,
      description: `Trzy Wiatry ${order.orderNumber}`,
      urlReturn: `${origin}${confirmPath(order.orderNumber, order.id)}`,
      urlStatus: `${origin}/api/webhooks/p24`,
    }),
  );

  if (registered.ok) redirect(registered.redirectUrl);

  const payCode =
    registered.reason === "auth-failed" ? "auth" : registered.reason === "network-failed" ? "net" : "0";
  redirect(`${origin}${confirmPath(order.orderNumber, order.id, { pay: payCode })}`);
}
