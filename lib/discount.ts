/** Newsletter / campaign percent of product goods (never shipping). Admin-editable. */
export const DEFAULT_NEWSLETTER_DISCOUNT_PERCENT = 10;

export function clampNewsletterDiscountPercent(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return DEFAULT_NEWSLETTER_DISCOUNT_PERCENT;
  return Math.min(30, Math.max(5, Math.round(n)));
}

export function newsletterDiscountRate(percent?: number) {
  return clampNewsletterDiscountPercent(percent) / 100;
}

export function formatNewsletterDiscount(percent?: number) {
  return `−${clampNewsletterDiscountPercent(percent)}%`;
}

/** Swap {discount} and leftover −15% copy when the admin changes the rate. */
export function applyDiscountCopy(text: string, percent?: number) {
  const label = formatNewsletterDiscount(percent);
  return text.replaceAll("{discount}", label).replace(/[-−]\d+\s*%/g, label);
}

export function discountAmountFromGoods(goodsCents: number, percent?: number) {
  return Math.round(Math.max(0, goodsCents) * newsletterDiscountRate(percent));
}
