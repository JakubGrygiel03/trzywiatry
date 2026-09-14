import { ContactDirect } from "@/components/contact/contact-direct";
import { ContactForm } from "@/components/contact/contact-form";
import { SurfacePageIntro } from "@/components/layout/surface-page";
import { Container } from "@/components/ui/badge";
import { SurfaceTile, SurfaceTileBody, SurfaceTileHeader } from "@/components/ui/surface-tile";
import { getContentPage } from "@/lib/data/content-pages";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getContentPage("kontakt");
  return pageMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    path: "/kontakt",
  });
}

export default async function ContactPage() {
  const page = await getContentPage("kontakt");

  return (
    <div className="py-8 md:py-10">
      <Container className="space-y-4 md:space-y-5">
        <SurfacePageIntro
          title={page.title}
          description={page.subtitle}
          descriptionEn={page.subtitleEn}
        />

        <div className="grid gap-4 md:gap-5 lg:grid-cols-2">
          <SurfaceTile>
            <SurfaceTileHeader eyebrow="Formularz" title={page.formHeading} />
            <SurfaceTileBody>
              <ContactForm intro={page.formIntro} />
            </SurfaceTileBody>
          </SurfaceTile>
          <SurfaceTile>
            <SurfaceTileHeader eyebrow="Bezpośrednio" title={page.directHeading} />
            <SurfaceTileBody>
              <ContactDirect />
            </SurfaceTileBody>
          </SurfaceTile>
        </div>
      </Container>
    </div>
  );
}
