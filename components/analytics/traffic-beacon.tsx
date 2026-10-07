"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackShopEvent } from "@/lib/track-client";

/** Counts consented storefront visits. Admin routes never mount this. */
export function TrafficBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/konto")) return;
    trackShopEvent("page", { path: pathname });
  }, [pathname]);

  return null;
}
