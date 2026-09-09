"use client";

import { UpsellRail } from "@/components/shop/upsell-rail";
import { getCartUpsells } from "@/lib/data/recommendations";
import { useCartStore } from "@/store/use-cart-store";

export function CartUpsell({
  title = "Dopełnij zamówienie",
  limit = 3,
  compact = false,
}: {
  title?: string;
  limit?: number;
  compact?: boolean;
}) {
  const items = useCartStore((state) => state.items);
  const productIds = items.map((item) => item.productId);
  if (productIds.length === 0) return null;

  const suggestions = getCartUpsells(productIds, limit);
  return <UpsellRail suggestions={suggestions} title={title} compact={compact} />;
}
