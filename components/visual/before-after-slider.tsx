"use client";

import { useRef, useState } from "react";
import Image from "next/image";

function Layer({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, 672px"
      quality={70}
      draggable={false}
      className={className ?? "object-cover"}
    />
  );
}

export function BeforeAfterSlider({
  before,
  after,
  title,
  beforeLabel = "Przed",
  afterLabel = "Po",
}: {
  before: string;
  after: string;
  title: string;
  beforeLabel?: string;
  afterLabel?: string;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(52);

  function move(clientX: number) {
    const rect = frame.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition(Math.min(94, Math.max(6, ((clientX - rect.left) / rect.width) * 100)));
  }

  return (
    <figure className="overflow-hidden rounded-2xl bg-bialy ring-1 ring-czarny/8">
      <div
        ref={frame}
        className="relative aspect-square cursor-ew-resize touch-none overflow-hidden bg-krem select-none"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          move(event.clientX);
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) move(event.clientX);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") setPosition((value) => Math.max(6, value - 4));
          if (event.key === "ArrowRight") setPosition((value) => Math.min(94, value + 4));
        }}
        tabIndex={0}
        role="slider"
        aria-valuemin={6}
        aria-valuemax={94}
        aria-valuenow={Math.round(position)}
        aria-label={`${title}: porównanie ${beforeLabel} i ${afterLabel}`}
      >
        <Layer src={after} alt={`${title} — ${afterLabel}`} />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
          <Layer src={before} alt={`${title} — ${beforeLabel}`} />
        </div>
        <div className="absolute inset-y-0 w-0.5 bg-bialy" style={{ left: `${position}%` }} />
        <div
          className="absolute top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-bialy text-sm font-semibold text-czarny shadow"
          style={{ left: `${position}%` }}
          aria-hidden
        >
          ↔
        </div>
        <span className="absolute top-3 left-3 rounded-full bg-bialy px-3 py-1 text-xs font-medium text-czarny">
          {beforeLabel}
        </span>
        <span className="absolute top-3 right-3 rounded-full bg-bialy px-3 py-1 text-xs font-medium text-czarny">
          {afterLabel}
        </span>
      </div>
      {title ? (
        <figcaption className="px-4 py-3 font-heading text-sm uppercase tracking-[0.08em] text-czarny">
          {title}
        </figcaption>
      ) : null}
    </figure>
  );
}
