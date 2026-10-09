"use client";

import { Suspense, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AdminMutationRefresh } from "@/components/admin/admin-mutation-refresh";
import { AdminSidebar } from "@/components/admin/shell/admin-sidebar";
import { AdminTopbar } from "@/components/admin/shell/admin-topbar";
import { useAdminBadges } from "@/components/admin/shell/use-admin-badges";

type AdminShellProps = {
  children: ReactNode;
  maintenanceMode?: boolean;
  vapidPublicKey?: string;
};

/**
 * Client shell stays mounted between navigations — only {children} swap.
 * Badges load async so sidebar clicks feel instant.
 */
export function AdminShell({ children, maintenanceMode = false, vapidPublicKey = "" }: AdminShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAuthPage =
    pathname === "/admin/logowanie" ||
    pathname.startsWith("/admin/reset-hasla") ||
    pathname.startsWith("/admin/nowe-haslo");

  const badges = useAdminBadges(!isAuthPage, pathname);

  if (isAuthPage) {
    return <div className="min-h-screen bg-papier">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-[#f3f0eb]">
      <AdminSidebar badges={badges} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar
          badges={badges}
          maintenanceMode={maintenanceMode}
          vapidPublicKey={vapidPublicKey}
          onMenuOpen={() => setMenuOpen(true)}
        />
        <main className="flex-1 px-4 py-5 text-[15px] leading-relaxed md:px-6 md:py-6">
          <Suspense fallback={null}>
            <AdminMutationRefresh />
          </Suspense>
          {children}
        </main>
      </div>
    </div>
  );
}
