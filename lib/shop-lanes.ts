import { SHOP_CATEGORY_TREE } from "@/lib/constants";
import type { Product, ProductDomain } from "@/lib/types";

export type ShopLaneId = "uzytkowa" | "pracownia";

export const SHOP_LANES = {
  uzytkowa: {
    id: "uzytkowa" as const,
    label: "Ceramika użytkowa",
    shortLabel: "Dla domu",
    description: "Kubki, czarki, miski, talerze i drewno — naczynia na codzienny stół.",
    domains: ["ceramika", "drewno"] as const satisfies readonly ProductDomain[],
  },
  pracownia: {
    id: "pracownia" as const,
    label: "Dla pracowni",
    shortLabel: "Dla ceramików",
    description: "Formy matki i, wkrótce, narzędzia do pracowni ceramicznej.",
    domains: ["formy"] as const satisfies readonly ProductDomain[],
  },
} as const;

export function isShopLane(value: string | null | undefined): value is ShopLaneId {
  return value === "uzytkowa" || value === "pracownia";
}

export function laneForDomain(domain: ProductDomain): ShopLaneId {
  return domain === "formy" ? "pracownia" : "uzytkowa";
}

export function productInLane(product: Product, lane: ShopLaneId) {
  return (SHOP_LANES[lane].domains as readonly string[]).includes(product.domain);
}

export function categoryTreeForLane(lane: ShopLaneId) {
  const domains = SHOP_LANES[lane].domains as readonly string[];
  return SHOP_CATEGORY_TREE.filter((group) => domains.includes(group.domain));
}
