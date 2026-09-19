"use client";

import { ChevronDown, Search } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  filterPhoneCountries,
  findPhoneCountry,
  type PhoneCountry,
} from "@/lib/phone-countries";
import { cn } from "@/lib/utils";

type CountryDialPickerProps = {
  valueIso: string;
  onChange: (country: PhoneCountry) => void;
  className?: string;
  buttonClassName?: string;
};

export function CountryDialPicker({
  valueIso,
  onChange,
  className,
  buttonClassName,
}: CountryDialPickerProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = useMemo(() => findPhoneCountry("", valueIso), [valueIso]);
  const results = useMemo(() => filterPhoneCountries(query), [query]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => searchRef.current?.focus(), 10);
    function onDoc(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative shrink-0", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`Kod kraju: +${selected.dial} ${selected.label}`}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex h-11 min-w-[7.75rem] items-center justify-between gap-1 rounded-2xl border border-czarny/10 bg-bialy px-2.5 text-left text-sm outline-none transition-colors hover:border-czarny/25 focus:border-czerwony sm:min-w-[8.75rem]",
          buttonClassName,
        )}
      >
        <span className="truncate font-medium tracking-wide">+{selected.dial}</span>
        <ChevronDown className={cn("size-3.5 shrink-0 text-czarny/45 transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <div
          id={listId}
          role="listbox"
          aria-label="Wybierz kraj"
          className="absolute left-0 top-[calc(100%+6px)] z-50 w-[min(100vw-2rem,18.5rem)] overflow-hidden rounded-2xl border border-czarny/10 bg-bialy shadow-[0_18px_40px_-24px_rgb(1_1_1_/_0.45)]"
        >
          <div className="border-b border-czarny/8 p-2">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-czarny/35" />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Szukaj kraju lub +48…"
                autoComplete="off"
                className="h-10 w-full rounded-xl border border-czarny/10 bg-krem pl-8 pr-3 text-sm outline-none placeholder:text-czarny/35 focus:border-czerwony focus:bg-bialy"
              />
            </label>
          </div>
          <ul className="max-h-56 overflow-y-auto overscroll-contain py-1">
            {results.length === 0 ? (
              <li className="px-3 py-4 text-center text-sm text-czarny/45">Brak wyników</li>
            ) : (
              results.map((country) => {
                const active = country.iso === selected.iso;
                return (
                  <li key={country.iso}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => {
                        onChange(country);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition-colors",
                        active ? "bg-czerwony/10 text-czarny" : "hover:bg-krem text-czarny/85",
                      )}
                    >
                      <span className="min-w-0 truncate">{country.label}</span>
                      <span className="shrink-0 font-medium tabular-nums text-czarny/55">+{country.dial}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
