"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const WARM_ROUTES = [
  "/sklep",
  "/koszyk",
  "/zamowienie",
  "/warsztaty",
  "/kontakt",
  "/blog",
  "/o-nas",
  "/faq",
] as const;

/** Prefetch main storefront routes after first paint so card taps feel instant. */
export function PrefetchWarmRoutes() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    function warm() {
      if (cancelled) return;
      for (const href of WARM_ROUTES) {
        try {
          router.prefetch(href);
        } catch {
          /* ignore */
        }
      }
    }

    const ric = window.requestIdleCallback?.bind(window);
    if (ric) {
      const id = ric(warm, { timeout: 1800 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback?.(id);
      };
    }

    const t = window.setTimeout(warm, 400);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [router]);

  return null;
}
