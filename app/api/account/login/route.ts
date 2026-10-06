import { NextResponse } from "next/server";
import { verifyAdminCredentials } from "@/lib/admin-auth";
import { ADMIN_COOKIE, adminCookieOptions, createAdminCookieValue } from "@/lib/admin-session";
import { loginHandoff } from "@/lib/auth-handoff";
import {
  ensureCustomersHydrated,
  flushCustomersSave,
  isCustomerEmailVerified,
  markCustomerEmailVerified,
  verifyCustomerCredentials,
} from "@/lib/customer-auth";
import { CUSTOMER_COOKIE, createCustomerSessionValue } from "@/lib/customer-session-token";
import { RATE, rateLimitRequest } from "@/lib/rate-limit";
import { isSameOrigin } from "@/lib/same-origin";
import { customerLoginSchema } from "@/lib/validations/forms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function redirectToLogin(request: Request, blad: "dane" | "haslo" | "limit", email?: string) {
  const loginUrl = new URL("/konto/logowanie", request.url);
  loginUrl.searchParams.set("blad", blad);
  if (email) loginUrl.searchParams.set("email", email);
  const response = NextResponse.redirect(loginUrl, 303);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

function completeAdminLogin(request: Request) {
  const response = loginHandoff(request, "/admin");
  response.cookies.set(ADMIN_COOKIE, createAdminCookieValue(), adminCookieOptions(request));
  return response;
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return redirectToLogin(request, "dane");
  }
  if (!rateLimitRequest(request, "login", RATE.login.limit, RATE.login.windowMs)) {
    return redirectToLogin(request, "limit");
  }

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

  try {
    if (verifyAdminCredentials(parsed.data.email, parsed.data.password)) {
      return completeAdminLogin(request);
    }
  } catch {
    // Missing session secret or hash error — fall through to customer login.
  }

  await ensureCustomersHydrated({ force: true });
  const user = verifyCustomerCredentials(parsed.data.email, parsed.data.password);
  if (!user) {
    return redirectToLogin(request, "haslo", parsed.data.email);
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
