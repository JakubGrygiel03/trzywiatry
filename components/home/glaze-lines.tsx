import Link from "next/link";
import { Container, SectionHeading } from "@/components/ui/badge";
import { defaultGlazeLines, type GlazePayload } from "@/lib/cms/home-layout";
import { GlazeSwatch } from "@/components/visual/glaze-swatch";

export function GlazeLines({ payload }: { payload: GlazePayload }) {
  const lines = payload.lines?.length ? payload.lines : defaultGlazeLines();

  return (
    <section className="bg-bialy py-12 md:py-16">
      <Container className="space-y-8">
        <SectionHeading eyebrow={payload.eyebrow} title={payload.title} description={payload.description} />
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {lines.map((line) => (
            <Link key={line.id} href={line.href} className="group space-y-2">
              <GlazeSwatch glaze={line.swatch} className="aspect-[4/5] rounded-xl" />
              <p className="px-1 font-heading text-[11px] uppercase tracking-[0.16em] text-czerwony">{line.name}</p>
              <p className="px-1 text-base leading-relaxed text-czarny">{line.description}</p>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
