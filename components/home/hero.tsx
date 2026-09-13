import Link from "next/link";
import { HeroProductGallery } from "@/components/home/hero-product-gallery";
import { Button } from "@/components/ui/button";
import { defaultHeroPayload, type HeroPayload } from "@/lib/cms/home-layout";
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
  payload = defaultHeroPayload(),
}: {
  workshopsEnabled: boolean;
  galleryProducts: HeroGalleryItem[];
  payload?: HeroPayload;
}) {
  const labels = marqueeLabels(workshopsEnabled);
  const secondary = workshopsEnabled ? payload.workshopCta : payload.aboutCta;

  return (
    <section className="hero-kadr">
      <div className="hero-stage">
        <div className="hero-copy">
          <div className="hero-copy__stack">
            <p className="hero-copy__eyebrow font-heading uppercase tracking-[0.28em]">
              {workshopsEnabled ? payload.eyebrowWorkshops : payload.eyebrow}
            </p>

            <h1 className="hero-copy__title font-heading uppercase leading-[1.1] tracking-[0.06em]">
              {payload.title}
            </h1>

            <p className="hero-copy__lead max-w-[36ch] leading-[1.7]">{payload.lead}</p>

            <div className="flex flex-col gap-2.5 pt-1">
              <Button asChild size="lg" className={`${heroBtnSize} bg-bialy text-czarny hover:bg-krem`}>
                <Link href={payload.primaryCta.href}>{payload.primaryCta.label}</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className={`${heroBtnSize} border-bialy bg-transparent text-bialy hover:bg-ceglany hover:text-czarny hover:border-ceglany`}
              >
                <Link href={secondary.href}>{secondary.label}</Link>
              </Button>
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
