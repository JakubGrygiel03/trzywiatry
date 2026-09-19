"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { Search } from "lucide-react";
import { AtelierFrame } from "@/components/visual/atelier-frame";
import { usePdpVariant } from "@/components/shop/pdp-variant";
import type { Product } from "@/lib/types";
import type { VesselView } from "@/lib/visual";
import { cn } from "@/lib/utils";

const views: { id: VesselView; label: string }[] = [
  { id: "profil", label: "Profil" },
  { id: "szkliwo", label: "Szkliwo" },
  { id: "stopka", label: "Stopka" },
];

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, value));
}

/**
 * Mouse: hover zoom following cursor.
 * Touch: tap to zoom in/out; while zoomed, drag to pan the focal point.
 */
function ZoomablePhoto({
  src,
  alt,
  priority,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [origin, setOrigin] = useState("50% 50%");
  const [zoomed, setZoomed] = useState(false);
  const [canHover, setCanHover] = useState(false);
  const pointerStart = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    function sync() {
      setCanHover(mq.matches);
    }
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    setZoomed(false);
    setOrigin("50% 50%");
  }, [src]);

  function setOriginFromClient(clientX: number, clientY: number) {
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const x = clampPercent(((clientX - rect.left) / rect.width) * 100);
    const y = clampPercent(((clientY - rect.top) / rect.height) * 100);
    setOrigin(`${x}% ${y}%`);
  }

  function onMouseMove(event: MouseEvent<HTMLDivElement>) {
    if (!canHover) return;
    setOriginFromClient(event.clientX, event.clientY);
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (canHover || event.pointerType === "mouse") return;
    pointerStart.current = { x: event.clientX, y: event.clientY, moved: false };
    frameRef.current?.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (canHover || event.pointerType === "mouse") return;
    const start = pointerStart.current;
    if (!start) return;
    const dx = Math.abs(event.clientX - start.x);
    const dy = Math.abs(event.clientY - start.y);
    if (dx > 8 || dy > 8) start.moved = true;
    if (zoomed) {
      event.preventDefault();
      setOriginFromClient(event.clientX, event.clientY);
    }
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (canHover || event.pointerType === "mouse") return;
    const start = pointerStart.current;
    pointerStart.current = null;
    try {
      frameRef.current?.releasePointerCapture(event.pointerId);
    } catch {
      /* already released */
    }
    if (!start || start.moved) return;
    // Tap: toggle zoom and focus under finger.
    setOriginFromClient(event.clientX, event.clientY);
    setZoomed((open) => !open);
  }

  function onPointerCancel() {
    pointerStart.current = null;
  }

  return (
    <div
      ref={frameRef}
      role="img"
      aria-label={zoomed ? `${alt} — przybliżone` : alt}
      className={cn(
        "group/zoom relative aspect-[5/6] overflow-hidden rounded-2xl bg-krem md:aspect-[4/5]",
        canHover ? "cursor-zoom-in" : "cursor-pointer",
        zoomed && !canHover && "touch-none",
      )}
      onMouseEnter={() => {
        if (canHover) setZoomed(true);
      }}
      onMouseLeave={() => {
        if (!canHover) return;
        setZoomed(false);
        setOrigin("50% 50%");
      }}
      onMouseMove={onMouseMove}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        draggable={false}
        sizes="(max-width: 1024px) 100vw, 55vw"
        className="object-cover will-change-transform select-none"
        style={{
          transformOrigin: origin,
          transform: zoomed ? "scale(1.55)" : "scale(1)",
          transition: canHover
            ? "transform 650ms cubic-bezier(0.22, 1, 0.36, 1)"
            : "transform 280ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />
      <span
        className={cn(
          "pointer-events-none absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-bialy/90 text-czarny shadow-sm transition-opacity duration-300",
          canHover ? "group-hover/zoom:opacity-0" : zoomed ? "opacity-0" : "opacity-100",
        )}
        aria-hidden
      >
        <Search className="h-4 w-4" strokeWidth={1.75} />
      </span>
      {!canHover ? (
        <span className="pointer-events-none absolute inset-x-3 bottom-3 rounded-full bg-czarny/55 px-3 py-1.5 text-center font-heading text-[10px] uppercase tracking-[0.14em] text-bialy backdrop-blur-[2px]">
          {zoomed ? "Przeciągnij · dotknij, by oddalić" : "Dotknij, żeby przybliżyć"}
        </span>
      ) : null}
    </div>
  );
}

export function ProductGallery({ product }: { product: Product }) {
  const { photos } = usePdpVariant();
  const [activePhoto, setActivePhoto] = useState(0);
  const [activeView, setActiveView] = useState<VesselView>("profil");
  const cover = photos[0] ?? "";

  useEffect(() => {
    setActivePhoto(0);
  }, [cover]);

  if (photos.length > 0) {
    return (
      <div className="space-y-3">
        <ZoomablePhoto
          key={photos[activePhoto] ?? photos[0]}
          src={photos[activePhoto] ?? photos[0]!}
          alt={product.name}
          priority
        />
        {photos.length > 1 ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {photos.map((src, index) => (
              <button
                key={src}
                type="button"
                onClick={() => setActivePhoto(index)}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-xl transition-opacity duration-300",
                  activePhoto === index ? "ring-2 ring-czerwony ring-offset-2" : "opacity-70 hover:opacity-100",
                )}
              >
                <Image src={src} alt="" fill className="object-cover" sizes="120px" />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AtelierFrame product={product} view={activeView} className="aspect-[5/6] min-h-[20rem] rounded-2xl md:aspect-[4/5]" />
      <div className="grid grid-cols-3 gap-2">
        {views.map((view) => (
          <button
            key={view.id}
            type="button"
            onClick={() => setActiveView(view.id)}
            className={cn(
              "aspect-square overflow-hidden rounded-xl transition-opacity duration-300",
              activeView === view.id ? "ring-2 ring-czerwony ring-offset-2" : "opacity-70 hover:opacity-100",
            )}
          >
            <AtelierFrame product={product} view={view.id} className="h-full min-h-full rounded-xl" caption={view.label} />
          </button>
        ))}
      </div>
    </div>
  );
}
