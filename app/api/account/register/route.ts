import { NextResponse } from "next/server";
import {
  ensureCustomersHydrated,
  findCustomerByEmail,
  flushCustomersSave,
  isCustomerEmailVerified,
  issueEmailConfirmToken,
  registerCustomer,
} from "@/lib/customer-auth";
import { sendCustomerConfirmEmail } from "@/lib/resend";
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

function redirectToCheckEmail(request: Request, email: string, mailed: boolean) {
  const url = new URL("/konto/sprawdz-email", request.url);
  url.searchParams.set("email", email);
  if (!mailed) url.searchParams.set("mail", "0");
  const response = NextResponse.redirect(url, 303);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

function confirmUrl(request: Request, token: string) {
  const url = new URL("/konto/potwierdz-email", request.url);
  url.searchParams.set("token", token);
  return url.toString();
}

async function sendConfirm(request: Request, email: string, name: string, token: string) {
  try {
    const mailed = await sendCustomerConfirmEmail(email, name, confirmUrl(request, token));
    return mailed.ok;
  } catch (error) {
    console.error("[register] confirm email failed", error);
    return false;
  }
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
    if (!isCustomerEmailVerified(existing)) {
      const issued = issueEmailConfirmToken(existing.email);
      let mailed = false;
      if (issued.ok) {
        await flushCustomersSave();
        mailed = await sendConfirm(request, issued.user.email, issued.user.name, issued.token);
      }
      return redirectToCheckEmail(request, existing.email, mailed);
    }
    return redirectToRegister(request, "exists");
  }

  const result = registerCustomer(parsed.data);
  if (!result.ok) {
    return redirectToRegister(request, "exists");
  }
  await flushCustomersSave();
  const mailed = await sendConfirm(request, result.user.email, result.user.name, result.confirmToken);
  return redirectToCheckEmail(request, result.user.email, mailed);
}
