"use client";

import Link from "next/link";
import { ExternalLink, Menu, Search } from "lucide-react";
import type { AdminBadges } from "@/components/admin/shell/admin-nav-config";

type AdminTopbarProps = {
  badges: AdminBadges;
  onMenuOpen: () => void;
};

export function AdminTopbar({ badges, onMenuOpen }: AdminTopbarProps) {
  const alerts = badges.lowStock + badges.orders;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-czarny/8 bg-bialy/95 px-4 backdrop-blur md:px-6">
      <button
        type="button"
        onClick={onMenuOpen}
        className="rounded-md p-2 text-czarny/70 hover:bg-krem md:hidden"
        aria-label="Otwórz menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden min-w-0 flex-1 items-center gap-2 text-sm text-czarny/45 sm:flex">
        <Search className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
        <span className="truncate">Panel pracowni</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {alerts > 0 ? (
          <span className="hidden rounded-md bg-ceglany/15 px-2.5 py-1 text-[11px] font-medium text-czerwony sm:inline">
            {alerts} do sprawdzenia
          </span>
        ) : null}
        <Link
          href="/sklep"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-czarny/10 bg-bialy px-3 py-1.5 text-xs font-medium text-czarny/75 transition hover:border-czerwony/30 hover:text-czerwony"
        >
          Zobacz sklep
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </header>
  );
}
