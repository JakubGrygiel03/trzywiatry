import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const TILE_BASE =
  "overflow-hidden rounded-[28px] border shadow-[0_18px_48px_-36px_rgb(1_1_1_/_0.45)]";

const TILE_TONES = {
  /** White content panel — the only “card” ground besides cream page */
  paper: "border-czarny/10 bg-bialy",
  /** Alias kept for older callers; same as paper to reduce beige stacking */
  clay: "border-czarny/10 bg-bialy",
  mist: "border-czarny/10 bg-bialy",
} as const;

export type SurfaceTileTone = keyof typeof TILE_TONES;

export function SurfaceTile({
  children,
  className,
  tone = "paper",
}: {
  children: ReactNode;
  className?: string;
  tone?: SurfaceTileTone;
}) {
  return <section className={cn(TILE_BASE, TILE_TONES[tone], className)}>{children}</section>;
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
    <div className="flex items-start justify-between gap-3 border-b border-czarny/8 px-5 py-4 sm:px-7">
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
