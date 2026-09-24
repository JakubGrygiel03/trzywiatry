"use server";

import { getAllProducts } from "@/lib/data/queries";
import { ensureAtelierHydrated } from "@/lib/data/atelier-persist";

export async function verifyCartStock(lines: { variantId: string; quantity: number }[]) {
  await ensureAtelierHydrated({ force: true });
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
