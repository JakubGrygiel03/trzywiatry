import { interpolateComponentCopy } from "@/lib/cms/site-components";
import { scrubPublicPromoCopy } from "@/lib/cms/tokens";
import { applyDiscountCopy, DEFAULT_NEWSLETTER_DISCOUNT_PERCENT } from "@/lib/discount";
import type { StudioSettings } from "@/lib/types";

export const defaultStudioSettings: StudioSettings = {
  announcementType: "promo",
  announcementText: "Darmowa dostawa od {freeShipping}  ·  Newsletter: {discount}",
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
  shopLaneUzytkowaEnabled: true,
  shopLanePracowniaEnabled: true,
  newsletterEnabled: true,
  newsletterEyebrow: "Newsletter",
  newsletterTitle: "{discount} na pierwsze naczynie",
  newsletterBody:
    "Kod rabatowy przychodzi mailem. Zero spamu — nowe wypusty, kolekcje i przerwy twórcze.",
  newsletterFormLabel: "Podaj e-mail",
  newsletterButtonLabel: "Odbierz {discount}",
  newsletterDiscountPercent: DEFAULT_NEWSLETTER_DISCOUNT_PERCENT,
  launchNoticeEnabled: false,
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
    discountPercent: settings.newsletterDiscountPercent,
  });
}

/** Storefront copy — never leaks promoCode; only free-shipping token is filled. */
export function interpolatePublicStudioCopy(text: string, settings: StudioSettings) {
  const withShipping = interpolateComponentCopy(text, {
    freeShippingThresholdCents: settings.freeShippingThresholdCents,
    discountPercent: settings.newsletterDiscountPercent,
  });
  return applyDiscountCopy(scrubPublicPromoCopy(withShipping, settings.promoCode), settings.newsletterDiscountPercent);
}
