"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { logoutAdmin } from "@/app/actions/admin";
import {
  ADMIN_NAV_GROUPS,
  isAdminNavActive,
  type AdminBadges,
} from "@/components/admin/shell/admin-nav-config";
import { cn } from "@/lib/utils";

type AdminSidebarProps = {
  badges: AdminBadges;
  open: boolean;
  onClose: () => void;
};

export function AdminSidebar({ badges, open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-czarny/40 transition-opacity md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-czarny text-bialy transition-transform duration-200 md:sticky md:top-0 md:h-dvh md:translate-x-0 md:self-start",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-white/10 px-4">
          <Link href="/admin" onClick={onClose} className="min-w-0">
            <p className="font-heading text-[10px] uppercase tracking-[0.22em] text-ceglany">CMS</p>
            <p className="truncate font-heading text-xs uppercase tracking-[0.14em]">Trzy Wiatry</p>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-bialy/60 hover:bg-white/10 hover:text-bialy md:hidden"
            aria-label="Zamknij menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {ADMIN_NAV_GROUPS.map((group) => (
            <div key={group.id} className="mb-5">
              <p className="mb-1.5 px-2 text-[10px] font-medium uppercase tracking-[0.16em] text-bialy/35">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isAdminNavActive(pathname, item);
                  const Icon = item.icon;
                  const badge = item.badgeKey ? badges[item.badgeKey] : 0;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        prefetch
                        onClick={onClose}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition",
                          active
                            ? "bg-czerwony text-bialy"
                            : "text-bialy/70 hover:bg-white/8 hover:text-bialy",
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0 opacity-90" strokeWidth={1.75} />
                        <span className="flex-1 truncate">{item.label}</span>
                        {badge > 0 ? (
                          <span
                            className={cn(
                              "min-w-[1.25rem] rounded-full px-1.5 text-center text-[10px] font-semibold leading-5",
                              active ? "bg-bialy/20 text-bialy" : "bg-ceglany text-czarny",
                            )}
                          >
                            {badge > 99 ? "99+" : badge}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="w-full rounded-lg px-2.5 py-2 text-left text-[13px] text-bialy/55 transition hover:bg-white/8 hover:text-bialy"
            >
              Wyloguj się
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
