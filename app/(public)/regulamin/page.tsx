import Link from "next/link";
import { PlainLegalBody } from "@/components/legal/plain-legal-body";
import { Container, SectionHeading } from "@/components/ui/badge";
import { getContentPage } from "@/lib/data/content-pages";
import { privacySections, renderLegalBlocks } from "@/lib/legal/shop-terms";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getContentPage("regulamin");
  return pageMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    path: "/regulamin",
  });
}

export default async function RegulaminPage() {
  const page = await getContentPage("regulamin");

  return (
    <div className="py-16 md:py-24">
      <Container className="max-w-3xl space-y-12">
        <div className="space-y-4">
          <SectionHeading eyebrow={page.eyebrow} title={page.title} description={page.description} />
          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-czarny/55">
            <Link href="/polityka-prywatnosci" className="underline-offset-2 hover:text-czerwony hover:underline">
              Polityka prywatności
            </Link>
            <Link href="/dostawa-i-zwroty" className="underline-offset-2 hover:text-czerwony hover:underline">
              Dostawa i zwroty
            </Link>
          </nav>
        </div>

        {page.items.map((section, index) => {
          const anchor = /załącznik nr 1/i.test(section.title)
            ? "zalacznik-1"
            : `par-${section.title.match(/§(\d+)/)?.[1] ?? index + 1}`;
          return (
            <article
              key={`${section.title}-${index}`}
              id={anchor}
              className="scroll-mt-24 space-y-4 border-b border-czarny/8 pb-8"
            >
              <h2 className="font-heading text-base uppercase tracking-[0.08em] text-czarny">{section.title}</h2>
              <div className="space-y-4">
                <PlainLegalBody body={section.body} />
              </div>
            </article>
          );
        })}

        <section id="zalacznik-2" className="scroll-mt-24 space-y-6">
          <h2 className="font-heading text-base uppercase tracking-[0.08em] text-czarny">
            Załącznik nr 2 – Polityka prywatności
          </h2>
          <p className="text-sm leading-relaxed text-czarny/55">
            Pełna treść jest też dostępna pod adresem{" "}
            <Link href="/polityka-prywatnosci" className="text-czerwony underline-offset-2 hover:underline">
              /polityka-prywatnosci
            </Link>
            .
          </p>
          {privacySections.map((section) => (
            <article key={section.id} className="space-y-3">
              <h3 className="text-sm font-medium text-czarny">{section.title}</h3>
              <div className="space-y-3">{renderLegalBlocks(section.blocks)}</div>
            </article>
          ))}
        </section>
      </Container>
    </div>
  );
}
