"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { CartUpsell } from "@/components/cart/cart-upsell";
import { FreeShippingMeter, GiftWrappingCard } from "@/components/cart/gift-and-shipping";
import { AtelierFrame } from "@/components/visual/atelier-frame";
import { drawerTransition, fadeTransition } from "@/lib/motion";
import { formatPLN } from "@/lib/format";
import { cartGiftWrapCost, cartSubtotal, useCartStore } from "@/store/use-cart-store";

export function CartDrawer() {
  const items = useCartStore((state) => state.items);
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const hasGiftWrapping = useCartStore((state) => state.hasGiftWrapping);
  const subtotal = cartSubtotal(items);
  const gift = cartGiftWrapCost(hasGiftWrapping);
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.button
            type="button"
            aria-label="Zamknij koszyk"
            className="fixed inset-0 z-50 bg-czarny/25"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : fadeTransition}
            onClick={closeCart}
          />
          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-bialy shadow-[0_0_40px_rgb(1_1_1/0.08)]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={reduceMotion ? { duration: 0 } : drawerTransition}
          >
            <div className="flex items-center justify-between border-b border-czarny/8 px-6 py-5">
              <h2 className="font-heading text-sm uppercase tracking-[0.16em]">Koszyk</h2>
              <button
                type="button"
                onClick={closeCart}
                className="text-sm text-szary transition-colors hover:text-czarny"
              >
                Zamknij
              </button>
            </div>
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              {items.length === 0 ? (
                <div className="space-y-4">
                  <AtelierFrame kind="cup" glaze="mist" className="aspect-square min-h-[12rem]" />
                  <p className="text-sm leading-relaxed text-szary">
                    Koszyk jest pusty. Wpadnij do sklepu po czarkę albo deskę.
                  </p>
                </div>
              ) : (
                items.map((item) => <CartLineItem key={item.variantId} item={item} />)
              )}
              {items.length > 0 ? (
                <>
                  <FreeShippingMeter subtotal={subtotal} />
                  <GiftWrappingCard />
                  <CartUpsell title="Dobierz jeszcze" limit={2} compact />
                </>
              ) : null}
            </div>
            <div className="space-y-3 border-t border-czarny/8 px-6 py-5">
              <div className="flex justify-between text-sm">
                <span>Suma częściowa</span>
                <span className="font-heading">{formatPLN(subtotal + gift)}</span>
              </div>
              <Button asChild className="w-full" onClick={closeCart}>
                <Link href="/zamowienie">Do kasy</Link>
              </Button>
              <Button asChild variant="outline" className="w-full" onClick={closeCart}>
                <Link href="/koszyk">Pełny koszyk</Link>
              </Button>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
