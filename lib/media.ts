import type { Product } from "@/lib/types";

/** Real PDP photos live here; brand book crops are placeholders only. */
const REAL_PHOTO_PREFIX = "/brand/photos/products/";
/** Woo import used the first PNG as a black sygnet, not a product shot. */
const WOO_LOGO_PNG = /-01\.png$/i;
const PHOTO_FILE = /\.(jpe?g|webp|avif)$/i;

export function isUsableProductPhoto(src: string) {
  if (!src.includes(REAL_PHOTO_PREFIX)) return false;
  if (WOO_LOGO_PNG.test(src)) return false;
  return true;
}

/** Cover image for shop cards / hero — never the imported sygnet PNG. */
export function getProductPhoto(product: Pick<Product, "images">, fallback?: string) {
  if (fallback && isUsableProductPhoto(fallback)) return fallback;

  const real = product.images.filter(isUsableProductPhoto);
  return real.find((src) => PHOTO_FILE.test(src)) ?? real[0];
}
