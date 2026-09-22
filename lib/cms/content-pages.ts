export const CONTENT_PAGE_KEYS = ["b2b", "o-nas", "kontakt"] as const;
export type ContentPageKey = (typeof CONTENT_PAGE_KEYS)[number];

export const CONTENT_PAGE_META: Record<
  ContentPageKey,
  { label: string; href: string; adminHref: string; hint: string }
> = {
  b2b: {
    label: "B2B",
    href: "/b2b",
    adminHref: "/admin/strony/b2b",
    hint: "Nagłówek i tekst przy formularzu dla lokali.",
  },
  "o-nas": {
    label: "O nas",
    href: "/o-nas",
    adminHref: "/admin/strony/o-nas",
    hint: "Tytuł, historia, zdjęcie rodziny i galeria prac.",
  },
  kontakt: {
    label: "Kontakt",
    href: "/kontakt",
    adminHref: "/admin/strony/kontakt",
    hint: "Tytuł strony, dwa zdania i nagłówki kolumn.",
  },
};

export type B2BOverlay = {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  description: string;
  descriptionEn: string;
  formIntro: string;
  frameCaption: string;
};

export type AboutOverlay = {
  metaTitle: string;
  metaDescription: string;
  title: string;
  heading: string;
  paragraphs: string[];
  imageSrc: string;
  imageAlt: string;
  galleryTitle: string;
  galleryWorks: { src: string; alt: string }[];
};

export type ContactOverlay = {
  metaTitle: string;
  metaDescription: string;
  title: string;
  subtitle: string;
  subtitleEn: string;
  formHeading: string;
  directHeading: string;
  formIntro: string;
};

export type ContentOverlayMap = {
  b2b: B2BOverlay;
  "o-nas": AboutOverlay;
  kontakt: ContactOverlay;
};

export function isContentPageKey(value: string): value is ContentPageKey {
  return (CONTENT_PAGE_KEYS as readonly string[]).includes(value);
}
