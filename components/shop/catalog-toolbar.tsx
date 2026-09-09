"use client";

import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { CATALOG_SORT_OPTIONS, type CatalogSortId } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function CatalogToolbar({
  total,
  from,
  to,
}: {
  total: number;
  from: number;
  to: number;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const requested = params.get("sortuj") as CatalogSortId | null;
  const current = CATALOG_SORT_OPTIONS.some((option) => option.id === requested)
    ? (requested as CatalogSortId)
    : "domyslne";

  function onSortChange(value: string) {
    const next = new URLSearchParams(params.toString());
    if (!value || value === "domyslne") next.delete("sortuj");
    else next.set("sortuj", value);
    next.delete("strona");
    const query = next.toString();
    router.push(query ? `/sklep?${query}` : "/sklep");
  }

  const rangeLabel =
    total === 0
      ? "Brak wyników"
      : `Wyświetlanie ${from}–${to} z ${total} ${total === 1 ? "wyniku" : "wyników"}`;

  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-czarny/70">{rangeLabel}</p>

      <Select.Root value={current} onValueChange={onSortChange}>
        <Select.Trigger
          aria-label="Sortowanie produktów"
          className={cn(
            "inline-flex h-10 w-full items-center justify-between gap-4 border border-czarny/12 bg-bialy px-3 text-left sm:w-auto sm:min-w-[16.5rem]",
            "font-heading text-[10px] uppercase tracking-[0.12em] text-czarny",
            "outline-none transition-colors duration-200",
            "hover:border-czerwony/40 focus-visible:border-czerwony",
            "data-[state=open]:border-czerwony",
          )}
        >
          <Select.Value />
          <Select.Icon className="text-czerwony">
            <ChevronDown className="size-3.5" strokeWidth={1.75} aria-hidden />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={6}
            className="z-[70] min-w-[var(--radix-select-trigger-width)] overflow-hidden border border-czarny/10 bg-bialy shadow-[0_12px_40px_-18px_rgb(1_1_1_/_0.28)]"
          >
            <Select.Viewport className="p-1">
              {CATALOG_SORT_OPTIONS.map((option) => (
                <Select.Item
                  key={option.id}
                  value={option.id}
                  className={cn(
                    "relative flex cursor-pointer items-center justify-between gap-6 py-2.5 pl-3 pr-3",
                    "font-heading text-[10px] uppercase tracking-[0.12em] text-czarny/70 outline-none",
                    "data-[highlighted]:bg-krem data-[highlighted]:text-czarny",
                    "data-[state=checked]:text-czerwony",
                  )}
                >
                  <Select.ItemText>{option.label}</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check className="size-3.5 text-czerwony" strokeWidth={1.75} aria-hidden />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
