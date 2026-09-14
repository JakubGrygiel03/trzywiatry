import Image from "next/image";
import { WorksGallery } from "@/components/about/works-gallery";
import { SurfacePageIntro } from "@/components/layout/surface-page";
import { Container } from "@/components/ui/badge";
import { SurfaceTile, SurfaceTileBody, SurfaceTileHeader } from "@/components/ui/surface-tile";
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
    <div className="py-8 md:py-10">
      <Container className="space-y-4 md:space-y-5">
        <SurfacePageIntro title={page.title} />

        <div className="grid items-stretch gap-4 md:grid-cols-2 md:gap-5">
          <SurfaceTile className="overflow-hidden p-0">
            <div className="relative aspect-[3/4] w-full">
              <Image
                src={page.imageSrc}
                alt={page.imageAlt}
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          </SurfaceTile>

          <SurfaceTile>
            <SurfaceTileHeader title={page.heading} />
            <SurfaceTileBody className="space-y-4 text-[15px] leading-relaxed text-czarny/75 md:text-base md:leading-[1.75]">
              {page.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </SurfaceTileBody>
          </SurfaceTile>
        </div>

        <SurfaceTile>
          <SurfaceTileHeader title={page.galleryTitle} />
          <SurfaceTileBody>
            <WorksGallery works={aboutGalleryWorks} />
          </SurfaceTileBody>
        </SurfaceTile>
      </Container>
    </div>
  );
}
