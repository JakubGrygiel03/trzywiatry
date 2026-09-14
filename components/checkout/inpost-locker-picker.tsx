"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { InpostLockerMap } from "@/components/checkout/inpost-locker-map";
import type { InpostPoint } from "@/lib/inpost-points";
import { formatLockerLabel } from "@/lib/inpost-points";
import { cn } from "@/lib/utils";

export function InpostLockerPicker({
  postalCode,
  city,
  value,
  onChange,
}: {
  postalCode: string;
  city: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [query, setQuery] = useState(postalCode || city);
  const [points, setPoints] = useState<InpostPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [focus, setFocus] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [listOpen, setListOpen] = useState(true);
  const selectedName = value.split(" · ")[0];

  function search(nextQuery = query, coords?: { lat: number; lng: number }) {
    const params = new URLSearchParams();
    if (coords) {
      params.set("lat", String(coords.lat));
      params.set("lng", String(coords.lng));
      setFocus(coords);
    } else if (nextQuery.trim()) {
      params.set("q", nextQuery.trim());
      setFocus(null);
    } else {
      setFocus(null);
    }

    setLoading(true);
    setError("");
    void fetch(`/api/inpost/points?${params}`)
      .then(async (response) => {
        const payload = (await response.json()) as { items?: InpostPoint[] };
        const items = payload.items ?? [];
        setPoints(items);
        if (items.length === 0) {
          setError(
            coords
              ? "Brak paczkomatów w promieniu ~3 km. Spróbuj wpisać kod pocztowy."
              : "Nie znaleziono paczkomatów. Spróbuj innego miasta lub kodu.",
          );
        }
      })
      .catch(() => setError("Nie udało się wczytać mapy InPost. Spróbuj ponownie."))
      .finally(() => {
        setLoading(false);
        setLocating(false);
      });
  }

  useEffect(() => {
    const next = (postalCode || city).trim();
    setQuery(next);
    search(next);
    // Re-search when checkout address changes (also covers initial empty → atelier default).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postalCode, city]);

  function locate() {
    if (!navigator.geolocation) {
      setError("Przeglądarka nie udostępnia lokalizacji.");
      return;
    }
    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (position) => search(query, { lat: position.coords.latitude, lng: position.coords.longitude }),
      () => {
        setLocating(false);
        setError("Nie udało się pobrać lokalizacji. Wpisz miasto lub kod pocztowy.");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60_000 },
    );
  }

  function selectPoint(point: InpostPoint) {
    onChange(formatLockerLabel(point));
    setListOpen(false);
  }

  const listCountLabel = loading && points.length === 0
    ? "szukam…"
    : `${points.length} ${points.length === 1 ? "punkt" : "punktów"}`;

  return (
    <div className="space-y-3 rounded-[28px] border border-czarny/10 bg-bialy p-4 md:p-5">
      <div>
        <Label htmlFor="inpostLocker">
          Paczkomat InPost <span className="text-czerwony">*</span>
        </Label>
        <p className="mt-1 text-xs text-szary">
          Wybierz punkt z listy albo kliknij pinezkę na mapie. „Najbliższe” przybliża mapę wokół Ciebie.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              search(query);
            }
          }}
          placeholder="Miasto, kod pocztowy lub numer, np. GDA97M"
          className="min-w-0"
        />
        <Button type="button" variant="secondary" onClick={() => search(query)}>
          Szukaj
        </Button>
        <Button type="button" variant="outline" onClick={locate} disabled={locating}>
          {locating ? "Szukam…" : "Najbliższe"}
        </Button>
      </div>

      {/* Mobile: roomy collapsible list + map below. Desktop: list | map. */}
      <div className="grid gap-3 lg:grid-cols-[minmax(0,280px)_1fr] lg:items-start">
        <div className="overflow-hidden rounded-[22px] border border-czarny/10 bg-papier/50 lg:border-0 lg:bg-transparent">
          <button
            type="button"
            aria-expanded={listOpen}
            onClick={() => setListOpen((open) => !open)}
            className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-krem/60 lg:hidden"
          >
            <span className="min-w-0">
              <span className="block font-heading text-[13px] uppercase tracking-[0.14em] text-czarny">
                Lista paczkomatów
              </span>
              <span className="mt-0.5 block truncate text-[13px] text-czarny/55">
                {value ? `${selectedName} · wybrany` : listCountLabel}
              </span>
            </span>
            <ChevronDown
              className={cn(
                "size-5 shrink-0 text-czarny/45 transition-transform duration-200",
                listOpen && "rotate-180",
              )}
              aria-hidden
            />
          </button>

          <div className={cn(listOpen ? "block" : "hidden", "lg:block")}>
            <ul className="tw-scroll max-h-[min(52dvh,22rem)] space-y-2 overflow-y-auto border-t border-czarny/8 px-3 py-3 lg:max-h-[380px] lg:border-0 lg:px-0 lg:py-0">
              {loading && points.length === 0 ? (
                <li className="px-1 py-3 text-sm text-szary">Szukam paczkomatów…</li>
              ) : null}
              {error ? <li className="px-1 py-3 text-sm text-czerwony">{error}</li> : null}
              {points.map((point) => (
                <li key={point.name}>
                  <button
                    type="button"
                    onClick={() => selectPoint(point)}
                    className={cn(
                      "w-full rounded-2xl border px-4 py-3.5 text-left transition-colors sm:px-3 sm:py-2.5",
                      point.name === selectedName
                        ? "border-czerwony bg-krem"
                        : "border-czarny/10 bg-bialy hover:border-czerwony/40",
                    )}
                  >
                    <span className="font-heading text-[12px] uppercase tracking-[0.14em] text-czerwony sm:text-xs sm:tracking-[0.12em]">
                      {point.name}
                    </span>
                    <span className="mt-1.5 block text-[15px] font-medium leading-snug text-czarny sm:mt-1 sm:text-sm sm:font-normal">
                      {point.address}
                    </span>
                    {point.description ? (
                      <span className="mt-1 block text-[13px] leading-snug text-szary sm:text-xs">
                        {point.description}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="h-[260px] overflow-hidden rounded-[22px] border border-czarny/8 sm:h-[300px] lg:h-[380px]">
          <InpostLockerMap
            points={points}
            selectedName={selectedName}
            focus={focus}
            onSelect={selectPoint}
          />
        </div>
      </div>

      <Input
        id="inpostLocker"
        name="inpostLocker"
        value={value}
        readOnly
        required
        placeholder="Nie wybrano — kliknij punkt na mapie lub z listy"
        className={cn(value ? "bg-krem" : "bg-papier")}
      />
    </div>
  );
}
