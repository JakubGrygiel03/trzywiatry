import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/shell/admin-shell";
import { ensureAtelierHydrated } from "@/lib/data/atelier-persist";

export const dynamic = "force-dynamic";

/** Shell is client-side — only page content refetches on navigation. */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  await ensureAtelierHydrated();
  return <AdminShell>{children}</AdminShell>;
}
