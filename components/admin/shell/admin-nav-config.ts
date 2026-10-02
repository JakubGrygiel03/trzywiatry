import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  CalendarDays,
  FileText,
  Images,
  Layers,
  LayoutDashboard,
  LayoutTemplate,
  Mail,
  Newspaper,
  Package,
  Settings,
  ShoppingBag,
  Tags,
  TicketPercent,
  Users,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Exact match for /admin; otherwise startsWith */
  exact?: boolean;
  badgeKey?: "orders" | "lowStock" | "b2b";
};

export type AdminNavGroup = {
  id: string;
  label: string;
  items: AdminNavItem[];
};

/** Menu groups mirror WooCommerce: Sklep → Treści → Analityka → Ustawienia. */
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    id: "overview",
    label: "Przegląd",
    items: [
      { href: "/admin", label: "Pulpit", icon: LayoutDashboard, exact: true },
      { href: "/admin/analityka", label: "Zarobki", icon: BarChart3 },
    ],
  },
  {
    id: "shop",
    label: "Sklep",
    items: [
      { href: "/admin/produkty", label: "Produkty", icon: Package, badgeKey: "lowStock" },
      { href: "/admin/produkty/kategorie", label: "Kategorie", icon: Tags },
      { href: "/admin/zamowienia", label: "Zamówienia", icon: ShoppingBag, badgeKey: "orders" },
      { href: "/admin/kupony", label: "Kupony", icon: TicketPercent },
      { href: "/admin/klienci", label: "Klienci", icon: Users },
    ],
  },
  {
    id: "atelier",
    label: "Pracownia",
    items: [
      { href: "/admin/warsztaty", label: "Warsztaty", icon: CalendarDays },
      { href: "/admin/b2b", label: "Zapytania", icon: Building2, badgeKey: "b2b" },
    ],
  },
  {
    id: "content",
    label: "Treści",
    items: [
      { href: "/admin/strona-glowna", label: "Strona główna", icon: LayoutTemplate },
      { href: "/admin/strony", label: "Strony", icon: FileText },
      { href: "/admin/kolekcje", label: "Kolekcje szkliw", icon: Layers },
      { href: "/admin/media", label: "Zdjęcia", icon: Images },
      { href: "/admin/blog", label: "Blog i poradniki", icon: Newspaper },
      { href: "/admin/emaile", label: "E-maile do klientów", icon: Mail },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [{ href: "/admin/ustawienia-sklepu", label: "Ustawienia sklepu", icon: Settings }],
  },
];

export type AdminBadges = {
  orders: number;
  lowStock: number;
  b2b: number;
};

export function isAdminNavActive(pathname: string, item: AdminNavItem, allItems: AdminNavItem[] = []) {
  if (item.exact) return pathname === item.href;
  const nestedHit = allItems.some(
    (other) =>
      other.href !== item.href &&
      other.href.startsWith(`${item.href}/`) &&
      (pathname === other.href || pathname.startsWith(`${other.href}/`)),
  );
  if (nestedHit) return false;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
