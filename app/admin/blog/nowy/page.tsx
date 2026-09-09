import Link from "next/link";
import { createBlogPost } from "@/app/actions/admin-blog";
import { BlogPostForm } from "@/components/admin/blog-post-form";
import { AdminAlert } from "@/components/admin/ui/admin-alert";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";

export default async function NewBlogPostPage({
  searchParams,
}: {
  searchParams: Promise<{ blad?: string }>;
}) {
  const { blad } = await searchParams;

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="Nowy wpis"
        description="Dodawaj bloki treści w dowolnej kolejności."
        actions={
          <Link
            href="/admin/blog"
            className="rounded-lg border border-czarny/12 bg-bialy px-3.5 py-2 text-xs font-medium text-czarny transition hover:border-czerwony/30"
          >
            ← Lista wpisów
          </Link>
        }
      />

      {blad ? <AdminAlert variant="error">{decodeURIComponent(blad)}</AdminAlert> : null}

      <div className="mt-6">
        <BlogPostForm action={createBlogPost} submitLabel="Opublikuj / zapisz" />
      </div>
    </div>
  );
}
