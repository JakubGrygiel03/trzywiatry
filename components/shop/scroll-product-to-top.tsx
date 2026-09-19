"use client";

import { useLayoutEffect } from "react";
import { forceDocumentTop } from "@/lib/scroll-to-top";

/**
 * Soft nav between /sklep/[slug] pages keeps scroll (upsell / recently viewed).
 * Re-run on every slug so the new PDP always opens from the top.
 */
export function ScrollProductToTop({ slug }: { slug: string }) {
  useLayoutEffect(() => {
    forceDocumentTop();
    const timers = [0, 40, 120, 280, 500].map((ms) => window.setTimeout(forceDocumentTop, ms));
    return () => {
      for (const id of timers) window.clearTimeout(id);
    };
  }, [slug]);

  return null;
}
