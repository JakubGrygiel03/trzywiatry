"use client";

import { SHIPPING_METHODS } from "@/lib/constants";
import { formatPLN } from "@/lib/format";
import { cn } from "@/lib/utils";

const HINTS: Record<(typeof SHIPPING_METHODS)[number]["id"], string> = {
  inpost: "Odbiór 24/7 — paczkomat wybierzesz na mapie.",
  kurier: "Dostawa pod wskazany adres.",
  odbior: "Życzliwa 13/4, Gdańsk — umówimy odbiór.",
};

export function CheckoutShipping({
  value,
  onChange,
  hint,
}: {
  value: (typeof SHIPPING_METHODS)[number]["id"];
  onChange: (id: (typeof SHIPPING_METHODS)[number]["id"]) => void;
  hint: string;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="font-heading text-[11px] uppercase tracking-[0.16em] text-szary">Dostawa</legend>
      <div className="grid gap-2">
        {SHIPPING_METHODS.map((method) => {
          const selected = method.id === value;
          return (
            <label
              key={method.id}
              className={cn(
                "flex cursor-pointer items-start justify-between gap-3 rounded-2xl border px-4 py-3 transition-colors",
                selected ? "border-czerwony bg-krem" : "border-czarny/10 bg-bialy hover:border-czerwony/40",
              )}
            >
              <span>
                <input
                  type="radio"
                  name="shippingMethod"
                  value={method.id}
                  checked={selected}
                  onChange={() => onChange(method.id)}
                  className="sr-only"
                />
                <span className="block text-sm">{method.label}</span>
                <span className="mt-1 block text-xs text-szary">{HINTS[method.id]}</span>
              </span>
              <span className="font-heading text-sm">{formatPLN(method.priceInCents)}</span>
            </label>
          );
        })}
      </div>
      <p className="text-xs text-szary">{hint}</p>
    </fieldset>
  );
}
