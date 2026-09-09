import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { deleteWorkshop, updateWorkshop } from "@/app/actions/admin-workshops";
import { WorkshopForm } from "@/components/admin/workshop-form";
import { AdminAlert } from "@/components/admin/ui/admin-alert";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { PublishBadge } from "@/components/admin/ui/admin-status-badge";
import { getWorkshopById } from "@/lib/data/queries";
import { formatDate, formatPLN } from "@/lib/format";

export default async function EditWorkshopPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ zapisano?: string; blad?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const workshop = getWorkshopById(id);
  if (!workshop) notFound();

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title={workshop.title}
        description={`${formatDate(workshop.eventDate)} · ${formatPLN(workshop.priceInCents)}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <PublishBadge published={workshop.isPublished} />
            {workshop.isPublished ? (
              <Link
                href={`/warsztaty/${workshop.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-lg border border-czarny/12 bg-bialy px-3.5 py-2 text-xs font-medium text-czarny transition hover:border-czerwony/30"
              >
                Podgląd
                <ExternalLink className="h-3 w-3" />
              </Link>
            ) : null}
            <Link
              href="/admin/warsztaty"
              className="rounded-lg border border-czarny/12 bg-bialy px-3.5 py-2 text-xs font-medium text-czarny transition hover:border-czerwony/30"
            >
              ← Lista
            </Link>
          </div>
        }
      />

      {query.zapisano ? <AdminAlert variant="success">Zapisano. Harmonogram odświeżony.</AdminAlert> : null}
      {query.blad ? <AdminAlert variant="error">{decodeURIComponent(query.blad)}</AdminAlert> : null}

      <div className="mt-6 space-y-6">
        <WorkshopForm action={updateWorkshop} workshop={workshop} submitLabel="Zapisz zmiany" />

        <form action={deleteWorkshop} className="rounded-xl border border-czerwony/20 bg-bialy p-4">
          <input type="hidden" name="id" value={workshop.id} />
          <p className="text-sm font-medium text-czarny">Usuń warsztat</p>
          <p className="mt-1 text-xs text-czarny/50">Usunięcie jest nieodwracalne w bieżącej sesji serwera.</p>
          <button
            type="submit"
            className="mt-3 rounded-lg border border-czerwony/30 px-3.5 py-2 text-xs font-medium text-czerwony transition hover:bg-czerwony/5"
          >
            Usuń termin
          </button>
        </form>
      </div>
    </div>
  );
}
