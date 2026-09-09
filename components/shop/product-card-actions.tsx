"use client";

import { Heart, ShoppingBag } from "lucide-react";
import { getProductPhoto } from "@/lib/media";
import type { Product } from "@/lib/types";
import { useCartStore } from "@/store/use-cart-store";
import { useWishlistStore } from "@/store/use-wishlist-store";

const actionClass =
  "flex size-9 items-center justify-center bg-bialy text-czarny shadow-sm transition-colors duration-200 hover:text-czerwony focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-czerwony";

function firstAvailable(product: Product) {
  return product.variants.find((variant) => variant.isAvailable && variant.stockQuantity > 0);
}

export function ProductCardActions({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const toggleWish = useWishlistStore((state) => state.toggle);
  const wished = useWishlistStore((state) => state.ids.includes(product.id));
  const variant = firstAvailable(product);

  return (
    <div className="product-hover-actions absolute right-3 top-3 z-20 flex flex-col gap-1.5">
      <button
        type="button"
        aria-pressed={wished}
        aria-label={wished ? `Usuń ${product.name} z ulubionych` : `Dodaj ${product.name} do ulubionych`}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          toggleWish(product.id);
        }}
        className={wished ? `${actionClass} text-czerwony` : actionClass}
      >
        <Heart
          className="size-4"
          strokeWidth={1.5}
          fill={wished ? "currentColor" : "none"}
          aria-hidden
        />
      </button>
      {variant ? (
        <button
          type="button"
          aria-label={`Dodaj ${product.name} do koszyka`}
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
          }}
          className={actionClass}
        >
          <ShoppingBag className="size-4" strokeWidth={1.5} aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
