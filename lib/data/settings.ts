import type { StudioSettings } from "@/lib/types";

export const defaultStudioSettings: StudioSettings = {
  announcementType: "promo",
  announcementText: "Darmowa dostawa od 300 zł  ·  Newsletter: −15% na hasło WIOSNA",
  promoCode: "WIOSNA",
  /** Align with shop regulamin §5 — free shipping above 300 PLN in Poland. */
  freeShippingThresholdCents: 30000,
  giftWrapPriceCents: 2000,
  /** Na razie wyłączone — włącz w adminie, gdy wrócą terminy. */
  workshopsEnabled: false,
  heroSlots: [],
  newsletterEnabled: true,
  newsletterEyebrow: "Newsletter",
  newsletterTitle: "−15% na pierwsze naczynie",
  newsletterBody:
    "Kod {code} przychodzi mailem. Zero spamu — nowe wypusty, kolekcje i przerwy twórcze.",
  newsletterFormLabel: "Podaj e-mail",
  newsletterButtonLabel: "Odbierz −15%",
};

/** @deprecated Prefer getSettings() — kept for modules that import the constant seed. */
export const studioSettings = defaultStudioSettings;

export function interpolatePromoCode(text: string, code?: string) {
  return text.replaceAll("{code}", (code ?? "").trim() || "WIOSNA");
}
