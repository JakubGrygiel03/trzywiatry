import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/badge";
import { SurfaceTile, SurfaceTileBody } from "@/components/ui/surface-tile";
import { searchPublishedPosts } from "@/lib/data/queries";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description: "Zapiski z pracowni Trzy Wiatry: szkliwa, wypały, warsztaty i dbanie o ceramikę.",
  path: "/blog",
});

function formatPostDate(iso: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const posts = searchPublishedPosts(query);

  return (
    <div className="py-8 md:py-10">
      <Container className="space-y-5 md:space-y-6">
        <SurfaceTile>
          <SurfaceTileBody className="sm:py-7">
            <p className="font-heading text-[11px] uppercase tracking-[0.22em] text-czerwony">
              Z pracowni
            </p>
            <h1 className="mt-2 font-heading text-3xl uppercase leading-[1.15] tracking-[0.06em] text-czarny md:text-4xl">
              Blog
            </h1>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-czarny/60">
              Notatki o nazwie, glinie i rzeczach, które powstają powoli.
            </p>
            <form action="/blog" className="mt-5 flex max-w-md gap-2">
              <input
                name="q"
                type="search"
                defaultValue={query}
                placeholder="Szukaj we wpisach…"
                className="h-10 min-w-0 flex-1 rounded-full border border-czarny/12 bg-krem/30 px-4 text-sm outline-none focus:border-czerwony"
              />
              <button
                type="submit"
                className="h-10 shrink-0 rounded-full bg-czerwony px-4 font-heading text-[10px] uppercase tracking-[0.14em] text-bialy"
              >
                Szukaj
              </button>
            </form>
            {query ? (
              <p className="mt-3 text-sm text-czarny/50">
                {posts.length === 0
                  ? `Nic nie pasuje do „${query}”.`
                  : `Znaleziono ${posts.length} ${posts.length === 1 ? "wpis" : "wpisów"} dla „${query}”.`}
              </p>
            ) : null}
          </SurfaceTileBody>
        </SurfaceTile>

        {posts.length === 0 ? (
          <p className="text-sm text-czarny/50">Spróbuj innego hasła albo wróć do pełnej listy.</p>
        ) : (
        <div className="grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-2">
          {posts.map((post, index) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group block min-w-0">
              <SurfaceTile className="h-full transition-colors group-hover:border-czerwony/35">
                <div className="relative h-44 w-full overflow-hidden border-b border-czarny/8 bg-bialy sm:h-52 lg:h-auto lg:aspect-[16/10]">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    quality={75}
                    priority={index === 0}
                    className="object-contain p-3 transition-transform duration-700 group-hover:scale-[1.02] sm:p-4"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                <SurfaceTileBody className="space-y-2">
                  <p className="font-heading text-[11px] uppercase tracking-[0.16em] text-czerwony">
                    {formatPostDate(post.publishedAt)}
                    {post.author ? ` · ${post.author}` : null}
                  </p>
                  <h2 className="font-heading text-xl uppercase leading-snug tracking-[0.06em] text-czarny transition-colors group-hover:text-czerwony md:text-2xl">
                    {post.title}
                  </h2>
                  <p className="text-[15px] leading-relaxed text-czarny/70">{post.excerpt}</p>
                  <span className="inline-block pt-1 font-heading text-[11px] uppercase tracking-[0.16em] text-czerwony">
                    Czytaj dalej →
                  </span>
                </SurfaceTileBody>
              </SurfaceTile>
            </Link>
          ))}
        </div>
        )}
      </Container>
    </div>
  );
}
