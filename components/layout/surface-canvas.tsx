import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** One cream canvas + quiet pattern — avoids stacking near-identical beiges. */
export function SurfaceCanvas({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative min-h-full w-full min-w-0 max-w-full overflow-x-clip bg-krem", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage: "url(/brand/wzory/a.png)",
          backgroundRepeat: "repeat",
          backgroundSize: "280px auto",
        }}
      />
      <div className="relative min-w-0 max-w-full">{children}</div>
    </div>
  );
}
