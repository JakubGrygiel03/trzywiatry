import Link from "next/link";
import { Mail } from "lucide-react";
import { AdminAlert } from "@/components/admin/ui/admin-alert";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { getEmailTemplate } from "@/lib/data/email-templates";
import { EMAIL_TEMPLATE_LIST } from "@/lib/email/catalog";

export default async function AdminEmailsPage({
  searchParams,
}: {
  searchParams: Promise<{ blad?: string }>;
}) {
  const { blad } = await searchParams;

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader
        title="E-maile do klientów"
        description="Szablony wychodzące automatycznie: zamówienia, newsletter, warsztat i reset hasła. Placeholdery w nawiasach klamrowych podstawiają się przy wysyłce."
      />

      {blad ? <AdminAlert>Nie udało się zapisać szablonu. Sprawdź temat i treść.</AdminAlert> : null}

      <div className="overflow-hidden rounded-xl border border-czarny/8 bg-bialy">
        <ul className="divide-y divide-czarny/5">
          {EMAIL_TEMPLATE_LIST.map((item) => {
            const draft = getEmailTemplate(item.key);
            return (
              <li key={item.key} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3.5 hover:bg-krem/30">
                <div className="min-w-0">
                  <Link
                    href={`/admin/emaile/${item.key}`}
                    className="font-medium text-czarny underline-offset-2 hover:text-czerwony hover:underline"
                  >
                    {item.label}
                  </Link>
                  <p className="mt-0.5 text-xs text-czarny/40">{item.trigger}</p>
                  <p className="mt-1 truncate font-heading text-[11px] uppercase tracking-[0.08em] text-czarny/35">
                    {draft.subject}
                  </p>
                </div>
                <Link
                  href={`/admin/emaile/${item.key}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-czerwony underline-offset-2 hover:underline"
                >
                  <Mail className="h-3 w-3" />
                  Edytuj
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
