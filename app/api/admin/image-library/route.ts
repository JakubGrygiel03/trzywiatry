import { getAdminProductImageLibrary } from "@/lib/admin-product-images";
import { rejectUnlessAdminApi } from "@/lib/admin-api-guard";

export async function GET(request: Request) {
  const denied = await rejectUnlessAdminApi(request, "read");
  if (denied) return denied;

  return Response.json(await getAdminProductImageLibrary(), {
    headers: { "Cache-Control": "private, max-age=30" },
  });
}
