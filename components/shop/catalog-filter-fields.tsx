"use client";

import { PriceFilter } from "@/components/shop/price-filter";
import { CAPACITY_FILTERS } from "@/lib/constants";
import { categoryTreeForLane, type ShopLaneId } from "@/lib/shop-lanes";
import { cn } from "@/lib/utils";

export type CategoryCounts = {
  byCategory: Record<string, number>;
  byDomain: Record<string, number>;
};

export function CatalogFilterFields({
  lane,
  capacity,
  domain,
  category,
  minParam,
  maxParam,
  floorZl,
  ceilZl,
  categoryCounts,
  hasActive,
  onClear,
  onPush,
}: {
  lane: ShopLaneId;
  capacity: string | null;
  domain: string | null;
  category: string | null;
  minParam: string | null;
  maxParam: string | null;
  floorZl: number;
  ceilZl: number;
  categoryCounts: CategoryCounts;
  hasActive: boolean;
  onClear: () => void;
  onPush: (mutate: (next: URLSearchParams) => void) => void;
}) {
  function selectDomain(nextDomain: string) {
    onPush((next) => {
      if (domain === nextDomain && !category) next.delete("domena");
      else {
        next.set("domena", nextDomain);
        next.delete("kategoria");
      }
    });
  }

  function selectCategory(nextDomain: string, nextCategory: string) {
    onPush((next) => {
      if (category === nextCategory) {
        next.delete("kategoria");
        next.set("domena", nextDomain);
      } else {
        next.set("domena", nextDomain);
        next.set("kategoria", nextCategory);
      }
    });
  }

  return (
    <div className="space-y-5">
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="font-heading text-[11px] uppercase tracking-[0.18em] text-czerwony">Cena</p>
          {hasActive ? (
            <button
              type="button"
              onClick={onClear}
              className="font-heading text-[10px] uppercase tracking-[0.14em] text-czerwony underline decoration-czerwony/30 underline-offset-4"
            >
              Wyczyść
            </button>
          ) : null}
        </div>
        <PriceFilter
          floorZl={floorZl}
          ceilZl={ceilZl}
          initialMin={minParam ? Number(minParam) : floorZl}
          initialMax={maxParam ? Number(maxParam) : ceilZl}
          onCommit={(minZl, maxZl) => {
            onPush((next) => {
              if (minZl <= floorZl) next.delete("cena_od");
              else next.set("cena_od", String(minZl));
              if (maxZl >= ceilZl) next.delete("cena_do");
              else next.set("cena_do", String(maxZl));
            });
          }}
        />
      </section>

      <section className="space-y-3 border-t border-krem-ciemny pt-5">
        <p className="font-heading text-[11px] uppercase tracking-[0.18em] text-czerwony">Kategorie</p>
        <ul className="space-y-4">
          {categoryTreeForLane(lane).map((group) => {
            const domainCount = categoryCounts.byDomain[group.domain] ?? 0;
            const domainActive = domain === group.domain && !category;
            return (
              <li key={group.id} className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => selectDomain(group.domain)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-[15px] font-medium transition-colors",
                    domainActive ? "bg-krem text-czerwony" : "text-czarny hover:bg-krem",
                  )}
                >
                  <span>{group.label}</span>
                  <Count>{domainCount}</Count>
                </button>
                <ul className="space-y-0.5 pl-1">
                  {group.children.map((child) => {
                    const count = categoryCounts.byCategory[child.category] ?? 0;
                    const active = category === child.category;
                    return (
                      <li key={child.id}>
                        <button
                          type="button"
                          onClick={() => selectCategory(group.domain, child.category)}
                          className={cn(
                            "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors",
                            active && "bg-czerwony/10 text-czerwony",
                            !active && count > 0 && "text-czarny/80 hover:bg-krem hover:text-czarny",
                            !active && count === 0 && "text-czarny/35",
                          )}
                        >
                          <span>{child.label}</span>
                          <Count muted={count === 0}>{count}</Count>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      </section>

      {lane === "uzytkowa" ? (
        <section className="space-y-3 border-t border-krem-ciemny pt-5">
          <p className="font-heading text-[11px] uppercase tracking-[0.18em] text-czerwony">Pojemność</p>
          <div className="flex flex-wrap gap-1.5">
            <Chip active={!capacity} onClick={() => onPush((next) => next.delete("pojemnosc"))}>
              Wszystkie
            </Chip>
            {CAPACITY_FILTERS.map((filter) => (
              <Chip
                key={filter.value}
                active={capacity === String(filter.value)}
                hint={filter.hint}
                onClick={() =>
                  onPush((next) => {
                    if (capacity === String(filter.value)) next.delete("pojemnosc");
                    else next.set("pojemnosc", String(filter.value));
                  })
                }
              >
                {filter.label}
              </Chip>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Count({ children, muted = false }: { children: number; muted?: boolean }) {
  return (
    <span
      className={cn(
        "font-heading text-[10px] tabular-nums tracking-wide",
        muted ? "text-czarny/30" : "text-czarny/45",
      )}
    >
      {children}
    </span>
  );
}

function Chip({
  active,
  onClick,
  children,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={hint}
      className={cn(
        "rounded-full border px-2.5 py-1 font-heading text-[10px] uppercase tracking-[0.12em] transition-colors",
        active
          ? "border-czerwony bg-czerwony text-bialy"
          : "border-szary bg-krem text-czarny hover:border-czerwony hover:text-czerwony",
      )}
    >
      {children}
    </button>
  );
}
