"use client";

import { useCartStore } from "@/store/use-cart-store";
import { formatPLN } from "@/lib/format";
import { studioSettings } from "@/lib/data/settings";

export function FreeShippingMeter({ subtotal }: { subtotal: number }) {
  const threshold = studioSettings.freeShippingThresholdCents;
  const remaining = Math.max(0, threshold - subtotal);
  const progress = Math.min(100, Math.round((subtotal / threshold) * 100));

  if (subtotal <= 0) return null;

  const thresholdLabel = formatPLN(threshold);

  return (
    <div className="space-y-2 rounded-2xl bg-krem p-4">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <p>
          {remaining === 0
            ? "Darmowa dostawa — próg osiągnięty."
            : `Do darmowej dostawy brakuje ${formatPLN(remaining)}.`}
        </p>
        <p className="shrink-0 font-heading text-[11px] uppercase tracking-[0.12em] text-szary">
          od {thresholdLabel}
        </p>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-krem-ciemny">
        <div className="h-full rounded-full bg-czerwony transition-[width] duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

export function GiftWrappingCard() {
  const hasGiftWrapping = useCartStore((state) => state.hasGiftWrapping);
  const giftMessage = useCartStore((state) => state.giftMessage);
  const setGiftWrapping = useCartStore((state) => state.setGiftWrapping);
  const setGiftMessage = useCartStore((state) => state.setGiftMessage);
  const price = studioSettings.giftWrapPriceCents;

  return (
    <div className="space-y-3 rounded-2xl border border-czarny/10 p-4">
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={hasGiftWrapping}
          onChange={(event) => setGiftWrapping(event.target.checked)}
          className="mt-1 accent-czerwony"
        />
        <span>
          <span className="font-heading text-[11px] uppercase tracking-[0.14em]">Pakowanie na prezent</span>
          <span className="mt-1 block text-czarny/70">
            Pudełko, wstążka i ceramiczny bilecik · {formatPLN(price)}
          </span>
        </span>
      </label>
      {hasGiftWrapping ? (
        <textarea
          value={giftMessage}
          onChange={(event) => setGiftMessage(event.target.value)}
          placeholder="Dedykacja na bileciku (opcjonalnie)"
          className="min-h-20 w-full rounded-2xl border border-czarny/10 px-3 py-2 text-sm outline-none focus:border-czerwony"
          maxLength={280}
        />
      ) : null}
    </div>
  );
}
