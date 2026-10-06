import { deleteUploadedImage } from "@/lib/admin-media-delete";
import { rejectUnlessAdminApi } from "@/lib/admin-api-guard";

export async function DELETE(request: Request) {
  const denied = await rejectUnlessAdminApi(request, "write");
  if (denied) return denied;

  try {
    const body = (await request.json()) as { url?: unknown };
    const url = typeof body.url === "string" ? body.url.trim() : "";
    if (!url) {
      return Response.json({ error: "Brak adresu zdjęcia." }, { status: 400 });
    }
    await deleteUploadedImage(url);
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Usuwanie nieudane.";
    return Response.json({ error: message }, { status: 400 });
  }
}
