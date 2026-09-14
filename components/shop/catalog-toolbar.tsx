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
    <div className="mb-5 flex flex-col gap-3 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[15px] leading-snug text-czarny/70 sm:text-sm">{rangeLabel}</p>

      <Select.Root value={current} onValueChange={onSortChange}>
        <Select.Trigger
          aria-label="Sortowanie produktów"
          className={cn(
            "inline-flex h-12 w-full items-center justify-between gap-3 rounded-2xl border border-czarny/12 bg-bialy px-4 text-left sm:h-11 sm:w-auto sm:min-w-[17rem]",
            "font-heading text-[13px] uppercase tracking-[0.14em] text-czarny sm:text-[12px]",
            "outline-none transition-colors duration-200",
            "hover:border-czerwony/40 focus-visible:border-czerwony",
            "data-[state=open]:border-czerwony data-[state=open]:bg-krem/40",
          )}
        >
          <Select.Value placeholder="Sortowanie" />
          <Select.Icon className="text-czerwony">
            <ChevronDown className="size-4 sm:size-3.5" strokeWidth={1.75} aria-hidden />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={8}
            collisionPadding={16}
            className={cn(
              "z-[70] w-[var(--radix-select-trigger-width)] overflow-hidden rounded-2xl",
              "border border-czarny/10 bg-bialy shadow-[0_18px_48px_-20px_rgb(1_1_1_/_0.35)]",
              "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            )}
          >
            <Select.Viewport className="p-1.5">
              {CATALOG_SORT_OPTIONS.map((option) => (
                <Select.Item
                  key={option.id}
                  value={option.id}
                  className={cn(
                    "relative flex cursor-pointer items-center justify-between gap-4 rounded-xl py-3.5 pl-3.5 pr-3 sm:py-2.5",
                    "font-heading text-[13px] uppercase tracking-[0.12em] text-czarny/75 outline-none sm:text-[11px]",
                    "data-[highlighted]:bg-krem data-[highlighted]:text-czarny",
                    "data-[state=checked]:bg-czerwony/8 data-[state=checked]:text-czerwony",
                  )}
                >
                  <Select.ItemText>{option.label}</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check className="size-4 text-czerwony sm:size-3.5" strokeWidth={1.75} aria-hidden />
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
