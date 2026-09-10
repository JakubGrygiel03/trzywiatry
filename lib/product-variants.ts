import type { Product, ProductVariant } from "@/lib/types";

export function variantColors(product: Product) {
  const seen = new Set<string>();
  const colors: { name: string; hex?: string }[] = [];
  for (const variant of product.variants) {
    const name = variant.color?.trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    colors.push({ name, hex: variant.colorHex });
  }
  return colors;
}

export function variantCapacities(product: Product) {
  const seen = new Set<number>();
  const values: number[] = [];
  for (const variant of product.variants) {
    const ml = variant.capacityMl ?? product.capacityMl;
    if (!ml || seen.has(ml)) continue;
    seen.add(ml);
    values.push(ml);
  }
  return values.sort((a, b) => a - b);
}

export function hasStructuredVariants(product: Product) {
  return variantColors(product).length > 1 || variantCapacities(product).length > 1;
}

export function variantMatches(
  variant: ProductVariant,
  product: Product,
  color?: string,
  capacityMl?: number,
) {
  if (color && (variant.color ?? "") !== color) return false;
  const ml = variant.capacityMl ?? product.capacityMl;
  if (capacityMl != null && ml !== capacityMl) return false;
  return true;
}

export function findVariant(
  product: Product,
  color?: string,
  capacityMl?: number,
): ProductVariant | undefined {
  return (
    product.variants.find((variant) => variantMatches(variant, product, color, capacityMl)) ??
    product.variants[0]
  );
}

export function variantPhoto(product: Product, variant?: ProductVariant) {
  return variant?.image ?? product.images[0];
}
