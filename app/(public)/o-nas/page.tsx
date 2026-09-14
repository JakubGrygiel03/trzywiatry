import Image from "next/image";
import { WorksGallery } from "@/components/about/works-gallery";
import { Container } from "@/components/ui/badge";
import { getContentPage } from "@/lib/data/content-pages";
import { aboutGalleryWorks } from "@/lib/data/gallery";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getContentPage("o-nas");
  return pageMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    path: "/o-nas",
    image: page.imageSrc,
  });
}

export default async function AboutPage() {
  const page = await getContentPage("o-nas");

  return (
    <div className="pb-16 md:pb-20">
      <Container className="space-y-10 py-12 md:space-y-12 md:py-16">
        <h1 className="text-center font-heading text-3xl uppercase tracking-[0.1em] text-czerwony md:text-4xl lg:text-5xl">
          {page.title}
        </h1>

        <div className="grid items-start gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-krem-ciemny">
            <Image
              src={page.imageSrc}
              alt={page.imageAlt}
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>

          <div className="space-y-6 md:pt-2">
            <h2 className="font-heading text-xl uppercase tracking-[0.14em] text-czarny md:text-2xl">
              {page.heading}
            </h2>
            <div className="space-y-5 text-base leading-relaxed text-czarny/80 md:text-[17px] md:leading-[1.75]">
              {page.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </Container>

      <section className="border-t border-szary bg-bialy py-12 md:py-16">
        <Container className="space-y-8">
          <h2 className="text-center font-heading text-2xl uppercase tracking-[0.12em] text-czerwony md:text-3xl">
            {page.galleryTitle}
          </h2>
          <WorksGallery works={aboutGalleryWorks} />
        </Container>
      </section>
    </div>
  );
}
