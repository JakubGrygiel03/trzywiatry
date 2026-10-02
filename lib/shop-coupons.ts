import "server-only";

import { normalizeCouponCode } from "@/lib/coupon-code";
import { runtimeStore } from "@/lib/data/runtime-store";
import type { CouponRedemption, ShopCoupon } from "@/lib/types";

export { normalizeCouponCode };

function coupons() {
  if (!Array.isArray(runtimeStore.shopCoupons)) runtimeStore.shopCoupons = [];
  return runtimeStore.shopCoupons;
}

function redemptions() {
  if (!Array.isArray(runtimeStore.couponRedemptions)) runtimeStore.couponRedemptions = [];
  return runtimeStore.couponRedemptions;
}

export function getShopCoupons() {
  return [...coupons()].sort((a, b) => a.code.localeCompare(b.code));
}

export function findShopCoupon(code: string) {
  const key = normalizeCouponCode(code);
  return coupons().find((row) => row.code === key && row.enabled);
}

export function upsertShopCoupon(coupon: ShopCoupon) {
  const list = coupons();
  const index = list.findIndex((row) => row.id === coupon.id);
  if (index >= 0) list[index] = coupon;
  else list.push(coupon);
}

export function deleteShopCoupon(id: string) {
  runtimeStore.shopCoupons = coupons().filter((row) => row.id !== id);
}

function isExpired(coupon: ShopCoupon) {
  if (!coupon.expiresAt) return false;
  return coupon.expiresAt < new Date().toISOString().slice(0, 10);
}

export function resolveShopCouponDiscount(
  rawCode: string,
  goodsCents: number,
  customerEmail?: string,
): { ok: true; amountCents: number; code: string; unique: boolean } | { ok: false; message: string } | null {
  const coupon = findShopCoupon(rawCode);
  if (!coupon) return null;
  if (isExpired(coupon)) return { ok: false, message: "Ten kod rabatowy stracił ważność." };
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    return { ok: false, message: "Ten kod rabatowy został już wyczerpany." };
  }
  if (coupon.minGoodsCents && goodsCents < coupon.minGoodsCents) {
    return { ok: false, message: "Za niska wartość koszyka na ten kod." };
  }
  const email = (customerEmail ?? "").trim().toLowerCase();
  if (coupon.oncePerEmail) {
    if (!email) return { ok: false, message: "Wpisz e-mail, zanim zastosujesz ten kod." };
    const used = redemptions().some(
      (row) => row.couponId === coupon.id && row.email === email,
    );
    if (used) return { ok: false, message: "Ten kod był już użyty na ten e-mail." };
  }
  const amount =
    coupon.kind === "percent"
      ? Math.round(Math.max(0, goodsCents) * (Math.min(100, coupon.value) / 100))
      : Math.min(Math.max(0, coupon.value), Math.max(0, goodsCents));
  return { ok: true, amountCents: amount, code: coupon.code, unique: true };
}

export function reserveShopCoupon(code: string, orderId: string, customerEmail?: string) {
  const coupon = findShopCoupon(code);
  if (!coupon) return false;
  coupon.usedCount += 1;
  redemptions().push({
    couponId: coupon.id,
    email: (customerEmail ?? "").trim().toLowerCase(),
    orderId,
    at: new Date().toISOString(),
  });
  return true;
}

export function releaseShopCouponForOrder(orderId: string) {
  const list = redemptions();
  const related = list.filter((row) => row.orderId === orderId);
  if (related.length === 0) return;
  runtimeStore.couponRedemptions = list.filter((row) => row.orderId !== orderId);
  for (const row of related) {
    const coupon = coupons().find((item) => item.id === row.couponId);
    if (coupon) coupon.usedCount = Math.max(0, coupon.usedCount - 1);
  }
}
