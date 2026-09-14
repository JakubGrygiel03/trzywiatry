import type { ReactNode } from "react";
import { SurfaceTile, SurfaceTileBody } from "@/components/ui/surface-tile";
import { cn } from "@/lib/utils";

/** Readable page intro tile — eyebrow + title + short lead. */
export function SurfacePageIntro({
  eyebrow,
  title,
  description,
  descriptionEn,
  className,
  as = "h1",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  descriptionEn?: string;
  className?: string;
  as?: "h1" | "h2";
}) {
  const TitleTag = as;
  return (
    <SurfaceTile className={className}>
      <SurfaceTileBody className="sm:py-7">
        {eyebrow ? (
          <p className="font-heading text-[11px] uppercase tracking-[0.22em] text-czerwony">{eyebrow}</p>
        ) : null}
        <TitleTag
          className={cn(
            "font-heading text-3xl uppercase leading-[1.15] tracking-[0.06em] text-czarny md:text-4xl",
            eyebrow && "mt-2",
          )}
        >
          {title}
        </TitleTag>
        {description ? (
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-czarny/65 md:text-base md:leading-relaxed">
            {description}
          </p>
        ) : null}
        {descriptionEn ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-czarny/45" lang="en">
            {descriptionEn}
          </p>
        ) : null}
      </SurfaceTileBody>
    </SurfaceTile>
  );
}

export function SurfaceProse({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <SurfaceTile>
      <SurfaceTileBody
        className={cn(
          "space-y-4 text-[15px] leading-relaxed text-czarny/75 md:text-base md:leading-[1.75]",
          className,
        )}
      >
        {children}
      </SurfaceTileBody>
    </SurfaceTile>
  );
}
