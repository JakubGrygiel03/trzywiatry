import { CATALOG_SORT_OPTIONS, capacityMatchesFilter, type CatalogSortId } from "@/lib/constants";
import type { ShopLaneId } from "@/lib/shop-lanes";
import type { Product, ProductDomain } from "@/lib/types";

export const CATALOG_PAGE_SIZE = 12;

const SORT_IDS = new Set<string>(CATALOG_SORT_OPTIONS.map((option) => option.id));
const DOMAINS = new Set<ProductDomain>(["ceramika", "drewno", "warsztaty", "formy"]);

export type CatalogQuery = {
  capacity?: number;
  domain?: ProductDomain;
  category?: string;
  minZl?: number;
  maxZl?: number;
  sort: CatalogSortId;
  page: number;
};

export const EMPTY_CATALOG_QUERY: CatalogQuery = { sort: "domyslne", page: 1 };

function zlParam(raw: string | null) {
  if (!raw) return undefined;
  const value = Number(raw);
  if (!Number.isFinite(value)) return undefined;
  return Math.max(0, Math.floor(value));
}

/** Read the public /sklep query string. Lane itself is not a catalog filter. */
export function parseCatalogSearchParams(params: { get(name: string): string | null }): CatalogQuery {
  const capacityRaw = Number(params.get("pojemnosc"));
  const capacity = Number.isFinite(capacityRaw) && capacityRaw > 0 ? capacityRaw : undefined;
  const domainRaw = params.get("domena");
  const domain = domainRaw && DOMAINS.has(domainRaw as ProductDomain) ? (domainRaw as ProductDomain) : undefined;
  const category = params.get("kategoria")?.trim() || undefined;
  const minRaw = zlParam(params.get("cena_od"));
  const maxRaw = zlParam(params.get("cena_do"));
  const minZl = minRaw != null && maxRaw != null ? Math.min(minRaw, maxRaw) : minRaw;
  const maxZl = minRaw != null && maxRaw != null ? Math.max(minRaw, maxRaw) : maxRaw;
  const sortRaw = params.get("sortuj");
  const sort = sortRaw && SORT_IDS.has(sortRaw) ? (sortRaw as CatalogSortId) : "domyslne";
  const pageRaw = Number(params.get("strona"));
  const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1;
  return { capacity, domain, category, minZl, maxZl, sort, page };
}

export function catalogHref(query: CatalogQuery, lane: ShopLaneId, page = query.page) {
  const next = new URLSearchParams();
  next.set("sklep", lane);
  if (query.capacity) next.set("pojemnosc", String(query.capacity));
  if (query.domain) next.set("domena", query.domain);
  if (query.category) next.set("kategoria", query.category);
  if (query.minZl != null) next.set("cena_od", String(query.minZl));
  if (query.maxZl != null) next.set("cena_do", String(query.maxZl));
  if (query.sort !== "domyslne") next.set("sortuj", query.sort);
  if (page > 1) next.set("strona", String(page));
  return `/sklep?${next.toString()}`;
}

function matches(product: Product, query: CatalogQuery) {
  if (query.domain && product.domain !== query.domain) return false;
  if (query.category && product.category !== query.category) return false;
  if (query.minZl != null && product.priceInCents < query.minZl * 100) return false;
  if (query.maxZl != null && product.priceInCents > query.maxZl * 100) return false;
  if (!query.capacity) return true;
  const sizes =
    typeof product.capacityMl === "number"
      ? [product.capacityMl]
      : product.variants
          .map((variant) => variant.capacityMl)
          .filter((ml): ml is number => typeof ml === "number");
  if (sizes.length === 0) return false;
  return sizes.some((ml) => capacityMatchesFilter(ml, query.capacity!));
}

function sortProducts(products: Product[], sort: CatalogSortId) {
  const list = [...products];
  switch (sort) {
    case "nazwa":
      return list.sort((a, b) => a.name.localeCompare(b.name, "pl"));
    case "cena_asc":
      return list.sort((a, b) => a.priceInCents - b.priceInCents || a.name.localeCompare(b.name, "pl"));
    case "cena_desc":
      return list.sort((a, b) => b.priceInCents - a.priceInCents || a.name.localeCompare(b.name, "pl"));
    case "popularnosc":
    case "domyslne":
    default:
      return list.sort((a, b) => Number(b.isBestseller) - Number(a.isBestseller) || a.name.localeCompare(b.name, "pl"));
  }
}

/** Filter, sort, and slice one lane. Runs in the browser after the cached page loads. */
export function applyCatalogQuery(products: Product[], query: CatalogQuery) {
  const sorted = sortProducts(products.filter((product) => matches(product, query)), query.sort);
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));
  const page = Math.min(query.page, totalPages);
  const start = (page - 1) * CATALOG_PAGE_SIZE;
  const pageProducts = sorted.slice(start, start + CATALOG_PAGE_SIZE);
  return {
    pageProducts,
    total,
    totalPages,
    page,
    from: total === 0 ? 0 : start + 1,
    to: Math.min(start + CATALOG_PAGE_SIZE, total),
  };
}
