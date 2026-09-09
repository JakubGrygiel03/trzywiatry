"use client";

import { useTransition } from "react";
import { updateVariantStock } from "@/app/actions/admin-products";

/** Inline stock qty + „brak w magazynie” on the admin products list. */
export function AdminStockEditor({
  productId,
  variantId,
  stockQuantity,
  isAvailable,
}: {
  productId: string;
  variantId: string;
  stockQuantity: number;
  isAvailable: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const outOfStock = stockQuantity <= 0 || !isAvailable;

  function save(nextStock: number, nextOutOfStock: boolean) {
    const formData = new FormData();
    formData.set("productId", productId);
    formData.set("variantId", variantId);
    formData.set("stockQuantity", String(nextOutOfStock ? 0 : nextStock));
    formData.set("outOfStock", nextOutOfStock ? "true" : "false");
    startTransition(() => {
      void updateVariantStock(formData);
    });
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${pending ? "opacity-50" : ""}`}>
      <input
        type="number"
        min={0}
        defaultValue={outOfStock ? 0 : stockQuantity}
        disabled={pending || outOfStock}
        className="h-8 w-16 rounded-md border border-czarny/12 bg-bialy px-2 text-sm tabular-nums outline-none focus:border-czerwony"
        aria-label="Ilość w magazynie"
        onBlur={(event) => {
          const next = Math.max(0, Number(event.target.value) || 0);
          if (next === stockQuantity && !outOfStock) return;
          save(next, next <= 0);
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter") return;
          event.currentTarget.blur();
        }}
      />
      <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-czarny/65">
        <input
          type="checkbox"
          checked={outOfStock}
          disabled={pending}
          onChange={(event) => {
            const checked = event.target.checked;
            save(checked ? 0 : Math.max(1, stockQuantity), checked);
          }}
          className="accent-czerwony"
        />
        Brak
      </label>
    </div>
  );
}
