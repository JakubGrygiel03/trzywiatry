import Link from "next/link";
import { HomeSection } from "@/components/home/home-section";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/badge";
import { defaultPillarsPayload, type PillarsPayload } from "@/lib/cms/home-layout";

export function ThreePillars({
  workshopsEnabled,
  payload = defaultPillarsPayload(),
}: {
  workshopsEnabled: boolean;
  payload?: PillarsPayload;
}) {
  const pillars = [...payload.cards, workshopsEnabled ? payload.workshopCard : payload.b2bCard];

  return (
    <HomeSection>
      <SectionHeading
        eyebrow={payload.eyebrow}
        title={payload.title}
        description={workshopsEnabled ? payload.description : payload.descriptionNoWorkshops}
      />
      <div className="grid gap-3 md:grid-cols-3">
        {pillars.map((pillar, index) => (
          <Reveal key={`${pillar.title}-${pillar.href}`} delay={index * 0.06}>
            <Link
              href={pillar.href}
              className="group relative block overflow-hidden rounded-2xl border border-czarny/12 bg-krem p-6 transition-colors duration-300 hover:border-czerwony hover:bg-krem-ciemny/50 md:p-7"
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
    </HomeSection>
  );
}
