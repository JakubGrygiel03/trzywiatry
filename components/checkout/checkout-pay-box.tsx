"use client";

import { Button } from "@/components/ui/button";
import { formatPLN } from "@/lib/format";
import type { CartItem } from "@/lib/types";

const P24_METHODS = ["BLIK", "karta", "Apple Pay", "Google Pay", "przelew"] as const;

export function CheckoutPayBox({
  items,
  giftLabel,
  giftCents,
  pending,
  paymentsLive,
  message,
}: {
  items: CartItem[];
  giftLabel?: string;
  giftCents: number;
  pending: boolean;
  paymentsLive: boolean;
  message: string;
}) {
  return (
    <aside className="h-fit space-y-4 rounded-[28px] bg-krem p-6">
      {items.map((item) => (
        <div key={item.variantId} className="flex justify-between gap-3 text-sm">
          <span>
            {item.name} × {item.quantity}
          </span>
          <span className="font-heading">{formatPLN(item.unitPriceInCents * item.quantity)}</span>
        </div>
      ))}
      {giftCents > 0 ? (
        <div className="flex justify-between text-sm">
          <span>{giftLabel ?? "Pakowanie prezentowe"}</span>
          <span className="font-heading">{formatPLN(giftCents)}</span>
        </div>
      ) : null}
      {paymentsLive ? (
        <div className="space-y-3 rounded-2xl bg-bialy/70 px-4 py-4">
          <p className="font-heading text-[11px] uppercase tracking-[0.16em] text-czerwony">Płatność Przelewy24</p>
          <div className="flex flex-wrap gap-2">
            {P24_METHODS.map((method) => (
              <span
                key={method}
                className="rounded-full bg-krem px-3 py-1 font-heading text-[10px] uppercase tracking-[0.14em] text-czarny/80"
              >
                {method}
              </span>
            ))}
          </div>
          <p className="text-xs leading-relaxed text-szary">
            Po złożeniu zamówienia wybierzesz BLIK, kartę albo inną metodę w oknie Przelewy24.
          </p>
        </div>
      ) : (
        <p className="text-xs text-szary">Zamówienie zapisujemy — o płatności damy znać mailem.</p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Składam zamówienie…" : paymentsLive ? "Zamawiam i płacę" : "Zamawiam"}
      </Button>
      {message ? <p className="text-sm text-czerwony">{message}</p> : null}
    </aside>
  );
}
