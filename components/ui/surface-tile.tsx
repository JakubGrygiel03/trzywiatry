import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const TILE =
  "overflow-hidden rounded-[28px] border border-czarny/8 bg-bialy shadow-[0_18px_48px_-36px_rgb(1_1_1_/_0.45)]";

export function SurfaceTile({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={cn(TILE, className)}>{children}</section>;
}

export function SurfaceTileHeader({
  eyebrow,
  title,
  description,
  end,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  end?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-czarny/8 bg-krem/35 px-5 py-4 sm:px-7">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="font-heading text-[11px] uppercase tracking-[0.2em] text-czerwony">{eyebrow}</p>
        ) : null}
        <h2
          className={cn(
            "font-heading uppercase tracking-[0.12em] text-czarny",
            eyebrow ? "mt-1 text-[15px]" : "text-[15px]",
          )}
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-1.5 text-[13px] leading-relaxed text-czarny/50">{description}</p>
        ) : null}
      </div>
      {end ? <div className="shrink-0 pt-0.5">{end}</div> : null}
    </div>
  );
}

export function SurfaceTileBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("px-5 py-5 sm:px-7 sm:py-6", className)}>{children}</div>;
}
