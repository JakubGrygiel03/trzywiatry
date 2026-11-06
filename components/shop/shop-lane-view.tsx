import { CatalogFilters } from "@/components/shop/catalog-filters";
import { CatalogPagination } from "@/components/shop/catalog-pagination";
import { CatalogToolbar } from "@/components/shop/catalog-toolbar";
import { ProductCard } from "@/components/shop/product-card";
import { RecentlyViewed } from "@/components/shop/recently-viewed";
import { applyCatalogQuery, catalogHref, type CatalogQuery } from "@/lib/catalog-query";
import type { CategoryCounts } from "@/components/shop/catalog-filter-fields";
import type { ShopCategoryGroup } from "@/lib/product-categories";
import type { ShopLaneId } from "@/lib/shop-lanes";
import type { Product } from "@/lib/types";

export type ShopLaneModel = {
  lane: ShopLaneId;
  products: Product[];
  categoryLabels: Record<string, string>;
  priceBounds: { minCents: number; maxCents: number };
  categoryCounts: CategoryCounts;
  categoryTree: ShopCategoryGroup[];
};

function searchFrom(query: CatalogQuery, lane: ShopLaneId) {
  return new URLSearchParams(catalogHref(query, lane).split("?")[1] ?? "");
}

/** Catalog body. Filtering happens here so /sklep does not re-render on the server. */
export function ShopLaneView({
  model,
  query,
  navigate,
}: {
  model: ShopLaneModel;
  query: CatalogQuery;
  navigate: (href: string) => void;
}) {
  const { lane } = model;
  const result = applyCatalogQuery(model.products, query);

  function push(mutate: (next: URLSearchParams) => void) {
    const next = searchFrom(query, lane);
    mutate(next);
    next.delete("strona");
    next.set("sklep", lane);
    navigate(`/sklep?${next.toString()}`);
  }

  function onSort(value: string) {
    const next = searchFrom(query, lane);
    if (!value || value === "domyslne") next.delete("sortuj");
    else next.set("sortuj", value);
    next.delete("strona");
    next.set("sklep", lane);
    navigate(`/sklep?${next.toString()}`);
  }

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[260px_1fr] lg:gap-5">
      <CatalogFilters
        priceBounds={model.priceBounds}
        categoryCounts={model.categoryCounts}
        lane={lane}
        categoryTree={model.categoryTree}
        capacity={query.capacity ? String(query.capacity) : null}
        domain={query.domain ?? null}
        category={query.category ?? null}
        minParam={query.minZl != null ? String(query.minZl) : null}
        maxParam={query.maxZl != null ? String(query.maxZl) : null}
        onPush={push}
        onClear={() => navigate(`/sklep?sklep=${lane}`)}
      />
      <div>
        <CatalogToolbar
          total={result.total}
          from={result.from}
          to={result.to}
          sort={query.sort}
          onSort={onSort}
        />
        {result.pageProducts.length === 0 ? (
          <div className="space-y-3 rounded-[22px] border border-dashed border-czarny/15 bg-bialy/80 px-4 py-5">
            <p className="text-sm text-czarny/55">Brak produktów dla wybranych filtrów — lista jest pusta.</p>
            <button
              type="button"
              onClick={() => navigate(`/sklep?sklep=${lane}`)}
              className="inline-flex font-heading text-[11px] uppercase tracking-[0.14em] text-czerwony underline decoration-czerwony/30 underline-offset-4"
            >
              Wyczyść filtry
            </button>
          </div>
        ) : (
          <>
            <div id="sklep-katalog" className="grid gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
              {result.pageProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  imagePriority={index < 6}
                  categoryLabel={model.categoryLabels[product.id]}
                />
              ))}
            </div>
            <CatalogPagination
              page={result.page}
              totalPages={result.totalPages}
              hrefFor={(page) => catalogHref(query, lane, page)}
              onPage={(page) => navigate(catalogHref(query, lane, page))}
            />
          </>
        )}
        <div className="mt-10">
          <RecentlyViewed />
        </div>
      </div>
    </div>
  );
}
