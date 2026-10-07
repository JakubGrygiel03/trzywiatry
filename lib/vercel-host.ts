import { NextResponse, type NextRequest } from "next/server";
import { SITE } from "@/lib/constants";

export function requestHost(request: NextRequest) {
  return (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "")
    .split(",")[0]
    ?.trim()
    .split(":")[0]
    .toLowerCase() ?? "";
}

export function isVercelAppHost(host: string) {
  return host.endsWith(".vercel.app");
}

/**
 * Production always has a public `*.vercel.app` clone. Send it to the real shop.
 * Preview deployments stay on their URL so QA still works.
 */
export function redirectVercelProductionAlias(request: NextRequest) {
  const host = requestHost(request);
  if (!isVercelAppHost(host)) return null;
  if (process.env.VERCEL_ENV === "preview") return null;

  const canonical = new URL(SITE.url);
  if (host === canonical.hostname) return null;

  const dest = new URL(request.nextUrl.pathname + request.nextUrl.search, canonical.origin);
  const response = NextResponse.redirect(dest, 308);
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}
