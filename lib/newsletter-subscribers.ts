import "server-only";

import { runtimeStore } from "@/lib/data/runtime-store";
import type { NewsletterSubscriber } from "@/lib/types";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function parseNewsletterSubscribers(raw: unknown): NewsletterSubscriber[] {
  if (!Array.isArray(raw)) return [];
  const map = new Map<string, NewsletterSubscriber>();
  for (const item of raw) {
    if (typeof item === "string") {
      const email = normalizeEmail(item);
      if (!email || map.has(email)) continue;
      map.set(email, {
        email,
        createdAt: "",
        source: "legacy",
        consentMarketing: true,
      });
      continue;
    }
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    if (typeof rec.email !== "string") continue;
    const email = normalizeEmail(rec.email);
    if (!email) continue;
    map.set(email, {
      email,
      createdAt: typeof rec.createdAt === "string" ? rec.createdAt : "",
      source: typeof rec.source === "string" && rec.source ? rec.source : "newsletter",
      consentMarketing: rec.consentMarketing !== false,
      consentAt: typeof rec.consentAt === "string" ? rec.consentAt : undefined,
    });
  }
  return [...map.values()];
}

function subscribers(): NewsletterSubscriber[] {
  const parsed = parseNewsletterSubscribers(runtimeStore.newsletter);
  runtimeStore.newsletter = parsed;
  return runtimeStore.newsletter;
}

export function listNewsletterSubscribers(): NewsletterSubscriber[] {
  const rows = subscribers().map((row) => {
    if (row.createdAt) return row;
    const coupon = runtimeStore.newsletterCoupons.find((item) => item.email === row.email);
    return coupon ? { ...row, createdAt: coupon.createdAt } : row;
  });
  return rows.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}

/** Adds the address to the marketing list. Returns false when it was already there. */
export function rememberNewsletterEmail(email: string, source = "footer_discount_15") {
  const key = normalizeEmail(email);
  const list = subscribers();
  if (list.some((item) => item.email === key)) return false;
  const now = new Date().toISOString();
  list.push({
    email: key,
    createdAt: now,
    source,
    consentMarketing: true,
    consentAt: now,
  });
  return true;
}

/** Removes the address from the marketing list. Coupon history stays. */
export function removeNewsletterEmail(email: string) {
  const key = normalizeEmail(email);
  const list = subscribers();
  const next = list.filter((row) => row.email !== key);
  if (next.length === list.length) return false;
  runtimeStore.newsletter = next;
  return true;
}

export function listConsentingNewsletterSubscribers() {
  return listNewsletterSubscribers().filter((row) => row.consentMarketing);
}

export function updateNewsletterSubscriber(currentEmail: string, nextEmail: string, consentMarketing: boolean) {
  const from = normalizeEmail(currentEmail);
  const to = normalizeEmail(nextEmail);
  const list = subscribers();
  const row = list.find((item) => item.email === from);
  if (!row) return { ok: false as const, error: "missing" };
  if (to !== from && list.some((item) => item.email === to)) {
    return { ok: false as const, error: "taken" };
  }
  row.email = to;
  row.consentMarketing = consentMarketing;
  if (consentMarketing) {
    row.consentAt = row.consentAt ?? new Date().toISOString();
  }
  return { ok: true as const, from, to };
}

export function mergeNewsletterEmails(incoming: unknown) {
  const list = subscribers();
  const map = new Map(list.map((row) => [row.email, row]));
  for (const next of parseNewsletterSubscribers(incoming)) {
    const prev = map.get(next.email);
    if (!prev) {
      list.push(next);
      map.set(next.email, next);
      continue;
    }
    if (!prev.createdAt && next.createdAt) prev.createdAt = next.createdAt;
    if (!prev.consentAt && next.consentAt) prev.consentAt = next.consentAt;
    if (prev.source === "legacy" && next.source !== "legacy") prev.source = next.source;
  }
}
