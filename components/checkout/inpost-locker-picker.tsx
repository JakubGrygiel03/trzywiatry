"use client";

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
  }

  return (
    <div className="space-y-3 rounded-[28px] border border-czarny/10 bg-bialy p-4 md:p-5">
      <div>
        <Label htmlFor="inpostLocker">
          Paczkomat InPost <span className="text-czerwony">*</span>
        </Label>
        <p className="mt-1 text-xs text-szary">
          „Najbliższe” przybliża mapę wokół Ciebie. Albo wybierz punkt z listy po lewej.
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

      <div className="grid gap-3 lg:grid-cols-[minmax(0,240px)_1fr]">
        <ul className="tw-scroll max-h-56 space-y-2 overflow-y-auto lg:max-h-[360px]">
          {loading && points.length === 0 ? <li className="text-sm text-szary">Szukam paczkomatów…</li> : null}
          {error ? <li className="text-sm text-czerwony">{error}</li> : null}
          {points.map((point) => (
            <li key={point.name}>
              <button
                type="button"
                onClick={() => selectPoint(point)}
                className={cn(
                  "w-full rounded-2xl border px-3 py-2 text-left transition-colors",
                  point.name === selectedName
                    ? "border-czerwony bg-krem"
                    : "border-czarny/10 hover:border-czerwony/40",
                )}
              >
                <span className="font-heading text-xs uppercase tracking-[0.12em] text-czerwony">{point.name}</span>
                <span className="mt-1 block text-sm leading-snug">{point.address}</span>
                {point.description ? <span className="mt-1 block text-xs text-szary">{point.description}</span> : null}
              </button>
            </li>
          ))}
        </ul>
        <div className="h-[280px] overflow-hidden rounded-[22px] border border-czarny/8 lg:h-[360px]">
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
        placeholder="Nie wybrano — kliknij punkt na mapie"
        className={cn(value ? "bg-krem" : "bg-papier")}
      />
    </div>
  );
}
