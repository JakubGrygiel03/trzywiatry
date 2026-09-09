import Link from "next/link";
import { ExternalLink, Plus, Newspaper } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/ui/admin-empty-state";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { PublishBadge } from "@/components/admin/ui/admin-status-badge";
import { getAllPosts } from "@/lib/data/queries";
import { formatDate } from "@/lib/format";

const STATUS_LABEL: Record<string, string> = {
  draft: "Szkic",
  published: "Opublikowany",
  archived: "Archiwum",
};

export default function AdminBlogPage() {
  const posts = [...getAllPosts()].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="Blog i poradniki"
        description="Edytuj gotowe wpisy blokami: tekst, nagłówki, zdjęcia, wzory i linki — jak w WordPressie."
        actions={
          <Link
            href="/admin/blog/nowy"
            className="inline-flex items-center gap-1.5 rounded-lg bg-czarny px-3.5 py-2 text-xs font-medium text-bialy transition hover:bg-czerwony"
          >
            <Plus className="h-3.5 w-3.5" />
            Nowy wpis
          </Link>
        }
      />

      {posts.length === 0 ? (
        <div className="rounded-xl border border-czarny/8 bg-bialy">
          <AdminEmptyState
            icon={Newspaper}
            title="Brak wpisów"
            description="Dodaj pierwszy artykuł — blok po bloku."
            action={
              <Link href="/admin/blog/nowy" className="text-xs font-medium text-czerwony underline-offset-2 hover:underline">
                Nowy wpis
              </Link>
            }
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-czarny/8 bg-bialy">
          <ul className="divide-y divide-czarny/5">
            {posts.map((post) => (
              <li key={post.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 text-sm hover:bg-krem/30">
                <div className="min-w-0">
                  <Link
                    href={`/admin/blog/${post.id}`}
                    className="font-medium text-czarny underline-offset-2 hover:text-czerwony hover:underline"
                  >
                    {post.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-czarny/40">
                    {formatDate(post.publishedAt)}
                    {post.category ? ` · ${post.category}` : ""}
                    {post.blocks?.length ? ` · ${post.blocks.length} bloków` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-md bg-krem px-2 py-0.5 text-[11px] font-medium text-czarny/55">
                    {STATUS_LABEL[post.status] ?? post.status}
                  </span>
                  {post.status === "published" ? (
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 text-xs text-czerwony underline-offset-2 hover:underline"
                      target="_blank"
                    >
                      Podgląd
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  ) : (
                    <PublishBadge published={false} />
                  )}
                  <Link
                    href={`/admin/blog/${post.id}`}
                    className="text-xs font-medium text-czerwony underline-offset-2 hover:underline"
                  >
                    Edytuj
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
