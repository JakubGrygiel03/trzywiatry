import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/badge";
import type { WorkshopPayload } from "@/lib/cms/home-layout";
import type { Workshop } from "@/lib/types";
import { formatDate } from "@/lib/format";

export function WorkshopTeaser({ workshop, payload }: { workshop: Workshop; payload: WorkshopPayload }) {
  return (
    <section className="bg-krem py-12 md:py-16">
      <Container className="grid items-center gap-6 md:grid-cols-2 md:gap-10">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
          <Image src={workshop.imageUrl} alt={workshop.title} fill className="object-cover" sizes="50vw" />
        </div>
        <div className="space-y-3">
          <p className="font-heading text-[11px] uppercase tracking-[0.2em] text-czerwony">{payload.eyebrow}</p>
          <h2 className="font-heading text-2xl uppercase tracking-[0.06em] text-czarny md:text-3xl">
            {workshop.title}
          </h2>
          <p className="font-heading text-xs uppercase tracking-[0.12em] text-ceglany">
            {formatDate(workshop.eventDate)}
          </p>
          <p className="max-w-md text-base leading-relaxed text-czarny">{workshop.description}</p>
          <Link
            href={`/warsztaty/${workshop.slug}`}
            className="inline-flex font-heading text-[11px] uppercase tracking-[0.16em] text-czerwony underline decoration-ceglany underline-offset-8"
          >
            {payload.ctaLabel}
          </Link>
        </div>
      </Container>
    </section>
  );
}
