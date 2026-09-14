import { NextResponse } from "next/server";
import { loginHandoff } from "@/lib/auth-handoff";
import {
  ensureCustomersHydrated,
  findCustomerByEmail,
  flushCustomersSave,
  markCustomerEmailVerified,
  registerCustomer,
} from "@/lib/customer-auth";
import { CUSTOMER_COOKIE, createCustomerSessionValue } from "@/lib/customer-session-token";
import { customerRegisterSchema } from "@/lib/validations/forms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function redirectToRegister(request: Request, blad: string) {
  const url = new URL("/konto/rejestracja", request.url);
  url.searchParams.set("blad", blad);
  const response = NextResponse.redirect(url, 303);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

function sessionCookie(request: Request, user: { id: string; email: string; name: string }) {
  const response = loginHandoff(request, "/konto");
  const https =
    new URL(request.url).protocol === "https:" ||
    process.env.VERCEL === "1" ||
    process.env.NODE_ENV === "production";
  response.cookies.set(CUSTOMER_COOKIE, createCustomerSessionValue(user), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: https,
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return redirectToRegister(request, "dane");
  }

  const parsed = customerRegisterSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    passwordConfirm: String(formData.get("passwordConfirm") ?? ""),
  });
  if (!parsed.success) {
    return redirectToRegister(request, parsed.error.issues[0]?.message ?? "dane");
  }

  await ensureCustomersHydrated();
  const existing = findCustomerByEmail(parsed.data.email);
  if (existing) {
    // Older unverified rows — unlock and send them to login instead of a dead confirm loop.
    markCustomerEmailVerified(existing.email);
    await flushCustomersSave();
    return redirectToRegister(request, "exists");
  }

  const result = registerCustomer(parsed.data);
  if (!result.ok) {
    return redirectToRegister(request, "exists");
  }
  await flushCustomersSave();
  return sessionCookie(request, result.user);
}
