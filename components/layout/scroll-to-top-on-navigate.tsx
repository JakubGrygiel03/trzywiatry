"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { scrollToHashOrTop } from "@/lib/scroll-chrome";

/**
 * On route / query changes: land at top or hash target, clear of sticky chrome.
 * Fixes “Przejdź do sklepu” and other Links that otherwise restore mid-page scroll.
 */
export function ScrollToTopOnNavigate() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  useEffect(() => {
    // Defer until after Next paints the new page.
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
