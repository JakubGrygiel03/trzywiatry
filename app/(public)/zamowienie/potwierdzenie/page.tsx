import Link from "next/link";
import { ClearCartOnMount } from "@/components/checkout/clear-cart-on-mount";
import { Container, SectionHeading } from "@/components/ui/badge";
import { ORDER_STATUS_HINTS, ORDER_STATUS_LABELS, SITE } from "@/lib/constants";
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
  searchParams: Promise<{ order?: string; k?: string; mail?: string }>;
}) {
  const { order: orderNumber, k, mail } = await searchParams;
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
            <p className="text-sm text-czarny/60">
              {mail === "0" ? (
                <>
                  Zamówienie jest zapisane, ale potwierdzenie e-mail nie wyszło. Napisz na{" "}
                  <a href={`mailto:${SITE.email}`} className="text-czerwony underline-offset-2 hover:underline">
                    {SITE.email}
                  </a>{" "}
                  — albo sprawdź w{" "}
                </>
              ) : (
                <>Potwierdzenie poszło na {order.customerEmail}. Status śledzisz też w </>
              )}
              <Link href="/konto" className="text-czerwony underline-offset-2 hover:underline">
                koncie
              </Link>
              .
            </p>
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
