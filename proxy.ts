import { NextResponse, type NextRequest } from "next/server";
import { CUSTOMER_COOKIE, verifyCustomerSessionCookie } from "@/lib/customer-session-token";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_ADMIN_PREFIXES = ["/admin/logowanie", "/admin/reset-hasla", "/admin/nowe-haslo"];
const PUBLIC_ACCOUNT_PREFIXES = [
  "/konto/logowanie",
  "/konto/rejestracja",
  "/konto/reset-hasla",
  "/konto/nowe-haslo",
];

function isPublicAdminPath(pathname: string) {
  return PUBLIC_ADMIN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isPublicAccountPath(pathname: string) {
  return PUBLIC_ACCOUNT_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function proxy(request: NextRequest) {
  const response = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && !isPublicAdminPath(pathname)) {
    if (request.cookies.get("tw-admin")?.value !== "1") {
      return NextResponse.redirect(new URL("/admin/logowanie", request.url));
    }
  }

  if (pathname === "/konto" || pathname.startsWith("/konto/")) {
    if (!isPublicAccountPath(pathname)) {
      const session = verifyCustomerSessionCookie(request.cookies.get(CUSTOMER_COOKIE)?.value);
      if (!session) {
        return NextResponse.redirect(new URL("/konto/logowanie", request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/konto", "/konto/:path*"],
};
