import { NextResponse } from "next/server";
import { verifyAdminCredentials } from "@/lib/admin-auth";
import { ADMIN_COOKIE, adminCookieOptions } from "@/lib/admin-session";
import { adminLoginSchema } from "@/lib/validations/forms";

export const dynamic = "force-dynamic";

/**
 * Classic POST + 303 redirect (not a Server Action).
 * Installed phone PWAs break on RSC refresh after loginAdmin().
 */
export async function POST(request: Request) {
  const loginUrl = new URL("/admin/logowanie", request.url);
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    loginUrl.searchParams.set("blad", "dane");
    return NextResponse.redirect(loginUrl, 303);
  }

  const parsed = adminLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    loginUrl.searchParams.set("blad", "dane");
    return NextResponse.redirect(loginUrl, 303);
  }

  const valid = verifyAdminCredentials(parsed.data.email, parsed.data.password);
  if (!valid) {
    loginUrl.searchParams.set("blad", "haslo");
    return NextResponse.redirect(loginUrl, 303);
  }

  const response = NextResponse.redirect(new URL("/admin", request.url), 303);
  response.cookies.set(ADMIN_COOKIE, "1", adminCookieOptions());
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
