import { NextResponse } from "next/server";
import { loginHandoff } from "@/lib/auth-handoff";
import {
  ensureCustomersHydrated,
  isCustomerEmailVerified,
  verifyCustomerCredentials,
} from "@/lib/customer-auth";
import { CUSTOMER_COOKIE, createCustomerSessionValue } from "@/lib/customer-session-token";
import { customerLoginSchema } from "@/lib/validations/forms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function redirectToLogin(request: Request, blad: "dane" | "haslo") {
  const loginUrl = new URL("/konto/logowanie", request.url);
  loginUrl.searchParams.set("blad", blad);
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
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return redirectToLogin(request, "dane");
  }

  await ensureCustomersHydrated();
  const user = verifyCustomerCredentials(parsed.data.email, parsed.data.password);
  if (!user) {
    return redirectToLogin(request, "haslo");
  }
  if (!isCustomerEmailVerified(user)) {
    const url = new URL("/konto/sprawdz-email", request.url);
    url.searchParams.set("email", user.email);
    const response = NextResponse.redirect(url, 303);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }

  const response = loginHandoff(request, "/konto");
  response.cookies.set(CUSTOMER_COOKIE, createCustomerSessionValue(user), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: new URL(request.url).protocol === "https:",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
