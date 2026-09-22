import { NextResponse } from "next/server";
import { ensureAtelierHydrated } from "@/lib/data/atelier-persist";
import { getRuntimeSettings } from "@/lib/data/runtime-store";
import {
  createPreviewCookieValue,
  PREVIEW_COOKIE,
  previewCookieOptions,
} from "@/lib/maintenance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { token } = await context.params;
  await ensureAtelierHydrated();
  const expected = getRuntimeSettings().maintenancePreviewToken;

  if (!token || !expected || token !== expected) {
    return NextResponse.redirect(new URL("/?podglad=blad", request.url), 303);
  }

  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.set(PREVIEW_COOKIE, createPreviewCookieValue(token), previewCookieOptions(request));
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
