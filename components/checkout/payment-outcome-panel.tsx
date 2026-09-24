import Link from "next/link";
import { PayP24Button } from "@/components/checkout/pay-p24-button";
import { SITE } from "@/lib/constants";
import {
  orderAllowsPayButton,
  PAYMENT_OUTCOMES,
  type PaymentOutcomeKey,
} from "@/lib/payment-outcome";
import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type PaymentOutcomeCopyTone = (typeof PAYMENT_OUTCOMES)[PaymentOutcomeKey]["tone"];

const TONE_CLASS: Record<PaymentOutcomeCopyTone, string> = {
  ok: "border-emerald-700/25 bg-emerald-50",
  wait: "border-ceglany/35 bg-ceglany/10",
  warn: "border-ceglany/40 bg-krem",
  error: "border-czerwony/35 bg-czerwony/10",
  neutral: "border-czarny/12 bg-krem",
};

const EYEBROW_CLASS: Record<PaymentOutcomeCopyTone, string> = {
  ok: "text-emerald-800",
  wait: "text-czerwony",
  warn: "text-czerwony",
  error: "text-czerwony",
  neutral: "text-czarny/55",
};

export function PaymentOutcomePanel({
  outcome,
  orderStatus,
  orderNumber,
  orderId,
  canPay,
  mailFailed,
  customerEmail,
}: {
  outcome: PaymentOutcomeKey;
  orderStatus: OrderStatus;
  orderNumber: string;
  orderId: string;
  canPay: boolean;
  mailFailed: boolean;
  customerEmail: string;
}) {
  const copy = PAYMENT_OUTCOMES[outcome];
  // Hard gate: pay CTA only while order is still pending in our store.
  const payEnabled = orderAllowsPayButton(orderStatus, outcome) && canPay;

  return (
    <div className="space-y-4">
      <div className={cn("space-y-3 rounded-[28px] border p-6", TONE_CLASS[copy.tone])}>
        <p
          className={cn(
            "font-heading text-[11px] uppercase tracking-[0.16em]",
            EYEBROW_CLASS[copy.tone],
          )}
        >
          {copy.eyebrow}
        </p>
        <h2 className="font-heading text-xl uppercase tracking-[0.06em] text-czarny">{copy.title}</h2>
        <p className="text-sm leading-relaxed text-czarny/75">{copy.body}</p>

        {payEnabled ? (
          <PayP24Button
            orderNumber={orderNumber}
            orderId={orderId}
            label={copy.payLabel ?? "Zapłać teraz"}
          />
        ) : null}

        {orderAllowsPayButton(orderStatus, outcome) && !canPay ? (
          <p className="text-sm text-szary">
            Płatności online są chwilowo niedostępne — napisz na{" "}
            <a href={`mailto:${SITE.email}`} className="text-czerwony underline-offset-2 hover:underline">
              {SITE.email}
            </a>
            .
          </p>
        ) : null}
      </div>

      <p className="text-sm text-czarny/60">
        {mailFailed ? (
          <>
            Mail ze złożeniem zamówienia nie doszedł na {customerEmail}. Zamówienie i tak jest zapisane — status
            zobaczysz w{" "}
          </>
        ) : outcome === "paid" ? (
          <>Potwierdzenie płatności wysłaliśmy na {customerEmail}. Status zamówienia zobaczysz też w </>
        ) : outcome === "awaiting" ? (
          <>
            Zapis zamówienia wysłaliśmy na {customerEmail}. Jak pracownia oznaczy wpłatę, status zmieni się w{" "}
          </>
        ) : (
          <>
            Zapis zamówienia wysłaliśmy na {customerEmail}. To jeszcze nie jest potwierdzenie płatności — status
            zobaczysz też w{" "}
          </>
        )}
        <Link href="/konto" className="text-czerwony underline-offset-2 hover:underline">
          koncie
        </Link>
        .
      </p>
    </div>
  );
}
