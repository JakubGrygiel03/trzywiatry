"use client";

import Image from "next/image";
import { useEffect } from "react";
import type { GalleryWork } from "@/lib/data/gallery";

export function WorksLightbox({
  works,
  active,
  onClose,
  onStep,
}: {
  works: GalleryWork[];
  active: number;
  onClose: () => void;
  onStep: (delta: number) => void;
}) {
  const work = works[active];

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onStep(1);
      if (event.key === "ArrowLeft") onStep(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onStep]);

  if (!work) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-czarny/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={work.alt}
      onClick={onClose}
    >
      <button
        type="button"
        className="absolute right-5 top-5 font-heading text-[11px] uppercase tracking-[0.16em] text-bialy"
        onClick={onClose}
      >
        Zamknij
      </button>
      <div className="relative h-[min(80vh,720px)] w-full max-w-3xl" onClick={(event) => event.stopPropagation()}>
        <Image src={work.src} alt={work.alt} fill className="object-contain" sizes="90vw" priority />
      </div>
    </div>
  );
}
