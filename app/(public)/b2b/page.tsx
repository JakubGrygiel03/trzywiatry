import { B2BForm } from "@/components/b2b/b2b-form";
import { Container, SectionHeading } from "@/components/ui/badge";
import { AtelierFrame } from "@/components/visual/atelier-frame";
import { getContentPage } from "@/lib/data/content-pages";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getContentPage("b2b");
  return { title: page.metaTitle, description: page.metaDescription };
}

export default async function B2BPage() {
  const page = await getContentPage("b2b");

  return (
    <div className="pt-8 pb-16 md:pt-10 md:pb-20">
      <Container className="grid items-start gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-8">
          <SectionHeading
            eyebrow={page.eyebrow}
            title={page.title}
            description={page.description}
            descriptionEn={page.descriptionEn}
          />
          <AtelierFrame
            kind="set"
            glaze="dust"
            className="hidden aspect-[4/3] min-h-[16rem] lg:block"
            caption={page.frameCaption || "B2B"}
          />
        </div>
        <div className="rounded-3xl border border-czarny/8 bg-bialy p-6 md:p-8 lg:p-10">
          <B2BForm intro={page.formIntro} />
        </div>
      </Container>
    </div>
  );
}
