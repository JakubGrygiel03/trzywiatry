"use server";

import { buildP24Session, newP24SessionId, registerP24Transaction } from "@/lib/p24";
import { resolvePaymentAccess } from "@/lib/payment-access";
import { ensureOrdersHydrated, flushOrdersSave } from "@/lib/data/order-persist";
import { getOrderByNumber, setOrderP24SessionInStore } from "@/lib/data/runtime-store";
import { getPublicSiteUrl } from "@/lib/site-url";

export type PayOrderState = {
  ok: boolean;
  redirectTo?: string;
  message?: string;
};

function confirmPath(orderNumber: string, orderId: string, extra: Record<string, string> = {}) {
  const params = new URLSearchParams({ order: orderNumber, k: orderId, ...extra });
  return `/zamowienie/potwierdzenie?${params}`;
}

/** Restarts P24 for a pending order from the thank-you page. */
export async function startPendingOrderPayment(
  _prev: PayOrderState,
  formData: FormData,
): Promise<PayOrderState> {
  const orderNumber = String(formData.get("orderNumber") ?? "");
  const orderId = String(formData.get("orderId") ?? "");
  await ensureOrdersHydrated({ force: true });
  const order = getOrderByNumber(orderNumber);
  const origin = getPublicSiteUrl();

  if (!order || order.id !== orderId || order.status !== "pending") {
    return { ok: false, message: "Nie znaleziono zamówienia do opłacenia." };
  }

  if (!(await resolvePaymentAccess()).canPay) {
    return { ok: false, message: "Płatności online są chwilowo niedostępne." };
  }

  // Unique session per retry — P24 rejects reusing the same sessionId after a failed attempt.
  const sessionId = newP24SessionId(order.orderNumber);

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

  if (registered.ok) {
    setOrderP24SessionInStore(order.id, sessionId);
    await flushOrdersSave();
    return { ok: true, redirectTo: registered.redirectUrl };
  }

  const payCode =
    registered.reason === "auth-failed" ? "auth" : registered.reason === "network-failed" ? "net" : "0";
  return {
    ok: false,
    message:
      payCode === "auth"
        ? "Przelewy24 odrzuciło klucz API. Spróbuj ponownie albo napisz do pracowni."
        : payCode === "net"
          ? "Nie udało się połączyć z Przelewy24. Sprawdź sieć i spróbuj ponownie."
          : "Płatność nie wystartowała. Spróbuj ponownie.",
  };
}
