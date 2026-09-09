import Image from "next/image";
import Link from "next/link";
import { Container, SectionHeading } from "@/components/ui/badge";
import { getPublishedPosts } from "@/lib/data/queries";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Blog" };

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
    <div className="py-12 md:py-16">
      <Container className="space-y-10">
        <SectionHeading
          eyebrow="Z pracowni"
          title="Blog"
          description="Notatki o nazwie, glinie i rzeczach, które powstają powoli."
        />
        <div className="grid gap-8 md:grid-cols-2">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group space-y-4">
              <div className="relative aspect-[16/10] overflow-hidden bg-krem">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  sizes="50vw"
                />
              </div>
              <p className="font-heading text-[11px] uppercase tracking-[0.16em] text-szary">
                {formatPostDate(post.publishedAt)}
                {post.author ? ` · ${post.author}` : null}
              </p>
              <h2 className="font-heading text-2xl uppercase tracking-[0.08em]">{post.title}</h2>
              <p className="text-sm leading-relaxed text-czarny/65">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </Container>
    </div>
  );
}
