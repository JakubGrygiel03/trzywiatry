import { GlazeNavigateLink } from "@/components/home/glaze-navigate-link";
import { HomeSection } from "@/components/home/home-section";
import { SectionHeading } from "@/components/ui/badge";
import { defaultGlazeLines, type GlazePayload } from "@/lib/cms/home-layout";
import { GlazeSwatch } from "@/components/visual/glaze-swatch";

export function GlazeLines({ payload }: { payload: GlazePayload }) {
  const lines = payload.lines?.length ? payload.lines : defaultGlazeLines();

  return (
    <HomeSection>
      <SectionHeading eyebrow={payload.eyebrow} title={payload.title} description={payload.description} />
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        {lines.map((line) => (
          <GlazeNavigateLink key={line.id} href={line.href} className="group space-y-2">
            <GlazeSwatch glaze={line.swatch} className="aspect-[4/5] rounded-xl" />
            <p className="px-1 font-heading text-[11px] uppercase tracking-[0.16em] text-czerwony">{line.name}</p>
            <p className="px-1 text-base leading-relaxed text-czarny/80">{line.description}</p>
          </GlazeNavigateLink>
        ))}
      </div>
    </HomeSection>
  );
}
