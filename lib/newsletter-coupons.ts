import "server-only";

import { isMintedNewsletterCode, normalizeCouponCode } from "@/lib/coupon-code";
import { discountAmountFromGoods } from "@/lib/discount";
import { isSignedNewsletterCode, mintSignedNewsletterCode } from "@/lib/newsletter-code-sign";
import { runtimeStore } from "@/lib/data/runtime-store";
import type { NewsletterCoupon } from "@/lib/types";

export { normalizeCouponCode };

const PREFIX = "TW-";
/** Crockford-ish alphabet — skip I/O/0/1 so codes stay readable in email. */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_BODY_LEN = 6;

export function normalizeCouponEmail(email: string) {
  return email.trim().toLowerCase();
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
      welcomeSentAt: typeof rec.welcomeSentAt === "string" ? rec.welcomeSentAt : undefined,
      welcomeSendFailed: rec.welcomeSendFailed === true ? true : undefined,
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
  const taken = (code: string) => coupons().some((coupon) => coupon.code === code);
  const signed = mintSignedNewsletterCode(taken);
  if (signed) return signed;
  for (let attempt = 0; attempt < 16; attempt += 1) {
    const bytes = crypto.getRandomValues(new Uint8Array(CODE_BODY_LEN));
    const body = Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join("");
    const code = `${PREFIX}${body}`;
    if (!taken(code)) return code;
  }
  throw new Error("Could not mint a unique newsletter coupon");
}

export function findCouponByEmail(email: string) {
  const key = normalizeCouponEmail(email);
  return coupons().find((coupon) => coupon.email === key);
}

