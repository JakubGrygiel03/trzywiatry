import { Mail } from "lucide-react";
import { connection } from "next/server";
import { NewsletterBroadcastForm } from "@/components/admin/newsletter-broadcast-form";
import { NewsletterDiscountForm } from "@/components/admin/newsletter-discount-form";
import { NewsletterExportButton } from "@/components/admin/newsletter-export-button";
import { NewsletterSubscriberRow } from "@/components/admin/newsletter-subscriber-row";
import { AdminAlert } from "@/components/admin/ui/admin-alert";
import { AdminEmptyState } from "@/components/admin/ui/admin-empty-state";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { ensureAtelierHydrated } from "@/lib/data/atelier-persist";
import { getSettings } from "@/lib/data/queries";
import { formatNewsletterDiscount } from "@/lib/discount";
import { listConsentingNewsletterSubscribers, listNewsletterSubscribers } from "@/lib/newsletter-subscribers";

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

export default async function AdminNewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ usunieto?: string; wyslano?: string; blad?: string; rabat?: string }>;
}) {
  await connection();
  await ensureAtelierHydrated({ force: true });
  const subscribers = listNewsletterSubscribers();
  const consentingCount = listConsentingNewsletterSubscribers().length;
  const settings = getSettings();
  const { usunieto, wyslano, blad, rabat } = await searchParams;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <AdminPageHeader
        title="Newsletter"
        description={`Edytujesz literówkę, odhaczasz zgodę albo piszesz list. Kod z zapisu to teraz ${formatNewsletterDiscount(settings.newsletterDiscountPercent)}.`}
        actions={
          subscribers.length > 0 ? (
            <NewsletterExportButton
              rows={subscribers.map((row) => ({ email: row.email, createdAt: row.createdAt }))}
            />
          ) : null
        }
      />

      {usunieto ? (
        <AdminAlert variant="success">Adres zniknął z listy. Nie dostanie kolejnych wysyłek.</AdminAlert>
      ) : null}
      {wyslano ? (
        <AdminAlert variant="success">
          Wysłano {wyslano} {wyslano === "1" ? "wiadomość" : "wiadomości"}.
        </AdminAlert>
      ) : null}
      {rabat ? (
        <AdminAlert variant="success">
          Zapisano rabat {formatNewsletterDiscount(settings.newsletterDiscountPercent)}. Nowe kody i kasa biorą tę stawkę.
        </AdminAlert>
      ) : null}
      {blad ? <AdminAlert variant="error">{blad}</AdminAlert> : null}

      <NewsletterDiscountForm percent={settings.newsletterDiscountPercent} />

      {subscribers.length > 0 ? (
        <NewsletterBroadcastForm
          consentingCount={consentingCount}
          skippedCount={subscribers.length - consentingCount}
        />
      ) : null}

      {subscribers.length === 0 ? (
        <div className="rounded-xl border border-czarny/8 bg-bialy">
          <AdminEmptyState
            icon={Mail}
            title="Lista jest pusta"
            description="Gdy ktoś zapisze się na stronie ze zgodą, e-mail pojawi się tutaj."
          />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-czarny/8 bg-bialy">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-[0.12em] text-czarny/40">
              <tr>
                <th className="px-4 py-3">E-mail, zgoda i akcje</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((row) => (
                <NewsletterSubscriberRow key={row.email} row={row} stamp={formatStamp(row.createdAt)} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
