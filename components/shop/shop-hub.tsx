import Image from "next/image";
import Link from "next/link";
import { SurfacePageIntro } from "@/components/layout/surface-page";
import { Container } from "@/components/ui/badge";
import { SurfaceTile, SurfaceTileBody } from "@/components/ui/surface-tile";
import { getSettings } from "@/lib/data/queries";
import { isShopLaneEnabled, SHOP_LANES, type ShopLaneId } from "@/lib/shop-lanes";

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
      enabled: isShopLaneEnabled("uzytkowa", settings),
    },
    {
      ...SHOP_LANES.pracownia,
      href: "/sklep?sklep=pracownia",
      mark: "02",
      photo: settings.shopHubPracowniaImage,
      photoAlt: "Formy gipsowe do pracowni ceramicznej",
      photoPosition: "object-[center_50%]",
      enabled: isShopLaneEnabled("pracownia", settings),
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
            <HubTile key={lane.id} {...lane} />
          ))}
        </div>
      </Container>
    </div>
  );
}

function HubTile({
  href,
  mark,
  photo,
  photoAlt,
  photoPosition,
  shortLabel,
  label,
  description,
  enabled,
}: {
  id: ShopLaneId;
  href: string;
  mark: string;
  photo: string;
  photoAlt: string;
  photoPosition: string;
  shortLabel: string;
  label: string;
  description: string;
  enabled: boolean;
}) {
  const body = (
    <SurfaceTile
      className={`h-full ${enabled ? "transition-colors group-hover:border-czerwony/35" : "opacity-80"}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden border-b border-czarny/8 bg-bialy">
        <Image
          src={photo}
          alt={photoAlt}
          fill
          quality={75}
          priority={mark === "01"}
          className={`object-cover ${enabled ? `transition-transform duration-700 group-hover:scale-[1.03] ${photoPosition}` : `${photoPosition} grayscale`}`}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        {enabled ? null : (
          <p className="absolute inset-x-4 bottom-4 rounded-full bg-czarny/80 px-3 py-1.5 text-center font-heading text-[11px] uppercase tracking-[0.16em] text-bialy">
            W przygotowaniu
          </p>
        )}
      </div>
      <SurfaceTileBody className="space-y-2">
        <p className="font-heading text-[11px] uppercase tracking-[0.2em] text-ceglany">
          {mark} · {shortLabel}
        </p>
        <h2 className="font-heading text-xl uppercase tracking-[0.08em]">{label}</h2>
        <p className="max-w-[40ch] text-sm leading-relaxed text-czarny/70">{description}</p>
        <span className="inline-flex pt-1 font-heading text-[11px] uppercase tracking-[0.16em] text-czerwony">
          {enabled ? "Wejdź →" : "Niedostępne"}
        </span>
      </SurfaceTileBody>
    </SurfaceTile>
  );

  if (!enabled) {
    return (
      <div className="block min-w-0" aria-disabled>
        {body}
      </div>
    );
  }

  return (
    <Link href={href} className="group block min-w-0">
      {body}
    </Link>
  );
}
