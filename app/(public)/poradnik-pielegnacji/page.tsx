import { SurfacePageIntro } from "@/components/layout/surface-page";
import { Container } from "@/components/ui/badge";
import { SurfaceTile, SurfaceTileBody, SurfaceTileHeader } from "@/components/ui/surface-tile";
import { getContentPage } from "@/lib/data/content-pages";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getContentPage("poradnik-pielegnacji");
  return pageMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    path: "/poradnik-pielegnacji",
  });
}

export default async function CarePage() {
  const page = await getContentPage("poradnik-pielegnacji");

  return (
    <div className="py-8 md:py-10">
      <Container className="max-w-3xl space-y-4 md:space-y-5">
        <SurfacePageIntro eyebrow={page.eyebrow} title={page.title} description={page.description} />
        {page.items.map((section) => (
          <SurfaceTile key={section.title}>
            <SurfaceTileHeader title={section.title} />
            <SurfaceTileBody>
              <p className="text-[15px] leading-relaxed text-czarny/70 md:text-base md:leading-[1.75]">
                {section.body}
              </p>
            </SurfaceTileBody>
          </SurfaceTile>
        ))}
      </Container>
    </div>
  );
}
