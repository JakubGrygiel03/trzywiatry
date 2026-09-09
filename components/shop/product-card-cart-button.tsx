"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { getProductPhoto } from "@/lib/media";
import type { Product } from "@/lib/types";
import { useCartStore } from "@/store/use-cart-store";
import { cn } from "@/lib/utils";

function firstAvailable(product: Product) {
  return product.variants.find((variant) => variant.isAvailable && variant.stockQuantity > 0);
}

export function ProductCardCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const variant = firstAvailable(product);
  const [added, setAdded] = useState(false);
  const addedTimer = useRef<number>(0);

  useEffect(() => () => window.clearTimeout(addedTimer.current), []);

  if (!variant) return null;

  return (
    <button
      type="button"
      aria-label={added ? `${product.name} jest w koszyku` : `Dodaj ${product.name} do koszyka`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        addItem({
          productId: product.id,
          variantId: variant.id,
          slug: product.slug,
          name: product.name,
          variantTitle: variant.title,
          image: getProductPhoto(product) ?? product.images[0],
          unitPriceInCents: variant.priceInCents ?? product.priceInCents,
          stockQuantity: variant.stockQuantity,
        });
        setAdded(true);
        window.clearTimeout(addedTimer.current);
        addedTimer.current = window.setTimeout(() => setAdded(false), 1400);
      }}
      className={cn(
        "absolute right-4 top-4 z-20 flex size-10 items-center justify-center rounded-full",
        "border border-czarny/8 bg-bialy/95 text-czarny shadow-[0_2px_10px_rgb(1_1_1/0.08)]",
        "transition duration-300 ease-out",
        "hover:border-czerwony hover:bg-czerwony hover:text-bialy",
        "focus-visible:opacity-100 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-czerwony",
        added && "border-czerwony bg-czerwony text-bialy",
        "[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:opacity-100",
      )}
    >
      {added ? (
        <Check className="size-[1.05rem]" strokeWidth={2} aria-hidden />
      ) : (
        <ShoppingBag className="size-[1.05rem]" strokeWidth={1.6} aria-hidden />
      )}
    </button>
  );
}
