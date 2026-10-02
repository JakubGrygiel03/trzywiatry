import { formatDate, formatPLN } from "@/lib/format";
import { shippingMethodLabel } from "@/lib/shipping";
import type { StudioIdentity } from "@/lib/studio-identity";
import type { StoredOrder, StudioSettings } from "@/lib/types";
import { PrintInvoiceButton } from "@/components/invoice/print-invoice-button";

export function OrderInvoice({
  order,
  identity,
  settings,
}: {
  order: StoredOrder;
  identity: StudioIdentity;
  settings: StudioSettings;
}) {
  return (
    <div className="mx-auto max-w-3xl bg-bialy px-6 py-10 print:max-w-none print:px-0 print:py-0">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4 print:mb-6">
        <div>
          <p className="font-heading text-[11px] uppercase tracking-[0.16em] text-czerwony">Faktura</p>
          <h1 className="mt-2 font-heading text-2xl uppercase tracking-[0.08em]">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-czarny/50">{formatDate(order.createdAt)}</p>
        </div>
        <PrintInvoiceButton />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <section>
          <h2 className="text-xs uppercase tracking-[0.12em] text-czarny/40">Sprzedawca</h2>
          <p className="mt-2 text-sm leading-relaxed">
            {identity.name}
            <br />
            {identity.owner}
            <br />
            {identity.address}
            <br />
            NIP {identity.nip}
            {identity.bankAccount ? (
              <>
                <br />
                Konto {identity.bankAccount}
              </>
            ) : null}
          </p>
        </section>
        <section>
          <h2 className="text-xs uppercase tracking-[0.12em] text-czarny/40">Nabywca</h2>
          <p className="mt-2 text-sm leading-relaxed">
            {order.customerName}
            {order.companyName ? (
              <>
                <br />
                {order.companyName}
              </>
            ) : null}
            {order.nip ? (
              <>
                <br />
                NIP {order.nip}
              </>
            ) : null}
            <br />
            {order.street}
            <br />
            {order.postalCode} {order.city}
            <br />
            {order.customerEmail}
          </p>
        </section>
      </div>

      <table className="mt-8 w-full text-sm">
        <thead>
          <tr className="border-b border-czarny/10 text-left text-xs uppercase tracking-[0.12em] text-czarny/45">
            <th className="py-2 pr-3">Pozycja</th>
            <th className="py-2 pr-3">Ilość</th>
            <th className="py-2 pr-3">Cena</th>
            <th className="py-2 text-right">Suma</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={`${item.productId}-${item.variantId}`} className="border-b border-czarny/6">
              <td className="py-3 pr-3">
                {item.productName}
                <span className="block text-xs text-czarny/45">{item.variantTitle}</span>
              </td>
              <td className="py-3 pr-3">{item.quantity}</td>
              <td className="py-3 pr-3">{formatPLN(item.unitPriceInCents)}</td>
              <td className="py-3 text-right">{formatPLN(item.unitPriceInCents * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="mt-6 ml-auto max-w-xs space-y-1 text-sm">
        <div className="flex justify-between">
          <dt>Towar</dt>
          <dd>{formatPLN(order.goodsInCents)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>{shippingMethodLabel(order.shippingMethod, settings)}</dt>
          <dd>{formatPLN(order.shippingCostInCents)}</dd>
        </div>
        {order.giftWrappingCostCents > 0 ? (
          <div className="flex justify-between">
            <dt>Pakowanie</dt>
            <dd>{formatPLN(order.giftWrappingCostCents)}</dd>
          </div>
        ) : null}
        {order.discountAmountCents > 0 ? (
          <div className="flex justify-between text-czerwony">
            <dt>Rabat {order.discountCode ?? ""}</dt>
            <dd>−{formatPLN(order.discountAmountCents)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between border-t border-czarny/10 pt-2 font-heading">
          <dt>Razem</dt>
          <dd>{formatPLN(order.totalAmountInCents)}</dd>
        </div>
      </dl>
      <p className="mt-8 text-xs text-czarny/40">
        Dokument do druku / PDF. Sprzedaż zwolniona albo na zasadach sprzedawcy — NIP {identity.nip}.
      </p>
    </div>
  );
}
