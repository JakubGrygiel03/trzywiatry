"use client";

import Link from "next/link";
import { PayP24Button } from "@/components/checkout/pay-p24-button";
import { SITE } from "@/lib/constants";
import {
  CANCELLED_ORDER_COPY,
  orderAllowsPayButton,
  PAYMENT_OUTCOMES,
  type PaymentOutcomeKey,
} from "@/lib/payment-outcome";
import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type Tone = (typeof PAYMENT_OUTCOMES)[PaymentOutcomeKey]["tone"];

const TONE_CLASS: Record<Tone, string> = {
  ok: "border-emerald-700/30 bg-emerald-50",
  wait: "border-ceglany bg-ceglany/15",
  warn: "border-ceglany/50 bg-krem",
  error: "border-czerwony bg-czerwony/12",
  neutral: "border-czarny/20 bg-bialy",
};

const EYEBROW_CLASS: Record<Tone, string> = {
  ok: "text-emerald-800",
  wait: "text-czerwony",
  warn: "text-czerwony",
  error: "text-czerwony",
  neutral: "text-czarny/50",
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
  const copy = orderStatus === "cancelled" ? CANCELLED_ORDER_COPY : PAYMENT_OUTCOMES[outcome];
  const payEnabled = orderAllowsPayButton(orderStatus, outcome) && canPay;

  return (
    <div className="space-y-4">
      <div className={cn("space-y-3 rounded-[28px] border-2 p-6", TONE_CLASS[copy.tone])}>
        <p className={cn("font-heading text-[11px] uppercase tracking-[0.16em]", EYEBROW_CLASS[copy.tone])}>
          {copy.eyebrow}
        </p>
        <h2 className="font-heading text-xl uppercase tracking-[0.06em] text-czarny">{copy.title}</h2>
        <p className="text-sm leading-relaxed text-czarny/80">{copy.body}</p>

        {copy.showBankAccount ? (
          <p className="rounded-2xl bg-bialy/80 px-4 py-3 font-heading text-sm tracking-[0.04em] text-czarny">
            {SITE.bankAccount}
          </p>
        ) : null}

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
            Zapis zamówienia jest na {customerEmail}. Jak oznaczymy przelew, status zmieni się w{" "}
          </>
        ) : outcome === "none" ? (
          <>Zapis zamówienia wysłaliśmy na {customerEmail}. Wpłaty jeszcze nie było — status w </>
        ) : (
          <>Zapis zamówienia wysłaliśmy na {customerEmail}. To nie jest potwierdzenie wpłaty — status w </>
        )}
        <Link href="/konto" className="text-czerwony underline-offset-2 hover:underline">
          koncie
        </Link>
        .
      </p>
    </div>
  );
}
