import { cache } from "react";
import { collections } from "@/lib/data/collections";
import { getProductUpsells } from "@/lib/data/recommendations";
import {
  getRuntimeBlogPosts,
  getRuntimeCatalog,
  getRuntimeSettings,
  getRuntimeWorkshopById,
  getRuntimeWorkshops,
} from "@/lib/data/runtime-store";
import { getProductPhoto, isUsableProductPhoto } from "@/lib/media";
import type { HeroSlot, Product, ProductDomain } from "@/lib/types";

export type HeroGalleryItem = {
  id: string;
  name: string;
  slug: string;
  image: string;
  caption?: string;
};

export function getSettings() {
  return getRuntimeSettings();
}

export function getCollections() {
  return collections;
}

export function getCollectionBySlug(slug: string) {
  return collections.find((item) => item.slug === slug);
}

export const getAllProducts = cache(() => getRuntimeCatalog());

export function getPublishedProducts() {
  return getAllProducts().filter(
    (product) => product.isPublished && Boolean(getProductPhoto(product)),
  );
}

export function getProductBySlug(slug: string) {
  return getPublishedProducts().find((product) => product.slug === slug);
}

export function getProductById(id: string) {
  return getAllProducts().find((product) => product.id === id);
}

export function getFeaturedProducts() {
  return getPublishedProducts().filter((product) => product.isBestseller);
}

export type HeroPhotoOption = {
  productId: string;
  name: string;
  image: string;
};

/** All usable product photos for the admin hero picker. */
export function getHeroPhotoOptions(): HeroPhotoOption[] {
  return getAllProducts().flatMap((product) =>
    product.images.filter(isUsableProductPhoto).map((image) => ({
      productId: product.id,
      name: product.name,
      image,
    })),
  );
}

function slotsToGallery(slots: HeroSlot[]): HeroGalleryItem[] {
  const collectionName = Object.fromEntries(collections.map((c) => [c.id, c.name]));

  return slots.flatMap((slot) => {
    const product = getProductById(slot.productId);
    if (!product || !isUsableProductPhoto(slot.image)) return [];
    return [
      {
        id: `${product.id}:${slot.image}`,
        name: product.name,
        slug: product.slug,
        image: slot.image,
        caption: product.collectionId ? collectionName[product.collectionId] : undefined,
      },
    ];
  });
}

/** Finished pieces only — plaster molds stay out of the automatic hero. */
function isHeroPiece(product: Product) {
  return product.domain !== "formy" && product.category !== "formy_matki";
}

