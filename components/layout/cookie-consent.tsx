"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const STORAGE_KEY = "tw-cookie-consent";

export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "accepted") return;
      const id = window.setTimeout(() => setOpen(true), 450);
      return () => window.clearTimeout(id);
    } catch {
      setOpen(true);
    }
  }, []);

  function accept() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      // private mode — dismiss for this session
    }
    setOpen(false);
  }

  return (
    <AnimatePresence>
      {open ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] flex justify-center p-3 sm:p-5">
          <motion.div
            role="dialog"
            aria-modal="false"
            aria-labelledby="cookie-title"
            aria-describedby="cookie-desc"
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto flex w-full max-w-[52rem] flex-col gap-4 rounded-[1.75rem] border border-czarny/[0.08] bg-[color-mix(in_srgb,var(--bialy)_88%,transparent)] px-5 py-4 shadow-[0_24px_60px_-36px_rgb(1_1_1_/_0.55)] backdrop-blur-xl sm:flex-row sm:items-center sm:gap-8 sm:rounded-full sm:px-7 sm:py-3.5"
          >
            <div className="min-w-0 flex-1 space-y-1.5">
              <p
                id="cookie-title"
                className="font-heading text-[10px] uppercase tracking-[0.22em] text-czerwony"
              >
                Cookies · Trzy Wiatry
              </p>
              <p id="cookie-desc" className="text-[13px] leading-relaxed text-czarny/65 sm:text-sm">
                Używamy niezbędnych plików cookie, żeby strona i koszyk działały poprawnie. Analityczne
                włączamy tylko po Twojej zgodzie.
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
              <Link
                href="/polityka-prywatnosci"
                className="inline-flex h-10 items-center justify-center rounded-full border border-czarny/15 bg-bialy/60 px-5 font-heading text-[10px] uppercase tracking-[0.16em] text-czarny/70 transition-colors hover:border-czarny/35 hover:text-czarny"
              >
                Polityka
              </Link>
              <button
                type="button"
                onClick={accept}
                className="inline-flex h-10 items-center justify-center rounded-full bg-czarny px-6 font-heading text-[10px] uppercase tracking-[0.16em] text-bialy transition-colors hover:bg-czerwony"
              >
                Akceptuję
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
