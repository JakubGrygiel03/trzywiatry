import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminPanel } from "@/components/admin/ui/admin-panel";
import { getPublishedProducts } from "@/lib/data/queries";
import { ensureOrdersHydrated } from "@/lib/data/order-persist";
import { runtimeStore } from "@/lib/data/runtime-store";
import { formatPLN } from "@/lib/format";

export default function AnalyticsPage() {
  ensureOrdersHydrated();
  const products = getPublishedProducts();
  const bestsellers = products.filter((product) => product.isBestseller);
  const revenue = runtimeStore.orders.reduce((sum, order) => sum + order.totalAmountInCents, 0);

  const csv = [["sku", "nazwa", "cena_grosze", "stan"].join(",")]
    .concat(
      products.flatMap((product) =>
        product.variants.map((variant) =>
          [
            variant.sku,
            `"${product.name.replaceAll('"', '""')}"`,
            variant.priceInCents ?? product.priceInCents,
            variant.stockQuantity,
          ].join(","),
        ),
      ),
    )
    .join("\n");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="Analityka"
        description="Podsumowanie sesji. Wykresy 30 dni dojdą po podpięciu Supabase — jak raporty WooCommerce."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-czarny/8 bg-bialy p-4">
          <p className="text-[11px] uppercase tracking-[0.12em] text-czarny/45">Zamówienia</p>
          <p className="mt-2 font-heading text-2xl">{runtimeStore.orders.length}</p>
        </div>
        <div className="rounded-xl border border-czarny/8 bg-bialy p-4">
          <p className="text-[11px] uppercase tracking-[0.12em] text-czarny/45">Przychód</p>
          <p className="mt-2 font-heading text-2xl">{formatPLN(revenue)}</p>
        </div>
        <div className="rounded-xl border border-czarny/8 bg-bialy p-4">
          <p className="text-[11px] uppercase tracking-[0.12em] text-czarny/45">Bestsellery</p>
          <p className="mt-2 font-heading text-2xl">{bestsellers.length}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminPanel title="Bestsellery w katalogu">
          {bestsellers.length === 0 ? (
            <p className="text-xs text-czarny/45">Oznacz produkty flagą Bestseller przy edycji.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {bestsellers.map((product) => (
                <li key={product.id} className="flex justify-between gap-3">
                  <span className="truncate text-czarny/75">{product.name}</span>
                  <span className="shrink-0 font-heading text-xs">{formatPLN(product.priceInCents)}</span>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>

        <AdminPanel title="Eksport magazynu">
          <p className="mb-4 text-xs leading-relaxed text-czarny/55">
            CSV ze SKU, nazwą, ceną w groszach i stanem — do Excela lub księgowości.
          </p>
          <a
            className="inline-flex rounded-lg bg-czarny px-4 py-2.5 text-xs font-medium text-bialy transition hover:bg-czerwony"
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`}
            download="trzywiatry-magazyn.csv"
          >
            Pobierz CSV magazynu
          </a>
        </AdminPanel>
      </div>
    </div>
  );
}
