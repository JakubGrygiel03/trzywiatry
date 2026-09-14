import { createHmac, timingSafeEqual } from "node:crypto";

/** Shared admin session cookie — used by login API, Server Actions, and proxy. */

export const ADMIN_COOKIE = "tw-admin";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 14;

function adminSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ??
    process.env.CUSTOMER_SESSION_SECRET ??
    process.env.ADMIN_DEMO_PASSWORD ??
    "trzywiatry-dev-admin"
  );
}

export function adminCookieOptions(request?: Request) {
  const https =
    request?.url.startsWith("https://") ||
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL === "1";

  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: https,
    maxAge: ADMIN_COOKIE_MAX_AGE,
    expires: new Date(Date.now() + ADMIN_COOKIE_MAX_AGE * 1000),
  };
}

/** Signed value so `tw-admin=1` cannot open the CMS. */
export function createAdminCookieValue() {
  const exp = String(Date.now() + ADMIN_COOKIE_MAX_AGE * 1000);
  const payload = `1.${exp}`;
  const sig = createHmac("sha256", adminSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function isAdminCookieValue(value: string | undefined) {
  if (!value) return false;
  // Legacy unsigned cookie — never honor it in production.
  if (value === "1") return process.env.NODE_ENV !== "production";

  const parts = value.split(".");
  if (parts.length !== 3) return false;
  const [flag, exp, sig] = parts;
  if (flag !== "1" || !exp || !sig) return false;
  if (Number(exp) < Date.now()) return false;

  const payload = `${flag}.${exp}`;
  const expected = createHmac("sha256", adminSecret()).update(payload).digest("hex");
  try {
    const left = Buffer.from(sig);
    const right = Buffer.from(expected);
    if (left.length !== right.length || !timingSafeEqual(left, right)) return false;
  } catch {
    return false;
  }
  return true;
}
