import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogBlocks } from "@/components/blog/blog-blocks";
import { JsonLd } from "@/components/seo/json-ld";
import { Container } from "@/components/ui/badge";
import { SurfaceTile, SurfaceTileBody, SurfaceTileHeader } from "@/components/ui/surface-tile";
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
    ...new Set(
      all
        .map((item) => item.category)
        .filter((category): category is string => {
          if (!category?.trim()) return false;
          return category.trim().toLowerCase() !== "uncategorized";
        }),
    ),
  ];

  return (
    <article className="py-8 md:py-10">
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
      <Container className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-6">
        <SurfaceTile>
          <SurfaceTileBody className="space-y-6 sm:py-8">
            <p className="font-heading text-[11px] uppercase tracking-[0.16em] text-czerwony">
              {formatPostDate(post.publishedAt)}
              {post.author ? ` · ${post.author}` : null}
            </p>
            <h1 className="font-heading text-3xl uppercase leading-[1.15] tracking-[0.06em] text-czarny md:text-4xl">
              {post.title}
            </h1>
            {post.subtitle ? (
              <p className="text-lg leading-relaxed text-czarny/65">{post.subtitle}</p>
            ) : null}

            <BlogBlocks blocks={blocks} />

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-czarny/8 pt-5 text-sm">
              {previous ? (
                <Link href={`/blog/${previous.slug}`} className="text-czerwony hover:underline">
                  ← Poprzedni wpis
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link href={`/blog/${next.slug}`} className="text-czerwony hover:underline">
                  Następny wpis →
                </Link>
              ) : null}
            </div>
          </SurfaceTileBody>
        </SurfaceTile>

        <aside className="space-y-4 lg:space-y-5">
          <SurfaceTile>
            <SurfaceTileHeader eyebrow="Nawigacja" title="Szukaj" />
            <SurfaceTileBody>
              <form action="/blog" className="flex gap-2">
                <input
                  name="q"
                  type="search"
                  placeholder="Szukaj…"
                  className="h-10 min-w-0 flex-1 rounded-full border border-czarny/12 bg-krem/30 px-4 text-sm outline-none focus:border-czerwony"
                />
                <button
                  type="submit"
                  className="h-10 shrink-0 rounded-full bg-czerwony px-4 font-heading text-[10px] uppercase tracking-[0.14em] text-bialy"
                >
                  Szukaj
                </button>
              </form>
            </SurfaceTileBody>
          </SurfaceTile>

          <SurfaceTile>
            <SurfaceTileHeader eyebrow="Blog" title="Ostatnie posty" />
            <ul className="divide-y divide-czarny/8">
              {all.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/blog/${item.slug}`}
                    className="block px-5 py-3 text-[14px] text-czarny/75 transition-colors hover:bg-krem/40 hover:text-czerwony sm:px-7"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </SurfaceTile>

          <SurfaceTile>
            <SurfaceTileHeader eyebrow="Tematy" title="Kategorie" />
            <SurfaceTileBody>
              {categories.length === 0 ? (
                <p className="text-sm text-czarny/50">Brak kategorii.</p>
              ) : (
                <ul className="space-y-2 text-sm text-czarny/70">
                  {categories.map((category) => (
                    <li key={category}>{category}</li>
                  ))}
                </ul>
              )}
            </SurfaceTileBody>
          </SurfaceTile>
        </aside>
      </Container>
    </article>
  );
}
