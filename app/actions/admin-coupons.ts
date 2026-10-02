"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertAdminSession } from "@/lib/admin-guard";
import { withCmsTick } from "@/lib/cms-redirect";
import { ensureAtelierHydrated, flushAtelierSave } from "@/lib/data/atelier-persist";
import { normalizeCouponCode } from "@/lib/coupon-code";
import { deleteShopCoupon, getShopCoupons, upsertShopCoupon } from "@/lib/shop-coupons";

const couponSchema = z.object({
  id: z.string().optional(),
  code: z
    .string()
    .trim()
    .min(3, "Kod min. 3 znaki.")
    .max(24)
    .transform((value) => normalizeCouponCode(value))
    .refine((value) => /^[A-Z0-9-]+$/.test(value), "Kod: litery, cyfry i myślnik."),
  kind: z.enum(["percent", "fixed"]),
  value: z.coerce.number().positive("Podaj wartość rabatu."),
  expiresAt: z.string().optional(),
  maxUses: z.coerce.number().int().positive().optional(),
  oncePerEmail: z.boolean(),
  enabled: z.boolean(),
  minGoodsZl: z.coerce.number().min(0).optional(),
});

function fail(message: string): never {
  redirect(`/admin/kupony?blad=${encodeURIComponent(message)}`);
}

export async function saveShopCoupon(formData: FormData) {
  await assertAdminSession();
  await ensureAtelierHydrated({ force: true });
  const parsed = couponSchema.safeParse({
    id: String(formData.get("id") ?? "").trim() || undefined,
    code: formData.get("code"),
    kind: formData.get("kind"),
    value: formData.get("value"),
    expiresAt: String(formData.get("expiresAt") ?? "").trim() || undefined,
    maxUses: String(formData.get("maxUses") ?? "").trim() || undefined,
    oncePerEmail: formData.getAll("oncePerEmail").includes("true"),
    enabled: formData.getAll("enabled").includes("true"),
    minGoodsZl: String(formData.get("minGoodsZl") ?? "").trim() || undefined,
  });
  if (!parsed.success) fail(parsed.error.issues[0]?.message ?? "Sprawdź kupon.");
  const data = parsed.data;
  if (data.kind === "percent" && data.value > 80) fail("Rabat procentowy max 80%.");
  const others = getShopCoupons().filter((row) => row.id !== data.id);
  if (others.some((row) => row.code === data.code)) fail("Taki kod już istnieje.");
  const existing = getShopCoupons().find((row) => row.id === data.id);
  upsertShopCoupon({
    id: data.id ?? crypto.randomUUID(),
    code: data.code,
    kind: data.kind,
    value: data.kind === "percent" ? Math.round(data.value) : Math.round(data.value * 100),
    expiresAt: data.expiresAt,
    maxUses: data.maxUses,
    usedCount: existing?.usedCount ?? 0,
    oncePerEmail: data.oncePerEmail,
    enabled: data.enabled,
    minGoodsCents: data.minGoodsZl ? Math.round(data.minGoodsZl * 100) : undefined,
  });
  await flushAtelierSave();
  revalidatePath("/admin/kupony");
  revalidatePath("/zamowienie");
  redirect(withCmsTick("/admin/kupony?zapisano=1"));
}

export async function removeShopCoupon(formData: FormData) {
  await assertAdminSession();
  await ensureAtelierHydrated({ force: true });
  const id = String(formData.get("id") ?? "").trim();
  if (!id) fail("Brak kuponu.");
  deleteShopCoupon(id);
  await flushAtelierSave();
  revalidatePath("/admin/kupony");
  redirect(withCmsTick("/admin/kupony?usunieto=1"));
}
