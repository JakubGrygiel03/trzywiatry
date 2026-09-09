"use client";

import Image from "next/image";
import Link from "next/link";
import { AtelierFrame } from "@/components/visual/atelier-frame";
import { formatPLN } from "@/lib/format";
import { getProductPhoto } from "@/lib/media";
import type { UpsellSuggestion } from "@/lib/data/recommendations";
import { useCartStore } from "@/store/use-cart-store";

function firstAvailable(product: UpsellSuggestion["product"]) {
  return product.variants.find((v) => v.isAvailable && v.stockQuantity > 0);
}

export function UpsellRail({
  suggestions,
  title = "Dobierz do siebie",
  compact = false,
}: {
  suggestions: UpsellSuggestion[];
  title?: string;
  compact?: boolean;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
  const cartIds = cartItems.map((item) => item.productId);

  const visible = suggestions.filter((item) => !cartIds.includes(item.product.id));
  if (visible.length === 0) return null;

  return (
    <section className="space-y-4 border-t border-czarny/8 pt-10 md:pt-12">
      <div className="space-y-1">
        <h2 className="font-heading text-sm uppercase tracking-[0.14em]">{title}</h2>
        <p className="text-xs text-szary">Pary i zestawy, które naturalnie uzupełniają wybór.</p>
      </div>
      <ul className={compact ? "space-y-3" : "grid gap-3 sm:grid-cols-2"}>
        {visible.map(({ product, reason }) => {
          const variant = firstAvailable(product);
          const price = variant?.priceInCents ?? product.priceInCents;
          const photo = getProductPhoto(product);
          const soldOut = !variant;

          return (
            <li
              key={product.id}
              className="flex gap-3 rounded-2xl border border-czarny/8 bg-bialy p-3"
            >
              <Link
                href={`/sklep/${product.slug}`}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-krem"
              >
                {photo ? (
                  <Image src={photo} alt={product.name} fill className="object-cover" sizes="80px" />
                ) : (
                  <AtelierFrame product={product} className="h-20 min-h-20 w-20 rounded-xl" />
                )}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                <div>
                  <p className="font-heading text-[10px] uppercase tracking-[0.14em] text-czerwony">
                    {reason}
                  </p>
                  <Link
                    href={`/sklep/${product.slug}`}
                    className="mt-0.5 block truncate text-sm font-medium leading-snug"
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs text-szary">{formatPLN(price)}</p>
                </div>
                <button
                  type="button"
                  disabled={soldOut}
                  onClick={() => {
                    if (!variant) return;
                    addItem({
                      productId: product.id,
                      variantId: variant.id,
                      slug: product.slug,
                      name: product.name,
                      variantTitle: variant.title,
                      image: getProductPhoto(product) ?? product.images[0],
                      unitPriceInCents: price,
                      stockQuantity: variant.stockQuantity,
                    });
                  }}
                  className="self-start font-heading text-[10px] uppercase tracking-[0.14em] text-czerwony underline-offset-4 hover:underline disabled:opacity-40"
                >
                  {soldOut ? "Wyprzedane" : "Dodaj do pary"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
