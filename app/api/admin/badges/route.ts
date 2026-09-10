import { cookies } from "next/headers";
import { getAdminBadges } from "@/lib/data/admin-metrics";
import { ADMIN_COOKIE, isAdminCookieValue } from "@/lib/admin-session";

export async function GET() {
  const store = await cookies();
  if (!isAdminCookieValue(store.get(ADMIN_COOKIE)?.value)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json(getAdminBadges(), {
    headers: { "Cache-Control": "private, no-store" },
  });
}
