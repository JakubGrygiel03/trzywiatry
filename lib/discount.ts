/** Newsletter and campaign codes are always −15% of product goods (not shipping). */
export const NEWSLETTER_DISCOUNT_RATE = 0.15;

export function discountAmountFromGoods(goodsCents: number) {
  return Math.round(Math.max(0, goodsCents) * NEWSLETTER_DISCOUNT_RATE);
}
