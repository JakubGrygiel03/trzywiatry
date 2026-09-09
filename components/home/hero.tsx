import Link from "next/link";
import { HeroProductGallery } from "@/components/home/hero-product-gallery";
import { Button } from "@/components/ui/button";
import type { HeroGalleryItem } from "@/lib/data/queries";

const heroBtnSize =
  "h-11 rounded-full px-6 font-heading text-[0.625rem] uppercase tracking-[0.18em]";

function marqueeLabels(workshopsEnabled: boolean) {
  return [
    "Dust",
    "Mist",
    "Sand",
    "Raw Clay",
    "Ceramika",
    "Drewno",
    ...(workshopsEnabled ? ["Warsztaty"] : []),
    "Formy matki",
  ];
}

function MarqueeStrip({ labels, hidden }: { labels: string[]; hidden?: boolean }) {
  const items = [...labels, ...labels, ...labels];

  return (
    <p
      className="flex shrink-0 items-center font-heading text-[11px] uppercase tracking-[0.2em] text-szary"
      aria-hidden={hidden}
    >
      {items.map((label, index) => (
        <span key={`${label}-${index}`} className="flex shrink-0 items-center">
          <span className="px-4">{label}</span>
          <span className="text-czarny/15" aria-hidden>
            —
          </span>
        </span>
      ))}
    </p>
  );
}

export function Hero({
  workshopsEnabled,
  galleryProducts,
}: {
  workshopsEnabled: boolean;
  galleryProducts: HeroGalleryItem[];
}) {
  const labels = marqueeLabels(workshopsEnabled);

  return (
    <section className="hero-kadr">
      <div className="hero-stage">
        <div className="hero-copy">
          <div className="hero-copy__stack">
            <p className="hero-copy__eyebrow font-heading uppercase tracking-[0.28em]">
              {workshopsEnabled ? "Ceramika · Drewno · Warsztaty" : "Ceramika · Drewno"}
            </p>

            <h1 className="hero-copy__title font-heading uppercase leading-[1.1] tracking-[0.06em]">
              Trzy Wiatry
            </h1>

            <p className="hero-copy__lead max-w-[36ch] leading-[1.7]">
              Slow craft z lokalnej gliny i drewna — toczone, wypalane i pakowane w pracowni.
            </p>

            <div className="flex flex-col gap-2.5 pt-1">
              <Button asChild size="lg" className={`${heroBtnSize} bg-bialy text-czarny hover:bg-krem`}>
                <Link href="/sklep">Wejdź do sklepu</Link>
              </Button>
              {workshopsEnabled ? (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className={`${heroBtnSize} border-bialy bg-transparent text-bialy hover:bg-ceglany hover:text-czarny hover:border-ceglany`}
                >
                  <Link href="/warsztaty">Zarezerwuj warsztat</Link>
                </Button>
              ) : (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className={`${heroBtnSize} border-bialy bg-transparent text-bialy hover:bg-ceglany hover:text-czarny hover:border-ceglany`}
                >
                  <Link href="/o-nas">Poznaj pracownię</Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="hero-mosaic-wrap">
          {galleryProducts.length > 0 ? (
            <HeroProductGallery products={galleryProducts} />
          ) : (
            <div className="h-full bg-krem-ciemny/40" aria-hidden />
          )}
        </div>
      </div>

      <div className="hero-marquee">
        <div className="marquee-track flex w-max">
          <MarqueeStrip labels={labels} />
          <MarqueeStrip labels={labels} hidden />
        </div>
      </div>
    </section>
  );
}
