import { JsonLd } from "@/components/seo/json-ld";
import { SurfacePageIntro } from "@/components/layout/surface-page";
import { Container } from "@/components/ui/badge";
import { SurfaceTile } from "@/components/ui/surface-tile";
import { getContentPage } from "@/lib/data/content-pages";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getContentPage("faq");
  return pageMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    path: "/faq",
  });
}

export default async function FaqPage() {
  const page = await getContentPage("faq");
  const faqs = page.items.map((item) => ({ q: item.title, a: item.body }));

  return (
    <div className="py-8 md:py-10">
      <Container className="max-w-3xl space-y-4 md:space-y-5">
        <SurfacePageIntro eyebrow={page.eyebrow} title={page.title} description={page.description} />
        <JsonLd data={[faqJsonLd(faqs), breadcrumbJsonLd([{ name: "FAQ", path: "/faq" }])]} />
        <SurfaceTile>
          <ul className="divide-y divide-czarny/8">
            {faqs.map((item) => (
              <li key={item.q} className="px-5 py-5 sm:px-7 sm:py-6">
                <h2 className="font-heading text-[15px] uppercase tracking-[0.1em] text-czarny">{item.q}</h2>
                <p className="mt-2 text-[15px] leading-relaxed text-czarny/70 md:text-base md:leading-[1.75]">
                  {item.a}
                </p>
              </li>
            ))}
          </ul>
        </SurfaceTile>
      </Container>
    </div>
  );
}
