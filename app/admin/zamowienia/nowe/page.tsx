import Link from "next/link";
import { connection } from "next/server";
import { createManualOrder } from "@/app/actions/admin-orders";
import { AdminAlert } from "@/components/admin/ui/admin-alert";
import { AdminField, AdminInput, AdminSelect, AdminTextarea } from "@/components/admin/ui/admin-field";
import { AdminFormActions } from "@/components/admin/ui/admin-form-actions";
import { AdminFormSection } from "@/components/admin/ui/admin-form-section";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { ensureAtelierHydrated } from "@/lib/data/atelier-persist";
import { getAllProducts, getSettings } from "@/lib/data/queries";
import { formatPLN } from "@/lib/format";
import { enabledShippingMethods } from "@/lib/shipping";

export const dynamic = "force-dynamic";

export default async function AdminNewOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ blad?: string }>;
}) {
  await connection();
  await ensureAtelierHydrated({ force: true });
  const { blad } = await searchParams;
  const settings = getSettings();
  const methods = enabledShippingMethods(settings);
  const catalog = getAllProducts();

  return (
    <div className="mx-auto max-w-3xl">
      <AdminPageHeader
        title="Ręczne zamówienie"
        description="Telefon / przelew — zapisze się na liście, zejdzie ze stanu i wejdzie w statystyki. Po zapisie możesz dodać kolejne pozycje."
        actions={
          <Link href="/admin/zamowienia" className="rounded-lg border border-czarny/12 px-3.5 py-2 text-xs">
            ← Lista
          </Link>
        }
      />
      {blad ? <AdminAlert variant="error">{decodeURIComponent(blad)}</AdminAlert> : null}
      <form action={createManualOrder} className="mt-6 space-y-6 pb-24">
        <AdminFormSection title="Klient">
          <AdminField label="Imię i nazwisko" htmlFor="customerName" required>
            <AdminInput id="customerName" name="customerName" required />
          </AdminField>
          <AdminField label="E-mail" htmlFor="customerEmail" required>
            <AdminInput id="customerEmail" name="customerEmail" type="email" required />
          </AdminField>
          <AdminField label="Telefon" htmlFor="customerPhone" required>
            <AdminInput id="customerPhone" name="customerPhone" required />
          </AdminField>
          <AdminField label="Ulica" htmlFor="street" required>
            <AdminInput id="street" name="street" required />
          </AdminField>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="Kod pocztowy" htmlFor="postalCode" required>
              <AdminInput id="postalCode" name="postalCode" placeholder="80-000" required />
            </AdminField>
            <AdminField label="Miasto" htmlFor="city" required>
              <AdminInput id="city" name="city" required />
            </AdminField>
          </div>
        </AdminFormSection>
        <AdminFormSection title="Zamówienie">
          <AdminField label="Dostawa" htmlFor="shippingMethod">
            <AdminSelect id="shippingMethod" name="shippingMethod" defaultValue={methods[0]?.id ?? "inpost"}>
              {methods.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.label} · {method.priceInCents === 0 ? "0 zł" : formatPLN(method.priceInCents)}
                </option>
              ))}
            </AdminSelect>
          </AdminField>
          <AdminField label="Produkt" htmlFor="variantId" required>
            <AdminSelect id="variantId" name="variantId" required defaultValue="">
              <option value="" disabled>
                Wybierz naczynie
              </option>
              {catalog.map((product) => (
                <optgroup key={product.id} label={product.name}>
                  {product.variants.map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {variant.title} · {formatPLN(variant.priceInCents ?? product.priceInCents)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </AdminSelect>
          </AdminField>
          <AdminField label="Ilość" htmlFor="quantity">
            <AdminInput id="quantity" name="quantity" type="number" min={1} max={99} defaultValue={1} />
          </AdminField>
          <AdminField label="Uwagi" htmlFor="notes">
            <AdminTextarea id="notes" name="notes" rows={3} />
          </AdminField>
          <label className="flex items-center gap-2 text-sm">
            <input type="hidden" name="markPaid" value="false" />
            <input type="checkbox" name="markPaid" value="true" defaultChecked className="accent-czerwony" />
            Opłacone (przelew / gotówka)
          </label>
        </AdminFormSection>
        <AdminFormActions submitLabel="Zapisz zamówienie" cancelHref="/admin/zamowienia" />
      </form>
    </div>
  );
}
