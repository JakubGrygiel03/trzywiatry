import {
  removeOrderItem,
  updateOrderItemQuantity,
} from "@/app/actions/admin-orders";
import { AdminOrderAddItems, type OrderCatalogOption } from "@/components/admin/admin-order-add-items";
import { formatPLN } from "@/lib/format";
import type { StoredOrder } from "@/lib/types";

export function AdminOrderItems({
  order,
  catalog,
  canEdit,
}: {
  order: StoredOrder;
  catalog: OrderCatalogOption[];
  canEdit: boolean;
}) {
  const items = order.items ?? [];

  return (
    <section className="overflow-hidden rounded-xl border border-czarny/8 bg-bialy">
      <header className="border-b border-czarny/6 px-5 py-4">
        <h2 className="text-base font-semibold text-czarny">Zamówione produkty</h2>
        <p className="mt-1 text-sm text-czarny/50">
          {canEdit
            ? "Dodaj, zmień ilość albo usuń pozycję — suma i magazyn przeliczają się od razu."
            : items.length === 0
              ? "Brak pozycji w tym zamówieniu."
              : `${items.length} ${items.length === 1 ? "pozycja" : "pozycje"} · wariant, ilość i cena z koszyka.`}
        </p>
        {canEdit && (order.status === "paid" || order.status === "shipped" || order.status === "completed") ? (
          <p className="mt-2 text-xs text-czarny/45">
            Kwota już pobrana w Przelewy24 się nie zmienia — to korekta w CMS.
          </p>
        ) : null}
      </header>

      {items.length === 0 ? (
        <p className="px-5 py-6 text-sm text-czarny/45">To zamówienie nie ma zapisanych produktów.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="bg-krem/40 text-[11px] uppercase tracking-wide text-czarny/40">
                <th className="px-5 py-2.5 font-medium">Produkt</th>
                <th className="px-5 py-2.5 font-medium">Wariant</th>
                <th className="px-5 py-2.5 font-medium">Ilość</th>
                <th className="px-5 py-2.5 font-medium">Cena szt.</th>
                <th className="px-5 py-2.5 text-right font-medium">Razem</th>
                {canEdit ? <th className="px-5 py-2.5 font-medium"> </th> : null}
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={`${item.variantId}-${index}`} className="border-t border-czarny/5">
                  <td className="px-5 py-3 font-medium text-czarny">{item.productName}</td>
                  <td className="px-5 py-3 text-czarny/65">{item.variantTitle || "—"}</td>
                  <td className="px-5 py-3">
                    {canEdit ? (
                      <form action={updateOrderItemQuantity} className="flex items-center gap-1.5">
                        <input type="hidden" name="orderId" value={order.id} />
                        <input type="hidden" name="index" value={index} />
                        <input
                          type="number"
                          name="quantity"
                          min={1}
                          max={99}
                          defaultValue={item.quantity}
                          className="h-9 w-16 rounded-lg border border-czarny/12 bg-bialy px-2 text-sm tabular-nums"
                          aria-label={`Ilość: ${item.productName}`}
                        />
                        <button
                          type="submit"
                          className="text-xs font-medium text-czerwony underline-offset-2 hover:underline"
                        >
                          Zmień
                        </button>
                      </form>
                    ) : (
                      <span className="tabular-nums text-czarny/80">× {item.quantity}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 tabular-nums text-czarny/65">{formatPLN(item.unitPriceInCents)}</td>
                  <td className="px-5 py-3 text-right font-medium tabular-nums">
                    {formatPLN(item.unitPriceInCents * item.quantity)}
                  </td>
                  {canEdit ? (
                    <td className="px-5 py-3 text-right">
                      <form action={removeOrderItem}>
                        <input type="hidden" name="orderId" value={order.id} />
                        <input type="hidden" name="index" value={index} />
                        <button
                          type="submit"
                          className="text-xs font-medium text-czerwony/80 underline-offset-2 hover:underline"
                        >
                          Usuń
                        </button>
                      </form>
                    </td>
                  ) : null}
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

      {canEdit ? <AdminOrderAddItems orderId={order.id} catalog={catalog} /> : null}
    </section>
  );
}
