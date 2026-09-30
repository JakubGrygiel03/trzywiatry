import { formatPLN } from "@/lib/format";
import type { StoredOrder } from "@/lib/types";

export function AdminOrderItems({ order }: { order: StoredOrder }) {
  const items = order.items ?? [];

  return (
    <section className="overflow-hidden rounded-xl border border-czarny/8 bg-bialy">
      <header className="border-b border-czarny/6 px-5 py-4">
        <h2 className="text-base font-semibold text-czarny">Zamówione produkty</h2>
        <p className="mt-1 text-sm text-czarny/50">
          {items.length === 0
            ? "Brak pozycji w tym zamówieniu."
            : `${items.length} ${items.length === 1 ? "pozycja" : "pozycje"} · wariant, ilość i cena z koszyka.`}
        </p>
      </header>

      {items.length === 0 ? (
        <p className="px-5 py-6 text-sm text-czarny/45">To zamówienie nie ma zapisanych produktów.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="bg-krem/40 text-[11px] uppercase tracking-wide text-czarny/40">
                <th className="px-5 py-2.5 font-medium">Produkt</th>
                <th className="px-5 py-2.5 font-medium">Wariant</th>
                <th className="px-5 py-2.5 font-medium">Ilość</th>
                <th className="px-5 py-2.5 font-medium">Cena szt.</th>
                <th className="px-5 py-2.5 text-right font-medium">Razem</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={`${item.variantId}-${index}`} className="border-t border-czarny/5">
                  <td className="px-5 py-3 font-medium text-czarny">{item.productName}</td>
                  <td className="px-5 py-3 text-czarny/65">{item.variantTitle || "—"}</td>
                  <td className="px-5 py-3 tabular-nums text-czarny/80">× {item.quantity}</td>
                  <td className="px-5 py-3 tabular-nums text-czarny/65">{formatPLN(item.unitPriceInCents)}</td>
                  <td className="px-5 py-3 text-right font-medium tabular-nums">
                    {formatPLN(item.unitPriceInCents * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <dl className="space-y-1.5 border-t border-czarny/6 px-5 py-4 text-sm">
        <div className="flex justify-between gap-4 text-czarny/60">
          <dt>Towar</dt>
          <dd className="tabular-nums">{formatPLN(order.goodsInCents)}</dd>
        </div>
        <div className="flex justify-between gap-4 text-czarny/60">
          <dt>Wysyłka</dt>
          <dd className="tabular-nums">{formatPLN(order.shippingCostInCents)}</dd>
        </div>
        {order.hasGiftWrapping ? (
          <div className="flex justify-between gap-4 text-czarny/60">
            <dt>Pakowanie na prezent</dt>
            <dd className="tabular-nums">{formatPLN(order.giftWrappingCostCents)}</dd>
          </div>
        ) : null}
        {order.discountAmountCents > 0 ? (
          <div className="flex justify-between gap-4 text-czerwony">
            <dt>Rabat{order.discountCode ? ` (${order.discountCode})` : ""}</dt>
            <dd className="tabular-nums">−{formatPLN(order.discountAmountCents)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-4 border-t border-czarny/8 pt-2 font-medium text-czarny">
          <dt>Do zapłaty</dt>
          <dd className="tabular-nums">{formatPLN(order.totalAmountInCents)}</dd>
        </div>
      </dl>
    </section>
  );
}
