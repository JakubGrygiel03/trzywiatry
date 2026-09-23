import Link from "next/link";
import { ClearCartOnMount } from "@/components/checkout/clear-cart-on-mount";
import { PaymentOutcomePanel } from "@/components/checkout/payment-outcome-panel";
import { PendingPaymentRefresh } from "@/components/checkout/pending-payment-refresh";
import { Container, SectionHeading } from "@/components/ui/badge";
import { ORDER_STATUS_HINTS, ORDER_STATUS_LABELS } from "@/lib/constants";
import { ensureOrdersHydrated } from "@/lib/data/order-persist";
import { getOrderByNumber } from "@/lib/data/runtime-store";
import { formatPLN } from "@/lib/format";
import { reconcilePendingOrderPayment } from "@/lib/p24-reconcile";
import {
  alignOutcomeWithOrderStatus,
  parsePaymentOutcomeParam,
  type PaymentOutcomeKey,
} from "@/lib/payment-outcome";
import { resolvePaymentAccess } from "@/lib/payment-access";
import { noIndexRobots } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Potwierdzenie zamówienia",
  description: "Status zamówienia w pracowni Trzy Wiatry.",
  robots: noIndexRobots,
};

function orderLead(orderNumber: string, sentence: string) {
  return `Numer ${orderNumber} · ${sentence.trim()}`;
}

function outcomeFromPayParam(pay: string | undefined): PaymentOutcomeKey | null {
  if (!pay) return null;
  if (pay === "auth" || pay === "net") return "error";
  if (pay === "0") return "retry";
  return null;
}

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; k?: string; mail?: string; pay?: string; wynik?: string }>;
}) {
  const { order: orderNumber, k, mail, pay, wynik } = await searchParams;
  await ensureOrdersHydrated({ force: true });
  const record = orderNumber ? getOrderByNumber(orderNumber) : null;
  let order = record && k && record.id === k ? record : null;

  const { canPay, isTester } = await resolvePaymentAccess();

  let candidate: PaymentOutcomeKey = "awaiting";

  // Preview of UI branches — admin tester only (never fake “paid” for real customers).
  const forced = isTester ? parsePaymentOutcomeParam(wynik) : null;
  if (forced) {
    candidate = forced;
  } else if (order?.status === "pending") {
    const reconciled = await reconcilePendingOrderPayment(order);
    order = reconciled.order;
    candidate = reconciled.outcome;
  } else if (order?.status === "cancelled") {
    candidate = "none";
  } else if (order) {
    candidate = "paid";
  }

  const payOutcome = outcomeFromPayParam(pay);
  if (!forced && payOutcome && order?.status === "pending") {
    candidate = payOutcome;
  }

  // Lock UI to the real order record — no “opłacone” without status paid, no “zapłać” after paid.
  const outcome = order
    ? alignOutcomeWithOrderStatus(order.status, candidate)
    : candidate;

  const firstName = order?.customerName.split(" ")[0] ?? "";
  const headingTitle = !order
    ? "Nie znaleziono zamówienia"
    : outcome === "paid"
      ? `Dziękujemy, ${firstName}`
      : "Zamówienie zapisane";
  const headingDescription = !order
    ? orderNumber
      ? `Szukaliśmy zamówienia ${orderNumber}, ale nie udało się go odczytać. Sprawdź maila albo konto.`
      : "Po płatności wróć linkiem z maila albo zaloguj się na konto."
    : orderLead(order.orderNumber, ORDER_STATUS_HINTS[order.status]);

  return (
    <div className="py-14 md:py-20">
      <Container className="max-w-2xl space-y-8">
        <SectionHeading eyebrow="Zamówienie" title={headingTitle} description={headingDescription} />
        {!order ? (
          <p className="text-sm text-czarny/60">
            Jeśli płatność przeszła w Przelewy24, zamówienie powinno być w panelu i na mailu pracowni. Napisz na
            kontakt, jeśli status się nie pojawi.
          </p>
        ) : null}
        {order ? (
          <>
            <ClearCartOnMount />
            <PendingPaymentRefresh pending={order.status === "pending"} />
            <div className="space-y-4 rounded-[28px] bg-krem p-6">
              <p className="font-heading text-sm uppercase tracking-[0.14em] text-czerwony">
                {ORDER_STATUS_LABELS[order.status]}
              </p>
              <ul className="space-y-2 text-sm">
                {order.items.map((item) => (
                  <li key={`${item.variantId}-${item.quantity}`} className="flex justify-between gap-3">
                    <span>
                      {item.productName} ({item.variantTitle}) × {item.quantity}
                    </span>
                    <span className="font-heading">{formatPLN(item.unitPriceInCents * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <p className="flex justify-between border-t border-czarny/10 pt-3 text-sm">
                <span>Razem</span>
                <span className="font-heading">{formatPLN(order.totalAmountInCents)}</span>
              </p>
            </div>
            <PaymentOutcomePanel
              outcome={outcome}
              orderStatus={order.status}
              orderNumber={order.orderNumber}
              orderId={order.id}
              canPay={canPay}
              isTester={isTester}
              mailFailed={mail === "0"}
              customerEmail={order.customerEmail}
            />
          </>
        ) : (
          <Link href="/sklep" className="text-sm text-czerwony underline-offset-2 hover:underline">
            Wróć do sklepu
          </Link>
        )}
      </Container>
    </div>
  );
}
