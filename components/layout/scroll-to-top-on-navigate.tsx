"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { scrollToHashOrTop } from "@/lib/scroll-chrome";

function scrollKey(pathname: string, query: string) {
  return `tw-scroll:${pathname}${query ? `?${query}` : ""}`;
}

function forceTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.documentElement.scrollLeft = 0;
  document.body.scrollTop = 0;
  document.body.scrollLeft = 0;
}

/** Messenger / Android WebViews often leave a leftover scrollX → uneven side gutters. */
function lockScrollX() {
  if (window.scrollX === 0 && document.documentElement.scrollLeft === 0 && document.body.scrollLeft === 0) {
    return;
  }
  window.scrollTo({ top: window.scrollY, left: 0, behavior: "auto" });
  document.documentElement.scrollLeft = 0;
  document.body.scrollLeft = 0;
}

/**
 * Forward navigations: always land at top / hash.
 * Back / forward (popstate): restore the last scroll Y for that URL.
 */
export function ScrollToTopOnNavigate() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const isPopState = useRef(false);
  const ready = useRef(false);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    function onPopState() {
      isPopState.current = true;
    }
    function onPageShow(event: PageTransitionEvent) {
      // bfcache / hard refresh — never leave a mid-page leftover.
      if (event.persisted && !isPopState.current && !window.location.hash) {
        forceTop();
      }
    }
    window.addEventListener("popstate", onPopState);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  // Persist scroll while the user stays on a route (so “wstecz” can restore it).
  // Also kill leftover scrollX — that reads as “more padding on the left”.
  useEffect(() => {
    const key = scrollKey(pathname, query);
    function save() {
      lockScrollX();
      try {
        sessionStorage.setItem(key, String(window.scrollY));
      } catch {
        /* private mode */
      }
    }
    function onResize() {
      lockScrollX();
    }
    window.addEventListener("scroll", save, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.visualViewport?.addEventListener("resize", onResize, { passive: true });
    window.visualViewport?.addEventListener("scroll", onResize, { passive: true });
    lockScrollX();
    return () => {
      save();
      window.removeEventListener("scroll", save);
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("scroll", onResize);
    };
  }, [pathname, query]);

  useEffect(() => {
    const key = scrollKey(pathname, query);
    const pop = isPopState.current;
    isPopState.current = false;

    // First mount of the shell: still force top unless this is a back navigation.
    if (!ready.current) {
      ready.current = true;
      if (!pop && !window.location.hash) {
        forceTop();
      }
    }

    if (pop) {
      let y = 0;
      try {
        y = Number(sessionStorage.getItem(key) || "0");
      } catch {
        y = 0;
      }
      const id = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          window.scrollTo({ top: Number.isFinite(y) ? y : 0, left: 0, behavior: "auto" });
        });
      });
      return () => window.cancelAnimationFrame(id);
    }

    // Forward Link navigation — hammer top a few times (layout / images can fight one frame).
    // Product PDP: tall gallery used to open mid-page on phones (scroll anchoring).
    forceTop();
    const frame = window.requestAnimationFrame(() => scrollToHashOrTop("auto"));
    const isProductPdp = /^\/sklep\/[^/]+\/?$/.test(pathname);
    const delays = isProductPdp
      ? [0, 30, 80, 160, 320, 600]
      : pathname.startsWith("/sklep")
        ? [0, 40, 100, 200]
        : [0, 80];
    const timers = delays.map((ms) =>
      window.setTimeout(() => {
        if (!window.location.hash) forceTop();
        else scrollToHashOrTop("auto");
      }, ms),
    );

    return () => {
      window.cancelAnimationFrame(frame);
      for (const id of timers) window.clearTimeout(id);
    };
  }, [pathname, query]);

  useEffect(() => {
    function onHashChange() {
      scrollToHashOrTop("smooth");
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return null;
}
