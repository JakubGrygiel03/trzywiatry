import { NextResponse } from "next/server";
import { loginHandoff } from "@/lib/auth-handoff";
import {
  confirmCustomerEmail,
  CUSTOMER_COOKIE,
  createCustomerSessionValue,
  ensureCustomersHydrated,
  flushCustomersSave,
} from "@/lib/customer-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function redirectToCheck(request: Request, blad: string) {
  const url = new URL("/konto/sprawdz-email", request.url);
  url.searchParams.set("blad", blad);
  const response = NextResponse.redirect(url, 303);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token")?.trim() ?? "";
  if (token.length < 20) {
    return redirectToCheck(request, "link");
  }

  await ensureCustomersHydrated();
  const result = confirmCustomerEmail(token);
  if (!result.ok) {
    return redirectToCheck(request, result.reason === "expired" ? "wygasl" : "link");
  }
  await flushCustomersSave();

  const response = loginHandoff(request, "/konto?potwierdzone=1");
  const https =
    new URL(request.url).protocol === "https:" ||
    process.env.VERCEL === "1" ||
    process.env.NODE_ENV === "production";
  response.cookies.set(CUSTOMER_COOKIE, createCustomerSessionValue(result.user), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: https,
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