export function findCouponByCode(code: string) {
  const key = normalizeCouponCode(code);
  const compact = key.replace(/-/g, "");
  return coupons().find((coupon) => coupon.code === key || coupon.code.replace(/-/g, "") === compact);
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

/** Union remote + memory so a warm serverless instance cannot wipe minted codes. */
export function mergeNewsletterSnapshot(incoming: { newsletter?: string[]; newsletterCoupons?: unknown }) {
  const byCode = new Map(coupons().map((coupon) => [coupon.code, coupon]));
  for (const next of parseNewsletterCoupons(incoming.newsletterCoupons)) {
    const prev = byCode.get(next.code);
    if (!prev) {
      coupons().push(next);
      byCode.set(next.code, next);
      continue;
    }
    if (next.isUsed) {
      prev.isUsed = true;
      prev.usedAt = next.usedAt ?? prev.usedAt;
      prev.usedOrderId = next.usedOrderId ?? prev.usedOrderId;
      prev.reservedOrderId = undefined;
    } else if (next.reservedOrderId && !prev.isUsed && !prev.reservedOrderId) {
      prev.reservedOrderId = next.reservedOrderId;
    }
    if (next.welcomeSentAt && !prev.welcomeSentAt) prev.welcomeSentAt = next.welcomeSentAt;
  }

  const emails = new Set(runtimeStore.newsletter.map(normalizeCouponEmail));
  for (const email of incoming.newsletter ?? []) {
    const key = normalizeCouponEmail(email);
    if (key) emails.add(key);
  }
  runtimeStore.newsletter = [...emails];
}

/**
 * Recreate a coupon row only when the code carries a valid HMAC.
 * Random TW-XXXXXX guesses fail the checksum and never get −15%.
 */
export function materializeSignedCoupon(rawCode: string, email?: string) {
  const code = normalizeCouponCode(rawCode);
  if (!isMintedNewsletterCode(code) || !isSignedNewsletterCode(code)) return null;
  const existing = findCouponByCode(code);
  if (existing) {
    if (email && !existing.email) existing.email = normalizeCouponEmail(email);
    return existing;
  }
  const coupon: NewsletterCoupon = {
    id: crypto.randomUUID(),
    code,
    email: email ? normalizeCouponEmail(email) : "",
    createdAt: new Date().toISOString(),
    isUsed: false,
  };
  coupons().push(coupon);
  if (email) rememberNewsletterEmail(email);
  return coupon;
}

/** One welcome e-mail per address. Retry only when the previous send failed. */
export function shouldSendNewsletterWelcome(coupon: NewsletterCoupon, minted: boolean) {
  if (coupon.welcomeSentAt) return false;
  if (minted) return true;
  return Boolean(coupon.welcomeSendFailed);
}

export function markNewsletterWelcomeSent(email: string) {
  const coupon = findCouponByEmail(email);
  if (!coupon) return;
  coupon.welcomeSentAt = new Date().toISOString();
  coupon.welcomeSendFailed = undefined;
}

export function markNewsletterWelcomeFailed(email: string) {
  const coupon = findCouponByEmail(email);
  if (!coupon) return;
  coupon.welcomeSentAt = undefined;
  coupon.welcomeSendFailed = true;
}

function orderById(id: string) {
  return runtimeStore.orders.find((order) => order.id === id);
}

/** Test checkouts and purged orders must not keep a mailed code locked forever. */
function unlockIfStale(coupon: NewsletterCoupon, customerEmail?: string) {
  if (coupon.isUsed && coupon.usedOrderId && !orderById(coupon.usedOrderId)) {
    coupon.isUsed = false;
    coupon.usedAt = undefined;
    coupon.usedOrderId = undefined;
  }
  if (!coupon.reservedOrderId) return;
  const reserved = orderById(coupon.reservedOrderId);
  if (!reserved || reserved.status === "cancelled") {
    coupon.reservedOrderId = undefined;
    return;
  }
  if (reserved.status !== "pending") return;
  const samePerson =
    Boolean(customerEmail) &&
    normalizeCouponEmail(reserved.customerEmail) === normalizeCouponEmail(customerEmail ?? "");
  if (samePerson) coupon.reservedOrderId = undefined;
}

export type CheckoutDiscount =
  | { ok: true; amountCents: number; code?: string; unique: boolean }
  | { ok: false; message: string };

export function resolveCheckoutDiscount(
  rawCode: string | undefined,
  goodsCents: number,
  campaignPromo?: string,
  customerEmail?: string,
): CheckoutDiscount {
  const typed = (rawCode ?? "").trim();
  if (!typed) return { ok: true, amountCents: 0, unique: false };

  const code = normalizeCouponCode(typed);
  const unique = findCouponByCode(code) ?? materializeSignedCoupon(code, customerEmail);
  if (unique) {
    unlockIfStale(unique, customerEmail);
    if (unique.isUsed) {
      return { ok: false, message: "Ten kod rabatowy został już wykorzystany." };
    }
    if (unique.reservedOrderId) {
      return { ok: false, message: "Ten kod rabatowy jest już używany przy innym zamówieniu." };
    }
    return { ok: true, amountCents: discountAmountFromGoods(goodsCents), code: unique.code, unique: true };
  }

  const campaign = (campaignPromo ?? "").trim().toUpperCase();
  if (campaign && code === campaign) {
    return { ok: true, amountCents: discountAmountFromGoods(goodsCents), code: campaign, unique: false };
  }

  const owned = customerEmail ? findCouponByEmail(customerEmail) : undefined;
  if (owned) {
    return {
      ok: false,
      message: "Ten e-mail ma już kod w skrzynce. Wpisz go dokładnie tak, jak w mailu z pracowni.",
    };
  }

  return {
    ok: false,
    message:
      "Nie rozpoznajemy tego kodu. Wielokrotne „Zastosuj” go nie zużywa — sprawdź pisownię z maila.",
  };
}

export function reserveCouponForOrder(code: string, orderId: string, customerEmail?: string) {
  const coupon = findCouponByCode(code);
  if (!coupon) return false;
  unlockIfStale(coupon, customerEmail);
  if (coupon.isUsed || coupon.reservedOrderId) return false;
  coupon.reservedOrderId = orderId;
  return true;
}
