import { ORDER_STATUS_LABELS, shippingMethodLabel } from "@/lib/constants";
import { formatPLN } from "@/lib/format";
import { orderPaymentDisplay } from "@/lib/p24-methods";
import type { StoredOrder } from "@/lib/types";

const PAID = new Set(["paid", "processing", "shipped", "completed"]);

export function csvEscape(value: string | number | boolean | undefined | null) {
  const text = value === undefined || value === null ? "" : String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

export function toCsv(rows: Array<Array<string | number | boolean | null | undefined>>) {
  return `\uFEFF${rows.map((row) => row.map(csvEscape).join(";")).join("\r\n")}\r\n`;
}

export function filterOrders(orders: StoredOrder[], query: string) {
  const needle = query.trim().toLowerCase().replace(/\s+/g, " ");
  if (!needle) return orders;
  const compact = needle.replace(/\s/g, "");
  return orders.filter((order) => {
    const hay = [
      order.orderNumber,
      order.customerName,
      order.customerEmail,
      order.customerPhone,
      order.city,
      order.street,
      order.postalCode,
      order.status,
      ORDER_STATUS_LABELS[order.status],
      order.discountCode,
      order.trackingNumber,
      order.inpostLocker,
      ...order.items.map((item) => `${item.productName} ${item.variantTitle}`),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(needle) || order.customerPhone.replace(/\s/g, "").includes(compact);
  });
}

export function ordersToCsv(orders: StoredOrder[]) {
  const header = [
    "numer",
    "data",
    "status",
    "klient",
    "email",
    "telefon",
    "ulica",
    "kod",
    "miasto",
    "wysylka",
    "paczkomat",
    "platnosc",
    "towar_grosze",
    "wysylka_grosze",
    "prezent_grosze",
    "rabat_grosze",
    "kod_rabatu",
    "razem_grosze",
    "razem_pln",
    "pozycje",
    "uwagi",
    "tracking",
  ];
  const body = orders.map((order) => [
    order.orderNumber,
    order.createdAt,
    ORDER_STATUS_LABELS[order.status],
    order.customerName,
    order.customerEmail,
    order.customerPhone,
    order.street,
    order.postalCode,
    order.city,
    shippingMethodLabel(order.shippingMethod),
    order.inpostLocker ?? "",
    orderPaymentDisplay(order),
    order.goodsInCents,
    order.shippingCostInCents,
    order.giftWrappingCostCents,
    order.discountAmountCents,
    order.discountCode ?? "",
    order.totalAmountInCents,
    formatPLN(order.totalAmountInCents),
    order.items.map((item) => `${item.productName} (${item.variantTitle}) x${item.quantity}`).join(" | "),
    order.notes ?? "",
    order.trackingNumber ?? "",
  ]);
  return toCsv([header, ...body]);
}

export function lineItemsToCsv(orders: StoredOrder[]) {
  const header = ["numer", "data", "produkt", "wariant", "sztuki", "cena_grosze", "wartosc_grosze"];
  const body = orders.flatMap((order) =>
    order.items.map((item) => [
      order.orderNumber,
      order.createdAt,
      item.productName,
      item.variantTitle,
      item.quantity,
      item.unitPriceInCents,
      item.unitPriceInCents * item.quantity,
    ]),
  );
  return toCsv([header, ...body]);
}

export type MonthWindow = {
  key: string;
  label: string;
};

/** `YYYY-MM` in Europe/Warsaw. Empty = previous full calendar month. */
export function monthWindow(monthKey?: string, now = new Date()): MonthWindow {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const yearNow = Number(parts.find((p) => p.type === "year")?.value);
  const monthNow = Number(parts.find((p) => p.type === "month")?.value);

  let year = yearNow;
  let month = monthNow - 1;
  const match = monthKey?.match(/^(\d{4})-(\d{2})$/);
  if (match) {
    year = Number(match[1]);
    month = Number(match[2]);
  } else if (month === 0) {
    year -= 1;
    month = 12;
  }

  const label = new Intl.DateTimeFormat("pl-PL", { month: "long", year: "numeric" }).format(
    new Date(year, month - 1, 1),
  );
  return {
    key: `${year}-${String(month).padStart(2, "0")}`,
    label,
  };
}

function warsawMonthKey(iso: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date(iso));
  return `${parts.find((p) => p.type === "year")?.value}-${parts.find((p) => p.type === "month")?.value}`;
}

export function ordersInWindow(orders: StoredOrder[], window: MonthWindow) {
  return orders.filter((order) => warsawMonthKey(order.createdAt) === window.key);
}

export function analysisToCsv(orders: StoredOrder[], window: MonthWindow) {
  const paid = orders.filter((order) => PAID.has(order.status));
  const pending = orders.filter((order) => order.status === "pending");
  const cancelled = orders.filter((order) => order.status === "cancelled");
  const revenue = paid.reduce((sum, order) => sum + order.totalAmountInCents, 0);
  const aov = paid.length ? Math.round(revenue / paid.length) : 0;
  const gifts = paid.filter((order) => order.hasGiftWrapping).length;

  const byStatus = Object.entries(ORDER_STATUS_LABELS).map(([status, label]) => {
    const rows = orders.filter((order) => order.status === status);
    return [label, rows.length, rows.reduce((sum, order) => sum + order.totalAmountInCents, 0)];
  });

  const products = new Map<string, { name: string; qty: number; cents: number }>();
  for (const order of paid) {
    for (const item of order.items) {
      const current = products.get(item.productId) ?? { name: item.productName, qty: 0, cents: 0 };
      current.qty += item.quantity;
      current.cents += item.unitPriceInCents * item.quantity;
      products.set(item.productId, current);
    }
  }
  const top = [...products.values()].sort((a, b) => b.qty - a.qty);

  const rows: Array<Array<string | number>> = [
    ["wskaznik", "wartosc"],
    ["okres", window.label],
    ["klucz_miesiaca", window.key],
    ["zamowien_wszystkich", orders.length],
    ["opaconych", paid.length],
    ["oczekuje_na_platnosc", pending.length],
    ["anulowanych", cancelled.length],
    ["przychod_grosze", revenue],
    ["przychod_pln", formatPLN(revenue)],
    ["srednia_wartosc_zamowienia_grosze", aov],
    ["srednia_wartosc_zamowienia_pln", formatPLN(aov)],
    ["pakowanie_prezent", gifts],
    [],
    ["status", "sztuki", "suma_grosze"],
    ...byStatus,
    [],
    ["top_produkt", "sztuki", "wartosc_grosze"],
    ...top.slice(0, 20).map((item) => [item.name, item.qty, item.cents]),
  ];
  return toCsv(rows);
}

export function analysisHtml(orders: StoredOrder[], window: MonthWindow) {
  const paid = orders.filter((order) => PAID.has(order.status));
  const revenue = paid.reduce((sum, order) => sum + order.totalAmountInCents, 0);
  const aov = paid.length ? Math.round(revenue / paid.length) : 0;
  return {
    count: orders.length,
    paid: paid.length,
    pending: orders.filter((order) => order.status === "pending").length,
    cancelled: orders.filter((order) => order.status === "cancelled").length,
    revenue,
    revenueLabel: formatPLN(revenue),
    aovLabel: formatPLN(aov),
  };
}
