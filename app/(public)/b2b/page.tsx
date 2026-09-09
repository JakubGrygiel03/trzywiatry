import { B2BForm } from "@/components/b2b/b2b-form";
import { Container, SectionHeading } from "@/components/ui/badge";
import { AtelierFrame } from "@/components/visual/atelier-frame";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "B2B",
  description: "Ceramika na zamówienie dla kawiarni, restauracji i hoteli — logo, formy matki, wolumeny.",
};

export default function B2BPage() {
  return (
    <div className="py-16 md:py-24">
      <Container className="grid items-start gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-8">
          <SectionHeading
            eyebrow="Strefa B2B"
            title="Ceramika dla lokali"
            description="Kubki z logo, powtarzalne profile z form matki, zestawy śniadaniowe. Od próbek po nakłady sezonowe."
          />
          <AtelierFrame kind="set" glaze="dust" className="hidden aspect-[4/3] min-h-[16rem] lg:block" caption="B2B" />
        </div>
        <B2BForm />
      </Container>
    </div>
  );
}
