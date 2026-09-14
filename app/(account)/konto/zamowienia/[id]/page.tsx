import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { OrderStatusChip } from "@/components/account/order-status-chip";
import { OrderTimeline } from "@/components/account/order-timeline";
import { SurfaceCanvas } from "@/components/layout/surface-canvas";
import { AccountTile, AccountTileBody } from "@/components/account/account-tile";
import { Container } from "@/components/ui/badge";
import { SHIPPING_METHODS } from "@/lib/constants";
import { getCustomerSession } from "@/lib/customer-session";
import { getCustomerOrder } from "@/lib/data/orders";
import { formatDate, formatPLN } from "@/lib/format";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Zamówienie" };

export default async function CustomerOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCustomerSession();
  if (!user) redirect("/konto/logowanie");

  const { id } = await params;
  const order = await getCustomerOrder(id, user);
  if (!order) notFound();

  const shippingLabel =
    SHIPPING_METHODS.find((method) => method.id === order.shippingMethod)?.label ?? order.shippingMethod;

  return (
    <SurfaceCanvas>
      <Container className="max-w-2xl space-y-5 py-8 md:space-y-6 md:py-10">
        <AccountTile>
          <AccountTileBody className="space-y-3">
            <Link
              href="/konto"
              className="font-heading text-[11px] uppercase tracking-[0.16em] text-czerwony"
            >
              ← Konto
            </Link>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="font-heading text-2xl uppercase tracking-[0.08em] text-czarny">
                {order.orderNumber}
              </h1>
              <OrderStatusChip status={order.status} />
            </div>
            <p className="text-sm text-czarny/55">{formatDate(order.createdAt)}</p>
          </AccountTileBody>
        </AccountTile>

        <AccountTile>
          <AccountTileBody className="space-y-3">
            <h2 className="font-heading text-sm uppercase tracking-[0.14em]">Co się dzieje</h2>
            <OrderTimeline order={order} />
            {order.trackingNumber ? (
              <p className="rounded-xl bg-krem px-4 py-3 text-sm">
                Numer śledzenia: <strong>{order.trackingNumber}</strong>
              </p>
            ) : null}
          </AccountTileBody>
        </AccountTile>

        <AccountTile>
          <AccountTileBody className="space-y-3">
            <h2 className="font-heading text-sm uppercase tracking-[0.14em]">Pozycje</h2>
            <ul className="divide-y divide-szary/40">
              {order.items.map((item) => (
                <li key={`${item.variantId}-${item.productId}`} className="flex justify-between gap-3 py-3 text-sm first:pt-0 last:pb-0">
                  <span>
                    {item.productName}
                    <span className="block text-xs text-czarny/45">
                      {item.variantTitle} × {item.quantity}
                    </span>
                  </span>
                  <span className="shrink-0">{formatPLN(item.unitPriceInCents * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <p className="text-right font-heading text-sm uppercase tracking-[0.08em]">
              Razem {formatPLN(order.totalAmountInCents)}
            </p>
          </AccountTileBody>
        </AccountTile>

        <AccountTile>
          <AccountTileBody className="space-y-2 text-sm">
            <h2 className="font-heading text-[11px] uppercase tracking-[0.14em] text-czerwony">Dostawa</h2>
            <p>
              {order.customerName}
              <br />
              {order.street}, {order.postalCode} {order.city}
            </p>
            <p>
              {shippingLabel}
              {order.inpostLocker ? ` · paczkomat ${order.inpostLocker}` : ""}
            </p>
            {order.hasGiftWrapping ? (
              <p className="text-czerwony">
                Pakowanie prezentowe
                {order.giftMessage ? `: „${order.giftMessage}”` : ""}
              </p>
            ) : null}
          </AccountTileBody>
        </AccountTile>
      </Container>
    </SurfaceCanvas>
  );
}
