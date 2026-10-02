import { connection } from "next/server";
import { AdminMediaLibrary } from "@/components/admin/admin-media-library";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { getAdminProductImageLibrary } from "@/lib/admin-product-images";
import { assertAdminSession } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  await connection();
  await assertAdminSession();
  const images = await getAdminProductImageLibrary();

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        title="Biblioteka zdjęć"
        description="Wgrane pliki i zdjęcia produktów. Adres URL wklejasz w karcie produktu, kolekcji albo na stronach."
      />
      <div className="mt-6">
        <AdminMediaLibrary initial={images} />
      </div>
    </div>
  );
}
