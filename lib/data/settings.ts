import { interpolateComponentCopy } from "@/lib/cms/site-components";
import { scrubPublicPromoCopy } from "@/lib/cms/tokens";
import type { StudioSettings } from "@/lib/types";

export const defaultStudioSettings: StudioSettings = {
  announcementType: "promo",
  announcementText: "Darmowa dostawa od {freeShipping}  ·  Newsletter: −15%",
  promoCode: "WIOSNA",
  /** Align with shop regulamin §5 — free shipping above 300 PLN in Poland. */
  freeShippingThresholdCents: 30000,
  giftWrapPriceCents: 2000,
  giftWrapEnabled: true,
  /** Na razie wyłączone — włącz w adminie, gdy wrócą terminy. */
  workshopsEnabled: false,
  heroSlots: [],
  shopHubUzytkowaImage: "/brand/photos/products/woo/czajniczek-w-kropki-zestaw-03.jpg",
  shopHubPracowniaImage: "/brand/photos/products/woo/forma-gipsowa-c1-06.jpg",
  newsletterEnabled: true,
  newsletterEyebrow: "Newsletter",
  newsletterTitle: "−15% na pierwsze naczynie",
  newsletterBody:
    "Kod rabatowy przychodzi mailem. Zero spamu — nowe wypusty, kolekcje i przerwy twórcze.",
  newsletterFormLabel: "Podaj e-mail",
  newsletterButtonLabel: "Odbierz −15%",
  maintenanceMode: false,
  maintenancePreviewToken: "",
};

/** @deprecated Prefer getSettings() — kept for modules that import the constant seed. */
export const studioSettings = defaultStudioSettings;

export function interpolatePromoCode(text: string, code?: string) {
  return interpolateComponentCopy(text, { code });
}

/** Emails / checkout — may include the live promo code. */
export function interpolateStudioCopy(text: string, settings: StudioSettings) {
  return interpolateComponentCopy(text, {
    code: settings.promoCode,
    freeShippingThresholdCents: settings.freeShippingThresholdCents,
  });
}

/** Storefront copy — never leaks promoCode; only free-shipping token is filled. */
export function interpolatePublicStudioCopy(text: string, settings: StudioSettings) {
  const withShipping = interpolateComponentCopy(text, {
    freeShippingThresholdCents: settings.freeShippingThresholdCents,
  });
  return scrubPublicPromoCopy(withShipping, settings.promoCode);
}
