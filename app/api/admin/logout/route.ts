import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminCookieOptions } from "@/lib/admin-session";
import { isSameOrigin } from "@/lib/same-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const response = NextResponse.redirect(new URL("/konto/logowanie", request.url), 303);
  response.cookies.set(ADMIN_COOKIE, "", { ...adminCookieOptions(request), maxAge: 0 });
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
