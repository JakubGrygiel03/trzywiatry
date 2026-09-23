import { SurfaceTile, SurfaceTileBody } from "@/components/ui/surface-tile";

export function P24HandoffNotice({ compact = false }: { compact?: boolean }) {
  return (
    <SurfaceTile>
      <SurfaceTileBody className={compact ? undefined : "sm:py-8"}>
        <p className="font-heading text-sm uppercase tracking-[0.14em] text-czerwony">
          Przekierowanie do płatności
        </p>
        <p className="mt-4 text-lg leading-relaxed">Chwilę… otwieramy Przelewy24 (BLIK, karta, przelew).</p>
      </SurfaceTileBody>
    </SurfaceTile>
  );
}
