import Image from "next/image";
import Link from "next/link";
import { Badge, PriceBubble } from "@/components/ui/badge";
import { formatDate, formatPLN, formatTime } from "@/lib/format";
import { remainingSeats } from "@/lib/data/queries";
import type { Workshop } from "@/lib/types";

export function WorkshopCard({ workshop }: { workshop: Workshop }) {
  const seats = remainingSeats(workshop);

  return (
    <Link
      href={`/warsztaty/${workshop.slug}`}
      className="group grid overflow-hidden rounded-[32px] bg-krem md:grid-cols-[1.05fr_1fr]"
    >
      <div className="relative min-h-64">
        <Image
          src={workshop.imageUrl}
          alt={workshop.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <div className="flex flex-col justify-center space-y-4 p-8">
        <div className="flex flex-wrap items-center gap-2">
          {seats <= 0 ? <Badge tone="sold">Wyprzedane</Badge> : <Badge tone="clay">{seats} miejsc</Badge>}
          <PriceBubble>{formatPLN(workshop.priceInCents)}</PriceBubble>
        </div>
        <h3 className="font-heading text-xl uppercase tracking-[0.08em]">{workshop.title}</h3>
        <p className="font-heading text-[11px] uppercase tracking-[0.14em] text-czarny/45">
          {formatDate(workshop.eventDate)} · {formatTime(workshop.eventDate)} · {workshop.durationHours} h
        </p>
        <p className="text-sm leading-relaxed text-czarny/65">{workshop.description}</p>
      </div>
    </Link>
  );
}
