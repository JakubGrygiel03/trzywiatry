import { B2BForm } from "@/components/b2b/b2b-form";
import { SurfacePageIntro } from "@/components/layout/surface-page";
import { Container } from "@/components/ui/badge";
import { SurfaceTile, SurfaceTileBody, SurfaceTileHeader } from "@/components/ui/surface-tile";
import { AtelierFrame } from "@/components/visual/atelier-frame";
import { getContentPage } from "@/lib/data/content-pages";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getContentPage("b2b");
  return pageMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    path: "/b2b",
  });
}

export default async function B2BPage() {
  const page = await getContentPage("b2b");

  return (
    <div className="py-8 md:py-10">
      <Container className="grid items-start gap-4 md:gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:gap-6">
        <div className="space-y-4 md:space-y-5">
          <SurfacePageIntro
            eyebrow={page.eyebrow}
            title={page.title}
            description={page.description}
            descriptionEn={page.descriptionEn}
          />
          <SurfaceTile className="hidden lg:block">
            <AtelierFrame
              kind="set"
              glaze="dust"
              className="aspect-[4/3] min-h-[16rem] rounded-none border-0"
              caption={page.frameCaption || "B2B"}
            />
          </SurfaceTile>
        </div>
        <SurfaceTile>
          <SurfaceTileHeader eyebrow="Zapytanie" title="Formularz B2B" />
          <SurfaceTileBody>
            <B2BForm intro={page.formIntro} />
          </SurfaceTileBody>
        </SurfaceTile>
      </Container>
    </div>
  );
}
