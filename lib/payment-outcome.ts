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
    lead: "Płatność jest potwierdzona. Pracownia może pakować naczynia.",
    body: "Potwierdzenie jest na mailu. Status zamówienia zobaczysz też na koncie.",
    tone: "ok",
    showPayButton: false,
  },
  awaiting: {
    key: "awaiting",
    sandboxLabel: "Oczekiwanie na wpłatę",
    eyebrow: "Czekamy na wpłatę",
    title: "Czekamy na płatność",
    pageTitle: "Czekamy na płatność",
    lead: "To nie jest błąd. Zamówienie jest zapisane — pieniądze jeszcze nie doszły.",
    body: "Przy przelewie oznaczymy „Opłacone”, gdy wpłata będzie na koncie. Status przyjdzie mailem i na koncie. Nie płać drugi raz.",
    tone: "wait",
    showPayButton: false,
    showBankAccount: true,
  },
  error: {
    key: "error",
    sandboxLabel: "Błąd płatności",
    eyebrow: "Nie przeszło",
    title: "Nie udało się zapłacić",
    pageTitle: "Nie udało się zapłacić",
    lead: "BLIK albo karta nie zadziałała. Zamówienie jest zapisane — nic nie powinno zejść z konta.",
    body: "Otworzymy nową formatkę Przelewy24. Tamta próba jest zamknięta, ta będzie na tę samą kwotę.",
    tone: "error",
    showPayButton: true,
    payLabel: "Spróbuj inną metodą",
  },
  none: {
    key: "none",
    sandboxLabel: "Brak wpłaty",
    eyebrow: "Nie dokończono",
    title: "Nie dokończono płatności",
    pageTitle: "Nie dokończono płatności",
    lead: "Zamknąłeś okno Przelewy24 zanim cokolwiek pobraliśmy.",
    body: "Zamówienie czeka w pracowni. Możesz zapłacić teraz.",
    tone: "neutral",
    showPayButton: true,
    payLabel: "Zapłać teraz",
  },
  amount: {
    key: "amount",
    sandboxLabel: "Nieprawidłowa kwota",
    eyebrow: "Inna kwota",
    title: "Wpłata nie zgadza się z koszykiem",
    pageTitle: "Kwota się nie zgadza",
    lead: "Na płatności jest inna suma niż w zamówieniu.",
    body: "Nie oznaczamy tego jako opłacone. Zapłać ponownie poprawną kwotą albo napisz do pracowni.",
    tone: "warn",
    showPayButton: true,
    payLabel: "Zapłać poprawną kwotą",
  },
  retry: {
    key: "retry",
    sandboxLabel: "Zapłać ponownie",
    eyebrow: "Nowa formatka",
    title: "Zapłać ponownie",
    pageTitle: "Zapłać ponownie",
    lead: "Poprzednia płatność jest zamknięta. Otworzymy nową formatkę Przelewy24.",
    body: "Nic nie schodzi z konta za tamten krok. Nowa sesja jest na kwotę tego zamówienia — BLIK, karta albo przelew.",
    tone: "neutral",
    showPayButton: true,
    payLabel: "Zapłać ponownie",
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
  title: "To zamówienie jest anulowane",
  pageTitle: "Zamówienie anulowane",
  lead: "Zamówienie nie jest opłacone i nie realizujemy go.",
  body: "Jeśli to pomyłka, napisz do pracowni.",
  tone: "neutral",
  showPayButton: false,
};
