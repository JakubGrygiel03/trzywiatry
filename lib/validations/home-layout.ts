import { z } from "zod";
import {
  HOME_SECTION_TYPES,
  defaultGlazeLines,
  defaultHomeLayout,
  type HomeSection,
  type HomeSectionType,
} from "@/lib/cms/home-layout";
import { revealsPromoOnStorefront } from "@/lib/cms/tokens";
import { cmsImageSrcSchema, optionalCmsImageSrcSchema } from "@/lib/validations/image-src";
import { firstZodMessage, plainText, safeHrefSchema } from "@/lib/validations/safe-input";

const ctaSchema = z.object({
  label: plainText("Etykieta przycisku", 60, 1),
  href: safeHrefSchema,
});

const pillarCardSchema = z.object({
  mark: plainText("Numer karty", 8, 1),
  title: plainText("Tytuł karty", 80, 1),
  copy: plainText("Opis karty", 240, 1),
  href: safeHrefSchema,
});

const heroSlotSchema = z.object({
  productId: z.string().min(1),
  image: cmsImageSrcSchema,
});

const sectionBase = z.object({
  id: z.string().min(1),
  enabled: z.boolean(),
});

export const homeSectionSchema = z.discriminatedUnion("type", [
  sectionBase.extend({
    type: z.literal("banner"),
    payload: z.object({
      panels: z.tuple([optionalCmsImageSrcSchema, optionalCmsImageSrcSchema, optionalCmsImageSrcSchema]),
      eyebrow: plainText("Etykieta banera", 80),
      title: plainText("Tytuł banera", 120, 1),
      subtitle: plainText("Podtytuł banera", 320),
      textAlign: z.enum(["left", "center", "right"]),
      textColor: z.enum(["bialy", "czarny"]),
      overlayOpacity: z.coerce.number().min(0).max(80),
      contentPaddingX: z.coerce.number().min(8).max(120),
      contentPaddingY: z.coerce.number().min(16).max(160),
      minHeightVh: z.coerce.number().min(28).max(100),
      marginTop: z.coerce.number().min(0).max(160),
      marginBottom: z.coerce.number().min(0).max(160),
      panelGap: z.coerce.number().min(0).max(24),
      panelInset: z.coerce.number().min(0).max(48).optional().default(0),
      mobilePanel: z
        .coerce
        .number()
        .int()
        .min(0)
        .max(2)
        .transform((value): 0 | 1 | 2 => (value === 0 || value === 2 ? value : 1))
        .optional()
        .default(1),
      tabletPanels: z
        .tuple([
          z
            .coerce
            .number()
            .int()
            .min(0)
            .max(2)
            .transform((value): 0 | 1 | 2 => (value === 1 || value === 2 ? value : 0)),
          z
            .coerce
            .number()
            .int()
            .min(0)
            .max(2)
            .transform((value): 0 | 1 | 2 => (value === 0 || value === 1 ? value : 2)),
        ])
        .optional()
        .default([0, 2]),
      ctaLabel: plainText("Przycisk banera", 60),
      ctaHref: safeHrefSchema,
    }),
  }),
  sectionBase.extend({
    type: z.literal("hero"),
    payload: z.object({
      eyebrow: plainText("Etykieta hero", 80),
      eyebrowWorkshops: plainText("Etykieta hero (warsztaty)", 80),
      title: plainText("Tytuł hero", 80, 1),
      lead: plainText("Lead hero", 320, 1),
      primaryCta: ctaSchema,
      workshopCta: ctaSchema,
      aboutCta: ctaSchema,
      slots: z.array(heroSlotSchema).max(12),
    }),
  }),
  sectionBase.extend({
    type: z.literal("pillars"),
    payload: z.object({
      eyebrow: plainText("Etykieta filarów", 60),
      title: plainText("Tytuł filarów", 80, 1),
      description: plainText("Opis filarów", 320),
      descriptionNoWorkshops: plainText("Opis filarów (bez warsztatów)", 320),
      cards: z.tuple([pillarCardSchema, pillarCardSchema]),
      workshopCard: pillarCardSchema,
      b2bCard: pillarCardSchema,
    }),
  }),
  sectionBase.extend({
    type: z.literal("featured"),
    payload: z.object({
      badge: plainText("Badge", 40),
      title: plainText("Tytuł bestsellerów", 80, 1),
      description: plainText("Opis bestsellerów", 320),
      ctaLabel: plainText("Przycisk katalogu", 40, 1),
      ctaHref: safeHrefSchema,
    }),
  }),
  sectionBase.extend({
    type: z.literal("glaze"),
    payload: z.object({
      eyebrow: plainText("Etykieta szkliw", 60),
      title: plainText("Tytuł szkliw", 80, 1),
      description: plainText("Opis szkliw", 320),
      lines: z
        .array(
          z.object({
            id: z.string().min(1),
            name: plainText("Nazwa szkliwa", 40, 1),
            slug: z
              .string()
              .trim()
              .toLowerCase()
              .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug szkliwa: małe litery, cyfry i myślnik."),
            description: plainText("Opis szkliwa", 240, 1),
            href: safeHrefSchema,
            swatch: z.enum(["dust", "mist", "sand", "raw", "wood", "formy", "gift"]),
          }),
        )
        .min(1, "Dodaj przynajmniej jedną linię szkliwa.")
        .max(8, "Maksimum 8 linii szkliw na stronie głównej.")
        .default(defaultGlazeLines()),
    }),
  }),
  sectionBase.extend({
    type: z.literal("workshop"),
    payload: z.object({
      eyebrow: plainText("Etykieta warsztatu", 60),
      ctaLabel: plainText("Przycisk warsztatu", 60, 1),
    }),
  }),
  sectionBase.extend({
    type: z.literal("newsletter"),
    payload: z.object({
      eyebrow: plainText("Etykieta newslettera", 40),
      title: plainText("Tytuł newslettera", 80, 1),
      body: plainText("Tekst newslettera", 320, 1),
      formLabel: plainText("Etykieta formularza", 40, 1),
      buttonLabel: plainText("Przycisk newslettera", 40, 1),
    }),
  }),
]);

