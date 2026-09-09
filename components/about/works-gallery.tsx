"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { WorksLightbox } from "@/components/about/works-lightbox";
import type { GalleryWork } from "@/lib/data/gallery";

const AUTO_MS = 4500;

export function WorksGallery({ works }: { works: GalleryWork[] }) {
  const [perPage, setPerPage] = useState(8);
  const [page, setPage] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    function sync() {
      setPerPage(window.matchMedia("(min-width: 768px)").matches ? 8 : 4);
    }
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  const pages = Math.max(1, Math.ceil(works.length / perPage));
  const safePage = page % pages;
  const start = safePage * perPage;
  const visible = works.slice(start, start + perPage);

  function go(delta: number) {
    setPage((current) => (current + delta + pages) % pages);
  }

  useEffect(() => {
    if (active !== null || hovering || pages < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setPage((current) => (current + 1) % pages);
    }, AUTO_MS);
    return () => window.clearInterval(timer);
  }, [active, hovering, pages]);

  return (
    <div className="relative" onPointerEnter={() => setHovering(true)} onPointerLeave={() => setHovering(false)}>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {visible.map((work, index) => {
          const absolute = start + index;
          return (
            <li key={`${work.src}-${absolute}`}>
              <button
                type="button"
                onClick={() => setActive(absolute)}
                className="group relative block aspect-square w-full overflow-hidden rounded-2xl bg-krem text-left"
                aria-label={`Powiększ: ${work.alt}`}
              >
                <Image
                  src={work.src}
                  alt={work.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </button>
            </li>
          );
        })}
      </ul>

      {pages > 1 ? (
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            type="button"
            aria-label="Poprzednie zdjęcia"
            onClick={() => go(-1)}
            className="flex size-9 items-center justify-center rounded-full border border-szary bg-bialy text-czarny hover:border-czerwony hover:text-czerwony"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <div className="flex gap-1.5">
            {Array.from({ length: pages }, (_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Strona ${index + 1}`}
                onClick={() => setPage(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === safePage ? "w-5 bg-czerwony" : "w-1.5 bg-szary"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Następne zdjęcia"
            onClick={() => go(1)}
            className="flex size-9 items-center justify-center rounded-full border border-szary bg-bialy text-czarny hover:border-czerwony hover:text-czerwony"
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
      ) : null}

      {active !== null ? (
        <WorksLightbox
          works={works}
          active={active}
          onClose={() => setActive(null)}
          onStep={(delta) => setActive((index) => ((index ?? 0) + delta + works.length) % works.length)}
        />
      ) : null}
    </div>
  );
}
