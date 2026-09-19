"use client";

import { useLayoutEffect, useState } from "react";
import { ensureCartHydratedSync, useCartStore } from "@/store/use-cart-store";

/** True after sync localStorage hydrate (layout effect — before paint). */
export function useCartHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useLayoutEffect(() => {
    ensureCartHydratedSync();
    setHydrated(true);
  }, []);

  return hydrated;
}

/**
 * Empty / ready flags without waiting on async zustand persist.
 * Sync hydrate in layout effect → no multi-second “Ładowanie koszyka…”.
 */
export function useCartEmptyFast(): { ready: boolean; empty: boolean } {
  const hydrated = useCartHydrated();
  const items = useCartStore((state) => state.items);

  if (!hydrated) return { ready: false, empty: false };
  return { ready: true, empty: items.length === 0 };
}
