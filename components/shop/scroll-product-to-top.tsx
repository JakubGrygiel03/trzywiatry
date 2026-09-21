"use client";

import { useLayoutEffect } from "react";
import { forceDocumentTop, pulseDocumentTop } from "@/lib/scroll-to-top";

/**
 * Soft nav between /sklep/[slug] pages often keeps scroll (upsell / recently viewed).
 * Re-run on every slug so the new PDP always opens from the top.
 */
export function ScrollProductToTop({ slug }: { slug: string }) {
  useLayoutEffect(() => {
    forceDocumentTop();
    const sentinel = document.getElementById("pdp-top");
    sentinel?.scrollIntoView({ block: "start", behavior: "auto" });
    const timers = pulseDocumentTop();
    return () => {
      for (const id of timers) window.clearTimeout(id);
    };
  }, [slug]);

  return <div id="pdp-top" aria-hidden className="pointer-events-none h-0 w-0 overflow-hidden" />;
}
