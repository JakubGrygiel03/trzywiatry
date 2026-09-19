import { JsonLd } from "@/components/seo/json-ld";
import { SurfacePageIntro } from "@/components/layout/surface-page";
import { Container } from "@/components/ui/badge";
import { SurfaceTile } from "@/components/ui/surface-tile";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "FAQ",
  description:
    "Czas wysyłki, różnice w rękodziele, pielęgnacja drewna oraz zmiana terminu warsztatu — odpowiedzi pracowni Trzy Wiatry.",
  path: "/faq",
});

const faqs = [
  {
    q: "Jak długo czeka się na zamówienie?",
    a: "Produkty dostępne od ręki wysyłamy w 2–4 dni robocze. Jeśli coś robimy na zamówienie, zwykle trwa to 3–5 tygodni — naczynie musi przejść dwa wypały w piecu.",
  },
  {
    q: "Czy każdy kubek wygląda tak samo?",
    a: "Nie — to rękodzieło, więc każdy egzemplarz jest trochę inny. Pojemność podajemy w przybliżeniu (np. 80, 180, 250 ml); różnica kilku mililitrów jest normalna. Kolor i faktura szkliwa też mogą lekko odbiegać od zdjęcia.",
  },
  {
    q: "Czy drewniane produkty mogą pęknąć?",
    a: "Drewno reaguje na wilgoć i temperaturę w domu, więc przy złej pielęgnacji może pękać. Deski olejujemy, ale nie wkładaj ich do zmywarki i nie stawiaj przy kaloryferze ani na mokrym blacie.",
  },
  {
    q: "Czy mogę zmienić termin warsztatu?",
    a: "Tak — jeśli zgłosisz się najpóźniej 7 dni przed zajęciami, przeniesiemy Cię na inny wolny termin. Bilet jest imienny, więc nie da się go swobodnie przekazać innej osobie.",
  },
];

export default function FaqPage() {
  return (
    <div className="py-8 md:py-10">
      <Container className="max-w-3xl space-y-4 md:space-y-5">
        <SurfacePageIntro
          eyebrow="Pytania"
          title="FAQ"
          description="Krótko: kiedy wyślemy paczkę, czemu kubki różnią się od zdjęć i jak zmienić termin warsztatu."
        />
        <JsonLd
          data={[
            faqJsonLd(faqs),
            breadcrumbJsonLd([{ name: "FAQ", path: "/faq" }]),
          ]}
        />
        <SurfaceTile>
          <ul className="divide-y divide-czarny/8">
            {faqs.map((item) => (
              <li key={item.q} className="px-5 py-5 sm:px-7 sm:py-6">
                <h2 className="font-heading text-[15px] uppercase tracking-[0.1em] text-czarny">
                  {item.q}
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-czarny/70 md:text-base md:leading-[1.75]">
                  {item.a}
                </p>
              </li>
            ))}
          </ul>
        </SurfaceTile>
      </Container>
    </div>
  );
}
