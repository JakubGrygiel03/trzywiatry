import type { ReactNode } from "react";
import { Container } from "@/components/ui/badge";
import { SurfaceTile, SurfaceTileBody, type SurfaceTileTone } from "@/components/ui/surface-tile";
import { cn } from "@/lib/utils";

/** Homepage section shell — white paper panels on the cream canvas for clear contrast. */
export function HomeSection({
  children,
  className,
  bodyClassName,
  tone = "paper",
}: {
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  tone?: SurfaceTileTone;
}) {
  return (
    <section className={cn("py-4 md:py-5", className)}>
      <Container>
        <SurfaceTile tone={tone} className="shadow-[0_22px_50px_-32px_rgb(1_1_1_/_0.55)]">
          <SurfaceTileBody className={cn("space-y-7 sm:py-8 md:space-y-8", bodyClassName)}>
            {children}
          </SurfaceTileBody>
        </SurfaceTile>
      </Container>
    </section>
  );
}
