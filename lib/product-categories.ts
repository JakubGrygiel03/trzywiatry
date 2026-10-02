import { CATEGORY_LABELS, DOMAIN_LABELS, SHOP_CATEGORY_TREE } from "@/lib/constants";
import type { ProductDomain } from "@/lib/types";

export type ProductCategoryDef = {
  id: string;
  label: string;
  domain: ProductDomain;
};

export type ShopCategoryGroup = {
  id: string;
  label: string;
  domain: ProductDomain;
  children: { id: string; label: string; category: string }[];
};

export function defaultProductCategories(): ProductCategoryDef[] {
  const rows: ProductCategoryDef[] = SHOP_CATEGORY_TREE.flatMap((group) =>
    group.children.map((child) => ({
      id: child.category,
      label: child.label,
      domain: group.domain,
    })),
  );
  if (!rows.some((row) => row.id === "karty")) {
    rows.push({ id: "karty", label: CATEGORY_LABELS.karty ?? "Karty podarunkowe", domain: "ceramika" });
  }
  return rows;
}

export function shopCategoryTreeFrom(categories: ProductCategoryDef[]): ShopCategoryGroup[] {
  const domains: ProductDomain[] = ["ceramika", "formy", "drewno"];
  return domains
    .map((domain) => ({
      id: domain,
      label: DOMAIN_LABELS[domain],
      domain,
      children: categories
        .filter((row) => row.domain === domain)
        .map((row) => ({ id: row.id, label: row.label, category: row.id })),
    }))
    .filter((group) => group.children.length > 0);
}

export function categoriesForDomain(categories: ProductCategoryDef[], domain: ProductDomain) {
  return categories.filter((row) => row.domain === domain);
}

export function labelForCategory(categories: ProductCategoryDef[], id: string) {
  return categories.find((row) => row.id === id)?.label ?? CATEGORY_LABELS[id] ?? id;
}

export function slugifyCategoryId(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 40);
}

export function uniqueCategoryId(existing: ProductCategoryDef[], label: string) {
  const base = slugifyCategoryId(label) || "kategoria";
  if (!existing.some((row) => row.id === base)) return base;
  let n = 2;
  while (existing.some((row) => row.id === `${base}_${n}`)) n += 1;
  return `${base}_${n}`;
}
