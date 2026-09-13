import { z } from "zod";
import { defaultContentOverlay } from "@/lib/cms/content-page-defaults";
import type { ContentOverlayMap, ContentPageKey } from "@/lib/cms/content-pages";
import { firstZodMessage, plainText } from "@/lib/validations/safe-input";

const imageSrc = z
  .string()
  .trim()
  .startsWith("/", "Zdjęcie musi być z katalogu pracowni.")
  .max(300)
  .refine((value) => !value.includes(".."), "Nieprawidłowa ścieżka zdjęcia.");

const seo = {
  metaTitle: plainText("Tytuł SEO", 80, 1),
  metaDescription: plainText("Opis SEO", 220, 8),
};

export const b2bOverlaySchema = z.object({
  ...seo,
  eyebrow: plainText("Etykieta", 40, 1),
  title: plainText("Tytuł", 80, 1),
  description: plainText("Opis", 400, 8),
  descriptionEn: plainText("Opis EN", 280, 0),
  formIntro: plainText("Wstęp przy formularzu", 280, 0),
  frameCaption: plainText("Podpis kadru", 40, 0),
});

export const aboutOverlaySchema = z.object({
  ...seo,
  title: plainText("Tytuł strony", 80, 1),
  heading: plainText("Nagłówek historii", 80, 1),
  paragraphs: z
    .array(plainText("Akapit", 2000, 10))
    .min(1, "Dodaj przynajmniej jeden akapit.")
    .max(6, "Maksimum 6 akapitów."),
  imageSrc,
  imageAlt: plainText("Opis zdjęcia", 160, 4),
  galleryTitle: plainText("Tytuł galerii", 80, 1),
});

export const contactOverlaySchema = z.object({
  ...seo,
  title: plainText("Tytuł", 80, 1),
  subtitle: plainText("Podtytuł", 200, 4),
  subtitleEn: plainText("Podtytuł EN", 200, 0),
  formHeading: plainText("Nagłówek formularza", 80, 1),
  directHeading: plainText("Nagłówek kontaktu", 80, 1),
  formIntro: plainText("Wstęp przy formularzu", 280, 0),
});

const schemas = {
  b2b: b2bOverlaySchema,
  "o-nas": aboutOverlaySchema,
  kontakt: contactOverlaySchema,
} as const;

export function parseContentOverlay<K extends ContentPageKey>(key: K, input: unknown) {
  return schemas[key].safeParse(input);
}

export function explainContentOverlayIssue(key: ContentPageKey, input: unknown) {
  const parsed = schemas[key].safeParse(input);
  if (parsed.success) return null;
  return firstZodMessage(parsed.error, "Sprawdź teksty nakładki.");
}

export function normalizeContentOverlay<K extends ContentPageKey>(key: K, input: unknown): ContentOverlayMap[K] {
  const parsed = schemas[key].safeParse(input);
  if (parsed.success) return parsed.data as ContentOverlayMap[K];
  const fallback = defaultContentOverlay(key);
  if (!input || typeof input !== "object") return fallback;
  const extras = Object.fromEntries(
    Object.entries(input).filter(([, value]) => typeof value === "string" || (Array.isArray(value) && value.length > 0)),
  );
  return { ...fallback, ...extras } as ContentOverlayMap[K];
}

