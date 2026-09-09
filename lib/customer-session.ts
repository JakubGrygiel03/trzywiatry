import { cookies } from "next/headers";
import {
  CUSTOMER_COOKIE,
  createCustomerSessionValue,
  findCustomerById,
  parseCustomerSessionValue,
  type CustomerUser,
} from "@/lib/customer-auth";

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
  const store = await cookies();
  const raw = store.get(CUSTOMER_COOKIE)?.value;
  return parseCustomerSessionValue(raw);
}

export async function requireCustomerSession() {
  const user = await getCustomerSession();
  if (!user) return null;
  return findCustomerById(user.id);
}
