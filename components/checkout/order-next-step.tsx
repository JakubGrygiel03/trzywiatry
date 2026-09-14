import Link from "next/link";
import { startPendingOrderPayment } from "@/app/actions/pay-order";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/constants";
import { hasP24Credentials } from "@/lib/p24";
import type { OrderStatus } from "@/lib/types";

export function OrderNextStep({
  orderNumber,
  orderId,
  status,
  customerEmail,
  mailFailed,
  payFailed,
}: {
  orderNumber: string;
  orderId: string;
  status: OrderStatus;
  customerEmail: string;
  mailFailed: boolean;
  payFailed: boolean;
}) {
  const canPay = status === "pending" && hasP24Credentials();

  return (
    <div className="space-y-4">
      {status === "pending" ? (
        <div className="space-y-3 rounded-[28px] border border-czerwony/20 bg-krem p-6">
          <p className="font-heading text-[11px] uppercase tracking-[0.16em] text-czerwony">Następny krok</p>
          <p className="text-sm leading-relaxed">
            Zamówienie jest zapisane. Pracownia zaczyna pakować dopiero po płatności — BLIK, karta albo przelew w
            Przelewy24.
          </p>
          {payFailed ? (
            <p className="text-sm text-czerwony">Płatność nie wystartowała za pierwszym razem. Spróbuj ponownie.</p>
          ) : null}
          {canPay ? (
            <form action={startPendingOrderPayment}>
              <input type="hidden" name="orderNumber" value={orderNumber} />
              <input type="hidden" name="orderId" value={orderId} />
              <Button type="submit">Zapłać teraz</Button>
            </form>
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
