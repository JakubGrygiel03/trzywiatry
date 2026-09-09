"use server";

import { getAllProducts } from "@/lib/data/queries";

export async function verifyCartStock(lines: { variantId: string; quantity: number }[]) {
  const catalog = getAllProducts();
  for (const line of lines) {
    const product = catalog.find((item) => item.variants.some((variant) => variant.id === line.variantId));
    const variant = product?.variants.find((item) => item.id === line.variantId);
    if (!variant || !variant.isAvailable || variant.stockQuantity < line.quantity) {
      return { ok: false as const, message: `Brak stanu: ${product?.name ?? line.variantId}` };
    }
  }
  return { ok: true as const };
}
