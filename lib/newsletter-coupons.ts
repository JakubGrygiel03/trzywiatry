import "server-only";

import { runtimeStore } from "@/lib/data/runtime-store";
import type { NewsletterCoupon } from "@/lib/types";

const PREFIX = "TW-";
/** Crockford-ish alphabet — skip I/O/0/1 so codes stay readable in email. */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_BODY_LEN = 6;
const DISCOUNT_RATE = 0.15;

export function normalizeCouponEmail(email: string) {
  return email.trim().toLowerCase();
}

export function normalizeCouponCode(code: string) {
  return code.trim().toUpperCase();
}

export function parseNewsletterCoupons(raw: unknown): NewsletterCoupon[] {
  if (!Array.isArray(raw)) return [];
  const out: NewsletterCoupon[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    if (typeof rec.id !== "string" || typeof rec.code !== "string" || typeof rec.email !== "string") {
      continue;
    }
    out.push({
      id: rec.id,
      code: normalizeCouponCode(rec.code),
      email: normalizeCouponEmail(rec.email),
      createdAt: typeof rec.createdAt === "string" ? rec.createdAt : new Date().toISOString(),
      isUsed: Boolean(rec.isUsed),
      usedAt: typeof rec.usedAt === "string" ? rec.usedAt : undefined,
      usedOrderId: typeof rec.usedOrderId === "string" ? rec.usedOrderId : undefined,
      reservedOrderId: typeof rec.reservedOrderId === "string" ? rec.reservedOrderId : undefined,
    });
  }
  return out;
}

function coupons() {
  if (!Array.isArray(runtimeStore.newsletterCoupons)) {
    runtimeStore.newsletterCoupons = [];
  }
  return runtimeStore.newsletterCoupons;
}

function mintCode() {
  const existing = coupons();
  for (let attempt = 0; attempt < 16; attempt += 1) {
    const bytes = crypto.getRandomValues(new Uint8Array(CODE_BODY_LEN));
    const body = Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join("");
    const code = `${PREFIX}${body}`;
    if (!existing.some((coupon) => coupon.code === code)) return code;
  }
  throw new Error("Could not mint a unique newsletter coupon");
}

export function findCouponByEmail(email: string) {
  const key = normalizeCouponEmail(email);
  return coupons().find((coupon) => coupon.email === key);
}

export function findCouponByCode(code: string) {
  const key = normalizeCouponCode(code);
  return coupons().find((coupon) => coupon.code === key);
}

/** One coupon per e-mail: reuse the existing row, never mint a second. */
export function issueOrReuseNewsletterCoupon(email: string) {
  const existing = findCouponByEmail(email);
  if (existing) return { coupon: existing, minted: false as const };

  const coupon: NewsletterCoupon = {
    id: crypto.randomUUID(),
    code: mintCode(),
    email: normalizeCouponEmail(email),
    createdAt: new Date().toISOString(),
    isUsed: false,
  };
  coupons().push(coupon);
  return { coupon, minted: true as const };
}

export function rememberNewsletterEmail(email: string) {
  const key = normalizeCouponEmail(email);
  if (runtimeStore.newsletter.some((item) => normalizeCouponEmail(item) === key)) {
    return false;
  }
  runtimeStore.newsletter.push(key);
  return true;
}

export type CheckoutDiscount =
  | { ok: true; amountCents: number; code?: string; unique: boolean }
  | { ok: false; message: string };

export function resolveCheckoutDiscount(
  rawCode: string | undefined,
  goodsCents: number,
  campaignPromo?: string,
): CheckoutDiscount {
  const typed = (rawCode ?? "").trim();
  if (!typed) return { ok: true, amountCents: 0, unique: false };

  const code = normalizeCouponCode(typed);
  const unique = findCouponByCode(code);
  if (unique) {
    if (unique.isUsed) {
      return { ok: false, message: "Ten kod rabatowy został już wykorzystany." };
    }
    if (unique.reservedOrderId) {
      return { ok: false, message: "Ten kod rabatowy jest już używany przy innym zamówieniu." };
    }
    return { ok: true, amountCents: Math.round(goodsCents * DISCOUNT_RATE), code: unique.code, unique: true };
  }

  const campaign = (campaignPromo ?? "").trim().toUpperCase();
  if (campaign && code === campaign) {
    return { ok: true, amountCents: Math.round(goodsCents * DISCOUNT_RATE), code: campaign, unique: false };
  }

  return { ok: false, message: "Nieprawidłowy kod rabatowy." };
}

export function reserveCouponForOrder(code: string, orderId: string) {
  const coupon = findCouponByCode(code);
  if (!coupon || coupon.isUsed || coupon.reservedOrderId) return false;
  coupon.reservedOrderId = orderId;
  return true;
}
