"use client";

import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CatalogFilterFields, type CategoryCounts } from "@/components/shop/catalog-filter-fields";
import type { ShopLaneId } from "@/lib/shop-lanes";
import { cn } from "@/lib/utils";

export function CatalogFilters({
  priceBounds,
  categoryCounts,
  lane,
}: {
  priceBounds: { minCents: number; maxCents: number };
  categoryCounts: CategoryCounts;
  lane: ShopLaneId;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  const capacity = params.get("pojemnosc");
  const domain = params.get("domena");
  const category = params.get("kategoria");
  const minParam = params.get("cena_od");
  const maxParam = params.get("cena_do");
  const activeCount = [capacity, domain, category, minParam, maxParam].filter(Boolean).length;

  function pushParams(mutate: (next: URLSearchParams) => void) {
    const next = new URLSearchParams(params.toString());
    mutate(next);
    next.delete("strona");
    next.set("sklep", lane);
    router.push(`/sklep?${next.toString()}`);
  }

  const fieldProps = {
    lane,
    capacity,
    domain,
    category,
    minParam,
    maxParam,
    floorZl: Math.floor(priceBounds.minCents / 100),
    ceilZl: Math.ceil(priceBounds.maxCents / 100),
    categoryCounts,
    hasActive: activeCount > 0,
    onClear: () => router.push(`/sklep?sklep=${lane}`),
    onPush: pushParams,
  };

  return (
    <>
      <div className="rounded-2xl border border-szary bg-bialy lg:hidden">
        <div className="flex items-center gap-2 p-2.5">
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="flex h-10 flex-1 items-center justify-between rounded-xl bg-krem px-3 font-heading text-[11px] uppercase tracking-[0.14em] text-czarny"
          >
            <span className="inline-flex items-center gap-2">
              <SlidersHorizontal className="size-3.5" strokeWidth={1.75} aria-hidden />
              Filtry
              {activeCount > 0 ? (
                <span className="rounded-full bg-czerwony px-1.5 py-0.5 text-[10px] text-bialy">{activeCount}</span>
              ) : null}
            </span>
            <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} aria-hidden />
          </button>
          <a
            href="/sklep"
            className="flex h-10 shrink-0 items-center px-2 font-heading text-[10px] uppercase tracking-[0.12em] text-czerwony"
          >
            Sklepy
          </a>
        </div>
        {open ? (
          <div className="border-t border-krem-ciemny p-4">
            <CatalogFilterFields {...fieldProps} />
          </div>
        ) : null}
      </div>

      <aside className="hidden rounded-2xl border border-szary bg-bialy p-4 lg:sticky lg:top-24 lg:block">
        <div className="mb-5">
          <a
            href="/sklep"
            className="font-heading text-[10px] uppercase tracking-[0.14em] text-czerwony underline decoration-czerwony/30 underline-offset-4"
          >
            Zmień sklep
          </a>
        </div>
        <CatalogFilterFields {...fieldProps} />
      </aside>
    </>
  );
}
