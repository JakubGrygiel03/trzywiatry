import { Container, SectionHeading } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "FAQ" };

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
    <div className="py-16 md:py-24">
      <Container className="max-w-3xl space-y-10">
        <SectionHeading eyebrow="Pytania" title="FAQ" />
        {faqs.map((item) => (
          <article key={item.q} className="space-y-2 border-b border-czarny/8 pb-6">
            <h2 className="font-heading text-base uppercase tracking-[0.08em]">{item.q}</h2>
            <p className="leading-relaxed text-czarny/75">{item.a}</p>
          </article>
        ))}
      </Container>
    </div>
  );
}
