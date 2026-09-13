import Link from "next/link";
import { HomeLayoutEditor } from "@/components/admin/home/home-layout-editor";
import { AdminAlert } from "@/components/admin/ui/admin-alert";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { getHomeLayout } from "@/lib/data/home-layout";
import { getHeroPhotoOptions, getSettings } from "@/lib/data/queries";

export default async function AdminHomeLayoutPage({
  searchParams,
}: {
  searchParams: Promise<{ zapisano?: string; blad?: string }>;
}) {
  const { zapisano, blad } = await searchParams;
  const sections = await getHomeLayout();
  const promoCode = getSettings().promoCode;

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader
        title="Strona główna"
        description="Przesuń sekcje, ukryj je albo zmień teksty i zdjęcia. Wygląd kadrów zostaje w stylu pracowni."
        actions={
          <Link
            href="/"
            target="_blank"
            className="rounded-lg border border-czarny/12 px-3.5 py-2 text-xs font-medium text-czarny transition hover:border-czerwony hover:text-czerwony"
          >
            Zobacz stronę
          </Link>
        }
      />

      {zapisano ? <AdminAlert variant="success">Zapisano. Odśwież sklep, żeby zobaczyć nową kolejność.</AdminAlert> : null}
      {blad ? <AdminAlert variant="error">{blad}</AdminAlert> : null}

      <div className="mt-6">
        <HomeLayoutEditor
          initialSections={sections}
          heroPhotos={getHeroPhotoOptions()}
          promoCode={promoCode}
        />
      </div>
    </div>
  );
}
