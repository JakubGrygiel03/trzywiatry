import Image from "next/image";
import { Layers } from "lucide-react";
import { connection } from "next/server";
import { removeCollection, saveCollection } from "@/app/actions/admin-collections";
import { AdminAlert } from "@/components/admin/ui/admin-alert";
import { AdminEmptyState } from "@/components/admin/ui/admin-empty-state";
import { AdminField, AdminInput, AdminTextarea } from "@/components/admin/ui/admin-field";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { ensureAtelierHydrated } from "@/lib/data/atelier-persist";
import { getCollections } from "@/lib/data/queries";

export const dynamic = "force-dynamic";

export default async function AdminCollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ zapisano?: string; usunieto?: string; blad?: string }>;
}) {
  await connection();
  await ensureAtelierHydrated({ force: true });
  const query = await searchParams;
  const collections = getCollections();

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader
        title="Kolekcje szkliw"
        description="Dust, Mist, Sand — nazwa, slug i zdjęcie na /kolekcje. Zmiana sluga zostawia przekierowanie 301."
      />
      {query.zapisano ? <AdminAlert variant="success">Zapisano kolekcję.</AdminAlert> : null}
      {query.usunieto ? <AdminAlert variant="success">Usunięto kolekcję.</AdminAlert> : null}
      {query.blad ? <AdminAlert variant="error">{decodeURIComponent(query.blad)}</AdminAlert> : null}

      <form action={saveCollection} className="mb-6 grid gap-3 rounded-xl border border-czarny/8 bg-bialy p-5 sm:grid-cols-2">
        <AdminField label="Nazwa" htmlFor="name" required>
          <AdminInput id="name" name="name" required placeholder="np. Dust" />
        </AdminField>
        <AdminField label="Slug" htmlFor="slug">
          <AdminInput id="slug" name="slug" placeholder="dust" />
        </AdminField>
        <AdminField label="Opis" htmlFor="description">
          <AdminTextarea id="description" name="description" rows={3} />
        </AdminField>
        <AdminField label="Zdjęcie (URL)" htmlFor="imageUrl">
          <AdminInput id="imageUrl" name="imageUrl" placeholder="/brand/photos/..." />
        </AdminField>
        <button
          type="submit"
          className="h-11 rounded-lg bg-czarny px-4 text-xs font-medium text-bialy hover:bg-czerwony sm:col-span-2"
        >
          Dodaj kolekcję
        </button>
      </form>

      {collections.length === 0 ? (
        <div className="rounded-xl border border-czarny/8 bg-bialy">
          <AdminEmptyState icon={Layers} title="Brak kolekcji" description="Dodaj linię szkliw — pojawi się na /kolekcje." />
        </div>
      ) : (
        <ul className="space-y-3">
          {collections.map((collection) => (
            <li key={collection.id} className="rounded-xl border border-czarny/8 bg-bialy p-4">
              <form action={saveCollection} className="grid gap-3 sm:grid-cols-[80px_1fr_auto]">
                <input type="hidden" name="id" value={collection.id} />
                <div className="relative h-20 overflow-hidden rounded-lg bg-krem">
                  {collection.imageUrl ? (
                    <Image src={collection.imageUrl} alt="" fill className="object-cover" sizes="80px" unoptimized />
                  ) : null}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <AdminInput name="name" defaultValue={collection.name} required />
                  <AdminInput name="slug" defaultValue={collection.slug} required />
                  <AdminInput name="imageUrl" defaultValue={collection.imageUrl} className="sm:col-span-2" />
                  <AdminTextarea name="description" defaultValue={collection.description} rows={2} className="sm:col-span-2" />
                </div>
                <div className="flex flex-col gap-2">
                  <button type="submit" className="rounded-lg border border-czarny/12 px-3 py-2 text-xs">
                    Zapisz
                  </button>
                </div>
              </form>
              <form action={removeCollection} className="mt-2 text-right">
                <input type="hidden" name="id" value={collection.id} />
                <button type="submit" className="text-xs text-czarny/45 hover:text-czerwony">
                  Usuń
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
