import { createHmac, timingSafeEqual } from "node:crypto";

export const CUSTOMER_COOKIE = "tw-customer";

function sessionSecret() {
  return process.env.CUSTOMER_SESSION_SECRET ?? process.env.ADMIN_DEMO_PASSWORD ?? "trzywiatry-dev-session";
}

/**
 * Signed cookie: id.exp.sig
 * Do not put email in the cookie — addresses contain `.` and break `.`-delimited parsing.
 */
export function createCustomerSessionValue(user: { id: string; email: string }) {
  void user.email;
  const exp = String(Date.now() + 1000 * 60 * 60 * 24 * 30);
  const payload = `${user.id}.${exp}`;
  const sig = createHmac("sha256", sessionSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

/** Edge-safe check — signature + expiry only (no filesystem). */
export function verifyCustomerSessionCookie(raw: string | undefined) {
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length !== 3) return null;
  const [id, exp, sig] = parts;
  if (!id || !exp || !sig) return null;
  if (!/^u-[a-f0-9]+$/i.test(id)) return null;
  const payload = `${id}.${exp}`;
  const expected = createHmac("sha256", sessionSecret()).update(payload).digest("hex");
  try {
    const left = Buffer.from(sig);
    const right = Buffer.from(expected);
    if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  } catch {
    return null;
  }
  if (Number(exp) < Date.now()) return null;
  return { id };
}
