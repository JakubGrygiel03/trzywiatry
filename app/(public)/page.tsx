import Image from "next/image";
import Link from "next/link";
import { FeaturedDrops } from "@/components/home/featured-drops";
import { Hero } from "@/components/home/hero";
import { NewsletterCta } from "@/components/home/newsletter-cta";
import { ThreePillars } from "@/components/home/three-pillars";
import { Container, SectionHeading } from "@/components/ui/badge";
import { GlazeSwatch } from "@/components/visual/glaze-swatch";
import { getCollections, getHeroGalleryProducts, getSettings, getWorkshops } from "@/lib/data/queries";
import { formatDate } from "@/lib/format";
import type { GlazeKey } from "@/lib/visual";

const glazeSlug: Record<string, GlazeKey> = {
  dust: "dust",
  mist: "mist",
  sand: "sand",
  "raw-clay": "raw",
};

export default function HomePage() {
  const collections = getCollections();
  const workshopsEnabled = getSettings().workshopsEnabled;
  const nextWorkshop = workshopsEnabled ? getWorkshops()[0] : undefined;
  const galleryProducts = getHeroGalleryProducts();

  return (
    <>
      <Hero workshopsEnabled={workshopsEnabled} galleryProducts={galleryProducts} />
      <ThreePillars workshopsEnabled={workshopsEnabled} />
      <FeaturedDrops />
      <section className="bg-bialy py-12 md:py-16">
        <Container className="space-y-8">
          <SectionHeading
            eyebrow="Linie szkliw"
            title="Dust · Mist · Sand · Raw Clay"
            description="Palety z pracowni — matowy pył, mleczna mgła, ochra i surowa glina. Kliknij linię, żeby zobaczyć naczynia."
          />
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {collections.map((collection) => {
              const glaze = glazeSlug[collection.slug] ?? "dust";
              return (
                <Link key={collection.id} href={`/kolekcje/${collection.slug}`} className="group space-y-2">
                  <GlazeSwatch glaze={glaze} className="aspect-[4/5] rounded-xl" />
                  <p className="px-1 text-base leading-relaxed text-czarny">{collection.description}</p>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>
      {nextWorkshop ? (
        <section className="bg-krem py-12 md:py-16">
          <Container className="grid items-center gap-6 md:grid-cols-2 md:gap-10">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src={nextWorkshop.imageUrl}
                alt={nextWorkshop.title}
                fill
                className="object-cover"
                sizes="50vw"
              />
            </div>
            <div className="space-y-3">
              <p className="font-heading text-[11px] uppercase tracking-[0.2em] text-czerwony">
                Najbliższy warsztat
              </p>
              <h2 className="font-heading text-2xl uppercase tracking-[0.06em] text-czarny md:text-3xl">
                {nextWorkshop.title}
              </h2>
              <p className="font-heading text-xs uppercase tracking-[0.12em] text-ceglany">
                {formatDate(nextWorkshop.eventDate)}
              </p>
              <p className="max-w-md text-base leading-relaxed text-czarny">{nextWorkshop.description}</p>
              <Link
                href={`/warsztaty/${nextWorkshop.slug}`}
                className="inline-flex font-heading text-[11px] uppercase tracking-[0.16em] text-czerwony underline decoration-ceglany underline-offset-8"
              >
                Zarezerwuj miejsce
              </Link>
            </div>
          </Container>
        </section>
      ) : null}
      <NewsletterCta />
    </>
  );
}
