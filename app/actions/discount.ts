"use server";

import { ensureAtelierHydrated, saveAtelierSnapshot } from "@/lib/data/atelier-persist";
import { getRuntimeSettings } from "@/lib/data/runtime-store";
import { resolveCheckoutDiscount } from "@/lib/newsletter-coupons";

export type DiscountPreview =
  | { ok: true; code: string; amountCents: number; unique: boolean }
  | { ok: false; message: string };

/** Checks a code against the current cart total — does not reserve or consume it. */
export async function previewDiscountCode(
  rawCode: string,
  goodsCents: number,
  customerEmail = "",
): Promise<DiscountPreview> {
  const typed = rawCode.trim();
  if (!typed) {
    return { ok: false, message: "Wpisz kod rabatowy z maila." };
  }

  await ensureAtelierHydrated({ force: true });
  const result = resolveCheckoutDiscount(typed, goodsCents, getRuntimeSettings().promoCode, customerEmail);
  if (!result.ok) return result;
  if (!result.code || result.amountCents <= 0) {
    return { ok: false, message: "Ten kod nie obniża tej kwoty." };
  }

  if (result.unique) await saveAtelierSnapshot();

  return {
    ok: true,
    code: result.code,
    amountCents: result.amountCents,
    unique: result.unique,
  };
}
