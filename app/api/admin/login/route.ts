import { NextResponse } from "next/server";
import { verifyAdminCredentials } from "@/lib/admin-auth";
import { ADMIN_COOKIE, adminCookieOptions } from "@/lib/admin-session";
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

/**
 * Native POST + cookie + HTML handoff (not a Server Action).
 * 303 + Set-Cookie is dropped by iOS/Android installed PWAs; a 200 page is not.
 */
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

  const dest = new URL("/admin", request.url).toString();
  const response = new NextResponse(
    `<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/admin"><title>Panel</title></head><body><p><a href="/admin">Otwórz panel</a></p><script>location.replace(${JSON.stringify(dest)});</script></body></html>`,
    {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "private, no-store",
      },
    },
  );
  response.cookies.set(ADMIN_COOKIE, "1", adminCookieOptions(request));
  return response;
}
