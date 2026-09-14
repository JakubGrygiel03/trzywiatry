import { NextResponse } from "next/server";
import { verifyAdminCredentials } from "@/lib/admin-auth";
import { ADMIN_COOKIE, adminCookieOptions, createAdminCookieValue } from "@/lib/admin-session";
import { loginHandoff } from "@/lib/auth-handoff";
import { adminLoginSchema } from "@/lib/validations/forms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function redirectToLogin(request: Request, blad: "dane" | "haslo") {
  const loginUrl = new URL("/admin/logowanie", request.url);
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

  const parsed = adminLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return redirectToLogin(request, "dane");
  }

  let valid = false;
  try {
    valid = verifyAdminCredentials(parsed.data.email, parsed.data.password);
  } catch {
    return redirectToLogin(request, "haslo");
  }

  if (!valid) {
    return redirectToLogin(request, "haslo");
  }

  const response = loginHandoff(request, "/admin");
  response.cookies.set(ADMIN_COOKIE, createAdminCookieValue(), adminCookieOptions(request));
  return response;
}
