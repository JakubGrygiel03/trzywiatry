import { HomeSectionStack } from "@/components/home/home-section-stack";
import { findHomeSection } from "@/lib/cms/home-layout";
import { getHomeLayout } from "@/lib/data/home-layout";
import { getHeroGalleryProducts, getSettings, getWorkshops } from "@/lib/data/queries";

export default async function HomePage() {
  const sections = await getHomeLayout();
  const workshopsEnabled = getSettings().workshopsEnabled;
  const nextWorkshop = workshopsEnabled ? getWorkshops()[0] : undefined;
  const hero = findHomeSection(sections, "hero");
  const galleryProducts = getHeroGalleryProducts(12, hero?.payload.slots);

  return (
    <HomeSectionStack
      sections={sections}
      workshopsEnabled={workshopsEnabled}
      galleryProducts={galleryProducts}
      nextWorkshop={nextWorkshop}
    />
  );
}
