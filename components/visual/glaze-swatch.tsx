import { GLAZE, type GlazeKey } from "@/lib/visual";
import { cn } from "@/lib/utils";

export function GlazeSwatch({
  glaze,
  className,
  label = true,
}: {
  glaze: GlazeKey;
  className?: string;
  label?: boolean;
}) {
  const palette = GLAZE[glaze];

  return (
    <div className={cn("group relative overflow-hidden rounded-2xl", className)} style={{ background: palette.paper }}>
      <div
        className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
        style={{
          background: `radial-gradient(circle at 35% 30%, ${palette.shine} 0%, ${palette.glaze} 38%, ${palette.clay} 100%)`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-czarny/15 to-transparent" />
      {label ? (
        <span className="absolute bottom-3 left-3 rounded-full bg-bialy/80 px-3 py-1 font-heading text-[10px] uppercase tracking-[0.16em] backdrop-blur">
          {palette.name}
        </span>
      ) : null}
    </div>
  );
}
