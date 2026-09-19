import { FeaturedDrops } from "@/components/home/featured-drops";
import { GlazeLines } from "@/components/home/glaze-lines";
import { Hero } from "@/components/home/hero";
import { HomeBanner } from "@/components/home/home-banner";
import { NewsletterCta } from "@/components/home/newsletter-cta";
import { ThreePillars } from "@/components/home/three-pillars";
import { WorkshopTeaser } from "@/components/home/workshop-teaser";
import type { HomeSection } from "@/lib/cms/home-layout";
import type { HeroGalleryItem } from "@/lib/data/queries";
import type { Workshop } from "@/lib/types";

export function HomeSectionStack({
  sections,
  workshopsEnabled,
  galleryProducts,
  nextWorkshop,
}: {
  sections: HomeSection[];
  workshopsEnabled: boolean;
  galleryProducts: HeroGalleryItem[];
  nextWorkshop?: Workshop;
}) {
  return (
    <div className="pb-4 md:pb-6">
      {sections.map((section) => {
        if (!section.enabled) return null;
        if (section.type === "workshop" && (!workshopsEnabled || !nextWorkshop)) return null;

        switch (section.type) {
          case "banner":
            return (
              <div key={section.id}>
                <HomeBanner payload={section.payload} />
                {/* Pure white rail so banner doesn’t bleed into cream hero */}
                <div className="h-3 w-full bg-bialy md:h-4" aria-hidden />
              </div>
            );
          case "hero":
            return (
              <Hero
                key={section.id}
                workshopsEnabled={workshopsEnabled}
                galleryProducts={galleryProducts}
                payload={section.payload}
              />
            );
          case "pillars":
            return <ThreePillars key={section.id} workshopsEnabled={workshopsEnabled} payload={section.payload} />;
          case "featured":
            return <FeaturedDrops key={section.id} payload={section.payload} />;
          case "glaze":
            return <GlazeLines key={section.id} payload={section.payload} />;
          case "workshop":
            return nextWorkshop ? (
              <WorkshopTeaser key={section.id} workshop={nextWorkshop} payload={section.payload} />
            ) : null;
          case "newsletter":
            return <NewsletterCta key={section.id} payload={section.payload} />;
        }
      })}
    </div>
  );
}
