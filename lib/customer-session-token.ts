import { createHmac, timingSafeEqual } from "node:crypto";

export const CUSTOMER_COOKIE = "tw-customer";

function sessionSecret() {
  return process.env.CUSTOMER_SESSION_SECRET ?? process.env.ADMIN_DEMO_PASSWORD ?? "trzywiatry-dev-session";
}

/** Compact signed cookie value: id.email.exp.sig */
export function createCustomerSessionValue(user: { id: string; email: string }) {
  const exp = String(Date.now() + 1000 * 60 * 60 * 24 * 30);
  const payload = `${user.id}.${encodeURIComponent(user.email)}.${exp}`;
  const sig = createHmac("sha256", sessionSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

/** Edge-safe check — signature + expiry only (no filesystem). */
export function verifyCustomerSessionCookie(raw: string | undefined) {
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length !== 4) return null;
  const [id, emailEnc, exp, sig] = parts;
  if (!id || !emailEnc || !exp || !sig) return null;
  const payload = `${id}.${emailEnc}.${exp}`;
  const expected = createHmac("sha256", sessionSecret()).update(payload).digest("hex");
  try {
    const left = Buffer.from(sig);
    const right = Buffer.from(expected);
    if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  } catch {
    return null;
  }
  if (Number(exp) < Date.now()) return null;
  return { id, email: decodeURIComponent(emailEnc) };
}
