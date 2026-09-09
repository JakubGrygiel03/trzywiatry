"use client";

import Link from "next/link";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { CartUpsell } from "@/components/cart/cart-upsell";
import { FreeShippingMeter, GiftWrappingCard } from "@/components/cart/gift-and-shipping";
import { Button } from "@/components/ui/button";
import { Container, SectionHeading } from "@/components/ui/badge";
import { formatPLN } from "@/lib/format";
import { cartGiftWrapCost, cartSubtotal, useCartStore } from "@/store/use-cart-store";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const hasGiftWrapping = useCartStore((state) => state.hasGiftWrapping);
  const subtotal = cartSubtotal(items);
  const gift = cartGiftWrapCost(hasGiftWrapping);

  return (
    <div className="py-14 md:py-20">
      <Container className="space-y-12">
        <SectionHeading eyebrow="Koszyk" title="Twoje naczynia" />
        {items.length === 0 ? (
          <p className="text-sm text-szary">Koszyk jest pusty.</p>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              {items.map((item) => (
                <CartLineItem key={item.variantId} item={item} />
              ))}
              <GiftWrappingCard />
              <CartUpsell title="Dopełnij zamówienie" limit={4} />
            </div>
            <aside className="h-fit space-y-4 rounded-[28px] bg-krem p-6">
              <FreeShippingMeter subtotal={subtotal} />
              <div className="flex justify-between">
                <span>Razem</span>
                <span className="font-heading">{formatPLN(subtotal + gift)}</span>
              </div>
              <Button asChild className="w-full">
                <Link href="/zamowienie">Przejdź do kasy</Link>
              </Button>
            </aside>
          </div>
        )}
      </Container>
    </div>
  );
}
