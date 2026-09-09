"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPLNExact } from "@/lib/format";
import { useRecentlyViewedStore } from "@/store/use-recently-viewed-store";

export function RecentlyViewed({
  excludeId,
  limit = 6,
}: {
  /** Hide the product currently being viewed on PDP. */
  excludeId?: string;
  limit?: number;
}) {
  const items = useRecentlyViewedStore((state) => state.items);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  const visible = items.filter((item) => item.id !== excludeId).slice(0, limit);
  if (visible.length === 0) return null;

  return (
    <section className="border-t border-czarny/8 pt-8">
      <h2 className="mb-5 text-center font-heading text-sm uppercase tracking-[0.2em] text-czarny">
        Ostatnio oglądane
      </h2>
      <ul className="flex flex-wrap justify-center gap-6 md:gap-8">
        {visible.map((item) => (
          <li key={item.id}>
            <Link href={`/sklep/${item.slug}`} className="group flex max-w-[11rem] gap-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-krem">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-400 group-hover:scale-105"
                  sizes="64px"
                />
              </div>
              <div className="min-w-0 space-y-1 pt-0.5">
                <p className="text-sm leading-snug text-ceglany group-hover:text-czerwony">{item.name}</p>
                <p className="text-sm text-czarny">{formatPLNExact(item.priceInCents)}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
