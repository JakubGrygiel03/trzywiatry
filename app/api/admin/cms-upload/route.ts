import { isCmsUploadFolder, saveCmsImageUpload } from "@/lib/admin-cms-images";
import { rejectUnlessAdminApi } from "@/lib/admin-api-guard";

export async function POST(request: Request) {
  const denied = await rejectUnlessAdminApi(request, "upload");
  if (denied) return denied;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folderRaw = String(formData.get("folder") ?? "cms");
    if (!(file instanceof File)) {
      return Response.json({ error: "Brak pliku" }, { status: 400 });
    }
    if (!isCmsUploadFolder(folderRaw)) {
      return Response.json({ error: "Nieznany folder zdjęć." }, { status: 400 });
    }
    const url = await saveCmsImageUpload(file, folderRaw);
    return Response.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return Response.json({ error: message }, { status: 400 });
  }
}
