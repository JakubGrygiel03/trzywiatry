import { notFound } from "next/navigation";
import { updateOrderStatus } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { ORDER_STATUS_LABELS, SHIPPING_METHODS } from "@/lib/constants";
import { ensureOrdersHydrated } from "@/lib/data/order-persist";
import { getOrderById } from "@/lib/data/runtime-store";
import { formatPLN } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

const STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ zapisano?: string; status?: string; mail?: string; label?: string; powod?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  await ensureOrdersHydrated();
  const order = getOrderById(id);
  if (!order) notFound();

  const shippingLabel =
    SHIPPING_METHODS.find((method) => method.id === order.shippingMethod)?.label ??
    order.shippingMethod;

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <p className="font-heading text-[11px] uppercase tracking-[0.16em] text-szary">Zamówienie</p>
        <h1 className="font-heading text-3xl uppercase tracking-[0.08em]">{order.orderNumber}</h1>
        <p className="mt-2 text-sm text-czarny/70">
          Status: <strong>{ORDER_STATUS_LABELS[order.status]}</strong>
        </p>
      </div>

      {query.zapisano ? (
        <p className="rounded-2xl bg-czerwony/15 px-4 py-3 text-sm">
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
                      : "Resend w trybie testowym wysyła tylko na skrzynkę pracowni — ustaw SMTP_PASS albo zweryfikuj send.trzywiatry.pl."
                  }`
                : ""}
        </p>
      ) : null}

      {order.hasGiftWrapping ? (
        <aside
          className="rounded-[24px] border-2 border-czerwony bg-czerwony px-5 py-6 text-bialy shadow-[0_8px_28px_rgb(156_100_78/0.35)]"
          role="status"
        >
          <p className="font-heading text-[12px] uppercase tracking-[0.22em] text-bialy/80">
            Uwaga pracowni
          </p>
          <p className="mt-2 font-heading text-2xl uppercase leading-tight tracking-[0.06em] md:text-3xl">
            Pakowanie na prezent
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-bialy/90">
            Pudełko, wstążka i bilecik
            {order.giftWrappingCostCents
              ? ` · ${formatPLN(order.giftWrappingCostCents)}`
              : ""}
            . Nie pakuj jak zwykłej wysyłki.
          </p>
          {order.giftMessage ? (
            <div className="mt-4 rounded-2xl bg-bialy/15 px-4 py-3">
              <p className="font-heading text-[11px] uppercase tracking-[0.16em] text-bialy/70">
                Dedykacja od klienta
              </p>
              <p className="mt-1 text-base leading-relaxed text-bialy">„{order.giftMessage}”</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-bialy/75">Bez dedykacji — tylko ozdobne pakowanie.</p>
          )}
        </aside>
      ) : null}

      <div className="space-y-2 rounded-[24px] bg-krem p-5 text-sm">
        <p>
          {order.customerName} ·{" "}
          <a className="text-czerwony underline" href={`mailto:${order.customerEmail}`}>
            {order.customerEmail}
          </a>{" "}
          · {order.customerPhone}
        </p>
        <p>
          {order.street}, {order.postalCode} {order.city}
        </p>
        <p>
          Dostawa: {shippingLabel}
          {order.inpostLocker ? ` · paczkomat ${order.inpostLocker}` : ""}
        </p>
        <p className="font-heading text-lg">{formatPLN(order.totalAmountInCents)}</p>
        {order.trackingNumber ? (
          <p>
            Śledzenie: <strong>{order.trackingNumber}</strong>
          </p>
        ) : null}
      </div>

      <ul className="space-y-2 text-sm">
        {order.items.map((item) => (
          <li key={item.variantId} className="flex justify-between gap-3 border-b border-czarny/8 py-2">
            <span>
              {item.productName}
              <span className="block text-xs text-szary">
                {item.variantTitle} × {item.quantity}
              </span>
            </span>
            <span className="font-heading">
              {formatPLN(item.unitPriceInCents * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <form action={updateOrderStatus} className="space-y-4 rounded-[24px] border border-czarny/8 p-5">
        <input type="hidden" name="id" value={order.id} />
        <p className="text-xs leading-relaxed text-czarny/45">
          Klient widzi ten status i historię zmian po zalogowaniu w /konto. Przy „Wysłane” dopisz numer
          śledzenia — pojawi się w profilu i w mailu.
        </p>
        <div className="space-y-2">
          <Label htmlFor="status">Status zamówienia</Label>
          <select
            id="status"
            name="status"
            defaultValue={order.status}
            className="h-11 w-full rounded-2xl border border-czarny/10 px-4 text-sm"
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {ORDER_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tracking">Numer śledzenia (przy „Wysłane”)</Label>
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
            Wyślij automatyczny e-mail do klienta o nowym statusie
            <span className="mt-1 block text-xs text-szary">
              Odznacz tylko przy wewnętrznej korekcie bez informowania klienta.
            </span>
          </span>
        </label>
        <Button type="submit">Zapisz status i powiadom</Button>
      </form>
    </div>
  );
}
