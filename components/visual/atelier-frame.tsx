import { Vessel } from "@/components/visual/vessel";
import { cn } from "@/lib/utils";
import {
  GLAZE,
  glazeFromCollection,
  tiltFromId,
  vesselFromProduct,
  type GlazeKey,
  type VesselKind,
  type VesselView,
} from "@/lib/visual";
import type { Product } from "@/lib/types";

export function AtelierFrame({
  product,
  kind,
  glaze,
  view = "profil",
  className,
  caption,
}: {
  product?: Pick<Product, "id" | "category" | "subCategory" | "collectionId" | "domain" | "capacityMl">;
  kind?: VesselKind;
  glaze?: GlazeKey;
  view?: VesselView;
  className?: string;
  caption?: string;
}) {
  const glazeKey = glaze ?? glazeFromCollection(product?.collectionId, product?.domain);
  const palette = GLAZE[glazeKey];
  const vessel = kind ?? (product ? vesselFromProduct(product) : "cup");
  const tilt = product ? tiltFromId(product.id) : 0;

  return (
    <div
      className={cn(
        "atelier-frame relative overflow-hidden rounded-2xl",
        className,
      )}
      style={{ background: palette.paper }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-40" style={blob(palette.glaze, palette.clay)} />
      <div
        className="relative flex h-full min-h-0 items-center justify-center p-4 transition-transform duration-700 ease-out group-hover:scale-[1.04] sm:p-6"
        style={{ transform: `rotate(${tilt}deg)` }}
      >
        <div className="h-[78%] w-[78%] max-h-[22rem]">
          <Vessel kind={vessel} palette={palette} view={view} />
        </div>
      </div>
      {product?.capacityMl ? (
        <span className="absolute bottom-3 left-3 rounded-full bg-bialy/70 px-2.5 py-1 font-heading text-[10px] uppercase tracking-[0.16em] text-czarny/80 backdrop-blur-sm">
          {product.capacityMl} ml
        </span>
      ) : null}
      {caption ? (
        <span className="absolute right-3 top-3 rounded-full bg-bialy/70 px-2.5 py-1 font-heading text-[10px] uppercase tracking-[0.16em] backdrop-blur-sm">
          {caption}
        </span>
      ) : null}
    </div>
  );
}

function blob(a: string, b: string) {
  return {
    background: `radial-gradient(120% 80% at 20% 20%, ${a} 0%, transparent 55%), radial-gradient(90% 70% at 90% 80%, ${b} 0%, transparent 50%)`,
  };
}
