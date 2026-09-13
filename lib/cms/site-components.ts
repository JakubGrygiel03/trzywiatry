import { formatPLN } from "@/lib/format";
import type { StudioSettings } from "@/lib/types";

/**
 * Stable keys — one per UI component. Admin edits payload; the storefront
 * looks up by key, never by a campaign name like WIOSNA.
 */
export const SITE_COMPONENT_KEYS = {
  announcementBar: "announcement_bar",
  newsletterCta: "newsletter_cta",
  shopHub: "shop_hub",
  homeHero: "home_hero",
  checkout: "checkout",
  workshops: "workshops",
} as const;

export type SiteComponentKey = (typeof SITE_COMPONENT_KEYS)[keyof typeof SITE_COMPONENT_KEYS];

export type SiteComponentRow = {
  key: SiteComponentKey;
  label: string;
  payload: Record<string, unknown>;
};

/** Tokens in CMS copy: {code} and {freeShipping} follow the admin fields. */
export function interpolateComponentCopy(
  text: string,
  vars: { code?: string; freeShippingThresholdCents?: number },
) {
  const code = (vars.code ?? "").trim();
  const shipping =
    vars.freeShippingThresholdCents != null ? formatPLN(vars.freeShippingThresholdCents) : "";
  return text.replaceAll("{code}", code).replaceAll("{freeShipping}", shipping);
}

export function flattenSiteComponents(
  rows: SiteComponentRow[],
  base: StudioSettings,
): StudioSettings {
  const byKey = new Map(rows.map((row) => [row.key, row.payload]));
  const announcement = byKey.get(SITE_COMPONENT_KEYS.announcementBar) ?? {};
  const newsletter = byKey.get(SITE_COMPONENT_KEYS.newsletterCta) ?? {};
  const shopHub = byKey.get(SITE_COMPONENT_KEYS.shopHub) ?? {};
  const hero = byKey.get(SITE_COMPONENT_KEYS.homeHero) ?? {};
  const checkout = byKey.get(SITE_COMPONENT_KEYS.checkout) ?? {};
  const workshops = byKey.get(SITE_COMPONENT_KEYS.workshops) ?? {};

  return {
    ...base,
    announcementType: readBannerType(announcement.type, base.announcementType),
    announcementText: readString(announcement.text, base.announcementText),
    vacationStartDate: readOptionalString(announcement.vacationStartDate) ?? base.vacationStartDate,
    vacationEndDate: readOptionalString(announcement.vacationEndDate) ?? base.vacationEndDate,
    vacationDispatchDate:
      readOptionalString(announcement.vacationDispatchDate) ?? base.vacationDispatchDate,
    newsletterEnabled: readBoolean(newsletter.enabled, base.newsletterEnabled),
    newsletterEyebrow: readString(newsletter.eyebrow, base.newsletterEyebrow),
    newsletterTitle: readString(newsletter.title, base.newsletterTitle),
    newsletterBody: readString(newsletter.body, base.newsletterBody),
    newsletterFormLabel: readString(newsletter.formLabel, base.newsletterFormLabel),
    newsletterButtonLabel: readString(newsletter.buttonLabel, base.newsletterButtonLabel),
    shopHubUzytkowaImage: readString(shopHub.uzytkowaImage, base.shopHubUzytkowaImage),
    shopHubPracowniaImage: readString(shopHub.pracowniaImage, base.shopHubPracowniaImage),
    heroSlots: Array.isArray(hero.slots) ? (hero.slots as StudioSettings["heroSlots"]) : base.heroSlots,
    promoCode: readOptionalString(checkout.promoCode) ?? base.promoCode,
    freeShippingThresholdCents: readNumber(
      checkout.freeShippingThresholdCents,
      base.freeShippingThresholdCents,
    ),
    giftWrapPriceCents: readNumber(checkout.giftWrapPriceCents, base.giftWrapPriceCents),
    workshopsEnabled: readBoolean(workshops.enabled, base.workshopsEnabled),
  };
}

function readString(value: unknown, fallback: string) {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function readOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function readBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function readNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function readBannerType(value: unknown, fallback: StudioSettings["announcementType"]) {
  return value === "promo" || value === "vacation" || value === "hidden" ? value : fallback;
}
