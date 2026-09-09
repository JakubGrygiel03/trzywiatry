import { CATEGORY_LABELS } from "@/lib/constants";
import type { Product } from "@/lib/types";

export function filterAdminProducts(
  products: Product[],
  { q, category }: { q?: string; category?: string },
) {
  const needle = (q ?? "").trim().toLowerCase();
  const cat = (category ?? "").trim();

  return products.filter((product) => {
    if (cat && product.category !== cat) return false;
    if (!needle) return true;

    const hay = [
      product.name,
      product.slug,
      CATEGORY_LABELS[product.category] ?? product.category,
      ...product.variants.flatMap((variant) => [variant.title, variant.sku]),
    ]
      .join(" ")
      .toLowerCase();

    return hay.includes(needle);
  });
}
