import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { updateOrderStatus } from "@/app/actions/admin";
import { AdminOrderItems } from "@/components/admin/admin-order-items";
import { AdminOrderMessageForm } from "@/components/admin/admin-order-message-form";
import { DeleteOrderButton } from "@/components/admin/delete-order-button";
import { AdminAlert } from "@/components/admin/ui/admin-alert";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { OrderStatusBadge } from "@/components/admin/ui/admin-status-badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { getAllProducts, getSettings } from "@/lib/data/queries";
import { shippingMethodLabel } from "@/lib/shipping";
import { ensureAtelierHydrated } from "@/lib/data/atelier-persist";
import { ensureOrdersHydrated } from "@/lib/data/order-persist";
import { getOrderById, getOrderByNumber } from "@/lib/data/runtime-store";
import { formatDate, formatTime } from "@/lib/format";
import { orderPaymentDisplay } from "@/lib/p24-methods";
import type { OrderStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    zapisano?: string;
    status?: string;
    mail?: string;
    label?: string;
    powod?: string;
    pozycje?: string;
    blad?: string;
    wiadomosc?: string;
  }>;
}) {
  await connection();
  const { id } = await params;
  const query = await searchParams;
  await ensureOrdersHydrated({ force: true });
  await ensureAtelierHydrated({ force: true });
  const order = getOrderById(id) ?? getOrderByNumber(id);
  if (!order) notFound();

  const shippingLabel = shippingMethodLabel(order.shippingMethod, getSettings());
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const canEdit = order.status !== "cancelled";
  const catalog = getAllProducts().map((product) => ({
    id: product.id,
    name: product.name,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      title: variant.title,
      stockQuantity: variant.stockQuantity,
      priceInCents: variant.priceInCents ?? product.priceInCents,
    })),
  }));

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title={order.orderNumber}
        description={`${formatDate(order.createdAt)} · ${formatTime(order.createdAt)} · ${itemCount} ${
          itemCount === 1 ? "sztuka" : "szt."
        }`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <OrderStatusBadge status={order.status} />
            <Link
              href={`/admin/zamowienia/${order.id}/faktura`}
              target="_blank"
              className="rounded-lg border border-czarny/12 bg-bialy px-3.5 py-2 text-xs font-medium text-czarny transition hover:border-czerwony/30"
            >
              Faktura
            </Link>
            <Link
              href="/admin/zamowienia"
              className="rounded-lg border border-czarny/12 bg-bialy px-3.5 py-2 text-xs font-medium text-czarny transition hover:border-czerwony/30"
            >
              ← Lista
            </Link>
          </div>
        }
      />

      {order.payload?.recoveredFromP24 === 1 ? (
        <AdminAlert>
          To nie jest zamówienie Seleny Wilczewskiej (to jest TW-0001, 129 zł, bez P24). To TW-0002: BLIK 105 zł z 2
          października, e-mail z Przelewy24 należy do Jędrzeja (test). Produkty i adres były w mailu pracowni „Nowe
          zamówienie TW-0002” — dopisz je poniżej, zanim cokolwiek wyślesz.
        </AdminAlert>
      ) : null}

      {query.pozycje ? <AdminAlert variant="success">Zapisano pozycje i przeliczono sumę.</AdminAlert> : null}
      {query.wiadomosc === "1" ? <AdminAlert variant="success">Wysłano wiadomość do klienta.</AdminAlert> : null}
      {query.wiadomosc === "0" ? (
        <AdminAlert variant="error">Wiadomość nie wyszła. {query.powod ?? "Sprawdź SMTP."}</AdminAlert>
      ) : null}
      {query.blad ? <AdminAlert variant="error">{decodeURIComponent(query.blad)}</AdminAlert> : null}
      {query.zapisano ? (
        <AdminAlert variant="success">
          Zapisano status
          {query.label ? ` „${decodeURIComponent(query.label)}”` : ""}.
          {query.mail === "1"
            ? " Wysłaliśmy automatyczny e-mail do klienta."
            : query.mail === "off"
              ? " E-mail do klienta wyłączony przy tym zapisie."
              : query.mail === "0"
                ? ` Status zapisany, ale e-mail do klienta nie wyszedł. ${
                    query.powod
                      ? query.powod
                      : "Sprawdź SMTP_PASS albo weryfikację send.trzywiatry.pl."
                  }`
                : ""}
        </AdminAlert>
      ) : null}

      {order.hasGiftWrapping ? (
        <aside className="mb-6 rounded-xl border border-czerwony/25 bg-czerwony px-5 py-4 text-bialy">
          <p className="text-xs font-medium uppercase tracking-wide text-bialy/80">Pakowanie na prezent</p>
          {order.giftMessage ? (
            <p className="mt-2 text-sm leading-relaxed">Dedykacja: „{order.giftMessage}”</p>
          ) : (
            <p className="mt-2 text-sm text-bialy/85">Bez dedykacji — tylko ozdobne pakowanie.</p>
          )}
        </aside>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <AdminOrderItems order={order} catalog={catalog} canEdit={canEdit} />
          <AdminOrderMessageForm orderId={order.id} />

          <form action={updateOrderStatus} className="space-y-4 rounded-xl border border-czarny/8 bg-bialy p-5">
            <input type="hidden" name="id" value={order.id} />
            <h2 className="text-base font-semibold text-czarny">Status i wysyłka</h2>
            <p className="text-xs leading-relaxed text-czarny/45">
              Klient widzi ten status w /konto. Przy „Wysłane” dopisz numer śledzenia.
            </p>
            <div className="space-y-2">
              <Label htmlFor="status">Status zamówienia</Label>
              <select
                id="status"
                name="status"
                defaultValue={order.status}
                className="h-11 w-full rounded-lg border border-czarny/10 bg-bialy px-3 text-sm"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {ORDER_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tracking">Numer śledzenia</Label>
              <Input
                id="tracking"
                name="tracking"
                defaultValue={order.trackingNumber ?? ""}
                placeholder="np. 623456789012345678901234"
              />
            </div>
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                name="notifyCustomer"
                value="true"
                defaultChecked
                className="mt-1 accent-czerwony"
              />
              <span>
                Wyślij e-mail do klienta o nowym statusie
                <span className="mt-1 block text-xs text-czarny/45">
                  Odznacz tylko przy korekcie wewnętrznej.
                </span>
              </span>
            </label>
            <Button type="submit">Zapisz status</Button>
          </form>
        </div>

        <aside className="space-y-6">
          <section className="rounded-xl border border-czarny/8 bg-bialy p-5">
            <h2 className="text-base font-semibold text-czarny">Klient i adres</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs text-czarny/40">Imię i nazwisko</dt>
                <dd className="mt-0.5 font-medium text-czarny">{order.customerName}</dd>
              </div>
              <div>
                <dt className="text-xs text-czarny/40">E-mail</dt>
                <dd className="mt-0.5">
                  <a className="text-czerwony underline-offset-2 hover:underline" href={`mailto:${order.customerEmail}`}>
                    {order.customerEmail}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-czarny/40">Telefon</dt>
                <dd className="mt-0.5">
                  <a className="text-czerwony underline-offset-2 hover:underline" href={`tel:${order.customerPhone}`}>
                    {order.customerPhone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-czarny/40">Adres do faktury</dt>
                <dd className="mt-0.5 leading-relaxed text-czarny/80">
                  {order.companyName ? (
                    <>
                      {order.companyName}
                      {order.nip ? ` · NIP ${order.nip}` : ""}
                      <br />
                    </>
                  ) : null}
                  {order.street}
                  <br />
                  {order.postalCode} {order.city}
                </dd>
              </div>
              {order.shippingStreet ? (
                <div>
                  <dt className="text-xs text-czarny/40">Adres wysyłki</dt>
                  <dd className="mt-0.5 leading-relaxed text-czarny/80">
                    {order.shippingStreet}
                    <br />
                    {order.shippingPostalCode} {order.shippingCity}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="text-xs text-czarny/40">Wysyłka</dt>
                <dd className="mt-0.5 text-czarny/80">
                  {shippingLabel}
                  {order.inpostLocker ? (
                    <>
                      <br />
                      Paczkomat: {order.inpostLocker}
                    </>
                  ) : null}
                </dd>
              </div>
              {order.notes ? (
                <div>
                  <dt className="text-xs text-czarny/40">Uwagi klienta</dt>
                  <dd className="mt-0.5 text-czarny/80">{order.notes}</dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section className="rounded-xl border border-czarny/8 bg-bialy p-5 text-sm">
            <h2 className="text-base font-semibold text-czarny">Płatność</h2>
            <p className="mt-3 text-czarny/75">
              <strong>{orderPaymentDisplay(order)}</strong>
              {order.paymentProvider === "p24" ? " · Przelewy24" : ""}
            </p>
            {order.paymentId ? (
              <p className="mt-1 font-mono text-xs text-czarny/45">ID {order.paymentId}</p>
            ) : null}
            {order.trackingNumber ? (
              <p className="mt-3 text-czarny/70">
                Śledzenie: <strong>{order.trackingNumber}</strong>
              </p>
            ) : null}
          </section>

          <div className="rounded-xl border border-czerwony/20 bg-bialy p-5">
            <p className="text-sm font-medium text-czarny">Usuń zamówienie</p>
            <p className="mt-1 text-xs text-czarny/50">
              Znika z listy i analityki. Jeśli nie było anulowane, sztuki wracają na magazyn.
            </p>
            <div className="mt-3">
              <DeleteOrderButton id={order.id} orderNumber={order.orderNumber} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
