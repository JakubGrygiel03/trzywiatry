import { Suspense } from "react";
import { CatalogFilters } from "@/components/shop/catalog-filters";
import { CatalogPagination } from "@/components/shop/catalog-pagination";
import { CatalogToolbar } from "@/components/shop/catalog-toolbar";
import { ProductCard } from "@/components/shop/product-card";
import { RecentlyViewed } from "@/components/shop/recently-viewed";
import { Container, SectionHeading } from "@/components/ui/badge";
import {
  filterCatalog,
  getCatalogPriceBounds,
  getShopCategoryCounts,
  sortCatalog,
} from "@/lib/data/queries";
import type { ProductDomain } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sklep",
  description: "Katalog ceramiki i drewna Trzy Wiatry — filtr ceny, kategorie i pojemności.",
};

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
  }>;
}) {
  const params = await searchParams;
  const minZl = params.cena_od ? Number(params.cena_od) : undefined;
  const maxZl = params.cena_do ? Number(params.cena_do) : undefined;

  const filtered = filterCatalog({
    capacity: params.pojemnosc ? Number(params.pojemnosc) : undefined,
    domain: params.domena as ProductDomain | undefined,
    category: params.kategoria,
    minPriceCents: minZl != null && !Number.isNaN(minZl) ? minZl * 100 : undefined,
    maxPriceCents: maxZl != null && !Number.isNaN(maxZl) ? maxZl * 100 : undefined,
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

  const priceBounds = getCatalogPriceBounds();
  const counts = getShopCategoryCounts();
  const categoryCounts = {
    byCategory: Object.fromEntries(counts.byCategory),
    byDomain: Object.fromEntries(counts.byDomain),
  };

  return (
    <div className="py-6 md:py-8">
      <Container className="space-y-5">
        <SectionHeading eyebrow="Sklep pracowni" title="Naczynia i drewno" />
        <div className="grid items-start gap-6 lg:grid-cols-[260px_1fr] lg:gap-8">
          <Suspense>
            <CatalogFilters priceBounds={priceBounds} categoryCounts={categoryCounts} />
          </Suspense>
          <div>
            <Suspense>
              <CatalogToolbar total={total} from={from} to={to} />
            </Suspense>
            {pageProducts.length === 0 ? (
              <p className="text-sm text-szary">Zdejmij jeden warunek z listy po lewej.</p>
            ) : (
              <>
                <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                  {pageProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
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
