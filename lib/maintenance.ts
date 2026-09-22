import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getRuntimeSettings } from "@/lib/data/runtime-store";

export const PREVIEW_COOKIE = "tw-preview";
export const PREVIEW_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export function createPreviewToken() {
  return randomBytes(24).toString("hex");
}

function previewSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ??
    process.env.CUSTOMER_SESSION_SECRET ??
    "trzywiatry-dev-preview"
  );
}

export function previewCookieOptions(request?: Request) {
  const https =
    request?.url.startsWith("https://") ||
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL === "1";

  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: https,
    maxAge: PREVIEW_COOKIE_MAX_AGE,
    expires: new Date(Date.now() + PREVIEW_COOKIE_MAX_AGE * 1000),
  };
}

/** Bind cookie to the current token so rotation immediately revokes old links. */
export function createPreviewCookieValue(token: string) {
  const sig = createHmac("sha256", previewSecret()).update(token).digest("hex");
  return `${token}.${sig}`;
}

export function previewCookieMatches(value: string | undefined, token: string) {
  if (!value || !token) return false;
  const dot = value.lastIndexOf(".");
  if (dot <= 0) return false;
  const raw = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  if (raw !== token) return false;
  const expected = createHmac("sha256", previewSecret()).update(token).digest("hex");
  try {
    const left = Buffer.from(sig);
    const right = Buffer.from(expected);
    return left.length === right.length && timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

export async function canBypassMaintenance() {
  const store = await cookies();
  const token = getRuntimeSettings().maintenancePreviewToken;
  return previewCookieMatches(store.get(PREVIEW_COOKIE)?.value, token);
}

export function isStorefrontLocked(maintenanceMode: boolean, bypass: boolean) {
  return maintenanceMode && !bypass;
}

/** Call after atelier hydrate. Null = storefront is open for this browser. */
export async function storefrontClosedMessage() {
  if (!getRuntimeSettings().maintenanceMode) return null;
  if (await canBypassMaintenance()) return null;
  return "Sklep jest chwilowo zamknięty. Spróbuj ponownie później.";
}
