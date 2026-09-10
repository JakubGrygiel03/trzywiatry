import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminCookieOptions } from "@/lib/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/admin/logowanie", request.url), 303);
  response.cookies.set(ADMIN_COOKIE, "", { ...adminCookieOptions(request), maxAge: 0 });
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
