/**
 * Customer-facing payment outcomes after Przelewy24 (live + sandbox).
 * Same branches customers hit in production: paid, waiting for transfer,
 * gateway error, abandoned checkout, amount mismatch, pay again.
 */
export const PAYMENT_OUTCOME_KEYS = [
  "paid",
  "awaiting",
  "error",
  "none",
  "amount",
  "retry",
] as const;

export type PaymentOutcomeKey = (typeof PAYMENT_OUTCOME_KEYS)[number];

export type PaymentOutcomeCopy = {
  key: PaymentOutcomeKey;
  /** Internal / sandbox simulator label — never shown to regular customers. */
  sandboxLabel: string;
  eyebrow: string;
  title: string;
  body: string;
  tone: "ok" | "wait" | "warn" | "error" | "neutral";
  showPayButton: boolean;
  showRefreshHint: boolean;
};

export const PAYMENT_OUTCOMES: Record<PaymentOutcomeKey, PaymentOutcomeCopy> = {
  paid: {
    key: "paid",
    sandboxLabel: "Zapłać",
    eyebrow: "Płatność OK",
    title: "Płatność potwierdzona",
    body: "Dziękujemy — BLIK, karta albo przelew przeszły. Pracownia może pakować zamówienie.",
    tone: "ok",
    showPayButton: false,
    showRefreshHint: false,
  },
  awaiting: {
    key: "awaiting",
    sandboxLabel: "Oczekiwanie na wpłatę",
    eyebrow: "Czekamy na wpływ",
    title: "Oczekiwanie na wpłatę",
    body: "Zamówienie jest zapisane. Przy przelewie tradycyjnym wpływ bywa z opóźnieniem — jak tylko bank i Przelewy24 potwierdzą pieniądze, status zmieni się na opłacone. Możesz zostawić tę kartę otwartą albo wrócić później.",
    tone: "wait",
    showPayButton: false,
    showRefreshHint: true,
  },
  error: {
    key: "error",
    sandboxLabel: "Błąd płatności",
    eyebrow: "Problem z płatnością",
    title: "Błąd płatności",
    body: "Płatność nie doszła do skutku (odrzucenie banku, timeout albo błąd bramki). Zamówienie zostało zapisane — spróbuj ponownie albo wybierz inną metodę: BLIK, karta, przelew.",
    tone: "error",
    showPayButton: true,
    showRefreshHint: false,
  },
  none: {
    key: "none",
    sandboxLabel: "Brak wpłaty",
    eyebrow: "Bez wpłaty",
    title: "Brak wpłaty",
    body: "Nie odnotowaliśmy płatności — najpewniej anulowanie albo wyjście z bramki przed końcem. Zamówienie czeka; możesz dokończyć płatność poniżej.",
    tone: "neutral",
    showPayButton: true,
    showRefreshHint: false,
  },
  amount: {
    key: "amount",
    sandboxLabel: "Nieprawidłowa kwota",
    eyebrow: "Kwota się nie zgadza",
    title: "Nieprawidłowa kwota",
    body: "Kwota w płatności różni się od zamówienia w sklepie, więc nie oznaczamy go jako opłaconego. Napisz do pracowni albo uruchom nową płatność z poprawną kwotą.",
    tone: "warn",
    showPayButton: true,
    showRefreshHint: false,
  },
  retry: {
    key: "retry",
    sandboxLabel: "Zapłać ponownie",
    eyebrow: "Spróbuj jeszcze raz",
    title: "Dokończ płatność",
    body: "Poprzednia próba nie domknęła się. Zamówienie jest nadal aktywne — otwórz ponownie Przelewy24 i zapłać BLIK-iem, kartą albo przelewem.",
    tone: "neutral",
    showPayButton: true,
    showRefreshHint: false,
  },
};

/** Dev/admin preview: ?wynik=zaplac|oczekiwanie|blad|brak|kwota|ponownie */
export function parsePaymentOutcomeParam(raw: string | undefined): PaymentOutcomeKey | null {
  if (!raw) return null;
  const map: Record<string, PaymentOutcomeKey> = {
    zaplac: "paid",
    paid: "paid",
    oczekiwanie: "awaiting",
    awaiting: "awaiting",
    blad: "error",
    error: "error",
    brak: "none",
    none: "none",
    kwota: "amount",
    amount: "amount",
    ponownie: "retry",
    retry: "retry",
  };
  return map[raw.trim().toLowerCase()] ?? null;
}

const PAID_STATUSES = new Set(["paid", "processing", "shipped", "completed"]);

/**
 * Single source of truth for what the customer sees.
 * Never show “paid” unless the order is actually paid in our store;
 * never offer “Zapłać” once the order left pending.
 */
export function alignOutcomeWithOrderStatus(
  orderStatus: string,
  candidate: PaymentOutcomeKey,
): PaymentOutcomeKey {
  if (PAID_STATUSES.has(orderStatus)) return "paid";
  if (orderStatus === "cancelled") return "none";
  // Still pending in our books — never claim payment succeeded.
  if (candidate === "paid") return "awaiting";
  return candidate;
}

export function orderAllowsPayButton(orderStatus: string, outcome: PaymentOutcomeKey) {
  if (orderStatus !== "pending") return false;
  return PAYMENT_OUTCOMES[outcome].showPayButton;
}
