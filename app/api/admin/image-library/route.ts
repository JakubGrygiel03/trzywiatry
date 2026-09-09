import { cookies } from "next/headers";
import { getAdminProductImageLibrary } from "@/lib/admin-product-images";

export async function GET() {
  const store = await cookies();
  if (store.get("tw-admin")?.value !== "1") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json(getAdminProductImageLibrary(), {
    headers: { "Cache-Control": "private, max-age=30" },
  });
}
