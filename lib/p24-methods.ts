/**
 * Human labels for Przelewy24 methodId (notification + panel).
 * IDs come from P24 merchant config — map known channels; unknown → grouped "Inne".
 */
const KNOWN_METHODS: Record<number, string> = {
  154: "BLIK",
  241: "Karta",
  242: "Karta",
  252: "Apple Pay",
  253: "Apple Pay",
  264: "Google Pay",
  265: "Google Pay",
  // Popular pay-by-link banks (fast transfer)
  25: "Przelew online",
  26: "Przelew online",
  31: "Przelew online",
  33: "Przelew online",
  45: "Przelew online",
  64: "Przelew online",
  65: "Przelew online",
  85: "Przelew online",
  88: "Przelew online",
  95: "Przelew online",
  99: "Przelew online",
  112: "Przelew online",
  113: "Przelew online",
  119: "Przelew online",
  136: "Przelew tradycyjny",
  140: "Przelew online",
  141: "Przelew online",
  143: "Przelew online",
  144: "Przelew online",
  145: "Przelew online",
  146: "Przelew online",
  147: "Przelew online",
  151: "Przelew online",
  157: "Przelew online",
  158: "Przelew online",
  160: "Przelew online",
  161: "Przelew online",
  222: "Przelew online",
  223: "Przelew online",
  226: "Przelew online",
  227: "Przelew online",
  229: "Przelew online",
  243: "Karty ratalne",
  270: "PayPo",
};

/** Bucket for admin charts — keeps the panel readable. */
export type PaymentMethodBucket =
  | "BLIK"
  | "Karta"
  | "Apple Pay"
  | "Google Pay"
  | "Przelew online"
  | "Przelew tradycyjny"
  | "Inne"
  | "Oczekuje"
  | "Bez płatności online";

/** Method 136 — money can sit in the bank until the studio marks the order paid. */
export const P24_TRADITIONAL_TRANSFER = 136;

export function isTraditionalTransfer(methodId: number | undefined | null) {
  return methodId === P24_TRADITIONAL_TRANSFER;
}

export function p24MethodLabel(methodId: number | undefined | null): string {
  if (methodId == null || methodId === 0) return "Przelewy24";
  return KNOWN_METHODS[methodId] ?? `Przelewy24 (#${methodId})`;
}

export function paymentMethodBucket(
  label: string | undefined,
  status: string,
  provider?: string,
): PaymentMethodBucket {
  if (status === "pending") return "Oczekuje";
  if (status === "cancelled") return "Bez płatności online";
  const t = (label ?? "").toLowerCase();
  if (t.includes("blik")) return "BLIK";
  if (t.includes("apple")) return "Apple Pay";
  if (t.includes("google")) return "Google Pay";
  if (t.includes("karta") || t.includes("card") || t.includes("visa") || t.includes("master")) {
    return "Karta";
  }
  if (t.includes("tradycyj")) return "Przelew tradycyjny";
  if (t.includes("przelew") || t.includes("transfer") || t.includes("paypo") || t.includes("rat")) {
    return "Przelew online";
  }
  if (provider === "p24" || t.includes("przelewy24")) return "Inne";
  return "Bez płatności online";
}

export function orderPaymentDisplay(order: {
  status: string;
  paymentMethodLabel?: string;
  paymentMethodId?: number;
  paymentProvider?: string;
}): string {
  if (order.paymentMethodLabel) return order.paymentMethodLabel;
  if (order.paymentMethodId) return p24MethodLabel(order.paymentMethodId);
  if (order.status === "pending") return "Oczekuje na płatność";
  if (order.paymentProvider === "p24") return "Przelewy24";
  return "—";
}
