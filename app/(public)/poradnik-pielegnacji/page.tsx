import { SurfacePageIntro } from "@/components/layout/surface-page";
import { Container } from "@/components/ui/badge";
import { SurfaceTile, SurfaceTileBody, SurfaceTileHeader } from "@/components/ui/surface-tile";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "Jak dbać o ceramikę",
  description: "Pielęgnacja ceramiki Trzy Wiatry: zmywarka, szok termiczny, formy gipsowe.",
  path: "/poradnik-pielegnacji",
});

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
    <div className="py-8 md:py-10">
      <Container className="max-w-3xl space-y-4 md:space-y-5">
        <SurfacePageIntro
          eyebrow="Poradnik"
          title="Jak dbać o ceramikę"
          description="Rękodzieło ma tolerancję wymiarową i własny charakter szkliwa. Poniżej zasady, które przedłużają życie naczynia."
        />
        {sections.map((section) => (
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
