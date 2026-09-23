import Link from "next/link";
import { PayP24Button } from "@/components/checkout/pay-p24-button";
import { SITE } from "@/lib/constants";
import { isP24Sandbox } from "@/lib/p24";
import type { OrderStatus } from "@/lib/types";

const PAY_ERRORS: Record<string, string> = {
  "0": "Płatność nie wystartowała za pierwszym razem. Spróbuj ponownie.",
  auth:
    "Przelewy24 odrzuciło klucz API (401). W sandboxie muszą być klucze z panelu sandbox.przelewy24.pl — nie z produkcji.",
  net: "Nie udało się połączyć z Przelewy24. Sprawdź sieć / TLS i spróbuj ponownie.",
};

export function OrderNextStep({
  orderNumber,
  orderId,
  status,
  customerEmail,
  mailFailed,
  payFailed,
  payCode,
  canPay: paymentsAllowed,
  isTester = false,
}: {
  orderNumber: string;
  orderId: string;
  status: OrderStatus;
  customerEmail: string;
  mailFailed: boolean;
  payFailed: boolean;
  payCode?: string;
  canPay: boolean;
  isTester?: boolean;
}) {
  const canPay = status === "pending" && paymentsAllowed;
  const payMessage = payCode ? PAY_ERRORS[payCode] ?? PAY_ERRORS["0"] : payFailed ? PAY_ERRORS["0"] : null;

  return (
    <div className="space-y-4">
      {status === "pending" ? (
        <div className="space-y-3 rounded-[28px] border border-czerwony/20 bg-krem p-6">
          <p className="font-heading text-[11px] uppercase tracking-[0.16em] text-czerwony">Następny krok</p>
          <p className="text-sm leading-relaxed">
            {canPay ? (
              <>
                Zamówienie jest zapisane. Pracownia zaczyna pakować dopiero po płatności — BLIK, karta albo przelew w
                Przelewy24
                {isP24Sandbox() || isTester ? " (tryb testowy / sandbox)" : ""}.
              </>
            ) : (
              <>
                Zamówienie jest zapisane. Płatności online są chwilowo niedostępne — o dalszych krokach damy znać
                mailem.
              </>
            )}
          </p>
          {payMessage ? <p className="text-sm text-czerwony">{payMessage}</p> : null}
          {canPay ? (
            <PayP24Button orderNumber={orderNumber} orderId={orderId} label="Zapłać teraz" />
          ) : (
            <p className="text-sm text-szary">
              O płatności damy znać mailem. W razie pytań napisz na{" "}
              <a href={`mailto:${SITE.email}`} className="text-czerwony underline-offset-2 hover:underline">
                {SITE.email}
              </a>
              .
            </p>
          )}
        </div>
      ) : null}
      <p className="text-sm text-czarny/60">
        {mailFailed ? (
          <>
            Potwierdzenie nie doszło na {customerEmail}. Dopóki domena sklepu nie jest zweryfikowana w Resend, testowe
            maile trafiają tylko na skrzynkę pracowni. Zamówienie i tak jest zapisane — status zobaczysz w{" "}
          </>
        ) : (
          <>Potwierdzenie poszło na {customerEmail}. Status śledzisz też w </>
        )}
        <Link href="/konto" className="text-czerwony underline-offset-2 hover:underline">
          koncie
        </Link>
        .
      </p>
    </div>
  );
}
