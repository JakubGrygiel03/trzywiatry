import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Warm patterned canvas used on public subpages (not home / legal / CMS). */
export function SurfaceCanvas({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative min-h-full bg-krem-ciemny", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.09]"
        style={{
          backgroundImage: "url(/brand/wzory/a.png)",
          backgroundRepeat: "repeat",
          backgroundSize: "280px auto",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
