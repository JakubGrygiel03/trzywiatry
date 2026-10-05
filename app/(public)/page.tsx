import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { HomeSectionStack } from "@/components/home/home-section-stack";
import { MaintenanceNotice } from "@/components/home/maintenance-notice";
import { SurfaceCanvas } from "@/components/layout/surface-canvas";
import { SITE } from "@/lib/constants";
import { findHomeSection } from "@/lib/cms/home-layout";
import { getHomeLayout } from "@/lib/data/home-layout";
import { getHeroGalleryProducts, getSettings, getWorkshops } from "@/lib/data/queries";
import { localBusinessJsonLd, pageMetadata, websiteJsonLd } from "@/lib/seo";
import { studioIdentity } from "@/lib/studio-identity";

export const metadata: Metadata = pageMetadata({
  title: "Trzy Wiatry — ceramika, drewno, warsztaty",
  description: SITE.seoDescription,
  path: "/",
  absoluteTitle: true,
});

export default async function HomePage() {
  const sections = await getHomeLayout();
  const settings = getSettings();
  const workshopsEnabled = settings.workshopsEnabled;
  const nextWorkshop = workshopsEnabled ? getWorkshops()[0] : undefined;
  const hero = findHomeSection(sections, "hero");
  const galleryProducts = getHeroGalleryProducts(12, hero?.payload.slots);

  return (
    <SurfaceCanvas>
      <JsonLd data={[localBusinessJsonLd(studioIdentity(settings)), websiteJsonLd()]} />
      {settings.launchNoticeEnabled ? <MaintenanceNotice /> : null}
      <HomeSectionStack
        sections={sections}
        workshopsEnabled={workshopsEnabled}
        galleryProducts={galleryProducts}
        nextWorkshop={nextWorkshop}
      />
    </SurfaceCanvas>
  );
}
