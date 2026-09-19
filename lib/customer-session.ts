import { cookies } from "next/headers";
import {
  CUSTOMER_COOKIE,
  createCustomerSessionValue,
  ensureCustomersHydrated,
  findCustomerById,
  parseCustomerSessionValue,
  type CustomerUser,
} from "@/lib/customer-auth";
import { verifyCustomerSessionCookie } from "@/lib/customer-session-token";

export { CUSTOMER_COOKIE };

export async function setCustomerSession(user: Pick<CustomerUser, "id" | "email">) {
  const store = await cookies();
  store.set(CUSTOMER_COOKIE, createCustomerSessionValue(user), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearCustomerSession() {
  const store = await cookies();
  store.delete(CUSTOMER_COOKIE);
}

export async function getCustomerSession(): Promise<CustomerUser | null> {
  await ensureCustomersHydrated();
  const store = await cookies();
  const raw = store.get(CUSTOMER_COOKIE)?.value;
  return parseCustomerSessionValue(raw);
}

/**
 * Nav chrome only — signed cookie check, no customers Supabase hydrate.
 * Account routes should keep using getCustomerSession().
 */
export async function peekCustomerSession(): Promise<{ id: string } | null> {
  const store = await cookies();
  return verifyCustomerSessionCookie(store.get(CUSTOMER_COOKIE)?.value);
}

export async function requireCustomerSession() {
  const user = await getCustomerSession();
  if (!user) return null;
  return findCustomerById(user.id);
}
