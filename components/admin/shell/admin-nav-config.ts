import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  CalendarDays,
  LayoutDashboard,
  Newspaper,
  Package,
  Settings,
  ShoppingBag,
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
      { href: "/admin/analityka", label: "Analityka", icon: BarChart3 },
    ],
  },
  {
    id: "shop",
    label: "Sklep",
    items: [
      { href: "/admin/produkty", label: "Produkty", icon: Package, badgeKey: "lowStock" },
      { href: "/admin/zamowienia", label: "Zamówienia", icon: ShoppingBag, badgeKey: "orders" },
    ],
  },
  {
    id: "atelier",
    label: "Pracownia",
    items: [
      { href: "/admin/warsztaty", label: "Warsztaty", icon: CalendarDays },
      { href: "/admin/b2b", label: "Zapytania B2B", icon: Building2, badgeKey: "b2b" },
    ],
  },
  {
    id: "content",
    label: "Treści",
    items: [{ href: "/admin/blog", label: "Blog i poradniki", icon: Newspaper }],
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

export function isAdminNavActive(pathname: string, item: AdminNavItem) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
