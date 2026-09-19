"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { scrollToHashOrTop } from "@/lib/scroll-chrome";

function scrollKey(pathname: string, query: string) {
  return `tw-scroll:${pathname}${query ? `?${query}` : ""}`;
}

/**
 * Forward navigations: land at top / hash (clear of sticky chrome).
 * Back / forward (popstate): restore the last scroll Y for that URL.
 */
export function ScrollToTopOnNavigate() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const isPopState = useRef(false);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    function onPopState() {
      isPopState.current = true;
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Persist scroll while the user stays on a route (so “wstecz” can restore it).
  useEffect(() => {
    const key = scrollKey(pathname, query);
    function save() {
      try {
        sessionStorage.setItem(key, String(window.scrollY));
      } catch {
        /* private mode */
      }
    }
    window.addEventListener("scroll", save, { passive: true });
    return () => {
      save();
      window.removeEventListener("scroll", save);
    };
  }, [pathname, query]);

  useEffect(() => {
    const key = scrollKey(pathname, query);

    if (isPopState.current) {
      isPopState.current = false;
      let y = 0;
      try {
        y = Number(sessionStorage.getItem(key) || "0");
      } catch {
        y = 0;
      }
      // Two frames: wait for the previous page to paint before restoring.
      const id = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          window.scrollTo({ top: Number.isFinite(y) ? y : 0, left: 0, behavior: "auto" });
        });
      });
      return () => window.cancelAnimationFrame(id);
    }

    const id = window.requestAnimationFrame(() => {
      scrollToHashOrTop("auto");
    });
    return () => window.cancelAnimationFrame(id);
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
