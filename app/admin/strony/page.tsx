import Link from "next/link";
import { AdminAlert } from "@/components/admin/ui/admin-alert";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { CONTENT_PAGE_KEYS, CONTENT_PAGE_META } from "@/lib/cms/content-pages";

export default async function AdminContentPagesHub({
  searchParams,
}: {
  searchParams: Promise<{ blad?: string }>;
}) {
  const { blad } = await searchParams;

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader
        title="Strony"
        description="Nakładki B2B, O nas i Kontakt — te same teksty, które widzi klient. Formularze zostają w kodzie."
      />
      {blad ? <AdminAlert variant="error">{blad}</AdminAlert> : null}
      <ul className="grid gap-4 md:grid-cols-3">
        {CONTENT_PAGE_KEYS.map((key) => {
          const meta = CONTENT_PAGE_META[key];
          return (
            <li key={key}>
              <Link
                href={meta.adminHref}
                className="block rounded-xl border border-czarny/10 bg-bialy p-5 transition hover:border-czerwony"
              >
                <p className="font-heading text-sm uppercase tracking-[0.12em] text-czerwony">{meta.label}</p>
                <p className="mt-2 text-sm leading-relaxed text-czarny/60">{meta.hint}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
