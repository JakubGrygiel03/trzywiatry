import { notFound } from "next/navigation";
import Image from "next/image";
import { BookingForm } from "@/components/workshops/booking-form";
import { Container } from "@/components/ui/badge";
import { formatDate, formatPLN, formatTime } from "@/lib/format";
import { areWorkshopsEnabled, getWorkshopBySlug } from "@/lib/data/queries";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (!areWorkshopsEnabled()) return { title: "Warsztat" };
  const workshop = getWorkshopBySlug(slug);
  return { title: workshop?.title ?? "Warsztat" };
}

export default async function WorkshopDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  if (!areWorkshopsEnabled()) notFound();

  const { slug } = await params;
  const workshop = getWorkshopBySlug(slug);
  if (!workshop) notFound();

  return (
    <div className="py-16 md:py-24">
      <Container className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="relative aspect-[16/10] overflow-hidden rounded-[32px] bg-krem">
            <Image src={workshop.imageUrl} alt={workshop.title} fill className="object-cover" sizes="60vw" priority />
          </div>
          <p className="font-heading text-[11px] uppercase tracking-[0.22em] text-czerwony">{workshop.location}</p>
          <h1 className="font-heading text-3xl uppercase tracking-[0.08em] md:text-5xl">{workshop.title}</h1>
          <p className="font-heading text-xs uppercase tracking-[0.14em] text-czarny/50">
            {formatDate(workshop.eventDate)} · {formatTime(workshop.eventDate)} · {workshop.durationHours} h ·{" "}
            {formatPLN(workshop.priceInCents)}
          </p>
          <p className="max-w-xl text-lg leading-relaxed text-czarny/70">{workshop.description}</p>
        </div>
        <BookingForm workshop={workshop} />
      </Container>
    </div>
  );
}
