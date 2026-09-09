import { Container, SectionHeading } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jak dbać o ceramikę",
  description: "Pielęgnacja ceramiki Trzy Wiatry: zmywarka, szok termiczny, formy gipsowe.",
};

const sections = [
  {
    title: "Zmywarka",
    body: "Większość szkliwionych naczyń znosi delikatny program. Unikaj tabletek z wybielaczem przy matowych szkliwach Dust i Raw Clay — one lubią mycie ręczne.",
  },
  {
    title: "Szok termiczny",
    body: "Nie wstawiaj gorącego naczynia do zimnej wody i nie lej wrzątku do czarki wyjętej z lodówki. Glina i szkliwo rozszerzają się w różnym tempie.",
  },
  {
    title: "Formy matki gipsowe",
    body: "Po odlewie osusz formę w przewiewie, nigdy na kaloryferze. Gips pęka od uderzenia i od gwałtownego suszenia. Przechowuj w suchym miejscu, stopkami do siebie.",
  },
  {
    title: "Drewno",
    body: "Deski olejujemy olejem lnianym. Zmywarka ich nie lubi. Po myciu stań deskę na krawędzi — niech oddycha.",
  },
];

export default function CarePage() {
  return (
    <div className="py-14 md:py-20">
      <Container className="max-w-3xl space-y-10">
        <SectionHeading
          eyebrow="Poradnik"
          title="Jak dbać o ceramikę"
          description="Rękodzieło ma tolerancję wymiarową i własny charakter szkliwa. Poniżej zasady, które przedłużają życie naczynia."
        />
        {sections.map((section) => (
          <article key={section.title} className="space-y-2">
            <h2 className="font-heading text-lg uppercase tracking-[0.1em]">{section.title}</h2>
            <p className="leading-relaxed text-czarny/75">{section.body}</p>
          </article>
        ))}
      </Container>
    </div>
  );
}
