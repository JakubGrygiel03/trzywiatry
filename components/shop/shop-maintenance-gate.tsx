import type { ReactNode } from "react";
import { MaintenanceScreen } from "@/components/layout/maintenance-screen";
import { getSettings } from "@/lib/data/queries";
import { canBypassMaintenance, isStorefrontLocked } from "@/lib/maintenance";

/** Locks catalog / cart / checkout only — home, blog, contact stay open. */
export async function ShopMaintenanceGate({ children }: { children: ReactNode }) {
  const settings = getSettings();
  const bypass = await canBypassMaintenance();
  if (isStorefrontLocked(settings.maintenanceMode, bypass)) {
    return <MaintenanceScreen />;
  }
  return children;
}
