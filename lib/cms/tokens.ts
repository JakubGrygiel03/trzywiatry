export type CmsToken = { key: string; label: string };

export const CMS_TOKEN_LABELS: Record<string, string> = {
  orderNumber: "numer tego zamówienia",
  customerName: "imię klienta",
  items: "lista produktów",
  total: "kwota",
  vacationBlock: "nota urlopowa (pusta poza urlopem)",
  statusLabel: "status zamówienia",
  trackingBlock: "numer śledzenia",
  studioEmail: "e-mail pracowni",
  code: "aktualny kod z ustawień",
  workshopTitle: "nazwa warsztatu",
  seatsCount: "liczba miejsc",
  resetButton: "przycisk resetu",
  resetUrl: "link do resetu",
  freeShipping: "próg darmowej dostawy",
};

export function tokenChip(key: string): CmsToken {
  return { key, label: CMS_TOKEN_LABELS[key] ?? key };
}

export function wrapToken(key: string) {
  return `{${key}}`;
}

export function missingTokens(text: string, keys: string[]) {
  return keys.filter((key) => !text.includes(wrapToken(key)));
}

/** Blocks pasting the live promo code instead of {code}. */
export function hasHardcodedPromo(text: string, promoCode?: string) {
  const code = promoCode?.trim();
  if (!code || code.length < 2) return false;
  return text.includes(code) && !text.includes("{code}");
}

/** True when storefront copy would leak the campaign code (token or literal). */
export function revealsPromoOnStorefront(text: string, promoCode?: string) {
  if (text.includes("{code}")) return true;
  return hasHardcodedPromo(text, promoCode) || Boolean(promoCode && text.includes(promoCode));
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Public UI must never show the live promo code — it goes out only by email / checkout.
 * Replaces {code} and any literal campaign string with a neutral phrase.
 */
export function scrubPublicPromoCopy(text: string, promoCode?: string) {
  let out = text.replace(/\b[Kk]od\s*\{code\}/g, "Kod rabatowy").replaceAll("{code}", "rabatowy");
  const code = promoCode?.trim();
  if (code && code.length >= 2) {
    out = out.replace(new RegExp(`\\b${escapeRegExp(code)}\\b`, "gi"), "rabatowy");
  }
  return out;
}
