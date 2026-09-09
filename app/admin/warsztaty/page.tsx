import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminAlert } from "@/components/admin/ui/admin-alert";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { PublishBadge } from "@/components/admin/ui/admin-status-badge";
import { getAllWorkshops, getSettings, remainingSeats } from "@/lib/data/queries";
import { runtimeStore } from "@/lib/data/runtime-store";
import { formatDate, formatPLN } from "@/lib/format";

export default async function AdminWorkshopsPage({
  searchParams,
}: {
  searchParams: Promise<{ usunieto?: string; blad?: string }>;
}) {
  const query = await searchParams;
  const workshops = getAllWorkshops();
  const enabled = getSettings().workshopsEnabled;

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="Warsztaty"
        description={
          enabled
            ? "Kliknij termin, żeby edytować datę, cenę i miejsca."
            : "Sekcja ukryta na stronie — włącz ją w ustawieniach sklepu."
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/ustawienia-sklepu"
              className="rounded-lg border border-czarny/12 bg-bialy px-3.5 py-2 text-xs font-medium text-czarny transition hover:border-czerwony/30"
            >
              Widoczność
            </Link>
            <Link
              href="/admin/warsztaty/nowy"
              className="inline-flex items-center gap-1.5 rounded-lg bg-czarny px-3.5 py-2 text-xs font-medium text-bialy transition hover:bg-czerwony"
            >
              <Plus className="h-3.5 w-3.5" />
              Nowy termin
            </Link>
          </div>
        }
      />

      {query.usunieto ? <AdminAlert variant="success">Usunięto warsztat.</AdminAlert> : null}
      {query.blad ? <AdminAlert variant="error">Nie udało się wykonać operacji.</AdminAlert> : null}

      <div className="overflow-hidden rounded-xl border border-czarny/8 bg-bialy">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-czarny/8 bg-krem/40 text-[11px] uppercase tracking-[0.1em] text-czarny/45">
              <th className="px-4 py-3 font-medium">Termin</th>
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium">Cena</th>
              <th className="px-4 py-3 font-medium">Miejsca</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Akcja</th>
            </tr>
          </thead>
          <tbody>
            {workshops.map((workshop) => {
              const left = remainingSeats(workshop);
              return (
                <tr key={workshop.id} className="border-b border-czarny/5 last:border-0 hover:bg-krem/30">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/warsztaty/${workshop.id}`}
                      className="font-medium text-czarny underline-offset-2 hover:text-czerwony hover:underline"
                    >
                      {workshop.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-czarny/55">{formatDate(workshop.eventDate)}</td>
                  <td className="px-4 py-3 tabular-nums text-czarny/65">{formatPLN(workshop.priceInCents)}</td>
                  <td className={`px-4 py-3 tabular-nums ${left <= 2 ? "text-czerwony" : "text-czarny/65"}`}>
                    {left} / {workshop.maxAttendees}
                  </td>
                  <td className="px-4 py-3">
                    <PublishBadge published={workshop.isPublished} />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/warsztaty/${workshop.id}`}
                      className="text-xs font-medium text-czerwony underline-offset-2 hover:underline"
                    >
                      Edytuj
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="border-t border-czarny/6 px-4 py-2.5 text-xs text-czarny/40">
          Rezerwacje w sesji: {runtimeStore.bookings.length}
        </div>
      </div>
    </div>
  );
}
