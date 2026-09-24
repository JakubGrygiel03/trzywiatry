import { isDelayedPaymentMethod } from "@/lib/p24-methods";
import type { PaymentOutcomeKey } from "@/lib/payment-outcome";

export type P24OutcomeSnapshot = {
  status: number;
  amount: number;
  paymentMethod?: number;
};

export function p24AmountMatches(p24Amount: number, orderCents: number) {
  if (p24Amount === orderCents) return true;
  return p24Amount > 0 && p24Amount * 100 === orderCents;
}

/**
 * One unpaid GET → one sandbox button. Do not collapse these.
 * Zapłać / Nieprawidłowa kwota are decided after verify in reconcile.
 */
export function outcomeFromUnpaidSnapshot(
  tx: P24OutcomeSnapshot,
  attemptCount: number,
): PaymentOutcomeKey {
  // Sandbox “Błąd płatności” + refunds.
  if (tx.status === 3) return "error";

  // Sandbox “Oczekiwanie na wpłatę”: funds not captured, delayed channel.
  if (tx.status === 1 || isDelayedPaymentMethod(tx.paymentMethod)) return "awaiting";

  const hasMethod = Boolean(tx.paymentMethod);
  if (!hasMethod) {
    // First close = “Brak wpłaty”. Later close after “Zapłać ponownie”.
    return attemptCount > 1 ? "retry" : "none";
  }

  // Status 0 with an instant method (BLIK/card): sandbox “Błąd płatności”.
  return "error";
}

/** Query extras P24 sometimes appends to urlReturn. */
export function outcomeFromP24ReturnQuery(
  params: Record<string, string | undefined>,
): PaymentOutcomeKey | null {
  if (params.pay === "auth" || params.pay === "net" || params.pay === "0") return "error";
  const blob = ["result", "error", "p24_error", "p24Error", "status"]
    .map((key) => params[key]?.trim().toLowerCase() ?? "")
    .filter(Boolean)
    .join(" ");
  if (!blob) return null;
  if (/(blad|błęd|error|fail|err[0-9])/.test(blob)) return "error";
  if (/(oczek|await|wait|pending)/.test(blob)) return "awaiting";
  if (/(kwota|amount)/.test(blob)) return "amount";
  if (/(ponown|retry)/.test(blob)) return "retry";
  if (/(brak|none|cancel|abort)/.test(blob)) return "none";
  return null;
}
