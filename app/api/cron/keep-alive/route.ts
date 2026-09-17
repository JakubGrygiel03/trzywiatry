import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Daily ping so the free Supabase project is not auto-paused for inactivity.
 * Secured by CRON_SECRET (Vercel Cron sends Authorization: Bearer …).
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  const auth = request.headers.get("authorization");
  const vercelCron = request.headers.get("x-vercel-cron") === "1";

  if (secret) {
    const ok = auth === `Bearer ${secret}` || vercelCron;
    if (!ok) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production" && !vercelCron) {
    return NextResponse.json({ ok: false, error: "missing-cron-secret" }, { status: 401 });
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "supabase-unconfigured" }, { status: 503 });
  }

  const started = Date.now();
  const { error, count } = await supabase
    .from("atelier_state")
    .select("key", { count: "exact", head: true });

  if (error) {
    console.error("[cron/keep-alive]", error.message);
    return NextResponse.json(
      { ok: false, error: error.message, ms: Date.now() - started },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    service: "supabase",
    keys: count ?? 0,
    ms: Date.now() - started,
    at: new Date().toISOString(),
  });
}
