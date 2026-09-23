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
  /** One sentence under the page title — must not contradict the panel. */
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
    title: "Płatność doszła",
    lead: "Dziękujemy — płatność jest potwierdzona i możemy pakować naczynia.",
    body: "Pieniądze z BLIK-a, karty albo przelewu są już u nas. Dalszy status zobaczysz w mailu i na koncie.",
    tone: "ok",
    showPayButton: false,
  },
  awaiting: {
    key: "awaiting",
    sandboxLabel: "Oczekiwanie na wpłatę",
    eyebrow: "Czekamy na wpłatę",
    title: "Zamówienie czeka na płatność",
    lead: "Zamówienie jest zapisane. Czekamy, aż bank przekaże pieniądze do Przelewy24.",
    body: "Przy BLIK-u i karcie status zwykle zmienia się sam w ciągu chwili. Przy zwykłym przelewie może to zająć do jednego dnia roboczego — nie płać drugi raz, jeśli środki są już w drodze.",
    tone: "wait",
    showPayButton: false,
  },
  error: {
    key: "error",
    sandboxLabel: "Błąd płatności",
    eyebrow: "Płatność nie przeszła",
    title: "Nie udało się pobrać pieniędzy",
    lead: "Płatność się nie udała. Zamówienie jest zapisane — możesz spróbować jeszcze raz.",
    body: "Bank albo Przelewy24 nie dokończyły płatności. Z karty i BLIK-a nic nie powinno zejść. Jeśli jednak widzisz obciążenie, napisz do pracowni, zanim zapłacisz ponownie.",
    tone: "error",
    showPayButton: true,
    payLabel: "Zapłać ponownie",
  },
  none: {
    key: "none",
    sandboxLabel: "Brak wpłaty",
    eyebrow: "Brak wpłaty",
    title: "Płatność nie została dokończona",
    lead: "Okno płatności zamknęło się wcześniej. Nic nie pobraliśmy z Twojego konta.",
    body: "Zamówienie czeka w pracowni. Możesz dokończyć płatność, kiedy chcesz — BLIK, karta albo przelew.",
    tone: "neutral",
    showPayButton: true,
    payLabel: "Zapłać teraz",
  },
  amount: {
    key: "amount",
    sandboxLabel: "Nieprawidłowa kwota",
    eyebrow: "Kwoty się nie zgadzają",
    title: "Wpłata ma inną kwotę niż zamówienie",
    lead: "W Przelewy24 jest inna suma niż w koszyku, więc zamówienia nie oznaczamy jako opłaconego.",
    body: "Paczki nie wysyłamy, dopóki kwoty się nie zgadzają. Najprościej zapłacić ponownie poprawną kwotą albo napisać do pracowni — sprawdzimy, co poszło nie tak.",
    tone: "warn",
    showPayButton: true,
    payLabel: "Zapłać ponownie",
  },
  retry: {
    key: "retry",
    sandboxLabel: "Zapłać ponownie",
    eyebrow: "Dokończ płatność",
    title: "Poprzednia próba się nie skończyła",
    lead: "Zamówienie jest zapisane i nadal czeka na wpłatę. Możesz otworzyć Przelewy24 jeszcze raz.",
    body: "Wejdź ponownie do płatności i wybierz BLIK, kartę albo przelew. Jeśli pierwsza wpłata jednak dojdzie, daj nam znać — nie musisz płacić dwa razy.",
    tone: "neutral",
    showPayButton: true,
    payLabel: "Zapłać ponownie",
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
