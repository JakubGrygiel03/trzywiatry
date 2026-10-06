import { saveHomeBannerImageUpload } from "@/lib/admin-home-banner-images";
import { rejectUnlessAdminApi } from "@/lib/admin-api-guard";

export async function POST(request: Request) {
  const denied = await rejectUnlessAdminApi(request, "upload");
  if (denied) return denied;

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
