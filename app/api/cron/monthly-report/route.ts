import { NextRequest, NextResponse } from "next/server";
import { sendMonthlyStudioReport } from "@/lib/reports/monthly-studio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 1st of the month — previous calendar month CSV pack to the studio inbox.
 * Secured like /api/cron/keep-alive (CRON_SECRET / x-vercel-cron).
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

  const month = request.nextUrl.searchParams.get("month") ?? undefined;
  const result = await sendMonthlyStudioReport({ month: month || undefined });
  return NextResponse.json({
    ok: result.ok,
    period: result.periodLabel,
    error: result.error,
    at: new Date().toISOString(),
  });
}
