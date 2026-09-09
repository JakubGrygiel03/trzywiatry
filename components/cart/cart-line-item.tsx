"use client";

import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import { AtelierFrame } from "@/components/visual/atelier-frame";
import { getProductById } from "@/lib/data/queries";
import { formatPLN } from "@/lib/format";
import { getProductPhoto } from "@/lib/media";
import type { CartItem } from "@/lib/types";
import { useCartStore } from "@/store/use-cart-store";

export function CartLineItem({ item }: { item: CartItem }) {
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const product = getProductById(item.productId);
  const photo = getProductPhoto(product ?? { images: [] }, item.image);

  return (
    <div className="flex gap-3">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-krem">
        {photo ? (
          <Image src={photo} alt={item.name} fill className="object-cover" sizes="80px" />
        ) : product ? (
          <AtelierFrame product={product} className="h-20 min-h-20 w-20 rounded-2xl" />
        ) : (
          <div className="h-full w-full bg-krem" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="truncate text-sm">{item.name}</p>
            <p className="text-xs text-szary">{item.variantTitle}</p>
          </div>
          <button type="button" onClick={() => removeItem(item.variantId)} aria-label="Usuń">
            <X className="h-4 w-4 text-szary" />
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-full border border-czarny/10 px-2 py-1">
            <button type="button" onClick={() => setQuantity(item.variantId, item.quantity - 1)}>
              <Minus className="h-3 w-3" />
            </button>
            <span className="font-heading text-xs">{item.quantity}</span>
            <button
              type="button"
              disabled={item.quantity >= item.stockQuantity}
              onClick={() => setQuantity(item.variantId, item.quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <p className="font-heading text-xs">{formatPLN(item.unitPriceInCents * item.quantity)}</p>
        </div>
      </div>
    </div>
  );
}
