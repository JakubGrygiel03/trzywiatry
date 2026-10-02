import { Suspense } from "react";
import { CatalogFilters } from "@/components/shop/catalog-filters";
import { CatalogPagination } from "@/components/shop/catalog-pagination";
import { CatalogToolbar } from "@/components/shop/catalog-toolbar";
import { ProductCard } from "@/components/shop/product-card";
import { RecentlyViewed } from "@/components/shop/recently-viewed";
import { ShopHub } from "@/components/shop/shop-hub";
import { SurfacePageIntro } from "@/components/layout/surface-page";
import { Container } from "@/components/ui/badge";
import {
  filterCatalog,
  getCatalogPriceBounds,
  getSettings,
  getShopCategoryCounts,
  getProductCategories,
  sortCatalog,
} from "@/lib/data/queries";
import { categoryTreeForLane, isShopLane, isShopLaneEnabled, laneForDomain, SHOP_LANES } from "@/lib/shop-lanes";
import type { ProductDomain } from "@/lib/types";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

const SHOP_DESCRIPTION =
  "Ręcznie toczona ceramika i półka dla pracowni: kubki, czarki, miski, formy matki. Katalog Trzy Wiatry z Gdańska.";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{
    pojemnosc?: string;
    domena?: string;
    kategoria?: string;
    cena_od?: string;
    cena_do?: string;
    sortuj?: string;
    strona?: string;
    sklep?: string;
  }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const lane = isShopLane(params.sklep) ? params.sklep : undefined;
  const noisy =
    Boolean(params.pojemnosc || params.domena || params.kategoria || params.cena_od || params.cena_do || params.sortuj) ||
    Boolean(params.strona && params.strona !== "1");
  const path = lane ? `/sklep?sklep=${lane}` : "/sklep";
  const title = lane ? SHOP_LANES[lane].label : "Sklep";
  return {
    ...pageMetadata({
      title,
      description: SHOP_DESCRIPTION,
      path,
    }),
    robots: noisy ? { index: false, follow: true } : undefined,
  };
}

const PAGE_SIZE = 12;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    pojemnosc?: string;
    domena?: string;
    kategoria?: string;
    cena_od?: string;
    cena_do?: string;
    sortuj?: string;
    strona?: string;
    sklep?: string;
  }>;
}) {
  const params = await searchParams;
  const domain = params.domena as ProductDomain | undefined;
  const lane = isShopLane(params.sklep)
    ? params.sklep
    : domain
      ? laneForDomain(domain)
      : params.kategoria || params.pojemnosc || params.cena_od || params.cena_do
        ? "uzytkowa"
        : null;

  if (!lane) return <ShopHub />;

  const laneMeta = SHOP_LANES[lane];
  if (!isShopLaneEnabled(lane, getSettings())) {
    return (
      <div className="py-8 md:py-10">
        <Container className="space-y-4">
          <SurfacePageIntro
            eyebrow={laneMeta.shortLabel}
            title={laneMeta.label}
            description="Ten dział sklepu jest teraz w przygotowaniu i chwilowo niedostępny."
          />
          <p>
            <a
              href="/sklep"
              className="inline-flex font-heading text-[11px] uppercase tracking-[0.14em] text-czerwony underline decoration-czerwony/30 underline-offset-4"
            >
              Wróć do wyboru półki
            </a>
          </p>
        </Container>
      </div>
    );
  }
  const rawMinZl = params.cena_od ? Number(params.cena_od) : undefined;
  const rawMaxZl = params.cena_do ? Number(params.cena_do) : undefined;
  const minZl =
    rawMinZl != null && Number.isFinite(rawMinZl) ? Math.max(0, Math.floor(rawMinZl)) : undefined;
  const maxZl =
    rawMaxZl != null && Number.isFinite(rawMaxZl) ? Math.max(0, Math.floor(rawMaxZl)) : undefined;
  const priceMin = minZl != null && maxZl != null ? Math.min(minZl, maxZl) : minZl;
  const priceMax = minZl != null && maxZl != null ? Math.max(minZl, maxZl) : maxZl;
  const capacityRaw = params.pojemnosc ? Number(params.pojemnosc) : undefined;
  const capacity =
    capacityRaw != null && Number.isFinite(capacityRaw) && capacityRaw > 0 ? capacityRaw : undefined;

  const filtered = filterCatalog({
    capacity,
    domain,
    category: params.kategoria,
    lane,
    minPriceCents: priceMin != null ? priceMin * 100 : undefined,
    maxPriceCents: priceMax != null ? priceMax * 100 : undefined,
  });
  const products = sortCatalog(filtered, params.sortuj);

  const total = products.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const requestedPage = params.strona ? Number(params.strona) : 1;
  const page =
    Number.isFinite(requestedPage) && requestedPage >= 1
      ? Math.min(Math.floor(requestedPage), totalPages)
      : 1;
  const start = (page - 1) * PAGE_SIZE;
  const pageProducts = products.slice(start, start + PAGE_SIZE);
  const from = total === 0 ? 0 : start + 1;
  const to = Math.min(start + PAGE_SIZE, total);

  const priceBounds = getCatalogPriceBounds(lane);
  const counts = getShopCategoryCounts(lane);
  const categoryCounts = {
    byCategory: Object.fromEntries(counts.byCategory),
    byDomain: Object.fromEntries(counts.byDomain),
  };

  return (
    <div className="py-8 md:py-10">
      <Container className="space-y-4 md:space-y-5">
        <SurfacePageIntro
          eyebrow={laneMeta.shortLabel}
          title={laneMeta.label}
          description={laneMeta.description}
        />
        <div className="grid items-start gap-4 lg:grid-cols-[260px_1fr] lg:gap-5">
          <Suspense>
            <CatalogFilters
              priceBounds={priceBounds}
              categoryCounts={categoryCounts}
              lane={lane}
              categoryTree={categoryTreeForLane(lane, getProductCategories())}
            />
          </Suspense>
          <div>
            <Suspense>
              <CatalogToolbar total={total} from={from} to={to} />
            </Suspense>
            {pageProducts.length === 0 ? (
              <div className="space-y-3 rounded-[22px] border border-dashed border-czarny/15 bg-bialy/80 px-4 py-5">
                <p className="text-sm text-czarny/55">
                  Brak produktów dla wybranych filtrów — lista jest pusta.
                </p>
                <a
                  href={`/sklep?sklep=${lane}`}
                  className="inline-flex font-heading text-[11px] uppercase tracking-[0.14em] text-czerwony underline decoration-czerwony/30 underline-offset-4"
                >
                  Wyczyść filtry
                </a>
              </div>
            ) : (
              <>
                <div id="sklep-katalog" className="grid gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                  {pageProducts.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      imagePriority={index < 6}
                    />
                  ))}
                </div>
                <Suspense>
                  <CatalogPagination page={page} totalPages={totalPages} />
                </Suspense>
              </>
            )}
            <div className="mt-10">
              <RecentlyViewed />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
