import Link from "next/link";
import { Plus, Package } from "lucide-react";
import { AdminStockEditor } from "@/components/admin/admin-stock-editor";
import { AdminEmptyState } from "@/components/admin/ui/admin-empty-state";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { PublishBadge } from "@/components/admin/ui/admin-status-badge";
import { ProductListFilters } from "@/components/admin/product-list-filters";
import { CATEGORY_LABELS, DOMAIN_LABELS } from "@/lib/constants";
import { filterAdminProducts } from "@/lib/data/admin-product-filter";
import { getAllProducts } from "@/lib/data/queries";
import { formatPLN } from "@/lib/format";
import { getProductPhoto } from "@/lib/media";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kategoria?: string }>;
}) {
  const { q, kategoria } = await searchParams;
  const catalog = getAllProducts();
  const products = filterAdminProducts(catalog, { q, category: kategoria });
  const variantCount = products.reduce((sum, product) => sum + product.variants.length, 0);
  const filtered = Boolean(q?.trim() || kategoria);

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="Produkty"
        description={
          filtered
            ? `${products.length} z ${catalog.length} produktów · ${variantCount} wariantów w tym widoku.`
            : `${catalog.length} produktów · ${variantCount} wariantów — stan magazynowy edytujesz poniżej albo w karcie produktu.`
        }
        actions={
          <Link
            href="/admin/produkty/nowy"
            className="inline-flex items-center gap-1.5 rounded-lg bg-czarny px-3.5 py-2 text-xs font-medium text-bialy transition hover:bg-czerwony"
          >
            <Plus className="h-3.5 w-3.5" />
            Dodaj produkt
          </Link>
        }
      />

      <ProductListFilters initialQ={q ?? ""} initialCategory={kategoria ?? ""} />

      {products.length === 0 ? (
        <div className="rounded-xl border border-czarny/8 bg-bialy">
          <AdminEmptyState
            icon={Package}
            title={filtered ? "Nic nie pasuje do filtra" : "Brak produktów"}
            description={
              filtered
                ? "Zmień nazwę albo kategorię — w katalogu są inne naczynia."
                : "Dodaj pierwsze naczynie wraz ze zdjęciami — pojawi się w sklepie po publikacji."
            }
            action={
              filtered ? (
                <Link
                  href="/admin/produkty"
                  className="text-xs font-medium text-czerwony underline-offset-2 hover:underline"
                >
                  Wyczyść filtry
                </Link>
              ) : (
                <Link
                  href="/admin/produkty/nowy"
                  className="text-xs font-medium text-czerwony underline-offset-2 hover:underline"
                >
                  Nowy produkt
                </Link>
              )
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => {
            const stock = product.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
            const low =
              product.variants.some(
                (v) => v.stockQuantity > 0 && v.stockQuantity <= product.lowStockThreshold,
              ) || stock === 0;
            const cover = getProductPhoto(product) ?? product.images[0];

            return (
              <article
                key={product.id}
                className="overflow-hidden rounded-xl border border-czarny/8 bg-bialy shadow-[0_1px_0_rgb(1_1_1/0.04)]"
              >
                <div className="flex flex-wrap items-center gap-4 border-b border-czarny/6 px-4 py-3.5">
                  <Link href={`/admin/produkty/${product.id}`} className="shrink-0">
                    <div className="h-14 w-14 overflow-hidden rounded-lg border border-czarny/8 bg-krem">
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cover}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center text-[10px] text-czarny/30">
                          brak
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/produkty/${product.id}`}
                        className="font-medium text-czarny underline-offset-2 hover:text-czerwony hover:underline"
                      >
                        {product.name}
                      </Link>
                      {product.isBestseller ? (
                        <span className="text-[10px] font-medium uppercase text-ceglany">Bestseller</span>
                      ) : null}
                      <PublishBadge published={product.isPublished} />
                    </div>
                    <p className="mt-0.5 text-xs text-czarny/45">
                      {DOMAIN_LABELS[product.domain]} · {CATEGORY_LABELS[product.category] ?? product.category}
                      {product.capacityMl ? ` · ${product.capacityMl} ml` : ""}
                      {` · ${product.variants.length} ${product.variants.length === 1 ? "wariant" : "warianty"}`}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="text-right">
                      <p className="font-medium tabular-nums text-czarny">{formatPLN(product.priceInCents)}</p>
                      <p
                        className={`text-xs tabular-nums ${low ? "font-semibold text-czerwony" : "text-czarny/45"}`}
                      >
                        stan łącznie: {stock}
                      </p>
                    </div>
                    <Link
                      href={`/admin/produkty/${product.id}`}
                      className="rounded-lg border border-czarny/12 px-3 py-1.5 text-xs font-medium text-czerwony transition hover:border-czerwony/30"
                    >
                      Edytuj
                    </Link>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead>
                      <tr className="bg-krem/40 text-[11px] uppercase tracking-wide text-czarny/40">
                        <th className="px-4 py-2.5 font-medium">Wariant</th>
                        <th className="px-4 py-2.5 font-medium">SKU</th>
                        <th className="px-4 py-2.5 font-medium">Cena</th>
                        <th className="px-4 py-2.5 font-medium">Magazyn</th>
                        <th className="px-4 py-2.5 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.variants.map((variant) => {
                        const variantLow =
                          variant.stockQuantity > 0 &&
                          variant.stockQuantity <= product.lowStockThreshold;
                        const soldOut = variant.stockQuantity <= 0 || !variant.isAvailable;
                        const price =
                          variant.priceInCents != null ? variant.priceInCents : product.priceInCents;

                        return (
                          <tr key={variant.id} className="border-t border-czarny/5">
                            <td className="px-4 py-2.5 text-czarny/80">{variant.title}</td>
                            <td className="px-4 py-2.5 font-mono text-xs text-czarny/55">{variant.sku}</td>
                            <td className="px-4 py-2.5 tabular-nums text-czarny/65">
                              {formatPLN(price)}
                              {variant.priceInCents != null ? (
                                <span className="ml-1 text-[10px] text-czarny/35">własna</span>
                              ) : null}
                            </td>
                            <td className="px-4 py-2.5">
                              <AdminStockEditor
                                productId={product.id}
                                variantId={variant.id}
                                stockQuantity={variant.stockQuantity}
                                isAvailable={variant.isAvailable}
                              />
                            </td>
                            <td className="px-4 py-2.5">
                              {soldOut ? (
                                <span className="rounded-md bg-czarny/8 px-2 py-0.5 text-[11px] font-medium text-czarny/55">
                                  Brak w magazynie
                                </span>
                              ) : variantLow ? (
                                <span className="rounded-md bg-czerwony/10 px-2 py-0.5 text-[11px] font-medium text-czerwony">
                                  Niski stan
                                </span>
                              ) : (
                                <span className="rounded-md bg-krem px-2 py-0.5 text-[11px] font-medium text-czarny/55">
                                  Dostępny
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
