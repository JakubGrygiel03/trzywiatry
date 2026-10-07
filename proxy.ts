import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, isAdminCookieValue } from "@/lib/admin-session";
import { CUSTOMER_COOKIE, verifyCustomerSessionCookie } from "@/lib/customer-session-token";
import { updateSession } from "@/lib/supabase/middleware";
import { isVercelAppHost, redirectVercelProductionAlias, requestHost } from "@/lib/vercel-host";

const PUBLIC_ADMIN_PREFIXES = ["/admin/logowanie", "/admin/reset-hasla", "/admin/nowe-haslo"];
const PUBLIC_ACCOUNT_PREFIXES = [
  "/konto/logowanie",
  "/konto/rejestracja",
  "/konto/reset-hasla",
  "/konto/nowe-haslo",
  "/konto/sprawdz-email",
  "/konto/potwierdz-email",
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

function withVercelNoIndex(response: NextResponse, request: NextRequest) {
  if (isVercelAppHost(requestHost(request))) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }
  return response;
}

export async function proxy(request: NextRequest) {
  const alias = redirectVercelProductionAlias(request);
  if (alias) return alias;

  const { pathname } = request.nextUrl;
  const onAdmin = pathname.startsWith("/admin");
  const onKonto = pathname === "/konto" || pathname.startsWith("/konto/");

  if (!onAdmin && !onKonto) {
    return withVercelNoIndex(NextResponse.next(), request);
  }

  const response = withVercelNoIndex(await updateSession(request), request);

  if (onAdmin) {
    response.headers.set("Cache-Control", "private, no-store");
  }

  if (onAdmin && !isPublicAdminPath(pathname)) {
    if (!isAdminCookieValue(request.cookies.get(ADMIN_COOKIE)?.value)) {
      const login = NextResponse.redirect(new URL("/konto/logowanie?next=/admin", request.url));
      login.headers.set("Cache-Control", "private, no-store");
      return login;
    }
  }

  if (onKonto && !isPublicAccountPath(pathname)) {
    const session = verifyCustomerSessionCookie(request.cookies.get(CUSTOMER_COOKIE)?.value);
    if (!session) {
      return NextResponse.redirect(new URL("/konto/logowanie", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:ico|png|jpg|jpeg|gif|webp|svg|woff2|txt)$).*)",
  ],
};
