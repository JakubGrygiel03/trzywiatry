"use client";

import { ShoppingBag } from "lucide-react";
import { cartCount, useCartStore } from "@/store/use-cart-store";

export function CartTrigger() {
  const items = useCartStore((state) => state.items);
  const openCart = useCartStore((state) => state.openCart);
  const count = cartCount(items);

  return (
    <button
      type="button"
      onClick={openCart}
      className="relative flex h-9 w-9 items-center justify-center rounded-full border border-czarny/10 transition-colors hover:border-czerwony hover:text-czerwony md:h-11 md:w-11"
      aria-label={`Koszyk, ${count} produktów`}
    >
      <ShoppingBag className="h-4 w-4 md:h-5 md:w-5" />
      {count > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-czerwony px-1 font-heading text-[10px] text-bialy md:h-6 md:min-w-6 md:text-[11px]">
          {count}
        </span>
      ) : null}
    </button>
  );
}