export const homeLayoutSchema = z
  .array(homeSectionSchema)
  .length(HOME_SECTION_TYPES.length)
  .superRefine((sections, ctx) => {
    const types = sections.map((section) => section.type);
    const unique = new Set(types);
    if (unique.size !== HOME_SECTION_TYPES.length) {
      ctx.addIssue({ code: "custom", message: "Każda sekcja może być tylko raz." });
    }
    for (const type of HOME_SECTION_TYPES) {
      if (!unique.has(type)) {
        ctx.addIssue({ code: "custom", message: `Brakuje sekcji: ${type}` });
      }
    }
  });

const defaultsByType = Object.fromEntries(
  defaultHomeLayout().map((section) => [section.type, section]),
) as Record<HomeSectionType, HomeSection>;

export function normalizeHomeLayout(input: unknown): HomeSection[] {
  const parsed = z.array(z.unknown()).safeParse(input);
  const incoming = parsed.success ? parsed.data : [];
  const used = new Set<HomeSectionType>();
  const ordered: HomeSection[] = [];

  for (const raw of incoming) {
    const result = homeSectionSchema.safeParse(hydrateBannerSection(hydrateGlazeSection(raw)));
    if (!result.success || used.has(result.data.type)) continue;
    used.add(result.data.type);
    ordered.push(result.data);
  }

  for (const type of HOME_SECTION_TYPES) {
    if (used.has(type)) continue;
    const section = structuredClone(defaultsByType[type]);
    const desiredIndex = HOME_SECTION_TYPES.indexOf(type);
    let insertAt = ordered.length;
    for (let i = 0; i < ordered.length; i += 1) {
      if (HOME_SECTION_TYPES.indexOf(ordered[i]!.type) > desiredIndex) {
        insertAt = i;
        break;
      }
    }
    ordered.splice(insertAt, 0, section);
  }

  return ordered;
}

