export type CmsToken = { key: string; label: string };

export const CMS_TOKEN_LABELS: Record<string, string> = {
  orderNumber: "numer tego zamówienia",
  customerName: "imię klienta",
  items: "lista produktów (sama)",
  itemsBlock: "kafelek z listą produktów",
  total: "kwota",
  vacationBlock: "nota urlopowa (pusta poza urlopem)",
  statusLabel: "status zamówienia",
  trackingBlock: "kafelek ze śledzeniem",
  highlightBlock: "duży kafelek z numerem / kodem",
  detailsBlock: "kafelek „Szczegóły zamówienia”",
  studioEmail: "e-mail pracowni",
  code: "aktualny kod z ustawień",
  workshopTitle: "nazwa warsztatu",
  seatsCount: "liczba miejsc",
  resetButton: "przycisk resetu hasła",
  resetUrl: "link do resetu",
  confirmButton: "przycisk potwierdzenia konta",
  confirmUrl: "link potwierdzenia konta",
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
    const escaped = escapeRegExp(code);
    // Drop “· KOD WIOSNA” / “KOD: WIOSNA” segments entirely from banners.
    out = out.replace(new RegExp(`\\s*[·•|]\\s*[Kk]od\\s*:?\\s*${escaped}\\b`, "gi"), "");
    out = out.replace(new RegExp(`\\b[Kk]od\\s*:?\\s*${escaped}\\b`, "gi"), "Newsletter: −15%");
    out = out.replace(new RegExp(`\\b${escaped}\\b`, "gi"), "rabatowy");
  }
  return out.replace(/\s*[·•]\s*[·•]/g, " · ").replace(/\s{2,}/g, " ").trim();
}
