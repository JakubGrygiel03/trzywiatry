import Image from "next/image";
import Link from "next/link";
import { Container, SectionHeading } from "@/components/ui/badge";
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
    <div className="py-10 md:py-14">
      <Container className="space-y-8">
        <SectionHeading
          eyebrow="Dwa sklepy"
          title="Wybierz półkę"
          description="Ceramika na stół — albo formy i narzędzia dla pracowni. Osobne katalogi, jeden koszyk."
        />
        <div className="grid gap-4 md:grid-cols-2">
          {lanes.map((lane) => (
            <Link
              key={lane.id}
              href={lane.href}
              className="group overflow-hidden rounded-2xl border border-szary bg-bialy transition-colors hover:border-czerwony"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-krem">
                <Image
                  src={lane.photo}
                  alt={lane.photoAlt}
                  fill
                  className={`object-cover transition-transform duration-700 group-hover:scale-[1.03] ${lane.photoPosition}`}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="space-y-2 p-6">
                <p className="font-heading text-[11px] uppercase tracking-[0.2em] text-ceglany">
                  {lane.mark} · {lane.shortLabel}
                </p>
                <h2 className="font-heading text-xl uppercase tracking-[0.08em]">{lane.label}</h2>
                <p className="max-w-[40ch] text-sm leading-relaxed text-czarny/70">{lane.description}</p>
                <span className="inline-flex pt-2 font-heading text-[11px] uppercase tracking-[0.16em] text-czerwony">
                  Wejdź →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </div>
  );
}
