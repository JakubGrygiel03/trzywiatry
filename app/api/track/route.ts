import { NextResponse } from "next/server";
import { recordTrafficEvent } from "@/lib/data/traffic-persist";
import { isSafeProductSlug, isTrafficKind } from "@/lib/data/traffic-stats";
import { RATE, rateLimitRequest } from "@/lib/rate-limit";
import { isSameOrigin } from "@/lib/same-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function trusted(request: Request) {
  if (isSameOrigin(request)) return true;
  const url = new URL(request.url);
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).origin === url.origin;
    } catch {
      return false;
    }
  }
  // sendBeacon often omits Origin; still require our host.
  if (request.headers.get("origin")) return false;
  const host = url.hostname;
  return host === "trzywiatry.pl" || host === "localhost" || host === "127.0.0.1";
}

export async function POST(request: Request) {
  if (!trusted(request)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  if (!rateLimitRequest(request, "track", RATE.track.limit, RATE.track.windowMs)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const rec = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  if (!isTrafficKind(rec.kind)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const path = typeof rec.path === "string" ? rec.path.slice(0, 180) : undefined;
  const slug = typeof rec.slug === "string" && isSafeProductSlug(rec.slug) ? rec.slug : undefined;

  await recordTrafficEvent({ kind: rec.kind, path, slug });
  return NextResponse.json({ ok: true });
}
