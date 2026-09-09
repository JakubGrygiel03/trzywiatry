"use client";

import { useEffect, useState } from "react";
import type { AdminBadges } from "@/components/admin/shell/admin-nav-config";

const EMPTY: AdminBadges = { orders: 0, lowStock: 0, b2b: 0 };

let cached: AdminBadges | null = null;

export function useAdminBadges(enabled: boolean) {
  const [badges, setBadges] = useState<AdminBadges>(cached ?? EMPTY);

  useEffect(() => {
    if (!enabled) return;

    if (cached) {
      setBadges(cached);
      return;
    }

    let cancelled = false;
    fetch("/api/admin/badges", { credentials: "same-origin" })
      .then((res) => (res.ok ? res.json() : EMPTY))
      .then((data: AdminBadges) => {
        if (cancelled) return;
        cached = data;
        setBadges(data);
      })
      .catch(() => {
        if (!cancelled) setBadges(EMPTY);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return badges;
}

/** Call after mutations that affect sidebar counts. */
export function invalidateAdminBadges() {
  cached = null;
}
