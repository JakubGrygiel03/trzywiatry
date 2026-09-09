"use client";

import Image from "next/image";
import { useRef, useState, type MouseEvent } from "react";
import { Search } from "lucide-react";
import { AtelierFrame } from "@/components/visual/atelier-frame";
import { getProductPhoto } from "@/lib/media";
import type { Product } from "@/lib/types";
import type { VesselView } from "@/lib/visual";
import { cn } from "@/lib/utils";

const views: { id: VesselView; label: string }[] = [
  { id: "profil", label: "Profil" },
  { id: "szkliwo", label: "Szkliwo" },
  { id: "stopka", label: "Stopka" },
];

/** Smooth hover zoom: scale + transform-origin follow the cursor (no layout jump). */
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

  function onMove(event: MouseEvent<HTMLDivElement>) {
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  }

  return (
    <div
      ref={frameRef}
      className="group/zoom relative aspect-[5/6] cursor-zoom-in overflow-hidden rounded-2xl bg-krem md:aspect-[4/5]"
      onMouseEnter={() => setZoomed(true)}
      onMouseLeave={() => {
        setZoomed(false);
        setOrigin("50% 50%");
      }}
      onMouseMove={onMove}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 1024px) 100vw, 55vw"
        className="object-cover will-change-transform"
        style={{
          transformOrigin: origin,
          transform: zoomed ? "scale(1.22)" : "scale(1)",
          transition: "transform 650ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />
      <span
        className="pointer-events-none absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-bialy/90 text-czarny shadow-sm transition-opacity duration-300 group-hover/zoom:opacity-0"
        aria-hidden
      >
        <Search className="h-4 w-4" strokeWidth={1.75} />
      </span>
    </div>
  );
}

export function ProductGallery({ product }: { product: Product }) {
  const photos = product.images.filter((src) => Boolean(getProductPhoto({ images: [src] })));
  const [activePhoto, setActivePhoto] = useState(0);
  const [activeView, setActiveView] = useState<VesselView>("profil");

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
