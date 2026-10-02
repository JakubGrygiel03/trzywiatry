import { getProductCategories } from "@/lib/data/queries";
import { labelForCategory } from "@/lib/product-categories";
import type { Product } from "@/lib/types";

export function filterAdminProducts(
  products: Product[],
  { q, category }: { q?: string; category?: string },
  categoryList = getProductCategories(),
) {
  const needle = (q ?? "").trim().toLowerCase();
  const cat = (category ?? "").trim();

  return products.filter((product) => {
    if (cat && product.category !== cat) return false;
    if (!needle) return true;

    const hay = [
      product.name,
      product.slug,
      labelForCategory(categoryList, product.category),
      ...product.variants.flatMap((variant) => [variant.title, variant.sku]),
    ]
      .join(" ")
      .toLowerCase();

    return hay.includes(needle);
  });
}
