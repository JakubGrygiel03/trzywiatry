"use client";

import { useEffect, useState } from "react";
import { previewDiscountCode } from "@/app/actions/discount";
import { CheckoutField } from "@/components/checkout/checkout-field";
import { Button } from "@/components/ui/button";
import { discountAmountFromGoods } from "@/lib/discount";
import { formatPLN } from "@/lib/format";

export type AppliedDiscount = {
  code: string;
  amountCents: number;
};

export function CheckoutDiscount({
  goodsCents,
  customerEmail = "",
  applied,
  onApplied,
}: {
  goodsCents: number;
  customerEmail?: string;
  applied: AppliedDiscount | null;
  onApplied: (value: AppliedDiscount | null) => void;
}) {
  const [draft, setDraft] = useState(applied?.code ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!applied) return;
    const next = discountAmountFromGoods(goodsCents);
    if (next !== applied.amountCents) {
      onApplied({ code: applied.code, amountCents: next });
    }
  }, [applied, goodsCents, onApplied]);

  async function apply() {
    setBusy(true);
    setError("");
    const result = await previewDiscountCode(draft, goodsCents, customerEmail);
    setBusy(false);
    if (!result.ok) {
      onApplied(null);
      setError(result.message);
      return;
    }
    onApplied({ code: result.code, amountCents: result.amountCents });
    setDraft(result.code);
  }

  function clear() {
    setDraft("");
    setError("");
    onApplied(null);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <CheckoutField
            name="discountCode"
            label="Kod rabatowy (opcjonalnie)"
            placeholder="TW-XXXXXX"
            autoComplete="off"
            value={draft}
            required={false}
            onChange={(value) => {
              setDraft(value);
              setError("");
              if (applied) onApplied(null);
            }}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              void apply();
            }}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={busy}
          className="shrink-0 sm:mt-7"
          onClick={() => void apply()}
        >
          {busy ? "Sprawdzam…" : "Zastosuj"}
        </Button>
      </div>
      {applied ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-krem px-4 py-3">
          <p className="text-sm leading-relaxed text-czarny/80">
            Kod <span className="font-heading tracking-[0.08em] text-czerwony">{applied.code}</span> działa.
            −15% ({formatPLN(applied.amountCents)}) zejdzie z produktów.
          </p>
          <button
            type="button"
            className="font-heading text-[10px] uppercase tracking-[0.14em] text-czarny/45 hover:text-czerwony"
            onClick={clear}
          >
            Usuń kod
          </button>
        </div>
      ) : error ? (
        <p className="text-xs text-czerwony">{error}</p>
      ) : (
        <p className="text-xs text-czarny/45">
          Wpisz kod z maila (TW-XXXXXX) i kliknij Zastosuj — od razu zobaczysz −15%.
        </p>
      )}
    </div>
  );
}
