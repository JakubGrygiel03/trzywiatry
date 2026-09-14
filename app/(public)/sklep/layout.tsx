import type { ReactNode } from "react";
import { SurfaceCanvas } from "@/components/layout/surface-canvas";

export default function Layout({ children }: { children: ReactNode }) {
  return <SurfaceCanvas>{children}</SurfaceCanvas>;
}
