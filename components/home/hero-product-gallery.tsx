"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { HeroGalleryItem } from "@/lib/data/queries";

const INTERVAL_MS = 5500;
const SLOT_COUNT = 3;

function pickInitialSlots(products: HeroGalleryItem[]): HeroGalleryItem[] {
  if (products.length === 0) return [];
  return Array.from({ length: Math.min(SLOT_COUNT, products.length) }, (_, i) => products[i]!);
}

function nextUnused(products: HeroGalleryItem[], occupiedIds: Set<string>, fromIndex: number) {
  if (products.length === 0) return { item: null as HeroGalleryItem | null, nextIndex: fromIndex };

  for (let offset = 0; offset < products.length; offset++) {
    const index = (fromIndex + offset) % products.length;
    const candidate = products[index]!;
    if (!occupiedIds.has(candidate.id) || products.length <= SLOT_COUNT) {
      return { item: candidate, nextIndex: (index + 1) % products.length };
    }
  }

  return { item: products[fromIndex % products.length]!, nextIndex: (fromIndex + 1) % products.length };
}

export function HeroProductGallery({ products }: { products: HeroGalleryItem[] }) {
  const [slots, setSlots] = useState(() => pickInitialSlots(products));
  const slotCursorRef = useRef(0);
  const poolCursorRef = useRef(Math.min(SLOT_COUNT, products.length));
  const productsRef = useRef(products);

  useEffect(() => {
    productsRef.current = products;
    setSlots(pickInitialSlots(products));
    slotCursorRef.current = 0;
    poolCursorRef.current = Math.min(SLOT_COUNT, products.length);
  }, [products]);

  useEffect(() => {
    if (products.length <= 1) return;

    const id = window.setInterval(() => {
      const pool = productsRef.current;
      setSlots((current) => {
        if (current.length === 0 || pool.length === 0) return current;

        const activeSlot = slotCursorRef.current % current.length;
        const occupied = new Set(current.map((item) => item.id));
        occupied.delete(current[activeSlot]!.id);

        const { item, nextIndex } = nextUnused(pool, occupied, poolCursorRef.current);
        if (!item) return current;

        const next = current.slice();
        next[activeSlot] = item;
        poolCursorRef.current = nextIndex;
        slotCursorRef.current = (activeSlot + 1) % current.length;
        return next;
      });
    }, INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [products.length]);

  if (slots.length === 0) return null;

  return (
    <div className="hero-mosaic">
      {slots.map((product, index) => (
        <Link
          key={`slot-${index}`}
          href={`/sklep/${product.slug}`}
          className="hero-mosaic__tile"
          aria-label={product.name}
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 768px) 33vw, 26vw"
            className="object-cover object-center"
          />
        </Link>
      ))}
    </div>
  );
}