/** Home hero mosaic — admin curation first, then bestsellers. */
export function getHeroGalleryProducts(limit = 12): HeroGalleryItem[] {
  const curated = slotsToGallery(getSettings().heroSlots ?? []);
  if (curated.length > 0) return curated.slice(0, limit);

  const collectionName = Object.fromEntries(collections.map((c) => [c.id, c.name]));
  const published = getPublishedProducts().filter(isHeroPiece);
  const pool =
    published.length > 0
      ? published
      : getAllProducts().filter((product) => isHeroPiece(product) && Boolean(getProductPhoto(product)));

  return pool
    .map((product) => {
      const image = getProductPhoto(product);
      if (!image) return null;
      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        image,
        caption: product.collectionId ? collectionName[product.collectionId] : undefined,
        isBestseller: product.isBestseller,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => Number(b.isBestseller) - Number(a.isBestseller))
    .slice(0, limit)
    .map(({ id, name, slug, image, caption }) => ({ id, name, slug, image, caption }));
}

export function getProductsByCollection(collectionId: string) {
  return getPublishedProducts().filter((product) => product.collectionId === collectionId);
}

export function getRelatedProducts(product: Product, limit = 4) {
  return getProductUpsells(product, limit).map((item) => item.product);
}

export function filterCatalog(filters: {
  capacity?: number;
  domain?: ProductDomain;
  category?: string;
  minPriceCents?: number;
  maxPriceCents?: number;
}) {
  return getPublishedProducts().filter((product) => {
    if (filters.domain && product.domain !== filters.domain) return false;
    if (filters.category && product.category !== filters.category) return false;
    if (filters.minPriceCents != null && product.priceInCents < filters.minPriceCents) return false;
    if (filters.maxPriceCents != null && product.priceInCents > filters.maxPriceCents) return false;
    if (filters.capacity) {
      if (!product.capacityMl) return false;
      if (filters.capacity === 400) return product.capacityMl >= 400;
      if (filters.capacity === 180) {
        return product.capacityMl >= 160 && product.capacityMl <= 180;
      }
      return product.capacityMl === filters.capacity;
    }
    return true;
  });
}

/** Stable catalog ordering — default keeps bestsellers first (legacy Woo feel). */
export function sortCatalog(products: Product[], sortId?: string | null) {
  const list = [...products];
  switch (sortId) {
    case "popularnosc":
      return list.sort((a, b) => Number(b.isBestseller) - Number(a.isBestseller) || a.name.localeCompare(b.name, "pl"));
    case "nazwa":
      return list.sort((a, b) => a.name.localeCompare(b.name, "pl"));
    case "cena_asc":
      return list.sort((a, b) => a.priceInCents - b.priceInCents || a.name.localeCompare(b.name, "pl"));
    case "cena_desc":
      return list.sort((a, b) => b.priceInCents - a.priceInCents || a.name.localeCompare(b.name, "pl"));
    case "domyslne":
    default:
      return list.sort((a, b) => Number(b.isBestseller) - Number(a.isBestseller) || a.name.localeCompare(b.name, "pl"));
  }
}

/** Catalog price bounds in grosze for the shop slider. */
export function getCatalogPriceBounds() {
  const products = getPublishedProducts();
  if (products.length === 0) return { minCents: 0, maxCents: 10000 };
  const prices = products.map((product) => product.priceInCents);
  return {
    minCents: Math.min(...prices),
    maxCents: Math.max(...prices),
  };
}

/** Counts for hierarchical category sidebar. */
export function getShopCategoryCounts() {
  const products = getPublishedProducts();
  const byCategory = new Map<string, number>();
  const byDomain = new Map<string, number>();

  for (const product of products) {
    byCategory.set(product.category, (byCategory.get(product.category) ?? 0) + 1);
    byDomain.set(product.domain, (byDomain.get(product.domain) ?? 0) + 1);
  }

  return { byCategory, byDomain };
}

export function areWorkshopsEnabled() {
  return getRuntimeSettings().workshopsEnabled;
}

export function getWorkshops() {
  if (!areWorkshopsEnabled()) return [];
  return getRuntimeWorkshops()
    .filter((workshop) => workshop.isPublished)
    .slice()
    .sort((a, b) => +new Date(a.eventDate) - +new Date(b.eventDate));
}

/** Admin / internal: all workshops, including drafts. */
export function getAllWorkshops() {
  return getRuntimeWorkshops()
    .slice()
    .sort((a, b) => +new Date(a.eventDate) - +new Date(b.eventDate));
}

export function getWorkshopBySlug(slug: string) {
  return getWorkshops().find((workshop) => workshop.slug === slug);
}

export function getWorkshopById(id: string) {
  return getRuntimeWorkshopById(id);
}

export function remainingSeats(workshop: { maxAttendees: number; bookedSeats: number }) {
  return Math.max(0, workshop.maxAttendees - workshop.bookedSeats);
}

export const getAllPosts = cache(() => getRuntimeBlogPosts());

export function getPublishedPosts() {
  return getAllPosts()
    .filter((post) => post.status === "published")
    .slice()
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
}

export function getPostBySlug(slug: string) {
  return getPublishedPosts().find((post) => post.slug === slug);
}

export function getPostById(id: string) {
  return getAllPosts().find((post) => post.id === id);
}

export function variantStockLabel(stock: number, threshold: number) {
  if (stock <= 0) return "sold_out" as const;
  if (stock <= threshold) return "low" as const;
  return "in_stock" as const;
}
