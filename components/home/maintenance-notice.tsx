"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

/** Soft launch notice on homepage; dismiss to browse the rest of the site. */
export function MaintenanceNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-czarny/40 p-5 backdrop-blur-[3px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="maintenance-title"
    >
      <div className="relative w-full max-w-[26rem] overflow-hidden rounded-[2rem] border border-czarny/8 bg-bialy shadow-[0_28px_70px_-32px_rgb(1_1_1_/_0.5)]">
        <div className="h-1.5 bg-gradient-to-r from-czerwony via-ceglany to-czerwony/70" aria-hidden />

        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Zamknij komunikat"
          className="absolute right-3.5 top-5 flex h-9 w-9 items-center justify-center rounded-full text-czarny/45 transition-colors hover:bg-krem hover:text-czarny"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>

        <div className="px-7 pb-7 pt-8 sm:px-9 sm:pb-9 sm:pt-9">
          <p className="font-heading text-[10px] uppercase tracking-[0.24em] text-czerwony">
            Trzy Wiatry
          </p>
          <h2
            id="maintenance-title"
            className="mt-3 max-w-[16ch] font-heading text-[1.65rem] uppercase leading-[1.15] tracking-[0.05em] text-czarny sm:text-[1.85rem]"
          >
            Nowa strona pracowni
          </h2>
          <p className="mt-4 text-[15px] leading-[1.7] text-czarny/65 sm:text-base">
            Budujemy świeżą witrynę sklepu. Możesz już przeglądać treści — część funkcji (zakupy, konto,
            płatności) może jeszcze działać niepełnie.
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-szary">
            Dziękujemy za cierpliwość. Wróć wkrótce — dopinamy detale.
          </p>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-czerwony px-5 py-3.5 font-heading text-[11px] uppercase tracking-[0.2em] text-bialy transition-colors hover:bg-ceglany"
          >
            Przeglądaj stronę
          </button>
        </div>
      </div>
    </div>
  );
}
