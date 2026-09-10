import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/shell/admin-shell";

export const dynamic = "force-dynamic";

/** Shell is client-side — only page content refetches on navigation. */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
