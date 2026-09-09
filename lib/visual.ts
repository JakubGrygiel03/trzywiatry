import type { Product } from "@/lib/types";

export type GlazeKey = "dust" | "mist" | "sand" | "raw" | "wood" | "formy" | "gift";
export type VesselKind =
  | "espresso"
  | "cup"
  | "tea"
  | "bowl"
  | "plate"
  | "platter"
  | "board"
  | "sculpture"
  | "mold"
  | "set"
  | "card"
  | "wheel";
export type VesselView = "profil" | "szkliwo" | "stopka";

export const GLAZE: Record<
  GlazeKey,
  { paper: string; clay: string; glaze: string; shine: string; ink: string; name: string }
> = {
  dust: {
    paper: "#d9d2c8",
    clay: "#8d6a58",
    glaze: "#b7aaa0",
    shine: "#efe8e0",
    ink: "#3b322c",
    name: "Dust",
  },
  mist: {
    paper: "#ece8e1",
    clay: "#c4bdb3",
    glaze: "#f4f0e9",
    shine: "#ffffff",
    ink: "#4a4e52",
    name: "Mist",
  },
  sand: {
    paper: "#edd6b8",
    clay: "#c47a42",
    glaze: "#d39058",
    shine: "#f3d7b4",
    ink: "#5a3a22",
    name: "Sand",
  },
  raw: {
    paper: "#e3c4b3",
    clay: "#9c644e",
    glaze: "#c17a62",
    shine: "#efd0c2",
    ink: "#3d2418",
    name: "Raw Clay",
  },
  wood: {
    paper: "#e4d7c2",
    clay: "#7d5a38",
    glaze: "#c4a574",
    shine: "#f0e4cc",
    ink: "#3a2a18",
    name: "Drewno",
  },
  formy: {
    paper: "#e6e1d8",
    clay: "#aaa9a5",
    glaze: "#f3efe8",
    shine: "#ffffff",
    ink: "#3a3a38",
    name: "Formy",
  },
  gift: {
    paper: "#e8d5c8",
    clay: "#9c644e",
    glaze: "#d39058",
    shine: "#f6e6d8",
    ink: "#2c1c16",
    name: "Prezent",
  },
};

export function glazeFromCollection(collectionId?: string, domain?: string): GlazeKey {
  if (collectionId === "col-dust") return "dust";
  if (collectionId === "col-mist") return "mist";
  if (collectionId === "col-sand") return "sand";
  if (collectionId === "col-raw") return "raw";
  if (domain === "drewno") return "wood";
  if (domain === "formy") return "formy";
  return "dust";
}

export function vesselFromProduct(product: Pick<Product, "category" | "subCategory">): VesselKind {
  if (product.subCategory === "espresso") return "espresso";
  if (product.subCategory === "tea_bowl") return "tea";
  if (product.subCategory === "breakfast_bowl") return "bowl";
  if (product.subCategory === "platter") return "platter";
  if (product.subCategory === "serving_board") return "board";
  if (product.subCategory === "sculpture") return "sculpture";
  if (product.category === "talerze") return "plate";
  if (product.category === "miski") return "bowl";
  if (product.category === "formy_matki") return "mold";
  if (product.category === "zestawy") return "set";
  if (product.category === "karty") return "card";
  if (product.category === "rzezby") return "board";
  return "cup";
}

export function tiltFromId(id: string) {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) % 7;
  return hash - 3;
}
