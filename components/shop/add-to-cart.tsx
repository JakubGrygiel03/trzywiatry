"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatPLN } from "@/lib/format";
import { variantStockLabel } from "@/lib/data/queries";
import { getProductPhoto } from "@/lib/media";
import type { Product } from "@/lib/types";
import { useCartStore } from "@/store/use-cart-store";

export function AddToCart({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const [variantId, setVariantId] = useState(product.variants[0]?.id);
  const [error, setError] = useState<string | null>(null);
  const variant = product.variants.find((item) => item.id === variantId) ?? product.variants[0];
  const price = variant?.priceInCents ?? product.priceInCents;
  const status = variantStockLabel(variant?.stockQuantity ?? 0, product.lowStockThreshold);
  const soldOut = !variant || !variant.isAvailable || variant.stockQuantity <= 0;

  function handleAdd() {
    if (!variant || soldOut) return;
    const result = addItem({
      productId: product.id,
      variantId: variant.id,
      slug: product.slug,
      name: product.name,
      variantTitle: variant.title,
      image: getProductPhoto(product) ?? product.images[0],
      unitPriceInCents: price,
      stockQuantity: variant.stockQuantity,
    });
    setError(result.ok ? null : result.reason ?? "Nie udało się dodać do koszyka.");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {product.variants.map((item) => {
          const itemSold = item.stockQuantity <= 0 || !item.isAvailable;
          return (
            <button
              key={item.id}
              type="button"
              disabled={itemSold}
              onClick={() => setVariantId(item.id)}
              className={`rounded-full border px-4 py-2 font-heading text-[11px] uppercase tracking-[0.12em] transition-colors duration-300 ${
                item.id === variant.id
                  ? "border-czerwony bg-czerwony text-bialy"
                  : "border-czarny/10 hover:border-czarny/25"
              } disabled:opacity-40`}
            >
              {item.title}
              {itemSold ? " · wyprzedane" : ""}
            </button>
          );
        })}
      </div>
      <p className="font-heading text-2xl">{formatPLN(price)}</p>
      {status === "low" && !soldOut ? (
        <p className="text-sm text-ceglany">Niski stan — zostało {variant.stockQuantity} szt.</p>
      ) : null}
      <Button type="button" onClick={handleAdd} disabled={soldOut} className="w-full">
        {soldOut ? "Wyprzedane" : "Dodaj do koszyka"}
      </Button>
      {error ? <p className="text-sm text-czerwony">{error}</p> : null}
    </div>
  );
}
