import Link from "next/link";
import { WorkshopCard } from "@/components/workshops/workshop-card";
import { Container, SectionHeading } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { areWorkshopsEnabled, getWorkshops } from "@/lib/data/queries";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Warsztaty",
  description: "Harmonogram sesji ceramicznych w pracowni Trzy Wiatry — toczenie, szkliwienie, herbata.",
};

export default function WorkshopsPage() {
  if (!areWorkshopsEnabled()) {
    return (
      <div className="py-16 md:py-24">
        <Container className="max-w-2xl space-y-6">
          <SectionHeading
            eyebrow="Warsztaty"
            title="Na razie pauza przy kole"
            description="Aktualnie skupiamy się na ceramice i drewnie w sklepie. Gdy wrócą terminy warsztatów, włączymy tę sekcję z panelu — i damy znać na liście."
          />
          <Button asChild>
            <Link href="/sklep">Przejdź do sklepu</Link>
          </Button>
        </Container>
      </div>
    );
  }

  const workshops = getWorkshops();

  return (
    <div className="py-16 md:py-24">
      <Container className="space-y-14">
        <SectionHeading
          eyebrow="Warsztaty"
          title="Miejsca przy kole"
          description="Małe grupy, glina na miejscu, wypał w piecu pracowni. Bilet cyfrowy po opłaceniu."
        />
        <div className="space-y-8">
          {workshops.map((workshop) => (
            <WorkshopCard key={workshop.id} workshop={workshop} />
          ))}
        </div>
      </Container>
    </div>
  );
}
