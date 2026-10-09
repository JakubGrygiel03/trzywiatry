import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/shell/admin-shell";
import { ensureAtelierHydrated } from "@/lib/data/atelier-persist";
import { getSettings } from "@/lib/data/queries";
import { vapidPublicKey } from "@/lib/push";
import { noIndexRobots } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: noIndexRobots,
};

/** Shell is client-side — only page content refetches on navigation. */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  await ensureAtelierHydrated({ force: true });
  return (
    <AdminShell maintenanceMode={getSettings().maintenanceMode} vapidPublicKey={vapidPublicKey()}>
      {children}
    </AdminShell>
  );
}
