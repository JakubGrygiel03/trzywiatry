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

export function PaymentOutcomePanel({
  outcome,
  orderStatus,
  orderNumber,
  orderId,
  attemptCount = 1,
  canPay,
  mailFailed,
  customerEmail,
}: {
  outcome: PaymentOutcomeKey;
  orderStatus: OrderStatus;
  orderNumber: string;
  orderId: string;
  attemptCount?: number;
  canPay: boolean;
  mailFailed: boolean;
  customerEmail: string;
}) {
  const copy = orderStatus === "cancelled" ? CANCELLED_ORDER_COPY : PAYMENT_OUTCOMES[outcome];
  const payEnabled = orderAllowsPayButton(orderStatus, outcome) && canPay;

  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-czarny/75">{copy.body}</p>

      {copy.showBankAccount ? (
        <p className="rounded-2xl bg-krem px-4 py-3 font-heading text-sm tracking-[0.04em] text-czarny">
          {SITE.bankAccount}
        </p>
      ) : null}

      {payEnabled ? (
        <PayP24Button
          key={`${orderId}-${attemptCount}-${outcome}`}
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

      <p className="text-sm leading-relaxed text-czarny/50">
        {mailFailed ? (
          <>
            Mail ze złożeniem zamówienia nie doszedł na {customerEmail}. Zamówienie i tak jest zapisane — status
            zobaczysz w{" "}
          </>
        ) : outcome === "paid" ? (
          <>Potwierdzenie płatności wysłaliśmy na {customerEmail}. Status zamówienia zobaczysz też w </>
        ) : outcome === "awaiting" ? (
          <>Zapis zamówienia jest na {customerEmail}. Jak zobaczymy wpłatę, status zmieni się w </>
        ) : outcome === "retry" ? (
          <>Zapis zamówienia jest na {customerEmail}. Nowa płatność zaktualizuje status w </>
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
