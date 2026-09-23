"use client";

import { useLayoutEffect } from "react";
import { endP24Handoff } from "@/lib/p24-handoff";
import { useCartStore } from "@/store/use-cart-store";

/** Clears the drawer after a placed order (including P24 return). */
export function ClearCartOnMount() {
  const clear = useCartStore((state) => state.clear);
  useLayoutEffect(() => {
    endP24Handoff();
    clear();
  }, [clear]);
  return null;
}
