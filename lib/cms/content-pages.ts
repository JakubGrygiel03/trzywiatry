export const CONTENT_PAGE_KEYS = [
  "b2b",
  "o-nas",
  "kontakt",
  "faq",
  "dostawa-i-zwroty",
  "poradnik-pielegnacji",
  "regulamin",
] as const;
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
  faq: {
    label: "FAQ",
    href: "/faq",
    adminHref: "/admin/strony/faq",
    hint: "Pytania i odpowiedzi widoczne na /faq.",
  },
  "dostawa-i-zwroty": {
    label: "Dostawa i zwroty",
    href: "/dostawa-i-zwroty",
    adminHref: "/admin/strony/dostawa-i-zwroty",
    hint: "Teksty wokół żywych cen wysyłki z ustawień sklepu.",
  },
  "poradnik-pielegnacji": {
    label: "Poradnik pielęgnacji",
    href: "/poradnik-pielegnacji",
    adminHref: "/admin/strony/poradnik-pielegnacji",
    hint: "Sekcje: zmywarka, szok termiczny, formy, drewno.",
  },
  regulamin: {
    label: "Regulamin",
    href: "/regulamin",
    adminHref: "/admin/strony/regulamin",
    hint: "Pełna treść regulaminu sklepu — paragrafy, które widzi klient.",
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
  imageSrc: string;
  imageAlt: string;
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

export type InfoPageOverlay = {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  description: string;
  items: { title: string; body: string }[];
};

export type ContentOverlayMap = {
  b2b: B2BOverlay;
  "o-nas": AboutOverlay;
  kontakt: ContactOverlay;
  faq: InfoPageOverlay;
  "dostawa-i-zwroty": InfoPageOverlay;
  "poradnik-pielegnacji": InfoPageOverlay;
  regulamin: InfoPageOverlay;
};

export function isContentPageKey(value: string): value is ContentPageKey {
  return (CONTENT_PAGE_KEYS as readonly string[]).includes(value);
}
