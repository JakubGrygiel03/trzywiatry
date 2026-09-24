/**
 * Three unpaid stories after Przelewy24, plus paid / wrong amount:
 * error = failed BLIK/card · none = closed the window · awaiting = bank transfer.
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
  sandboxLabel: string;
  eyebrow: string;
  title: string;
  pageTitle: string;
  lead: string;
  body: string;
  tone: "ok" | "wait" | "warn" | "error" | "neutral";
  showPayButton: boolean;
  payLabel?: string;
};

export const PAYMENT_OUTCOMES: Record<PaymentOutcomeKey, PaymentOutcomeCopy> = {
  paid: {
    key: "paid",
    sandboxLabel: "Zapłać",
    eyebrow: "Opłacone",
    title: "Płatność potwierdzona",
    pageTitle: "Dziękujemy",
    lead: "Płatność jest potwierdzona. Pracownia może pakować naczynia.",
    body: "Potwierdzenie jest na mailu. Status zamówienia zobaczysz też na koncie.",
    tone: "ok",
    showPayButton: false,
  },
  awaiting: {
    key: "awaiting",
    sandboxLabel: "Oczekiwanie na wpłatę",
    eyebrow: "Oczekiwanie na przelew",
    title: "Czekamy, aż pieniądze dojdą",
    pageTitle: "Czekamy na przelew",
    lead: "Wybrałeś przelew. Pracownia oznaczy zamówienie jako opłacone, gdy wpłata będzie na koncie.",
    body: "Nie płać drugi raz i nie odświeżaj tej strony w kółko. Status sprawdzisz na koncie — jak oznaczymy wpłatę, przyjdzie mail.",
    tone: "wait",
    showPayButton: false,
  },
  error: {
    key: "error",
    sandboxLabel: "Błąd płatności",
    eyebrow: "Błąd płatności",
    title: "Płatność nie przeszła",
    pageTitle: "Płatność nie przeszła",
    lead: "BLIK, karta albo przelew online nie doszły do skutku. Zamówienie jest zapisane.",
    body: "Nic nie powinno zejść z konta. Zapłać ponownie poniżej — albo napisz do pracowni, jeśli widzisz obciążenie.",
    tone: "error",
    showPayButton: true,
    payLabel: "Zapłać ponownie",
  },
  none: {
    key: "none",
    sandboxLabel: "Brak wpłaty",
    eyebrow: "Brak wpłaty",
    title: "Nie dokończyłeś płatności",
    pageTitle: "Brak wpłaty",
    lead: "Okno Przelewy24 zamknęło się, zanim pieniądze zeszły. Zamówienie czeka w pracowni.",
    body: "Nic nie pobraliśmy. Możesz zapłacić teraz — BLIK, karta albo przelew.",
    tone: "neutral",
    showPayButton: true,
    payLabel: "Zapłać teraz",
  },
  amount: {
    key: "amount",
    sandboxLabel: "Nieprawidłowa kwota",
    eyebrow: "Inna kwota",
    title: "Wpłata nie zgadza się z zamówieniem",
    pageTitle: "Kwota się nie zgadza",
    lead: "Na płatności jest inna suma niż w koszyku, więc nie oznaczamy zamówienia jako opłaconego.",
    body: "Paczki nie wysyłamy. Zapłać ponownie poprawną kwotą albo napisz do pracowni — sprawdzimy przelew.",
    tone: "warn",
    showPayButton: true,
    payLabel: "Zapłać ponownie",
  },
  retry: {
    key: "retry",
    sandboxLabel: "Zapłać ponownie",
    eyebrow: "Dokończ płatność",
    title: "Poprzednia próba się nie skończyła",
    pageTitle: "Dokończ płatność",
    lead: "Zamówienie czeka. Możesz otworzyć Przelewy24 jeszcze raz.",
    body: "Wejdź ponownie do płatności i wybierz BLIK, kartę albo przelew.",
    tone: "neutral",
    showPayButton: true,
    payLabel: "Zapłać ponownie",
  },
};

/** Dev preview: ?wynik=zaplac|oczekiwanie|blad|brak|kwota */
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
 * Paid orders stay paid. Cancelled stays closed. Pending keeps the P24 story
 * (error / brak wpłaty / przelew) — do not collapse them into one card.
 */
export function alignOutcomeWithOrderStatus(
  orderStatus: string,
  candidate: PaymentOutcomeKey,
): PaymentOutcomeKey {
  if (PAID_STATUSES.has(orderStatus)) return "paid";
  if (orderStatus === "cancelled") return "none";
  if (candidate === "paid") return "awaiting";
  return candidate;
}

export function orderAllowsPayButton(orderStatus: string, outcome: PaymentOutcomeKey) {
  if (orderStatus !== "pending") return false;
  return PAYMENT_OUTCOMES[outcome].showPayButton;
}

export const CANCELLED_ORDER_COPY: PaymentOutcomeCopy = {
  key: "none",
  sandboxLabel: "Anulowane",
  eyebrow: "Anulowane",
  title: "To zamówienie jest anulowane",
  pageTitle: "Zamówienie anulowane",
  lead: "Zamówienie nie jest opłacone i nie realizujemy go.",
  body: "Jeśli to pomyłka, napisz do pracowni.",
  tone: "neutral",
  showPayButton: false,
};
