import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/badge";
import { coverBackdropClass } from "@/lib/blog-cover";
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
    <div className="py-8 md:py-14">
      <Container className="space-y-8 md:space-y-12">
        <header className="max-w-2xl space-y-2 md:space-y-3">
          <p className="text-sm text-czerwony">Z pracowni</p>
          <h1 className="text-2xl font-medium tracking-tight text-czarny md:text-4xl">Blog</h1>
          <p className="text-base leading-relaxed text-czarny/75 md:text-lg">
            Notatki o nazwie, glinie i rzeczach, które powstają powoli.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-szary bg-bialy transition-colors hover:border-czerwony"
            >
              <div
                className={`relative h-44 w-full overflow-hidden sm:h-52 lg:h-auto lg:aspect-[16/10] ${coverBackdropClass(post.coverBackdrop)}`}
              >
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-contain p-3 transition-transform duration-700 group-hover:scale-[1.02] sm:p-4"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div className="min-w-0 space-y-2 p-5 md:p-6">
                <p className="text-sm text-czerwony">
                  {formatPostDate(post.publishedAt)}
                  {post.author ? ` · ${post.author}` : null}
                </p>
                <h2 className="text-lg font-medium leading-snug tracking-tight text-czarny transition-colors group-hover:text-czerwony md:text-2xl">
                  {post.title}
                </h2>
                <p className="text-[15px] leading-[1.65] text-czarny/80 md:text-base md:leading-[1.7]">
                  {post.excerpt}
                </p>
                <span className="inline-block pt-0.5 text-sm text-czerwony">Czytaj dalej →</span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </div>
  );
}
