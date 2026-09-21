import Link from "next/link";
import { OrderNextStep } from "@/components/checkout/order-next-step";
import { ClearCartOnMount } from "@/components/checkout/clear-cart-on-mount";
import { Container, SectionHeading } from "@/components/ui/badge";
import { ORDER_STATUS_HINTS, ORDER_STATUS_LABELS } from "@/lib/constants";
import { ensureOrdersHydrated } from "@/lib/data/order-persist";
import { getOrderByNumber } from "@/lib/data/runtime-store";
import { formatPLN } from "@/lib/format";
import { noIndexRobots } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Potwierdzenie zamówienia",
  description: "Status zamówienia w pracowni Trzy Wiatry.",
  robots: noIndexRobots,
};

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; k?: string; mail?: string; pay?: string }>;
}) {
  const { order: orderNumber, k, mail, pay } = await searchParams;
  await ensureOrdersHydrated();
  const record = orderNumber ? getOrderByNumber(orderNumber) : null;
  const order = record && k && record.id === k ? record : null;

  return (
    <div className="py-14 md:py-20">
      <Container className="max-w-2xl space-y-8">
        <SectionHeading
          eyebrow="Zamówienie"
          title={order ? `Dziękujemy, ${order.customerName.split(" ")[0]}` : "Nie znaleziono zamówienia"}
          description={
            order
              ? `Numer ${order.orderNumber}. ${ORDER_STATUS_HINTS[order.status]}`
              : "Sprawdź link z maila albo zaloguj się na konto, żeby zobaczyć historię."
          }
        />
        {order ? (
          <>
            <ClearCartOnMount />
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
            <OrderNextStep
              orderNumber={order.orderNumber}
              orderId={order.id}
              status={order.status}
              customerEmail={order.customerEmail}
              mailFailed={mail === "0"}
              payFailed={Boolean(pay)}
              payCode={pay}
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
