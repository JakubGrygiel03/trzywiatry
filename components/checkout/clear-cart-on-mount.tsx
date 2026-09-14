"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/use-cart-store";

/** Clears the drawer after a placed order (including P24 return). */
export function ClearCartOnMount() {
  const clear = useCartStore((state) => state.clear);
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
