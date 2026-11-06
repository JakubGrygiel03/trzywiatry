import type { ReactNode } from "react";
import { MaintenanceScreen } from "@/components/layout/maintenance-screen";
import { getSettings } from "@/lib/data/queries";
import { canBypassMaintenance, isStorefrontLocked } from "@/lib/maintenance";

/**
 * Locks catalog / cart / checkout only — home, blog, contact stay open.
 * cookies() is dynamic IO. Skip it while the shop is open so product pages
 * stay cached; the preview cookie is only needed during maintenance.
 */
export async function ShopMaintenanceGate({ children }: { children: ReactNode }) {
  const settings = getSettings();
  if (!settings.maintenanceMode) return children;
  const bypass = await canBypassMaintenance();
  if (isStorefrontLocked(true, bypass)) return <MaintenanceScreen />;
  return children;
}
