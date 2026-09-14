import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogBlocks } from "@/components/blog/blog-blocks";
import { JsonLd } from "@/components/seo/json-ld";
import { Container } from "@/components/ui/badge";
import { SITE } from "@/lib/constants";
import { getPostBySlug, getPublishedPosts } from "@/lib/data/queries";
import { breadcrumbJsonLd, noIndexRobots, pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site-url";
import type { Metadata } from "next";

function formatPostDate(iso: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Wpis", robots: noIndexRobots };
  return pageMetadata({
    title: post.title,
    description: post.excerpt || post.content.slice(0, 160),
    path: `/blog/${post.slug}`,
    image: post.coverImage,
    type: "article",
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const all = getPublishedPosts();
  const index = all.findIndex((item) => item.id === post.id);
  const previous = index >= 0 ? all[index + 1] : undefined;
  const next = index > 0 ? all[index - 1] : undefined;
  const blocks = post.blocks?.length
    ? post.blocks
    : [{ type: "paragraph" as const, text: post.content }];
  const categories = [
    ...new Set(all.map((item) => item.category).filter(Boolean) as string[]),
  ];

  return (
    <article className="py-12 md:py-16">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            image: post.coverImage ? [absoluteUrl(post.coverImage)] : undefined,
            datePublished: post.publishedAt,
            author: { "@type": "Person", name: post.author || SITE.owner },
            publisher: { "@type": "Organization", name: SITE.name, url: absoluteUrl("/") },
            mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
          },
          breadcrumbJsonLd([
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />
      <Container className="grid gap-10 rounded-2xl border border-szary bg-bialy px-5 py-8 md:px-8 md:py-10 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-12 lg:px-10">
        <div className="min-w-0 space-y-6">
          <p className="text-sm text-czerwony">
            {formatPostDate(post.publishedAt)}
            {post.author ? ` · ${post.author}` : null}
          </p>
          <h1 className="text-3xl font-medium leading-tight tracking-tight text-czarny md:text-4xl">
            {post.title}
          </h1>
          {post.subtitle ? (
            <p className="text-lg leading-relaxed text-czarny/75">{post.subtitle}</p>
          ) : null}

          <BlogBlocks blocks={blocks} />

          <div className="flex flex-wrap items-center justify-between gap-4 border-y border-czarny/10 py-5 text-sm text-ceglany">
            {previous ? (
              <Link href={`/blog/${previous.slug}`} className="hover:underline">
                ← Poprzedni wpis
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/blog/${next.slug}`} className="hover:underline">
                Następny wpis →
              </Link>
            ) : null}
          </div>
        </div>

        <aside className="space-y-8 border-t border-czarny/10 pt-8 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <div className="space-y-3">
            <p className="font-heading text-[11px] uppercase tracking-[0.16em] text-szary">Szukaj</p>
            <form action="/blog" className="flex gap-2">
              <input
                name="q"
                type="search"
                placeholder="Szukaj…"
                className="h-10 flex-1 rounded-none border border-czarny/15 px-3 text-sm outline-none focus:border-czerwony"
              />
              <button
                type="submit"
                className="h-10 bg-ceglany px-4 font-heading text-[10px] uppercase tracking-[0.14em] text-bialy"
              >
                Szukaj
              </button>
            </form>
          </div>

          <div className="space-y-3">
            <p className="font-heading text-sm uppercase tracking-[0.12em]">Ostatnie posty</p>
            <ul className="space-y-2 text-sm text-ceglany">
              {all.map((item) => (
                <li key={item.id}>
                  <Link href={`/blog/${item.slug}`} className="hover:underline">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <p className="font-heading text-sm uppercase tracking-[0.12em]">Ostatnie komentarze</p>
            <p className="text-sm text-czarny/50">Brak komentarzy do wyświetlenia.</p>
          </div>

          <div className="space-y-3">
            <p className="font-heading text-sm uppercase tracking-[0.12em]">Kategorie</p>
            <ul className="space-y-2 text-sm text-ceglany">
              {categories.map((category) => (
                <li key={category}>{category}</li>
              ))}
            </ul>
          </div>
        </aside>
      </Container>
    </article>
  );
}
