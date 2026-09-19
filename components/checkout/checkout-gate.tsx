"use client";

import Link from "next/link";
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

  if (empty) return <EmptyCheckout />;

  return (
    <CheckoutForm
      defaultEmail={defaultEmail}
      defaultName={defaultName}
      paymentsLive={paymentsLive}
    />
  );
}
