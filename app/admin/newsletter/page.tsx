import { Mail } from "lucide-react";
import { connection } from "next/server";
import { NewsletterExportButton } from "@/components/admin/newsletter-export-button";
import { AdminEmptyState } from "@/components/admin/ui/admin-empty-state";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { ensureAtelierHydrated } from "@/lib/data/atelier-persist";
import { listNewsletterSubscribers } from "@/lib/newsletter-subscribers";

export const dynamic = "force-dynamic";

function formatStamp(iso: string) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default async function AdminNewsletterPage() {
  await connection();
  await ensureAtelierHydrated({ force: true });
  const subscribers = listNewsletterSubscribers();

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        title="Newsletter"
        description="Adresy zapisane z formularza na stronie. Zgoda marketingowa jest wymagana przy zapisie."
        actions={
          subscribers.length > 0 ? (
            <NewsletterExportButton
              rows={subscribers.map((row) => ({ email: row.email, createdAt: row.createdAt }))}
            />
          ) : null
        }
      />
      {subscribers.length === 0 ? (
        <div className="rounded-xl border border-czarny/8 bg-bialy">
          <AdminEmptyState
            icon={Mail}
            title="Lista jest pusta"
            description="Gdy ktoś zapisze się na stronie, e-mail pojawi się tutaj."
          />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-czarny/8 bg-bialy">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-[0.12em] text-czarny/40">
              <tr>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Zapis</th>
                <th className="px-4 py-3">Źródło</th>
                <th className="px-4 py-3">Zgoda</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((row) => (
                <tr key={row.email} className="border-t border-czarny/6">
                  <td className="px-4 py-3">{row.email}</td>
                  <td className="px-4 py-3 text-czarny/55">{formatStamp(row.createdAt)}</td>
                  <td className="px-4 py-3 text-czarny/55">{row.source}</td>
                  <td className="px-4 py-3">{row.consentMarketing ? "Tak" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
