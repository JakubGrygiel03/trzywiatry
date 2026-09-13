import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentPageEditor } from "@/components/admin/content-pages/content-page-editor";
import { AdminAlert } from "@/components/admin/ui/admin-alert";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { CONTENT_PAGE_META, isContentPageKey } from "@/lib/cms/content-pages";
import { getContentPage } from "@/lib/data/content-pages";

export default async function AdminContentPageEditor({
  params,
  searchParams,
}: {
  params: Promise<{ key: string }>;
  searchParams: Promise<{ zapisano?: string; blad?: string }>;
}) {
  const { key } = await params;
  const { zapisano, blad } = await searchParams;
  if (!isContentPageKey(key)) notFound();

  const overlay = await getContentPage(key);
  const meta = CONTENT_PAGE_META[key];

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader
        title={meta.label}
        description={meta.hint}
        actions={
          <Link
            href={meta.href}
            target="_blank"
            className="rounded-lg border border-czarny/12 px-3.5 py-2 text-xs font-medium text-czarny transition hover:border-czerwony hover:text-czerwony"
          >
            Zobacz stronę
          </Link>
        }
      />
      {zapisano ? <AdminAlert variant="success">Zapisano. Odśwież sklep, żeby zobaczyć nową nakładkę.</AdminAlert> : null}
      {blad ? <AdminAlert variant="error">{blad}</AdminAlert> : null}
      <div className="mt-6">
        <ContentPageEditor pageKey={key} initial={overlay} />
      </div>
    </div>
  );
}
