/**
 * Customer screens after Przelewy24. Each sandbox button is its own story.
 * Zapłać · Oczekiwanie na wpłatę · Błąd płatności · Brak wpłaty · Nieprawidłowa kwota · Zapłać ponownie
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
  showBankAccount?: boolean;
};

export const PAYMENT_OUTCOMES: Record<PaymentOutcomeKey, PaymentOutcomeCopy> = {
  paid: {
    key: "paid",
    sandboxLabel: "Zapłać",
    eyebrow: "Opłacone",
    title: "Płatność potwierdzona",
    pageTitle: "Dziękujemy",
    lead: "Otrzymaliśmy płatność. Zamówienie trafia do pracowni.",
    body: "Potwierdzenie wysłaliśmy na e-mail. Realizację i wysyłkę możesz śledzić na koncie.",
    tone: "ok",
    showPayButton: false,
  },
  awaiting: {
    key: "awaiting",
    sandboxLabel: "Oczekiwanie na wpłatę",
    eyebrow: "Czekamy na wpłatę",
    title: "Czekamy na przelew",
    pageTitle: "Czekamy na przelew",
    lead: "Zamówienie jest przyjęte. Czekamy, aż przelew pojawi się na koncie pracowni.",
    body: "Nie opłacaj tego zamówienia drugi raz. Gdy wpłata dotrze, oznaczymy je jako opłacone i wyślemy wiadomość.",
    tone: "wait",
    showPayButton: false,
    showBankAccount: true,
  },
  error: {
    key: "error",
    sandboxLabel: "Błąd płatności",
    eyebrow: "Płatność nieudana",
    title: "Płatność nie powiodła się",
    pageTitle: "Płatność nie powiodła się",
    lead: "Nie pobraliśmy pieniędzy. Zamówienie jest zapisane i czeka na opłacenie.",
    body: "Możesz zapłacić ponownie, tą samą albo inną metodą. Kwota pozostaje bez zmian.",
    tone: "error",
    showPayButton: true,
    payLabel: "Zapłać ponownie",
  },
  none: {
    key: "none",
    sandboxLabel: "Brak wpłaty",
    eyebrow: "Do opłacenia",
    title: "Płatność nie została dokończona",
    pageTitle: "Płatność nie została dokończona",
    lead: "Zamówienie jest zapisane, ale płatność nie została zakończona.",
    body: "Nic nie zostało pobrane. Możesz opłacić to zamówienie teraz, bez składania go od nowa.",
    tone: "neutral",
    showPayButton: true,
    payLabel: "Opłać zamówienie",
  },
  amount: {
    key: "amount",
    sandboxLabel: "Nieprawidłowa kwota",
    eyebrow: "Inna kwota",
    title: "Kwota płatności jest inna niż w zamówieniu",
    pageTitle: "Kwota płatności się nie zgadza",
    lead: "Zarejestrowana wpłata ma inną sumę niż to zamówienie, dlatego nie możemy jej potwierdzić.",
    body: "Opłać ponownie kwotę z podsumowania albo napisz do nas, jeśli przelew już wyszedł z Twojego konta.",
    tone: "warn",
    showPayButton: true,
    payLabel: "Opłać poprawną kwotę",
  },
  retry: {
    key: "retry",
    sandboxLabel: "Zapłać ponownie",
    eyebrow: "Do opłacenia",
    title: "Zamówienie czeka na płatność",
    pageTitle: "Zamówienie czeka na płatność",
    lead: "Poprzednia płatność nie doszła do skutku. Zamówienie jest nadal zapisane.",
    body: "Nic nie zostało pobrane. Możesz opłacić je teraz.",
    tone: "neutral",
    showPayButton: true,
    payLabel: "Zapłać",
  },
};

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
  title: "Zamówienie zostało anulowane",
  pageTitle: "Zamówienie anulowane",
  lead: "Tego zamówienia nie realizujemy i nie pobieramy za nie płatności.",
  body: "Jeśli to pomyłka, napisz do pracowni — pomożemy.",
  tone: "neutral",
  showPayButton: false,
};
