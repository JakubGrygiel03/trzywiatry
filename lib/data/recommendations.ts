import { getRuntimeCatalog } from "@/lib/data/runtime-store";
import type { Product } from "@/lib/types";

/** Categories that naturally complete each other on the table. */
const COMPLEMENTS: Record<string, string[]> = {
  kubki: ["miski", "talerze", "zestawy", "rzezby"],
  miski: ["kubki", "talerze", "zestawy", "rzezby"],
  talerze: ["kubki", "miski", "zestawy", "rzezby"],
  rzezby: ["kubki", "miski", "talerze", "zestawy"],
  zestawy: ["kubki", "talerze", "miski", "rzezby"],
  karty: ["zestawy", "kubki", "miski"],
  formy_matki: ["kubki", "formy_matki"],
};

export type UpsellSuggestion = {
  product: Product;
  reason: string;
  score: number;
};

function published() {
  return getRuntimeCatalog().filter((product) => product.isPublished);
}

function byId(id: string) {
  return getRuntimeCatalog().find((product) => product.id === id);
}

function hasStock(product: Product) {
  return product.variants.some((v) => v.isAvailable && v.stockQuantity > 0);
}

function reasonFor(seed: Product, candidate: Product): string {
  if (seed.relatedIds?.includes(candidate.id)) return "Dobierz do pary";
  if (candidate.category === "zestawy" && seed.category !== "zestawy") return "Zestaw prezentowy";
  if (seed.collectionId && candidate.collectionId === seed.collectionId) return "Ta sama kolekcja";
  if (seed.domain === "ceramika" && candidate.domain === "drewno") return "Ceramika + drewno";
  if (seed.domain === "drewno" && candidate.domain === "ceramika") return "Do deski";
  if ((COMPLEMENTS[seed.category] ?? []).includes(candidate.category)) return "Dopełnia stół";
  if (candidate.isBestseller) return "Bestseller pracowni";
  return "Pasuje do koszyka";
}

function scorePair(seed: Product, candidate: Product): number {
  if (seed.id === candidate.id || !hasStock(candidate)) return 0;

  let score = 0;
  if (seed.relatedIds?.includes(candidate.id)) score += 100;
  if (candidate.category === "zestawy" && seed.category !== "zestawy") score += 45;
  if (seed.collectionId && candidate.collectionId === seed.collectionId) score += 40;
  if ((COMPLEMENTS[seed.category] ?? []).includes(candidate.category)) score += 28;
  if (seed.domain === "ceramika" && candidate.domain === "drewno") score += 22;
  if (seed.domain === "drewno" && candidate.domain === "ceramika") score += 22;
  if (candidate.isBestseller) score += 12;
  if (seed.category === candidate.category) score += 8;
  if (
    seed.capacityMl &&
    candidate.capacityMl &&
    Math.abs(seed.capacityMl - candidate.capacityMl) <= 100
  ) {
    score += 6;
  }
  return score;
}

/** Related products for a PDP — curated IDs win, then complements & collection. */
export function getProductUpsells(product: Product, limit = 4): UpsellSuggestion[] {
  return published()
    .map((candidate) => {
      const score = scorePair(product, candidate);
      return score > 0
        ? { product: candidate, score, reason: reasonFor(product, candidate) }
        : null;
    })
    .filter((item): item is UpsellSuggestion => item !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/** Cart-aware upsell: merges signals from every line, skips items already in cart. */
export function getCartUpsells(productIds: string[], limit = 4): UpsellSuggestion[] {
  const exclude = new Set(productIds);
  const seeds = productIds.map((id) => byId(id)).filter((p): p is Product => Boolean(p));

  if (seeds.length === 0) {
    return published()
      .filter((p) => hasStock(p) && p.isBestseller)
      .slice(0, limit)
      .map((product) => ({ product, score: 1, reason: "Polecane z pracowni" }));
  }

  const byProduct = new Map<string, UpsellSuggestion>();

  for (const seed of seeds) {
    for (const candidate of published()) {
      if (exclude.has(candidate.id)) continue;
      const score = scorePair(seed, candidate);
      if (score <= 0) continue;
      const prev = byProduct.get(candidate.id);
      if (!prev || score > prev.score) {
        byProduct.set(candidate.id, {
          product: candidate,
          score,
          reason: reasonFor(seed, candidate),
        });
      } else {
        prev.score += Math.round(score * 0.35);
      }
    }
  }

  return [...byProduct.values()].sort((a, b) => b.score - a.score).slice(0, limit);
}
