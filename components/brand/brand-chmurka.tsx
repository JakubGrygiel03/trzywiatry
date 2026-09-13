import type { ReactNode } from "react";
import {
  chmurkaSrc,
  chmurkaTextTone,
  type ChmurkaColor,
  type ChmurkaShape,
} from "@/lib/brand-assets";
import { cn } from "@/lib/utils";

type BrandChmurkaProps = {
  children: ReactNode;
  color?: ChmurkaColor;
  shape?: ChmurkaShape;
  className?: string;
};

/** Official Księga Znaku price / label bubble — raster, never redrawn. */
export function BrandChmurka({
  children,
  color = "czerwona",
  shape = "a",
  className,
}: BrandChmurkaProps) {
  const tone = chmurkaTextTone(color);

  return (
    <span
      className={cn(
        "relative inline-flex max-w-full items-center justify-center bg-center bg-contain bg-no-repeat",
        shape === "c" ? "min-h-10 px-6 pb-1.5 pt-3.5" : "min-h-8 px-5 py-1.5",
        tone === "light" ? "text-bialy" : "text-czarny",
        className,
      )}
      style={{ backgroundImage: `url(${chmurkaSrc(color, shape)})` }}
    >
      <span className="relative font-heading text-[11px] uppercase tracking-[0.12em]">{children}</span>
    </span>
  );
}
