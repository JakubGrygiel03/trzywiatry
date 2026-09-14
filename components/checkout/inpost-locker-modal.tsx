"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { InpostLockerMap } from "@/components/checkout/inpost-locker-map";
import type { InpostPoint } from "@/lib/inpost-points";
import { cn } from "@/lib/utils";

export function InpostLockerModal({
  postalCode,
  city,
  selectedLabel,
  onClose,
  onSelect,
}: {
  postalCode: string;
  city: string;
  selectedLabel: string;
  onClose: () => void;
  onSelect: (point: InpostPoint) => void;
}) {
  const [query, setQuery] = useState(postalCode || city);
  const [points, setPoints] = useState<InpostPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const selectedName = selectedLabel.split(" · ")[0];

  function search(nextQuery = query, coords?: { lat: number; lng: number }) {
    const params = new URLSearchParams();
    if (coords) {
      params.set("lat", String(coords.lat));
      params.set("lng", String(coords.lng));
    } else if (nextQuery.trim()) {
      params.set("q", nextQuery.trim());
    }

    setLoading(true);
    setError("");
    void fetch(`/api/inpost/points?${params}`)
      .then(async (response) => {
        const payload = (await response.json()) as { items?: InpostPoint[] };
        const items = payload.items ?? [];
        setPoints(items);
        if (items.length === 0) setError("Nie znaleziono paczkomatów. Spróbuj innego miasta lub kodu.");
      })
      .catch(() => setError("Nie udało się wczytać mapy InPost. Spróbuj ponownie."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    search(postalCode || city);
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
    // Search once when the map opens; later queries go through Szukaj / Najbliższe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function locate() {
    if (!navigator.geolocation) {
      setError("Przeglądarka nie udostępnia lokalizacji.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => search(query, { lat: position.coords.latitude, lng: position.coords.longitude }),
      () => setError("Nie udało się pobrać lokalizacji. Wpisz miasto lub kod pocztowy."),
    );
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-czarny/45 p-3 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Wybór paczkomatu InPost"
      onClick={onClose}
    >
      <div
        className="flex h-[min(92vh,760px)] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] bg-bialy shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-czarny/10 px-5 py-4">
          <div>
            <p className="font-heading text-[11px] uppercase tracking-[0.16em] text-czerwony">InPost</p>
            <p className="text-sm">Wybierz paczkomat na mapie albo z listy.</p>
          </div>
          <Button type="button" variant="ghost" onClick={onClose}>
            Zamknij
          </Button>
        </div>
        <div className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_auto_auto]">
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
            className="min-w-[16rem] flex-1"
            autoFocus
          />
          <Button type="button" variant="secondary" onClick={() => search(query)}>
            Szukaj
          </Button>
          <Button type="button" variant="outline" onClick={locate}>
            Najbliższe
          </Button>
        </div>
        <div className="grid min-h-0 flex-1 gap-3 px-5 pb-5 lg:grid-cols-[minmax(0,280px)_1fr]">
          <ul className="tw-scroll max-h-48 space-y-2 overflow-y-auto lg:max-h-none">
            {loading && points.length === 0 ? <li className="text-sm text-szary">Szukam paczkomatów…</li> : null}
            {error ? <li className="text-sm text-czerwony">{error}</li> : null}
            {points.map((point) => (
              <li key={point.name}>
                <button
                  type="button"
                  onClick={() => onSelect(point)}
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
          <InpostLockerMap points={points} selectedName={selectedName} onSelect={onSelect} />
        </div>
      </div>
    </div>,
    document.body,
  );
}
