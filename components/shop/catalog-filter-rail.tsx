"use client";

import type { ReactNode } from "react";
import { CAPACITY_FILTERS } from "@/lib/constants";
import { categoryTreeForLane, type ShopLaneId } from "@/lib/shop-lanes";
import { cn } from "@/lib/utils";

type CategoryCounts = {
  byCategory: Record<string, number>;
  byDomain: Record<string, number>;
};

/** Tablet chip rail — wraps so Windows never paints a terracotta overflow bar over the chips. */
export function CatalogFilterRail({
  lane,
  capacity,
  domain,
  category,
  hasActive,
  categoryCounts,
  onClear,
  onPush,
}: {
  lane: ShopLaneId;
  capacity: string | null;
  domain: string | null;
  category: string | null;
  hasActive: boolean;
  categoryCounts: CategoryCounts;
  onClear: () => void;
  onPush: (mutate: (next: URLSearchParams) => void) => void;
}) {
  const tree = categoryTreeForLane(lane);

  return (
    <div className="sticky top-[var(--site-chrome)] z-20 -mx-1 hidden overflow-x-hidden border-b border-czarny/8 bg-papier/95 pb-1 backdrop-blur-sm md:block lg:hidden">
      <div
        className="catalog-filter-rail flex flex-wrap items-center gap-2 overflow-x-hidden px-1 py-3"
        role="navigation"
        aria-label="Filtry katalogu"
      >
        <a
          href="/sklep"
          className="shrink-0 rounded-full border border-czerwony/35 bg-bialy px-3 py-2 font-heading text-[10px] uppercase tracking-[0.14em] text-czerwony"
        >
          Zmień sklep
        </a>

        {hasActive ? (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 rounded-full border border-czarny/15 bg-bialy px-3 py-2 font-heading text-[10px] uppercase tracking-[0.14em] text-czarny/70"
          >
            Wyczyść
          </button>
        ) : null}

        {tree.map((group) => {
          const domainActive = domain === group.domain && !category;
          return (
            <div key={group.id} className="flex flex-wrap items-center gap-1.5">
              <RailChip
                active={domainActive}
                onClick={() =>
                  onPush((next) => {
                    if (domain === group.domain && !category) next.delete("domena");
                    else {
                      next.set("domena", group.domain);
                      next.delete("kategoria");
                    }
                  })
                }
              >
                {group.label}
                <span className="ml-1 opacity-50">{categoryCounts.byDomain[group.domain] ?? 0}</span>
              </RailChip>
              {group.children.map((child) => {
                const active = category === child.category;
                const count = categoryCounts.byCategory[child.category] ?? 0;
                return (
                  <RailChip
                    key={child.id}
                    active={active}
                    muted={count === 0 && !active}
                    onClick={() =>
                      onPush((next) => {
                        if (category === child.category) {
                          next.delete("kategoria");
                          next.set("domena", group.domain);
                        } else {
                          next.set("domena", group.domain);
                          next.set("kategoria", child.category);
                        }
                      })
                    }
                  >
                    {child.label}
                  </RailChip>
                );
              })}
            </div>
          );
        })}

        {lane === "uzytkowa" ? (
          <div className="flex flex-wrap items-center gap-1.5 border-l border-czarny/10 pl-2">
            <RailChip active={!capacity} onClick={() => onPush((next) => next.delete("pojemnosc"))}>
              ml · wszystkie
            </RailChip>
            {CAPACITY_FILTERS.map((filter) => (
              <RailChip
                key={filter.value}
                active={capacity === String(filter.value)}
                title={filter.hint}
                onClick={() =>
                  onPush((next) => {
                    if (capacity === String(filter.value)) next.delete("pojemnosc");
                    else next.set("pojemnosc", String(filter.value));
                  })
                }
              >
                {filter.label}
              </RailChip>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function RailChip({
  active,
  muted,
  onClick,
  children,
  title,
}: {
  active: boolean;
  muted?: boolean;
  onClick: () => void;
  children: ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3 py-2 font-heading text-[10px] uppercase tracking-[0.12em] transition-colors",
        active && "border-czerwony bg-czerwony text-bialy",
        !active && !muted && "border-czarny/12 bg-bialy text-czarny hover:border-czerwony/40",
        muted && "border-czarny/8 bg-bialy/70 text-czarny/35",
      )}
    >
      {children}
    </button>
  );
}
