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
