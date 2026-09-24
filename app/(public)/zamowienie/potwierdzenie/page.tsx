import Link from "next/link";
import { ClearCartOnMount } from "@/components/checkout/clear-cart-on-mount";
import { PaymentOutcomePanel } from "@/components/checkout/payment-outcome-panel";
import { Container } from "@/components/ui/badge";
import { SurfaceTile, SurfaceTileBody, SurfaceTileHeader } from "@/components/ui/surface-tile";
import { ORDER_STATUS_HINTS, ORDER_STATUS_LABELS } from "@/lib/constants";
import { ensureOrdersHydrated } from "@/lib/data/order-persist";
import { getOrderByNumber } from "@/lib/data/runtime-store";
import { formatPLN } from "@/lib/format";
import { reconcilePendingOrderPayment } from "@/lib/p24-reconcile";
import { outcomeFromP24ReturnQuery } from "@/lib/p24-session-outcome";
import {
  alignOutcomeWithOrderStatus,
  PAYMENT_OUTCOMES,
  type PaymentOutcomeKey,
} from "@/lib/payment-outcome";
import { resolvePaymentAccess } from "@/lib/payment-access";
import { noIndexRobots } from "@/lib/seo";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Potwierdzenie zamówienia",
  description: "Status zamówienia w pracowni Trzy Wiatry.",
  robots: noIndexRobots,
};

function tileAccent(outcome: PaymentOutcomeKey) {
  if (outcome === "paid") return "border-l-[3px] border-l-czerwony";
  if (outcome === "awaiting") return "border-l-[3px] border-l-ceglany";
  if (outcome === "error" || outcome === "amount") return "border-l-[3px] border-l-czerwony";
  if (outcome === "retry") return "border-l-[3px] border-l-ceglany";
  return "border-l-[3px] border-l-szary";
}

function firstQuery(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const orderNumber = firstQuery(raw.order);
  const k = firstQuery(raw.k);
  const mail = firstQuery(raw.mail);
  const pay = firstQuery(raw.pay);
  await ensureOrdersHydrated({ force: true });
  const record = orderNumber ? getOrderByNumber(orderNumber) : null;
  let order = record && k && record.id === k ? record : null;

  const { canPay } = await resolvePaymentAccess();

  let candidate: PaymentOutcomeKey = "none";

  if (order?.status === "pending") {
    const reconciled = await reconcilePendingOrderPayment(order);
    order = reconciled.order;
    candidate = reconciled.outcome;
  } else if (order?.status === "cancelled") {
    candidate = "none";
  } else if (order) {
    candidate = "paid";
  }

  const returnHint = outcomeFromP24ReturnQuery({
    result: firstQuery(raw.result),
    error: firstQuery(raw.error),
    p24_error: firstQuery(raw.p24_error),
    p24Error: firstQuery(raw.p24Error),
    status: firstQuery(raw.status),
    pay,
  });
  if (
    returnHint &&
    returnHint !== "paid" &&
    order?.status === "pending" &&
    candidate !== "paid" &&
    candidate !== "amount"
  ) {
    candidate = returnHint;
  }

  const outcome = order
    ? alignOutcomeWithOrderStatus(order.status, candidate)
    : candidate;

  const copy = order ? PAYMENT_OUTCOMES[outcome] : null;
  const firstName = order?.customerName.split(" ")[0] ?? "";
  const headingTitle = !order
    ? "Nie znaleziono zamówienia"
    : outcome === "paid"
      ? `Dziękujemy, ${firstName}`
      : order.status === "cancelled"
        ? "Zamówienie anulowane"
        : copy?.pageTitle ?? "Zamówienie zapisane";
  const headingDescription = !order
    ? orderNumber
      ? `Szukaliśmy zamówienia ${orderNumber}, ale nie udało się go odczytać. Sprawdź maila albo konto.`
      : "Po płatności wróć linkiem z maila albo zaloguj się na konto."
    : order.status === "pending"
      ? copy?.lead
      : ORDER_STATUS_HINTS[order.status];

  return (
    <div className="py-14 md:py-20">
      <Container className="max-w-xl">
        {!order ? (
          <SurfaceTile>
            <SurfaceTileHeader
              eyebrow="Zamówienie"
              title={headingTitle}
              description={headingDescription}
            />
            <SurfaceTileBody className="space-y-4">
              <p className="text-sm leading-relaxed text-czarny/60">
                Jeśli płatność przeszła w Przelewy24, zamówienie powinno być w panelu i na mailu pracowni.
                Napisz na kontakt, jeśli status się nie pojawi.
              </p>
              <Link href="/sklep" className="text-sm text-czerwony underline-offset-2 hover:underline">
                Wróć do sklepu
              </Link>
            </SurfaceTileBody>
          </SurfaceTile>
        ) : (
          <>
            <ClearCartOnMount />
            <SurfaceTile className={cn(tileAccent(outcome))}>
              <SurfaceTileHeader
                eyebrow={
                  order.status === "pending"
                    ? `Zamówienie ${order.orderNumber}`
                    : ORDER_STATUS_LABELS[order.status]
                }
                title={headingTitle}
                description={headingDescription}
              />
              <SurfaceTileBody className="space-y-6">
                <ul className="space-y-2.5 text-sm">
                  {order.items.map((item) => (
                    <li key={`${item.variantId}-${item.quantity}`} className="flex justify-between gap-3">
                      <span className="text-czarny/80">
                        {item.productName} ({item.variantTitle}) × {item.quantity}
                      </span>
                      <span className="font-heading text-czarny">
                        {formatPLN(item.unitPriceInCents * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="flex justify-between border-t border-czarny/8 pt-3 text-sm">
                  <span className="text-czarny/60">Razem</span>
                  <span className="font-heading">{formatPLN(order.totalAmountInCents)}</span>
                </p>
                <PaymentOutcomePanel
                  outcome={outcome}
                  orderStatus={order.status}
                  orderNumber={order.orderNumber}
                  orderId={order.id}
                  attemptCount={Number(order.payload.p24AttemptCount ?? 1)}
                  canPay={canPay}
                  mailFailed={mail === "0"}
                  customerEmail={order.customerEmail}
                />
              </SurfaceTileBody>
            </SurfaceTile>
          </>
        )}
      </Container>
    </div>
  );
}
