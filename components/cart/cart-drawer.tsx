"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { CartUpsell } from "@/components/cart/cart-upsell";
import { FreeShippingMeter, GiftWrappingCard } from "@/components/cart/gift-and-shipping";
import { usePaymentsEnabled, useSiteSettings } from "@/components/cms/site-settings-provider";
import { drawerTransition, fadeTransition } from "@/lib/motion";
import { formatPLN } from "@/lib/format";
import { cartGiftWrapCost, cartSubtotal, ensureCartHydratedSync, useCartStore } from "@/store/use-cart-store";

/** Above sticky chrome (60) and cookie bar (90). */
const CART_Z = "z-[100]";

export function CartDrawer() {
  const items = useCartStore((state) => state.items);
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const hasGiftWrapping = useCartStore((state) => state.hasGiftWrapping);
  const { giftWrapPriceCents } = useSiteSettings();
  const paymentsEnabled = usePaymentsEnabled();
  const subtotal = cartSubtotal(items);
  const gift = cartGiftWrapCost(hasGiftWrapping, giftWrapPriceCents);
  const reduceMotion = useReducedMotion();

  // Hard reset drawer open flag only — cart lines hydrate sync from localStorage.
  useEffect(() => {
    ensureCartHydratedSync();
    useCartStore.setState({ isOpen: false });
  }, []);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("touch-action");
      return;
    }
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeCart();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("touch-action");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, closeCart]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            role="presentation"
            aria-hidden
            className={`fixed inset-0 ${CART_Z} bg-czarny/40`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : fadeTransition}
            onClick={closeCart}
            onPointerDown={closeCart}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Koszyk"
            className={`fixed inset-0 ${CART_Z} flex h-dvh w-full max-w-none flex-col bg-bialy shadow-[0_0_40px_rgb(1_1_1/0.08)] sm:inset-y-0 sm:left-auto sm:right-0 sm:max-w-md`}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={reduceMotion ? { duration: 0 } : drawerTransition}
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-czarny/8 px-6 py-5">
              <h2 className="font-heading text-sm uppercase tracking-[0.16em]">Koszyk</h2>
              <button
                type="button"
                onClick={closeCart}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  closeCart();
                }}
                className="relative z-[2] flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-czarny/15 bg-bialy text-czarny transition-colors hover:border-czarny/40"
                aria-label="Zamknij koszyk"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">
              {items.length === 0 ? (
                <p className="text-sm leading-relaxed text-szary">
                  Koszyk jest pusty. Wpadnij do sklepu po czarkę albo deskę.
                </p>
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
            <div className="shrink-0 space-y-3 border-t border-czarny/8 px-6 py-5">
              {items.length > 0 ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span>Suma częściowa</span>
                    <span className="font-heading">{formatPLN(subtotal + gift)}</span>
                  </div>
                  {!paymentsEnabled ? (
                    <p className="text-xs leading-relaxed text-czerwony">
                      Płatności online chwilowo niedostępne — zamówienie zapisujemy bez opłaty online.
                    </p>
                  ) : null}
                  <Button asChild className="w-full" onClick={closeCart}>
                    <Link href="/zamowienie" prefetch>
                      Do kasy
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full" onClick={closeCart}>
                    <Link href="/koszyk" prefetch>
                      Pełny koszyk
                    </Link>
                  </Button>
                </>
              ) : (
                <Button asChild className="w-full" onClick={closeCart}>
                  <Link href="/sklep" prefetch>
                    Przejdź do sklepu
                  </Link>
                </Button>
              )}
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
