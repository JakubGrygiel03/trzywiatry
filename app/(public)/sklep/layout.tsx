import type { ReactNode } from "react";
import { SurfaceCanvas } from "@/components/layout/surface-canvas";
import { ShopMaintenanceGate } from "@/components/shop/shop-maintenance-gate";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ShopMaintenanceGate>
      <SurfaceCanvas>{children}</SurfaceCanvas>
    </ShopMaintenanceGate>
  );
}
