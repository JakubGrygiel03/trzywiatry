"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SurfaceTile, SurfaceTileBody } from "@/components/ui/surface-tile";
import { formatPLNExact } from "@/lib/format";
import { onProductNavigateClick } from "@/lib/scroll-to-top";
import { useRecentlyViewedStore } from "@/store/use-recently-viewed-store";

export function RecentlyViewed({
  excludeId,
  limit = 3,
}: {
  excludeId?: string;
  limit?: number;
}) {
  const items = useRecentlyViewedStore((state) => state.items);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  const visible = items.filter((item) => item.id !== excludeId).slice(0, Math.min(limit, 3));
  if (visible.length === 0) return null;

  return (
    <SurfaceTile>
      <SurfaceTileBody className="space-y-5">
        <h2 className="font-heading text-sm uppercase tracking-[0.2em] text-czarny">
          Ostatnio oglądane
        </h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {visible.map((item) => (
            <li key={item.id}>
              <Link
                href={`/sklep/${item.slug}`}
                prefetch
                onClick={onProductNavigateClick}
                className="group flex gap-3 rounded-xl border border-czarny/8 bg-krem/50 p-2.5 transition-colors hover:border-czerwony/40"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-krem">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-400 group-hover:scale-105"
                    sizes="56px"
                  />
                </div>
                <div className="min-w-0 space-y-1 pt-0.5">
                  <p className="line-clamp-2 text-sm leading-snug text-czarny group-hover:text-czerwony">
                    {item.name}
                  </p>
                  <p className="font-heading text-[11px] uppercase tracking-[0.08em] text-czarny/65">
                    {formatPLNExact(item.priceInCents)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </SurfaceTileBody>
    </SurfaceTile>
  );
}
