import Link from "next/link";
import { createWorkshop } from "@/app/actions/admin-workshops";
import { WorkshopForm } from "@/components/admin/workshop-form";
import { AdminAlert } from "@/components/admin/ui/admin-alert";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";

export default async function NewWorkshopPage({
  searchParams,
}: {
  searchParams: Promise<{ blad?: string }>;
}) {
  const query = await searchParams;

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="Nowy warsztat"
        description="Dodaj termin do harmonogramu pracowni."
        actions={
          <Link
            href="/admin/warsztaty"
            className="rounded-lg border border-czarny/12 bg-bialy px-3.5 py-2 text-xs font-medium text-czarny transition hover:border-czerwony/30"
          >
            ← Lista
          </Link>
        }
      />

      {query.blad ? <AdminAlert variant="error">{decodeURIComponent(query.blad)}</AdminAlert> : null}

      <div className="mt-6">
        <WorkshopForm action={createWorkshop} submitLabel="Utwórz warsztat" />
      </div>
    </div>
  );
}
