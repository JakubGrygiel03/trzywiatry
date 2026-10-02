import { cookies } from "next/headers";
import { deleteUploadedImage } from "@/lib/admin-media-delete";
import { ADMIN_COOKIE, isAdminCookieValue } from "@/lib/admin-session";

export async function DELETE(request: Request) {
  const store = await cookies();
  if (!isAdminCookieValue(store.get(ADMIN_COOKIE)?.value)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

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
