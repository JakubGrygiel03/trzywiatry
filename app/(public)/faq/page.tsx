import { JsonLd } from "@/components/seo/json-ld";
import { SurfacePageIntro } from "@/components/layout/surface-page";
import { Container } from "@/components/ui/badge";
import { SurfaceTile } from "@/components/ui/surface-tile";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "FAQ",
  description:
    "Czas realizacji, tolerancja rękodzieła, pielęgnacja drewna i gliny, bilety na warsztaty — pytania do pracowni Trzy Wiatry.",
  path: "/faq",
});

const faqs = [
  {
    q: "Ile czeka się na zamówienie?",
    a: "To, co jest na stanie, pakujemy w 2–4 dni robocze. Naczynia na zamówienie — zwykle 3–5 tygodni, bo czekają na dwa ognie.",
  },
  {
    q: "Czy kubki są identyczne?",
    a: "Nie. Rękodzieło ma tolerancję pojemności i szkliwa. Podajemy pojemność nominalną (80, 180, 250 ml) — odchyłka kilku mililitrów to ślad toczenia, nie wada.",
  },
  {
    q: "Czy drewno pęka?",
    a: "Drewno pracuje z wilgocią w domu. Olejujemy deski, ale trzymaj je z dala od zmywarki i kaloryfera.",
  },
  {
    q: "Czy mogę oddać warsztat?",
    a: "Do 7 dni przed terminem przeniesiemy Cię na inny wolny slot. Bilet jest imienny.",
  },
];

export default function FaqPage() {
  return (
    <div className="py-8 md:py-10">
      <Container className="max-w-3xl space-y-4 md:space-y-5">
        <SurfacePageIntro
          eyebrow="Pytania"
          title="FAQ"
          description="Najczęstsze pytania o czas realizacji, rękodzieło i warsztaty."
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
