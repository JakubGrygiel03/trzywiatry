/**
 * Customer screens after Przelewy24. Three unpaid stories must not share copy:
 * error = gateway rejected BLIK/card · none = closed the window · awaiting = bank transfer.
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
    eyebrow: "Przelew",
    title: "Nie płać drugi raz",
    pageTitle: "Czekamy na przelew",
    lead: "Wybrałeś przelew tradycyjny — to nie jest błąd płatności.",
    body: "Pieniądze idą z banku na konto pracowni. Jak je zobaczymy, odhaczymy „Opłacone”. Status sprawdzisz na koncie i w mailu. Nie odświeżaj tej strony i nie płać ponownie.",
    tone: "wait",
    showPayButton: false,
    showBankAccount: true,
  },
  error: {
    key: "error",
    sandboxLabel: "Błąd płatności",
    eyebrow: "Błąd",
    title: "BLIK albo karta nie przeszły",
    pageTitle: "Błąd płatności",
    lead: "Bramka odrzuciła tę próbę. Zamówienie jest zapisane.",
    body: "To nie jest przelew w drodze i nie brak kliknięcia „zapłać”. Metoda nie zadziałała. Nic nie powinno zejść z konta — spróbuj inną metodą albo napisz, jeśli widzisz obciążenie.",
    tone: "error",
    showPayButton: true,
    payLabel: "Spróbuj inną metodą",
  },
  none: {
    key: "none",
    sandboxLabel: "Brak wpłaty",
    eyebrow: "Brak wpłaty",
    title: "Okno płatności zostało zamknięte",
    pageTitle: "Brak wpłaty",
    lead: "Nie wybrano zapłaty. Zamówienie czeka w pracowni.",
    body: "Zamknąłeś Przelewy24 zanim cokolwiek pobraliśmy. To nie błąd BLIK-a i nie przelew w banku — po prostu nie było wpłaty. Możesz zapłacić teraz.",
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
    eyebrow: "Brak wpłaty",
    title: "Okno płatności zostało zamknięte",
    pageTitle: "Brak wpłaty",
    lead: "Nie wybrano zapłaty. Zamówienie czeka w pracowni.",
    body: "Zamknąłeś Przelewy24 zanim cokolwiek pobraliśmy. Możesz zapłacić teraz.",
    tone: "neutral",
    showPayButton: true,
    payLabel: "Zapłać teraz",
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
    ponownie: "none",
    retry: "none",
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
  if (candidate === "retry") return "none";
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
