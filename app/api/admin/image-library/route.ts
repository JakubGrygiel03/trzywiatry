import { cookies } from "next/headers";
import { getAdminProductImageLibrary } from "@/lib/admin-product-images";
import { ADMIN_COOKIE, isAdminCookieValue } from "@/lib/admin-session";

export async function GET() {
  const store = await cookies();
  if (!isAdminCookieValue(store.get(ADMIN_COOKIE)?.value)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json(getAdminProductImageLibrary(), {
    headers: { "Cache-Control": "private, max-age=30" },
  });
}