function hydrateGlazeSection(raw: unknown) {
  if (!raw || typeof raw !== "object") return raw;
  const section = raw as { type?: string; payload?: { lines?: unknown } };
  if (section.type !== "glaze") return raw;
  if (Array.isArray(section.payload?.lines) && section.payload.lines.length > 0) return raw;
  return { ...section, payload: { ...section.payload, lines: defaultGlazeLines() } };
}

/** Migrate legacy single `image` banner into three-panel triptych. */
function hydrateBannerSection(raw: unknown) {
  if (!raw || typeof raw !== "object") return raw;
  const section = raw as {
    type?: string;
    payload?: {
      panels?: unknown;
      image?: string;
      panelGap?: number;
      panelInset?: number;
      minHeightVh?: number;
      mobilePanel?: number;
      tabletPanels?: unknown;
    };
  };
  if (section.type !== "banner" || !section.payload) return raw;

  const defaultPanels = defaultHomeLayout().find((item) => item.type === "banner")!.payload.panels;
  // Old default was 64vh; ÅOOMI triptych fills the first screen.
  const minHeightVh =
    typeof section.payload.minHeightVh !== "number" || section.payload.minHeightVh === 64
      ? 100
      : section.payload.minHeightVh;
  // Visible white gutters between panels (3px was effectively flush).
  const panelGap =
    typeof section.payload.panelGap !== "number" ||
    section.payload.panelGap === 0 ||
    section.payload.panelGap === 3 ||
    section.payload.panelGap === 4
      ? 10
      : section.payload.panelGap;
  const panelInset =
    typeof section.payload.panelInset !== "number" || section.payload.panelInset === 16
      ? 0
      : section.payload.panelInset;
  const mobilePanel =
    section.payload.mobilePanel === 0 ||
    section.payload.mobilePanel === 1 ||
    section.payload.mobilePanel === 2
      ? section.payload.mobilePanel
      : 1;
  const tabletRaw = section.payload.tabletPanels;
  const tabletPanels: [0 | 1 | 2, 0 | 1 | 2] =
    Array.isArray(tabletRaw) &&
    tabletRaw.length === 2 &&
    (tabletRaw[0] === 0 || tabletRaw[0] === 1 || tabletRaw[0] === 2) &&
    (tabletRaw[1] === 0 || tabletRaw[1] === 1 || tabletRaw[1] === 2)
      ? [tabletRaw[0], tabletRaw[1]]
      : [0, 2];

  if (Array.isArray(section.payload.panels) && section.payload.panels.length === 3) {
    return {
      ...section,
      payload: {
        ...section.payload,
        panelGap,
        panelInset,
        minHeightVh,
        mobilePanel,
        tabletPanels,
      },
    };
  }

  const legacy = section.payload.image?.trim();
  const panels: [string, string, string] = legacy ? [legacy, legacy, legacy] : defaultPanels;
  const { image: _legacyImage, ...rest } = section.payload as { image?: string } & Record<string, unknown>;

  return {
    ...section,
    payload: {
      ...rest,
      panels,
      panelGap,
      panelInset,
      minHeightVh,
      mobilePanel,
      tabletPanels,
    },
  };
}

export function explainHomeLayoutIssues(sections: unknown, promoCode?: string) {
  const parsed = homeLayoutSchema.safeParse(sections);
  if (!parsed.success) return firstZodMessage(parsed.error, "Sprawdź tytuły i linki w sekcjach.");
  const newsletter = parsed.data.find((section) => section.type === "newsletter");
  if (newsletter?.type === "newsletter" && revealsPromoOnStorefront(newsletter.payload.body, promoCode)) {
    return "Kod rabatowy ma iść tylko mailem — nie wpisuj go ani {code} w belce newslettera. Np. „Kod rabatowy przychodzi mailem…”.";
  }
  return null;
}
