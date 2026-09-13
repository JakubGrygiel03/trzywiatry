import { z } from "zod";
import {
  HOME_SECTION_TYPES,
  defaultGlazeLines,
  defaultHomeLayout,
  type HomeSection,
  type HomeSectionType,
} from "@/lib/cms/home-layout";
import { hasHardcodedPromo } from "@/lib/cms/tokens";
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
  image: z
    .string()
    .startsWith("/", "Zdjęcie musi być z katalogu pracowni.")
    .max(300)
    .refine((value) => !value.includes(".."), "Nieprawidłowa ścieżka zdjęcia."),
});

const sectionBase = z.object({
  id: z.string().min(1),
  enabled: z.boolean(),
});

export const homeSectionSchema = z.discriminatedUnion("type", [
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
    const result = homeSectionSchema.safeParse(hydrateGlazeSection(raw));
    if (!result.success || used.has(result.data.type)) continue;
    used.add(result.data.type);
    ordered.push(result.data);
  }

  for (const type of HOME_SECTION_TYPES) {
    if (!used.has(type)) ordered.push(structuredClone(defaultsByType[type]));
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

export function explainHomeLayoutIssues(sections: unknown, promoCode?: string) {
  const parsed = homeLayoutSchema.safeParse(sections);
  if (!parsed.success) return firstZodMessage(parsed.error, "Sprawdź tytuły i linki w sekcjach.");
  const newsletter = parsed.data.find((section) => section.type === "newsletter");
  if (newsletter?.type === "newsletter" && hasHardcodedPromo(newsletter.payload.body, promoCode)) {
    return "W newsletterze jest kod wpisany na sztywno. Wstaw pigułkę {code}.";
  }
  return null;
}
