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
      <div className="overflow-hidden rounded-2xl border border-czarny/10 bg-bialy shadow-[0_10px_28px_-22px_rgb(1_1_1_/_0.35)] lg:hidden">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="flex h-14 w-full items-center justify-between gap-3 px-4 text-left transition-colors hover:bg-krem/50"
        >
          <span className="inline-flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-krem text-czerwony">
              <SlidersHorizontal className="size-4" strokeWidth={1.75} aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block font-heading text-[14px] uppercase tracking-[0.14em] text-czarny">
                Filtry
              </span>
              <span className="mt-0.5 block truncate text-[13px] text-czarny/55">
                {activeCount > 0
                  ? `${activeCount} aktywne · dotknij, by zmienić`
                  : "Cena, kategorie, pojemność"}
              </span>
            </span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-2">
            {activeCount > 0 ? (
              <span className="rounded-full bg-czerwony px-2 py-0.5 font-heading text-[11px] text-bialy">
                {activeCount}
              </span>
            ) : null}
            <ChevronDown
              className={cn("size-5 text-czarny/50 transition-transform duration-200", open && "rotate-180")}
              aria-hidden
            />
          </span>
        </button>

        {open ? (
          <div className="space-y-5 border-t border-czarny/8 bg-papier/60 px-4 py-5">
            <a
              href="/sklep"
              className="inline-flex font-heading text-[12px] uppercase tracking-[0.14em] text-czerwony underline decoration-czerwony/30 underline-offset-4"
            >
              Zmień sklep
            </a>
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
