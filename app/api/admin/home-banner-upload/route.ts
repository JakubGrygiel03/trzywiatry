import { cookies } from "next/headers";
import { saveHomeBannerImageUpload } from "@/lib/admin-home-banner-images";
import { ADMIN_COOKIE, isAdminCookieValue } from "@/lib/admin-session";

export async function POST(request: Request) {
  const store = await cookies();
  if (!isAdminCookieValue(store.get(ADMIN_COOKIE)?.value)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return Response.json({ error: "Brak pliku" }, { status: 400 });
    }
    const url = await saveHomeBannerImageUpload(file);
    return Response.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return Response.json({ error: message }, { status: 400 });
  }
}
