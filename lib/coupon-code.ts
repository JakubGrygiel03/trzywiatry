/** Shared coupon code parsing — safe for checkout Zod (not server-only). */

const DASHES = /[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/g;
const SPACES = /[\s\u00A0\u1680\u2000-\u200D\u202F\u205F\u3000\uFEFF]/g;
const BODY = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function normalizeCouponCode(code: string) {
  return code.trim().replace(DASHES, "-").replace(SPACES, "").toUpperCase();
}

export function isMintedNewsletterCode(code: string) {
  return new RegExp(`^TW-[${BODY}]{6}$`).test(normalizeCouponCode(code));
}
