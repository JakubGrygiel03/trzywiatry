import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAdminCookieValue } from "@/lib/admin-session";
import { hasP24Credentials } from "@/lib/p24";

export type PaymentAccess = {
  /** Shoppers see live pay UI only when this is true. */
  isPublic: boolean;
  /** Can start P24 (public flag or logged-in admin tester). */
  canPay: boolean;
  /** Admin session bypass — test without opening pay to everyone. */
  isTester: boolean;
};

/** Customer-facing gate: PAYMENTS_ENABLED=true + P24 keys. */
export function arePaymentsPublic() {
  return process.env.PAYMENTS_ENABLED === "true" && hasP24Credentials();
}

async function isAdminTester() {
  const store = await cookies();
  return isAdminCookieValue(store.get(ADMIN_COOKIE)?.value);
}

/**
 * Public stays off while an admin session can still run sandbox payments.
 * Shoppers without the admin cookie only see the “niedostępne” notice.
 */
export async function resolvePaymentAccess(): Promise<PaymentAccess> {
  if (!hasP24Credentials()) {
    return { isPublic: false, canPay: false, isTester: false };
  }
  if (arePaymentsPublic()) {
    return { isPublic: true, canPay: true, isTester: false };
  }
  const isTester = await isAdminTester();
  return { isPublic: false, canPay: isTester, isTester };
}
