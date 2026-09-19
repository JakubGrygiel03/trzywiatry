import { NextResponse } from "next/server";
import { loginHandoff } from "@/lib/auth-handoff";
import {
  ensureCustomersHydrated,
  flushCustomersSave,
  isCustomerEmailVerified,
  markCustomerEmailVerified,
  verifyCustomerCredentials,
} from "@/lib/customer-auth";
import { CUSTOMER_COOKIE, createCustomerSessionValue } from "@/lib/customer-session-token";
import { customerLoginSchema } from "@/lib/validations/forms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function redirectToLogin(request: Request, blad: "dane" | "haslo", email?: string) {
  const loginUrl = new URL("/konto/logowanie", request.url);
  loginUrl.searchParams.set("blad", blad);
  if (email) loginUrl.searchParams.set("email", email);
  const response = NextResponse.redirect(loginUrl, 303);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return redirectToLogin(request, "dane");
  }

  const parsed = customerLoginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) {
    return redirectToLogin(request, "dane");
  }

  await ensureCustomersHydrated({ force: true });
  const user = verifyCustomerCredentials(parsed.data.email, parsed.data.password);
  if (!user) {
    return redirectToLogin(request, "haslo");
  }

  // Email confirmation is disabled — unlock any leftover unverified accounts on successful login.
  if (!isCustomerEmailVerified(user)) {
    markCustomerEmailVerified(user.email);
    await flushCustomersSave();
  }

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
