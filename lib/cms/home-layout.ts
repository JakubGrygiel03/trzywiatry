import type { HeroSlot } from "@/lib/types";
import type { GlazeKey } from "@/lib/visual";

export const HOME_PAGE_KEY = "home";

export const HOME_SECTION_TYPES = [
  "banner",
  "hero",
  "pillars",
  "featured",
  "glaze",
  "workshop",
  "newsletter",
] as const;

export type HomeSectionType = (typeof HOME_SECTION_TYPES)[number];

export type HomeCta = { label: string; href: string };

/** Full-bleed ÅOOMI-style triptych above hero — three panels + overlay copy. */
export type BannerPayload = {
  /** Left / center / right photo panels (thin white gutters between). */
  panels: [string, string, string];
  eyebrow: string;
  title: string;
  subtitle: string;
  textAlign: "left" | "center" | "right";
  textColor: "bialy" | "czarny";
  /** Dark scrim over the photos so text stays readable (0–80). */
  overlayOpacity: number;
  /** Inner padding around the text block (px). */
  contentPaddingX: number;
  contentPaddingY: number;
  /** Minimum section height in viewport units. */
  minHeightVh: number;
  marginTop: number;
  marginBottom: number;
  /** Gap between the three panels in px. */
  panelGap: number;
  /** White margin around the triptych (px) — insets photos from section edges. */
  panelInset: number;
  /** Which panel shows alone on phone / narrow screens (0 left, 1 center, 2 right). */
  mobilePanel: 0 | 1 | 2;
  /** Two panels below 1400px (tablet / typical laptop): left then right slot. */
  tabletPanels: [0 | 1 | 2, 0 | 1 | 2];
  ctaLabel: string;
  ctaHref: string;
};

export type HeroPayload = {
  eyebrow: string;
  eyebrowWorkshops: string;
  title: string;
  lead: string;
  primaryCta: HomeCta;
  workshopCta: HomeCta;
  aboutCta: HomeCta;
  slots: HeroSlot[];
};

export type PillarCard = { mark: string; title: string; copy: string; href: string };

export type PillarsPayload = {
  eyebrow: string;
  title: string;
  description: string;
  descriptionNoWorkshops: string;
  cards: [PillarCard, PillarCard];
  workshopCard: PillarCard;
  b2bCard: PillarCard;
};

export type FeaturedPayload = {
  badge: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
};

export type GlazeLine = {
  id: string;
  name: string;
  slug: string;
  description: string;
  href: string;
  swatch: GlazeKey;
};

export type GlazePayload = {
  eyebrow: string;
  title: string;
  description: string;
  lines: GlazeLine[];
};

export type WorkshopPayload = {
  eyebrow: string;
  ctaLabel: string;
};

export type NewsletterPayload = {
  eyebrow: string;
  title: string;
  body: string;
  formLabel: string;
  buttonLabel: string;
};

export type HomeSection =
  | { id: string; type: "banner"; enabled: boolean; payload: BannerPayload }
  | { id: string; type: "hero"; enabled: boolean; payload: HeroPayload }
  | { id: string; type: "pillars"; enabled: boolean; payload: PillarsPayload }
  | { id: string; type: "featured"; enabled: boolean; payload: FeaturedPayload }
  | { id: string; type: "glaze"; enabled: boolean; payload: GlazePayload }
  | { id: string; type: "workshop"; enabled: boolean; payload: WorkshopPayload }
  | { id: string; type: "newsletter"; enabled: boolean; payload: NewsletterPayload };

export const HOME_SECTION_LABELS: Record<HomeSectionType, string> = {
  banner: "Baner (3 kadry)",
  hero: "Hero",
  pillars: "Trzy filary",
  featured: "Bestsellery",
  glaze: "Linie szkliw",
  workshop: "Najbliższy warsztat",
  newsletter: "Newsletter",
};

export function defaultHomeLayout(): HomeSection[] {
  return [
    { id: "s-banner", type: "banner", enabled: true, payload: defaultBannerPayload() },
    { id: "s-hero", type: "hero", enabled: true, payload: defaultHeroPayload() },
    { id: "s-pillars", type: "pillars", enabled: true, payload: defaultPillarsPayload() },
    { id: "s-featured", type: "featured", enabled: true, payload: defaultFeaturedPayload() },
    { id: "s-glaze", type: "glaze", enabled: true, payload: defaultGlazePayload() },
    { id: "s-workshop", type: "workshop", enabled: true, payload: defaultWorkshopPayload() },
    { id: "s-newsletter", type: "newsletter", enabled: true, payload: defaultNewsletterPayload() },
  ];
}

export function defaultBannerPayload(): BannerPayload {
  return {
    panels: [
      "/brand/photos/products/woo/czarki-kremowe-02.jpg",
      "/brand/photos/products/woo/czajniczek-szesciokatny-02.jpg",
      "/brand/photos/products/woo/czarki-zawijasy-pastelowe-02.jpg",
    ],
    eyebrow: "Pracownia",
    title: "Trzy Wiatry",
    subtitle: "Ceramika i drewno — slow craft z Gdańska.",
    textAlign: "center",
    textColor: "bialy",
    overlayOpacity: 32,
    contentPaddingX: 28,
    contentPaddingY: 40,
    minHeightVh: 100,
    marginTop: 0,
    marginBottom: 0,
    panelGap: 10,
    panelInset: 0,
    mobilePanel: 1,
    tabletPanels: [0, 2],
    ctaLabel: "Zobacz więcej",
    ctaHref: "#hero-atelier",
  };
}

