import type { ReactNode } from "react";
import {
  SurfaceTile,
  SurfaceTileBody,
  SurfaceTileHeader,
} from "@/components/ui/surface-tile";

/** Account pages reuse the shared surface tile language. */
export function AccountTile({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <SurfaceTile className={className}>{children}</SurfaceTile>;
}

export function AccountTileHeader({
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
    <SurfaceTileHeader eyebrow={eyebrow} title={title} description={description} end={end} />
  );
}

export function AccountTileBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <SurfaceTileBody className={className}>{children}</SurfaceTileBody>;
}
