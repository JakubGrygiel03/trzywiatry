import Link from "next/link";
import { SurfacePageIntro } from "@/components/layout/surface-page";
import { WorkshopCard } from "@/components/workshops/workshop-card";
import { Container } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SurfaceTile, SurfaceTileBody } from "@/components/ui/surface-tile";
import { areWorkshopsEnabled, getWorkshops } from "@/lib/data/queries";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "Warsztaty",
  description: "Harmonogram sesji ceramicznych w pracowni Trzy Wiatry — toczenie, szkliwienie, herbata.",
  path: "/warsztaty",
});

export default function WorkshopsPage() {
  if (!areWorkshopsEnabled()) {
    return (
      <div className="py-8 md:py-10">
        <Container className="max-w-2xl space-y-4">
          <SurfacePageIntro
            eyebrow="Warsztaty"
            title="Na razie pauza przy kole"
            description="Aktualnie skupiamy się na ceramice i drewnie w sklepie. Gdy wrócą terminy warsztatów, włączymy tę sekcję z panelu — i damy znać na liście."
          />
          <SurfaceTile>
            <SurfaceTileBody>
              <Button asChild>
                <Link href="/sklep">Przejdź do sklepu</Link>
              </Button>
            </SurfaceTileBody>
          </SurfaceTile>
        </Container>
      </div>
    );
  }

  const workshops = getWorkshops();

  return (
    <div className="py-8 md:py-10">
      <Container className="space-y-4 md:space-y-5">
        <SurfacePageIntro
          eyebrow="Warsztaty"
          title="Miejsca przy kole"
          description="Małe grupy, glina na miejscu, wypał w piecu pracowni. Bilet cyfrowy po opłaceniu."
        />
        <div className="space-y-4">
          {workshops.map((workshop) => (
            <WorkshopCard key={workshop.id} workshop={workshop} />
          ))}
        </div>
      </Container>
    </div>
  );
}
