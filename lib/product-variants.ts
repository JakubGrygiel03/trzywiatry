import { glazeColorHex } from "@/lib/glaze-colors";
import { isUsableProductPhoto } from "@/lib/media";
import type { Product, ProductVariant } from "@/lib/types";

export function variantColors(product: Product) {
  const seen = new Set<string>();
  const colors: { name: string; hex?: string }[] = [];
  for (const variant of product.variants) {
    const name = variant.color?.trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    colors.push({ name, hex: variant.colorHex ?? glazeColorHex(name) });
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

/**
 * Gallery for the selected variant.
 * - Capacity-only / shared gallery: all product photos, cover first
 * - Colour variants with `-v{id}-` files: parent shots + that variant’s shots
 * - Legacy `slug-02.jpg` stems: group by colour stem
 */
export function photosForVariant(product: Product, variant?: ProductVariant) {
  const all = product.images.filter(isUsableProductPhoto);
  const cover = variant?.image && isUsableProductPhoto(variant.image) ? variant.image : undefined;
  if (!cover) return all;

  const withCoverFirst = (list: string[]) => [cover, ...list.filter((src) => src !== cover)];

  // Woo CSV import: variant-specific files are named `…-v1234-…`
  const variantToken = cover.match(/-v\d+-/i)?.[0];
  if (variantToken) {
    const matched = all.filter(
      (src) => src === cover || src.includes(variantToken) || !/-v\d+-/i.test(src),
    );
    return withCoverFirst(matched.length ? matched : all);
  }

  // Legacy naming: `micha-biala-02.jpg` — group by stem without trailing -NN
  const classicStem = (src: string) => src.replace(/-\d{2}\.(jpe?g|png|webp|avif)$/i, "").toLowerCase();
  const coverClassic = classicStem(cover);
  if (coverClassic !== cover.toLowerCase()) {
    const matched = all.filter((src) => src === cover || classicStem(src) === coverClassic);
    if (matched.length > 1) return withCoverFirst(matched);
  }

  // Shared gallery (e.g. wygodny kubas – capacity variants): show every product photo
  return withCoverFirst(all);
}
