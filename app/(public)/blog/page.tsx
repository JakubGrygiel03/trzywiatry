import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/badge";
import { SurfaceTile, SurfaceTileBody } from "@/components/ui/surface-tile";
import { getPublishedPosts } from "@/lib/data/queries";
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

export default function BlogPage() {
  const posts = getPublishedPosts();

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
          </SurfaceTileBody>
        </SurfaceTile>

        <div className="grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-2">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group block min-w-0">
              <SurfaceTile className="h-full transition-colors group-hover:border-czerwony/35">
                <div className="relative h-44 w-full overflow-hidden border-b border-czarny/8 bg-bialy sm:h-52 lg:h-auto lg:aspect-[16/10]">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
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
      </Container>
    </div>
  );
}
