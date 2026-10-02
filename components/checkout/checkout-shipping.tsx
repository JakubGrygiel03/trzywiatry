"use client";

import { formatPLN } from "@/lib/format";
import type { ShippingMethod, ShippingMethodDef } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CheckoutShipping({
  methods,
  value,
  onChange,
  hint,
}: {
  methods: ShippingMethodDef[];
  value: ShippingMethod;
  onChange: (id: ShippingMethod) => void;
  hint: string;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="font-heading text-[11px] uppercase tracking-[0.16em] text-szary">Dostawa</legend>
      <div className="grid gap-2">
        {methods.map((method) => {
          const selected = method.id === value;
          return (
            <label
              key={method.id}
              className={cn(
                "flex cursor-pointer items-start justify-between gap-3 rounded-2xl border px-4 py-3 transition-colors",
                selected ? "border-czerwony bg-krem" : "border-czarny/10 bg-krem/50 hover:border-czerwony/40",
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
                <span className="mt-1 block text-xs text-szary">{method.hint}</span>
              </span>
              <span className="font-heading text-sm">
                {method.priceInCents === 0 ? "0 zł" : formatPLN(method.priceInCents)}
              </span>
            </label>
          );
        })}
      </div>
      <p className="text-xs text-szary">{hint}</p>
    </fieldset>
  );
}
