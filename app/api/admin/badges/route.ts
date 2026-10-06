import { NextResponse } from "next/server";
import { getAdminBadges } from "@/lib/data/admin-metrics";
import { rejectUnlessAdminApi } from "@/lib/admin-api-guard";

export async function GET(request: Request) {
  const denied = await rejectUnlessAdminApi(request, "read");
  if (denied) return denied;

  return NextResponse.json(await getAdminBadges(), {
    headers: { "Cache-Control": "private, no-store" },
  });
}
