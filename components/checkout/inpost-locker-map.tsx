"use client";

import { useEffect, useRef } from "react";
import type { InpostPoint } from "@/lib/inpost-points";
import "leaflet/dist/leaflet.css";

export function InpostLockerMap({
  points,
  selectedName,
  onSelect,
}: {
  points: InpostPoint[];
  selectedName?: string;
  onSelect: (point: InpostPoint) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    let cancelled = false;
    let map: import("leaflet").Map | undefined;

    void (async () => {
      const leaflet = await import("leaflet");
      const L = leaflet.default ?? leaflet;
      if (cancelled || !containerRef.current) return;

      const center = points[0] ? ([points[0].lat, points[0].lng] as [number, number]) : ([54.352, 18.646] as const);
      map = L.map(containerRef.current, { zoomControl: true, attributionControl: true }).setView(center, 13);
      if (cancelled) {
        map.remove();
        return;
      }
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const bounds = L.latLngBounds([]);
      for (const point of points) {
        const selected = point.name === selectedName;
        const marker = L.marker([point.lat, point.lng], {
          icon: L.divIcon({
            className: selected ? "inpost-pin is-selected" : "inpost-pin",
            html: "<span></span>",
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          }),
          title: point.name,
        }).addTo(map);
        marker.on("click", () => onSelectRef.current(point));
        bounds.extend([point.lat, point.lng]);
      }

      if (points.length > 1) map.fitBounds(bounds.pad(0.18));
      window.setTimeout(() => map?.invalidateSize(), 60);
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [points, selectedName]);

  return <div ref={containerRef} className="h-full min-h-[260px] w-full rounded-[22px] bg-krem" />;
}
