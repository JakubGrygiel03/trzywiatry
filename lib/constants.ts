import type { OrderStatus, ProductDomain } from "@/lib/types";

export const SITE = {
  name: "Trzy Wiatry",
  url: "https://trzywiatry.pl",
  email: "kontakt@trzywiatry.pl",
  phone: "666-022-555",
  phoneHref: "tel:+48666022555",
  instagram: "https://www.instagram.com/trzy_wiatry/",
  facebook: "https://www.facebook.com/profile.php?id=61585627986049",
  owner: "Jędrzej Słomiak",
  nip: "5833536856",
  regon: "541629383",
  address: "Życzliwa 13/4, 80-176 Gdańsk",
  addressLines: ["Życzliwa 13/4,", "80-176 Gdańsk"] as const,
  bankAccount: "08 1090 1678 0000 0001 2000 7664",
  tagline: "Ceramika, drewno i warsztaty. Slow craft z lokalnych materiałów.",
};

export const CAPACITY_FILTERS = [
  { label: "80 ml", value: 80, hint: "Espresso" },
  { label: "160–180 ml", value: 180, hint: "Flat White" },
  { label: "250 ml", value: 250, hint: "Cappuccino" },
  { label: "300 ml", value: 300, hint: "Latte" },
  { label: "350 ml", value: 350, hint: "Herbata" },
  { label: "400 ml+", value: 400, hint: "Misa / duży kubek" },
] as const;

export const DOMAIN_LABELS: Record<ProductDomain, string> = {
  ceramika: "Ceramika",
  drewno: "Drewno",
  warsztaty: "Warsztaty",
  formy: "Formy matki",
};

export const CATEGORY_LABELS: Record<string, string> = {
  kubki: "Kubki",
  czarki: "Czarki",
  miski: "Miski",
  talerze: "Talerze",
  czajniczki: "Czajniczki",
  rzezby: "Rzeźba i drewno",
  formy_matki: "forma gipsowa",
  formy_master: "forma master",
  narzedzia: "Narzędzia",
  zestawy: "Zestawy prezentowe",
  karty: "Karty podarunkowe",
};

/** Hierarchical shop categories (sidebar), inspired by legacy WooCommerce tree. */
export const SHOP_CATEGORY_TREE = [
  {
    id: "ceramika",
    label: "Ceramika",
    domain: "ceramika" as const,
    children: [
      { id: "czarki", label: "Czarki", category: "czarki" },
      { id: "kubki", label: "Kubki", category: "kubki" },
      { id: "miski", label: "Miski", category: "miski" },
      { id: "czajniczki", label: "Czajniczki", category: "czajniczki" },
      { id: "talerze", label: "Talerze", category: "talerze" },
      { id: "zestawy", label: "Zestawy", category: "zestawy" },
    ],
  },
  {
    id: "formy",
    label: "Formy",
    domain: "formy" as const,
    children: [
      { id: "formy_matki", label: "forma gipsowa", category: "formy_matki" },
      { id: "formy_master", label: "forma master", category: "formy_master" },
      { id: "narzedzia", label: "Narzędzia", category: "narzedzia" },
    ],
  },
  {
    id: "drewno",
    label: "Drewno",
    domain: "drewno" as const,
    children: [{ id: "rzezby", label: "Rzeźby i deski", category: "rzezby" }],
  },
] as const;

/** Which shop categories belong to each domain (admin form + filters). */
export const CATEGORIES_BY_DOMAIN: Record<ProductDomain, string[]> = {
  ceramika: ["kubki", "czarki", "miski", "czajniczki", "talerze", "zestawy", "karty"],
  drewno: ["rzezby"],
  formy: ["formy_matki", "formy_master", "narzedzia"],
  warsztaty: ["kubki"],
};

export const PRODUCT_IMAGE_OPTIONS = [
  { value: "/brand/photos/mugs-clean.jpg", label: "Kubki (studio)" },
  { value: "/brand/photos/ceramic-mugs.jpg", label: "Ceramika blisko" },
  { value: "/brand/photos/rings-clean.jpg", label: "Słoje / faktura" },
  { value: "/brand/photos/shavings-clean.jpg", label: "Wióry / drewno" },
] as const;

export const SHIPPING_METHODS = [
  { id: "inpost", label: "Paczkomat InPost", priceInCents: 2000 },
  { id: "kurier", label: "Kurier", priceInCents: 3000 },
  { id: "odbior", label: "Odbiór w pracowni", priceInCents: 0 },
] as const;

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Oczekuje na płatność",
  paid: "Opłacone",
  processing: "W realizacji",
  shipped: "Wysłane",
  completed: "Zakończone",
  cancelled: "Anulowane",
};

/** Customer-facing copy — what is happening right now. */
export const ORDER_STATUS_HINTS: Record<OrderStatus, string> = {
  pending: "Czekamy na płatność. Jak tylko BLIK / przelew wejdzie, ruszamy z pakowaniem.",
  paid: "Płatność potwierdzona. Pracownia przygotowuje naczynia.",
  processing: "Pakujemy w pracowni — wkładki i karton, zero stłuczek.",
  shipped: "Paczka wyszła z pracowni. Numer śledzenia pojawi się poniżej, gdy kurier go nada.",
  completed: "Zamówienie zakończone. Dziękujemy za wsparcie pracowni.",
  cancelled: "To zamówienie zostało anulowane. Jeśli to pomyłka — napisz do nas.",
};

export const ORDER_PIPELINE: OrderStatus[] = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "completed",
];

export const CUSTOMER_OPEN_STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "processing",
  "shipped",
];

export const NAV_LINKS = [
  { href: "/sklep", label: "Sklep" },
  { href: "/warsztaty", label: "Warsztaty" },
  { href: "/b2b", label: "B2B" },
  { href: "/blog", label: "Blog" },
  { href: "/o-nas", label: "O nas" },
  { href: "/kontakt", label: "Kontakt" },
] as const;

/** Shop catalog sort — URL `?sortuj=` */
export const CATALOG_SORT_OPTIONS = [
  { id: "domyslne", label: "Domyślne sortowanie" },
  { id: "popularnosc", label: "Sortuj według popularności" },
  { id: "nazwa", label: "Sortuj według nazwy" },
  { id: "cena_asc", label: "Sortuj według ceny: od najniższej" },
  { id: "cena_desc", label: "Sortuj według ceny: od najwyższej" },
] as const;

export type CatalogSortId = (typeof CATALOG_SORT_OPTIONS)[number]["id"];

export function getPublicNavLinks(workshopsEnabled: boolean) {
  return NAV_LINKS.filter((link) => workshopsEnabled || link.href !== "/warsztaty");
}
