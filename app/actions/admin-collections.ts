"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertAdminSession } from "@/lib/admin-guard";
import { withCmsTick } from "@/lib/cms-redirect";
import { ensureAtelierHydrated, flushAtelierSave } from "@/lib/data/atelier-persist";
import { getCollections } from "@/lib/data/queries";
import { deleteRuntimeCollection, upsertRuntimeCollection } from "@/lib/data/runtime-store";
import { isAllowedImageSrc } from "@/lib/validations/image-src";
import { firstZodMessage, plainText } from "@/lib/validations/safe-input";
import { recordSlugRedirect } from "@/lib/slug-redirects";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const schema = z.object({
  id: z.string().optional(),
  name: plainText("Nazwa kolekcji", 60, 2),
  slug: z.string().trim().max(80).optional(),
  description: plainText("Opis", 400, 0),
  imageUrl: z.string().trim().max(400),
});

export async function saveCollection(formData: FormData) {
  await assertAdminSession();
  await ensureAtelierHydrated({ force: true });
  const parsed = schema.safeParse({
    id: String(formData.get("id") ?? "").trim() || undefined,
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    imageUrl: formData.get("imageUrl"),
  });
  if (!parsed.success) {
    redirect(`/admin/kolekcje?blad=${encodeURIComponent(firstZodMessage(parsed.error))}`);
  }
  const data = parsed.data;
  const slug = (data.slug?.trim() || slugify(data.name)).replace(/[^a-z0-9-]/g, "");
  if (slug.length < 2) redirect(`/admin/kolekcje?blad=${encodeURIComponent("Podaj slug kolekcji.")}`);
  const others = getCollections().filter((row) => row.id !== data.id);
  if (others.some((row) => row.slug === slug)) {
    redirect(`/admin/kolekcje?blad=${encodeURIComponent("Slug kolekcji jest zajęty.")}`);
  }
  const existing = getCollections().find((row) => row.id === data.id);
  if (existing && existing.slug !== slug) {
    recordSlugRedirect("collection", existing.slug, slug);
  }
  upsertRuntimeCollection({
    id: data.id ?? crypto.randomUUID(),
    name: data.name,
    slug,
    description: data.description,
    imageUrl: isAllowedImageSrc(data.imageUrl) ? data.imageUrl : existing?.imageUrl ?? "/brand/photos/ceramic-mugs.jpg",
  });
  await flushAtelierSave();
  revalidatePath("/admin/kolekcje");
  revalidatePath("/kolekcje", "layout");
  if (existing) revalidatePath(`/kolekcje/${existing.slug}`);
  revalidatePath(`/kolekcje/${slug}`);
  redirect(withCmsTick("/admin/kolekcje?zapisano=1"));
}

export async function removeCollection(formData: FormData) {
  await assertAdminSession();
  await ensureAtelierHydrated({ force: true });
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/kolekcje?blad=1");
  deleteRuntimeCollection(id);
  await flushAtelierSave();
  revalidatePath("/admin/kolekcje");
  revalidatePath("/kolekcje", "layout");
  redirect(withCmsTick("/admin/kolekcje?usunieto=1"));
}
