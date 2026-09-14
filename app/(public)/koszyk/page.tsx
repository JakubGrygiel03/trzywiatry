"use client";

import Link from "next/link";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { CartStockNotice } from "@/components/cart/cart-stock-notice";
import { CartUpsell } from "@/components/cart/cart-upsell";
import { FreeShippingMeter, GiftWrappingCard } from "@/components/cart/gift-and-shipping";
import { useSiteSettings } from "@/components/cms/site-settings-provider";
import { SurfacePageIntro } from "@/components/layout/surface-page";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/badge";
import { SurfaceTile, SurfaceTileBody, SurfaceTileHeader } from "@/components/ui/surface-tile";
import { formatPLN } from "@/lib/format";
import { cartGiftWrapCost, cartSubtotal, useCartStore } from "@/store/use-cart-store";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const hasGiftWrapping = useCartStore((state) => state.hasGiftWrapping);
  const { giftWrapPriceCents } = useSiteSettings();
  const subtotal = cartSubtotal(items);
  const gift = cartGiftWrapCost(hasGiftWrapping, giftWrapPriceCents);

  return (
    <div className="py-8 md:py-10">
      <Container className="space-y-4 md:space-y-5">
        <SurfacePageIntro eyebrow="Koszyk" title="Twoje naczynia" />
        {items.length === 0 ? (
          <SurfaceTile>
            <SurfaceTileBody className="space-y-4">
              <p className="text-[15px] text-czarny/60">Koszyk jest pusty.</p>
              <Button asChild variant="secondary">
                <Link href="/sklep">Przejdź do sklepu</Link>
              </Button>
            </SurfaceTileBody>
          </SurfaceTile>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:gap-5">
            <SurfaceTile>
              <SurfaceTileHeader eyebrow="Zawartość" title="Produkty" />
              <SurfaceTileBody className="space-y-6">
                <CartStockNotice />
                {items.map((item) => (
                  <CartLineItem key={item.variantId} item={item} />
                ))}
                <GiftWrappingCard />
                <CartUpsell title="Dopełnij zamówienie" limit={4} />
              </SurfaceTileBody>
            </SurfaceTile>
            <SurfaceTile className="h-fit">
              <SurfaceTileHeader eyebrow="Podsumowanie" title="Do zapłaty" />
              <SurfaceTileBody className="space-y-4">
                <FreeShippingMeter subtotal={subtotal} />
                <div className="flex justify-between text-[15px]">
                  <span>Razem</span>
                  <span className="font-heading">{formatPLN(subtotal + gift)}</span>
                </div>
                <Button asChild className="w-full">
                  <Link href="/zamowienie">Przejdź do kasy</Link>
                </Button>
              </SurfaceTileBody>
            </SurfaceTile>
          </div>
        )}
      </Container>
    </div>
  );
}