export function defaultHeroPayload(): HeroPayload {
  return {
    eyebrow: "Ceramika · Drewno",
    eyebrowWorkshops: "Ceramika · Drewno · Warsztaty",
    title: "Trzy Wiatry",
    lead: "Slow craft z lokalnej gliny i drewna — toczone, wypalane i pakowane w pracowni.",
    primaryCta: { label: "Wejdź do sklepu", href: "/sklep" },
    workshopCta: { label: "Zarezerwuj warsztat", href: "/warsztaty" },
    aboutCta: { label: "Poznaj pracownię", href: "/o-nas" },
    slots: [],
  };
}

export function defaultPillarsPayload(): PillarsPayload {
  return {
    eyebrow: "Filary atelier",
    title: "Trzy praktyki, jeden rytm",
    description: "Sygnet pracowni to trzy wiatry przez otwarty dom: glina, drewno i spotkanie przy kole.",
    descriptionNoWorkshops:
      "Sygnet pracowni to trzy wiatry przez otwarty dom: glina, drewno i współpraca z lokalami.",
    cards: [
      {
        mark: "01",
        title: "Ceramika użytkowa",
        copy: "Kubki, czarki, miski i drewno — naczynia na codzienny stół.",
        href: "/sklep?sklep=uzytkowa",
      },
      {
        mark: "02",
        title: "Dla pracowni",
        copy: "Formy matki i, wkrótce, narzędzia. Półka dla ceramików i atelier.",
        href: "/sklep?sklep=pracownia",
      },
    ],
    workshopCard: {
      mark: "03",
      title: "Warsztaty",
      copy: "Toczenie, szkliwienie i sesje herbaciane. Małe grupy, realne miejsca przy kole.",
      href: "/warsztaty",
    },
    b2bCard: {
      mark: "03",
      title: "B2B",
      copy: "Ceramika z logo i formy matki na zamówienie dla kawiarni, restauracji i hoteli.",
      href: "/b2b",
    },
  };
}

export function defaultFeaturedPayload(): FeaturedPayload {
  return {
    badge: "Bestseller",
    title: "Naczynia ze stołu pracowni",
    description: "Formy, które wracają do kawiarni i domów — wybór z półki, nie z promocji.",
    ctaLabel: "Cały katalog",
    ctaHref: "/sklep",
  };
}

export function defaultGlazeLines(): GlazeLine[] {
  return [
    {
      id: "col-dust",
      name: "Dust",
      slug: "dust",
      description: "Matowe, pyliste szkliwa w odcieniach gliny i kamienia. Cicha paleta do codziennego stołu.",
      href: "/kolekcje/dust",
      swatch: "dust",
    },
    {
      id: "col-mist",
      name: "Mist",
      slug: "mist",
      description: "Prześwitujące, mleczne szkliwa — jak mgła nad zatoką. Delikatne warstwy i miękkie krawędzie.",
      href: "/kolekcje/mist",
      swatch: "mist",
    },
    {
      id: "col-sand",
      name: "Sand",
      slug: "sand",
      description: "Ciepłe ochry i piasek. Szkliwa, które oddają palce przy toczeniu i ogień pieca.",
      href: "/kolekcje/sand",
      swatch: "sand",
    },
    {
      id: "col-raw",
      name: "Raw Clay",
      slug: "raw-clay",
      description: "Nieszkliwiona lub częściowo szkliwiona glina. Surowa faktura, ślad narzędzia, szczerość materiału.",
      href: "/kolekcje/raw-clay",
      swatch: "raw",
    },
  ];
}

export function defaultGlazePayload(): GlazePayload {
  return {
    eyebrow: "Linie szkliw",
    title: "Dust · Mist · Sand · Raw Clay",
    description: "Palety z pracowni — matowy pył, mleczna mgła, ochra i surowa glina. Kliknij linię, żeby zobaczyć naczynia.",
    lines: defaultGlazeLines(),
  };
}

export function emptyGlazeLine(): GlazeLine {
  const id = `col-${crypto.randomUUID().slice(0, 8)}`;
  return {
    id,
    name: "Nowa linia",
    slug: "nowa-linia",
    description: "Krótki opis szkliwa — faktura, kolor, do jakiego stołu.",
    href: "/sklep",
    swatch: "dust",
  };
}

export function defaultWorkshopPayload(): WorkshopPayload {
  return { eyebrow: "Najbliższy warsztat", ctaLabel: "Zarezerwuj miejsce" };
}

export function defaultNewsletterPayload(): NewsletterPayload {
  return {
    eyebrow: "Newsletter",
    title: "−15% na pierwsze naczynie",
    body: "Kod {code} przychodzi mailem. Zero spamu — nowe wypusty, kolekcje i przerwy twórcze.",
    formLabel: "Podaj e-mail",
    buttonLabel: "Odbierz −15%",
  };
}

export function findHomeSection<T extends HomeSectionType>(
  sections: HomeSection[],
  type: T,
): Extract<HomeSection, { type: T }> | undefined {
  return sections.find((section): section is Extract<HomeSection, { type: T }> => section.type === type);
}
