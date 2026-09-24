"use client";

import { useEffect, useState } from "react";
import type { AdminBadges } from "@/components/admin/shell/admin-nav-config";

const EMPTY: AdminBadges = { orders: 0, lowStock: 0, b2b: 0 };

export function useAdminBadges(enabled: boolean, pathname = "") {
  const [badges, setBadges] = useState<AdminBadges>(EMPTY);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    fetch("/api/admin/badges", { credentials: "same-origin", cache: "no-store" })
      .then((res) => (res.ok ? res.json() : EMPTY))
      .then((data: AdminBadges) => {
        if (!cancelled) setBadges(data);
      })
      .catch(() => {
        if (!cancelled) setBadges(EMPTY);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, pathname]);

  return badges;
}
