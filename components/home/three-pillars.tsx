import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { Container, SectionHeading } from "@/components/ui/badge";

const basePillars = [
  {
    href: "/sklep?sklep=uzytkowa",
    title: "Ceramika użytkowa",
    copy: "Kubki, czarki, miski i drewno — naczynia na codzienny stół.",
    mark: "01",
  },
  {
    href: "/sklep?sklep=pracownia",
    title: "Dla pracowni",
    copy: "Formy matki i, wkrótce, narzędzia. Półka dla ceramików i atelier.",
    mark: "02",
  },
];

const workshopPillar = {
  href: "/warsztaty",
  title: "Warsztaty",
  copy: "Toczenie, szkliwienie i sesje herbaciane. Małe grupy, realne miejsca przy kole.",
  mark: "03",
};

const b2bPillar = {
  href: "/b2b",
  title: "B2B",
  copy: "Ceramika z logo i formy matki na zamówienie dla kawiarni, restauracji i hoteli.",
  mark: "03",
};

export function ThreePillars({ workshopsEnabled }: { workshopsEnabled: boolean }) {
  const pillars = [...basePillars, workshopsEnabled ? workshopPillar : b2bPillar];

  return (
    <section className="bg-bialy py-12 md:py-16">
      <Container className="space-y-8">
        <SectionHeading
          eyebrow="Filary atelier"
          title="Trzy praktyki, jeden rytm"
          description={
            workshopsEnabled
              ? "Sygnet pracowni to trzy wiatry przez otwarty dom: glina, drewno i spotkanie przy kole."
              : "Sygnet pracowni to trzy wiatry przez otwarty dom: glina, drewno i współpraca z lokalami."
          }
        />
        <div className="grid gap-3 md:grid-cols-3">
          {pillars.map((pillar, index) => (
            <Reveal key={pillar.title} delay={index * 0.06}>
              <Link
                href={pillar.href}
                className="group relative block overflow-hidden rounded-2xl border border-szary bg-krem p-6 transition-colors duration-300 hover:border-czerwony md:p-7"
              >
                <p className="font-heading text-[11px] uppercase tracking-[0.2em] text-ceglany">{pillar.mark}</p>
                <h3 className="mt-4 font-heading text-xl uppercase tracking-[0.08em] text-czarny">{pillar.title}</h3>
                <p className="mt-3 max-w-[32ch] text-base leading-relaxed text-czarny">{pillar.copy}</p>
                <span className="mt-5 inline-flex font-heading text-[11px] uppercase tracking-[0.16em] text-czerwony">
                  Zobacz →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
