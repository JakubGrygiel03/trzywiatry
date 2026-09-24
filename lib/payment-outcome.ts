/**
 * Customer-facing payment outcomes. Four real stories:
 * paid · awaiting transfer (admin ticks paid) · payment failed · wrong amount.
 * `none` / `retry` are aliases of failed payment so sandbox/old URLs still work.
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
  /** H1 on the confirmation page. */
  pageTitle: string;
  lead: string;
  body: string;
  tone: "ok" | "wait" | "warn" | "error" | "neutral";
  showPayButton: boolean;
  payLabel?: string;
};

const FAILED_PAYMENT: Omit<PaymentOutcomeCopy, "key" | "sandboxLabel"> = {
  eyebrow: "Płatność nie przeszła",
  title: "Nie otrzymaliśmy płatności",
  pageTitle: "Płatność nie przeszła",
  lead: "Zamówienie jest zapisane, ale nieopłacone. Możesz spróbować jeszcze raz.",
  body: "BLIK, karta albo okno płatności nie doszły do skutku. Nic nie powinno zejść z konta. Zapłać ponownie poniżej — albo napisz do pracowni, jeśli widzisz obciążenie.",
  tone: "error",
  showPayButton: true,
  payLabel: "Zapłać ponownie",
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
    eyebrow: "Czekamy na przelew",
    title: "Pracownia potwierdzi wpłatę",
    pageTitle: "Zamówienie zapisane",
    lead: "Przy przelewie bankowym płatność nie schodzi od razu. Zamówienie czeka, aż pracownia zobaczy pieniądze na koncie i oznaczy je jako opłacone.",
    body: "Nie odświeżaj tej strony w kółko. Status sprawdzisz na koncie. Jak tylko oznaczymy wpłatę, przyjdzie mail.",
    tone: "wait",
    showPayButton: false,
  },
  error: {
    key: "error",
    sandboxLabel: "Błąd płatności",
    ...FAILED_PAYMENT,
  },
  none: {
    key: "none",
    sandboxLabel: "Brak wpłaty",
    eyebrow: "Anulowane",
    title: "To zamówienie jest anulowane",
    pageTitle: "Zamówienie anulowane",
    lead: "Zamówienie nie jest opłacone i nie realizujemy go.",
    body: "Jeśli to pomyłka, napisz do pracowni.",
    tone: "neutral",
    showPayButton: false,
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
    ...FAILED_PAYMENT,
  },
};

/** Dev/admin preview: ?wynik=zaplac|oczekiwanie|blad|kwota */
export function parsePaymentOutcomeParam(raw: string | undefined): PaymentOutcomeKey | null {
  if (!raw) return null;
  const map: Record<string, PaymentOutcomeKey> = {
    zaplac: "paid",
    paid: "paid",
    oczekiwanie: "awaiting",
    awaiting: "awaiting",
    blad: "error",
    error: "error",
    brak: "error",
    none: "error",
    kwota: "amount",
    amount: "amount",
    ponownie: "error",
    retry: "error",
  };
  return map[raw.trim().toLowerCase()] ?? null;
}

const PAID_STATUSES = new Set(["paid", "processing", "shipped", "completed"]);

/**
 * Customer screen: failed / abandoned / retry all look like “pay again”.
 * Cancelled stays a closed order (no pay button).
 */
export function alignOutcomeWithOrderStatus(
  orderStatus: string,
  candidate: PaymentOutcomeKey,
): PaymentOutcomeKey {
  if (PAID_STATUSES.has(orderStatus)) return "paid";
  if (orderStatus === "cancelled") return "none";
  if (candidate === "paid") return "awaiting";
  if (candidate === "none" || candidate === "retry") return "error";
  return candidate;
}

export function orderAllowsPayButton(orderStatus: string, outcome: PaymentOutcomeKey) {
  if (orderStatus !== "pending") return false;
  return PAYMENT_OUTCOMES[outcome].showPayButton;
}
