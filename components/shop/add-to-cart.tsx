"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatPLN } from "@/lib/format";
import { variantStockLabel } from "@/lib/data/queries";
import { findVariant, variantCapacities, variantColors } from "@/lib/product-variants";
import { getProductPhoto } from "@/lib/media";
import type { Product } from "@/lib/types";
import { useCartStore } from "@/store/use-cart-store";
import { cn } from "@/lib/utils";

export function AddToCart({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const colors = useMemo(() => variantColors(product), [product]);
  const capacities = useMemo(() => variantCapacities(product), [product]);
  const structured = colors.length > 0 || capacities.length > 1;

  const [color, setColor] = useState(colors[0]?.name);
  const [capacityMl, setCapacityMl] = useState(capacities[0]);
  const [variantId, setVariantId] = useState(product.variants[0]?.id);
  const [error, setError] = useState<string | null>(null);

  const variant = structured
    ? findVariant(product, color, capacityMl)
    : (product.variants.find((item) => item.id === variantId) ?? product.variants[0]);

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
      image: variant.image ?? getProductPhoto(product) ?? product.images[0],
      unitPriceInCents: price,
      stockQuantity: variant.stockQuantity,
    });
    setError(result.ok ? null : result.reason ?? "Nie udało się dodać do koszyka.");
  }

  return (
    <div className="space-y-4">
      {structured ? (
        <div className="space-y-4">
          {colors.length > 0 ? (
            <fieldset className="space-y-2">
              <legend className="font-heading text-[11px] uppercase tracking-[0.16em] text-szary">
                Kolor{color ? ` · ${color}` : ""}
              </legend>
              <div className="flex flex-wrap gap-2">
                {colors.map((item) => {
                  const option = findVariant(product, item.name, capacityMl);
                  const gone = !option || option.stockQuantity <= 0 || !option.isAvailable;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setColor(item.name)}
                      title={item.name}
                      className={cn(
                        "flex size-9 items-center justify-center rounded-full border transition",
                        color === item.name ? "border-czerwony ring-2 ring-czerwony/25" : "border-czarny/15",
                        gone && "opacity-40",
                      )}
                    >
                      <span
                        className="size-6 rounded-full"
                        style={{ background: item.hex ?? "#aaa9a5" }}
                      />
                      <span className="sr-only">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ) : null}

          {capacities.length > 0 ? (
            <fieldset className="space-y-2">
              <legend className="font-heading text-[11px] uppercase tracking-[0.16em] text-szary">
                Pojemność
              </legend>
              <div className="flex flex-wrap gap-2">
                {capacities.map((ml) => {
                  const option = findVariant(product, color, ml);
                  const gone = !option || option.stockQuantity <= 0 || !option.isAvailable;
                  return (
                    <button
                      key={ml}
                      type="button"
                      disabled={gone}
                      onClick={() => setCapacityMl(ml)}
                      className={cn(
                        "rounded-full border px-4 py-2 font-heading text-[11px] uppercase tracking-[0.12em] transition-colors",
                        capacityMl === ml
                          ? "border-czerwony bg-czerwony text-bialy"
                          : "border-czarny/10 hover:border-czarny/25",
                        "disabled:opacity-40",
                      )}
                    >
                      {ml} ml
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {product.variants.map((item) => {
            const itemSold = item.stockQuantity <= 0 || !item.isAvailable;
            return (
              <button
                key={item.id}
                type="button"
                disabled={itemSold}
                onClick={() => setVariantId(item.id)}
                className={cn(
                  "rounded-full border px-4 py-2 font-heading text-[11px] uppercase tracking-[0.12em] transition-colors duration-300",
                  item.id === variant?.id
                    ? "border-czerwony bg-czerwony text-bialy"
                    : "border-czarny/10 hover:border-czarny/25",
                  "disabled:opacity-40",
                )}
              >
                {item.title}
                {itemSold ? " · wyprzedane" : ""}
              </button>
            );
          })}
        </div>
      )}
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
