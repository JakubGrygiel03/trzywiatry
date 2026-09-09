import { cookies } from "next/headers";
import { getAdminBadges } from "@/lib/data/admin-metrics";

export async function GET() {
  const store = await cookies();
  if (store.get("tw-admin")?.value !== "1") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json(getAdminBadges(), {
    headers: { "Cache-Control": "private, no-store" },
  });
}
