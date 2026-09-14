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

function redirectToCheckEmail(request: Request) {
  const response = NextResponse.redirect(new URL("/konto/sprawdz-email", request.url), 303);
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
    await sendCustomerConfirmEmail(email, name, confirmUrl(request, token));
  } catch (error) {
    console.error("[register] confirm email failed", error);
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
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
  });
  if (!parsed.success) {
    return redirectToRegister(request, parsed.error.issues[0]?.message ?? "dane");
  }

  await ensureCustomersHydrated();
  const existing = findCustomerByEmail(parsed.data.email);
  if (existing) {
    if (!isCustomerEmailVerified(existing)) {
      const issued = issueEmailConfirmToken(existing.email);
      if (issued.ok) {
        await flushCustomersSave();
        await sendConfirm(request, issued.user.email, issued.user.name, issued.token);
      }
      return redirectToCheckEmail(request);
    }
    return redirectToRegister(request, "exists");
  }

  const result = registerCustomer(parsed.data);
  if (!result.ok) {
    return redirectToRegister(request, "exists");
  }
  await flushCustomersSave();
  await sendConfirm(request, result.user.email, result.user.name, result.confirmToken);
  return redirectToCheckEmail(request);
}
