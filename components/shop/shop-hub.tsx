import Image from "next/image";
import Link from "next/link";
import { SurfacePageIntro } from "@/components/layout/surface-page";
import { Container } from "@/components/ui/badge";
import { SurfaceTile, SurfaceTileBody } from "@/components/ui/surface-tile";
import { getSettings } from "@/lib/data/queries";
import { SHOP_LANES } from "@/lib/shop-lanes";

export function ShopHub() {
  const settings = getSettings();
  const lanes = [
    {
      ...SHOP_LANES.uzytkowa,
      href: "/sklep?sklep=uzytkowa",
      mark: "01",
      photo: settings.shopHubUzytkowaImage,
      photoAlt: "Ceramika użytkowa Trzy Wiatry",
      photoPosition: "object-[center_52%]",
    },
    {
      ...SHOP_LANES.pracownia,
      href: "/sklep?sklep=pracownia",
      mark: "02",
      photo: settings.shopHubPracowniaImage,
      photoAlt: "Formy gipsowe do pracowni ceramicznej",
      photoPosition: "object-[center_50%]",
    },
  ];

  return (
    <div className="py-8 md:py-10">
      <Container className="space-y-4 md:space-y-5">
        <SurfacePageIntro
          eyebrow="Dwa sklepy"
          title="Wybierz półkę"
          description="Ceramika na stół — albo formy i narzędzia dla pracowni. Osobne katalogi, jeden koszyk."
        />
        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
          {lanes.map((lane) => (
            <Link key={lane.id} href={lane.href} className="group block min-w-0">
              <SurfaceTile className="h-full transition-colors group-hover:border-czerwony/35">
                <div className="relative aspect-[4/3] overflow-hidden border-b border-czarny/8 bg-bialy">
                  <Image
                    src={lane.photo}
                    alt={lane.photoAlt}
                    fill
                    className={`object-cover transition-transform duration-700 group-hover:scale-[1.03] ${lane.photoPosition}`}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <SurfaceTileBody className="space-y-2">
                  <p className="font-heading text-[11px] uppercase tracking-[0.2em] text-ceglany">
                    {lane.mark} · {lane.shortLabel}
                  </p>
                  <h2 className="font-heading text-xl uppercase tracking-[0.08em]">{lane.label}</h2>
                  <p className="max-w-[40ch] text-sm leading-relaxed text-czarny/70">{lane.description}</p>
                  <span className="inline-flex pt-1 font-heading text-[11px] uppercase tracking-[0.16em] text-czerwony">
                    Wejdź →
                  </span>
                </SurfaceTileBody>
              </SurfaceTile>
            </Link>
          ))}
        </div>
      </Container>
    </div>
  );
}
