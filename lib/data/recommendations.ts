import { getRuntimeCatalog } from "@/lib/data/runtime-store";
import type { Product } from "@/lib/types";

const TECHNICAL_CATEGORIES = new Set(["formy_matki", "formy_master", "narzedzia"]);

/** Categories that naturally complete each other on the table. */
const COMPLEMENTS: Record<string, string[]> = {
  kubki: ["miski", "talerze", "czarki", "czajniczki", "zestawy", "rzezby"],
  czarki: ["kubki", "miski", "talerze", "czajniczki", "zestawy"],
  miski: ["kubki", "talerze", "czarki", "zestawy", "rzezby"],
  talerze: ["kubki", "miski", "czarki", "zestawy", "rzezby"],
  czajniczki: ["czarki", "kubki", "miski", "talerze", "zestawy"],
  rzezby: ["kubki", "miski", "talerze", "zestawy"],
  zestawy: ["kubki", "talerze", "miski", "czarki", "rzezby"],
  karty: ["zestawy", "kubki", "miski"],
  formy_matki: ["formy_matki", "formy_master", "narzedzia"],
  formy_master: ["formy_matki", "formy_master", "narzedzia"],
  narzedzia: ["formy_matki", "formy_master", "narzedzia"],
};

export type UpsellSuggestion = {
  product: Product;
  reason: string;
  score: number;
};

export type UpsellCopy = {
  title: string;
  subtitle: string;
  rail: string;
};

export function isStudioTechnicalProduct(product: Pick<Product, "domain" | "category">) {
  return product.domain === "formy" || TECHNICAL_CATEGORIES.has(product.category);
}

/** Heading + supporting line for the PDP recommendation block. */
export function getUpsellCopy(product: Product): UpsellCopy {
  if (isStudioTechnicalProduct(product)) {
    return {
      title: "Dobierz do pracowni",
      subtitle: "Pasujące formy, narzędzia i akcesoria odlewnicze — bez zastawy stołowej.",
      rail: "Formy i narzędzia, które naturalnie uzupełniają odlew.",
    };
  }
  if (product.domain === "drewno") {
    return {
      title: "Dobierz do deski",
      subtitle: "Naczynia i drewno, które dobrze siadają obok tego egzemplarza.",
      rail: "Pary, które naturalnie uzupełniają wybór.",
    };
  }
  return {
    title: "Dobierz zestaw do stołu",
    subtitle: "Ta sama kolekcja szkliwa, dopełniające formy albo gotowy zestaw prezentowy.",
    rail: "Pary i zestawy, które naturalnie uzupełniają wybór.",
  };
}

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
  if (isStudioTechnicalProduct(seed)) {
    if (candidate.category === "narzedzia") return "Narzędzia do odlewu";
    if (candidate.category === "formy_master") return "Forma master";
    return "Pasuje do odlewu";
  }
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

  const curated = Boolean(seed.relatedIds?.includes(candidate.id));
  const seedTech = isStudioTechnicalProduct(seed);
  const candidateTech = isStudioTechnicalProduct(candidate);
  // Tableware ↔ molds only when the atelier curated the pair.
  if (seedTech !== candidateTech && !curated) return 0;

  let score = 0;
  if (curated) score += 100;
  if (candidate.category === "zestawy" && seed.category !== "zestawy" && !seedTech) score += 45;
  if (seed.collectionId && candidate.collectionId === seed.collectionId) score += 40;
  if ((COMPLEMENTS[seed.category] ?? []).includes(candidate.category)) score += 28;
  if (!seedTech && seed.domain === "ceramika" && candidate.domain === "drewno") score += 22;
  if (!seedTech && seed.domain === "drewno" && candidate.domain === "ceramika") score += 22;
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
