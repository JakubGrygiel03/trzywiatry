"use client";

import { useEffect, useState } from "react";
import { verifyCartStock } from "@/app/actions/cart";
import { useCartStore } from "@/store/use-cart-store";

/** Warns before checkout if a variant ran out after it was added. */
export function CartStockNotice() {
  const items = useCartStore((state) => state.items);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      setMessage(null);
      return;
    }
    let cancelled = false;
    void verifyCartStock(items.map((item) => ({ variantId: item.variantId, quantity: item.quantity }))).then(
      (result) => {
        if (!cancelled) setMessage(result.ok ? null : result.message);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [items]);

  if (!message) return null;
  return <p className="text-sm text-czerwony">{message} Zmień ilość albo wróć do sklepu.</p>;
}
