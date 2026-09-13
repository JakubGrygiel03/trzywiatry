"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { HeroGalleryItem } from "@/lib/data/queries";
import { cn } from "@/lib/utils";

const FADE_MS = 1200;

/** Two stacked photos — outgoing stays put until the next frame has faded in. */
export function HeroTile({ product, priority }: { product: HeroGalleryItem; priority?: boolean }) {
  const [shown, setShown] = useState(product);
  const [incoming, setIncoming] = useState<HeroGalleryItem | null>(null);
  const [visible, setVisible] = useState(false);
  const incomingRef = useRef(incoming);
  incomingRef.current = incoming;

  useEffect(() => {
    if (product.image === shown.image) return;
    if (incomingRef.current?.image === product.image) return;
    setIncoming(product);
    setVisible(false);
  }, [product, shown.image]);

  useEffect(() => {
    if (!incoming || visible) return;
    const id = window.setTimeout(() => setVisible(true), 40);
    return () => window.clearTimeout(id);
  }, [incoming, visible]);

  useEffect(() => {
    if (!incoming || !visible) return;
    const id = window.setTimeout(() => {
      setShown(incoming);
      setIncoming(null);
      setVisible(false);
    }, FADE_MS);
    return () => window.clearTimeout(id);
  }, [incoming, visible]);

  return (
    <>
      <Image
        src={shown.image}
        alt={shown.name}
        fill
        priority={priority}
        sizes="(max-width: 768px) 33vw, 26vw"
        className="object-cover object-center"
      />
      {incoming ? (
        <Image
          src={incoming.image}
          alt={incoming.name}
          fill
          sizes="(max-width: 768px) 33vw, 26vw"
          className={cn(
            "object-cover object-center transition-opacity ease-out motion-reduce:transition-none",
            visible ? "opacity-100" : "opacity-0",
          )}
          style={{ transitionDuration: `${FADE_MS}ms` }}
        />
      ) : null}
    </>
  );
}
