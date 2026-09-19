"use client";

import { useLayoutEffect } from "react";
import { forceDocumentTop } from "@/lib/scroll-to-top";

/**
 * Soft nav between /kolekcje/[slug] (glaze → glaze) keeps mid-page scroll.
 * Re-run on every slug so the new collection always opens from the top.
 * Browser back still restores via ScrollToTopOnNavigate popstate.
 */
export function ScrollCollectionToTop({ slug }: { slug: string }) {
  useLayoutEffect(() => {
    forceDocumentTop();
    const timers = [0, 40, 120, 280, 500].map((ms) => window.setTimeout(forceDocumentTop, ms));
    return () => {
      for (const id of timers) window.clearTimeout(id);
    };
  }, [slug]);

  return null;
}
