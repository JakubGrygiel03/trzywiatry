"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { useCartEmptyFast } from "@/hooks/use-cart-hydration";
import { Button } from "@/components/ui/button";
import { SurfaceTile, SurfaceTileBody } from "@/components/ui/surface-tile";

function EmptyCheckout() {
  return (
    <SurfaceTile>
      <SurfaceTileBody className="space-y-4">
        <p className="text-[15px] leading-relaxed text-czarny/70">
          Koszyk jest pusty — nie ma czego opłacić.
        </p>
        <Button asChild variant="secondary">
          <Link href="/sklep" prefetch>
            Przejdź do sklepu
          </Link>
        </Button>
      </SurfaceTileBody>
    </SurfaceTile>
  );
}

/** Skip heavy checkout when cart is empty; no async “Ładowanie koszyka…” wait. */
export function CheckoutGate({
  defaultEmail = "",
  defaultName = "",
  paymentsLive = false,
}: {
  defaultEmail?: string;
  defaultName?: string;
  paymentsLive?: boolean;
}) {
  const { ready, empty } = useCartEmptyFast();
  const [handingOff, setHandingOff] = useState(false);
  const onHandoff = useCallback(() => setHandingOff(true), []);

  // Before paint hydrate: tiny placeholder (usually never visible).
  if (!ready) {
    return (
      <SurfaceTile>
        <SurfaceTileBody>
          <div className="h-4 w-40 animate-pulse rounded-full bg-czarny/8" aria-hidden />
        </SurfaceTileBody>
      </SurfaceTile>
    );
  }

  // After successful checkout the cart may clear on pagehide — never flash empty UI mid-redirect.
  if (empty && !handingOff) return <EmptyCheckout />;

  if (empty && handingOff) {
    return (
      <SurfaceTile>
        <SurfaceTileBody className="sm:py-8">
          <p className="font-heading text-sm uppercase tracking-[0.14em] text-czerwony">
            Przekierowanie do płatności
          </p>
          <p className="mt-4 text-lg leading-relaxed">Chwilę… otwieramy Przelewy24.</p>
        </SurfaceTileBody>
      </SurfaceTile>
    );
  }

  return (
    <CheckoutForm
      defaultEmail={defaultEmail}
      defaultName={defaultName}
      paymentsLive={paymentsLive}
      onHandoff={onHandoff}
    />
  );
}
