import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { deleteBlogPost, updateBlogPost } from "@/app/actions/admin-blog";
import { BlogPostForm } from "@/components/admin/blog-post-form";
import { AdminAlert } from "@/components/admin/ui/admin-alert";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { getPostById } from "@/lib/data/queries";

export default async function EditBlogPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ zapisano?: string; blad?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const post = getPostById(id);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title={post.title}
        description={`Edycja wpisu · /blog/${post.slug}`}
        actions={
          <div className="flex flex-wrap gap-2">
            {post.status === "published" ? (
              <Link
                href={`/blog/${post.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-lg border border-czarny/12 bg-bialy px-3.5 py-2 text-xs font-medium text-czarny transition hover:border-czerwony/30"
              >
                Podgląd
                <ExternalLink className="h-3 w-3" />
              </Link>
            ) : null}
            <Link
              href="/admin/blog"
              className="rounded-lg border border-czarny/12 bg-bialy px-3.5 py-2 text-xs font-medium text-czarny transition hover:border-czerwony/30"
            >
              ← Lista
            </Link>
          </div>
        }
      />

      {query.zapisano ? <AdminAlert variant="success">Zapisano. Blog odświeżony.</AdminAlert> : null}
      {query.blad ? <AdminAlert variant="error">{decodeURIComponent(query.blad)}</AdminAlert> : null}

      <div className="mt-6 space-y-6">
        <BlogPostForm action={updateBlogPost} post={post} submitLabel="Zapisz zmiany" />

        <form action={deleteBlogPost} className="rounded-xl border border-czerwony/20 bg-bialy p-4">
          <input type="hidden" name="id" value={post.id} />
          <p className="text-sm font-medium text-czarny">Usuń wpis</p>
          <p className="mt-1 text-xs text-czarny/50">
            Możesz też zmienić status na „Szkic” lub „Archiwum”, żeby ukryć wpis bez usuwania.
          </p>
          <button
            type="submit"
            className="mt-3 rounded-lg border border-czerwony/30 px-3.5 py-2 text-xs font-medium text-czerwony transition hover:bg-czerwony/5"
          >
            Usuń wpis
          </button>
        </form>
      </div>
    </div>
  );
}
