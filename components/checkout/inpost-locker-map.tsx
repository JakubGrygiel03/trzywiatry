"use client";

import { useEffect, useRef, useState } from "react";
import type { InpostPoint } from "@/lib/inpost-points";
import "leaflet/dist/leaflet.css";

const MAP_PIN_LIMIT = 8;
const NEAR_PIN_LIMIT = 5;

function pinHtml(selected: boolean) {
  const size = selected ? 40 : 28;
  const bg = selected ? "#D39058" : "#9C644E";
  const ring = selected ? "3px solid #fff" : "2px solid #fff";
  return `<div style="width:${size}px;height:${size}px;border-radius:999px;background:${bg};border:${ring};box-shadow:0 2px 6px rgba(1,1,1,.3)" aria-hidden="true"></div>`;
}

function sortByDistance(points: InpostPoint[], focus: { lat: number; lng: number }) {
  return [...points].sort((a, b) => {
    const da = (a.lat - focus.lat) ** 2 + (a.lng - focus.lng) ** 2;
    const db = (b.lat - focus.lat) ** 2 + (b.lng - focus.lng) ** 2;
    return da - db;
  });
}

export function InpostLockerMap({
  points,
  selectedName,
  focus = null,
  onSelect,
}: {
  points: InpostPoint[];
  selectedName?: string;
  focus?: { lat: number; lng: number } | null;
  onSelect: (point: InpostPoint) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelect);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markersRef = useRef<import("leaflet").Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);
  onSelectRef.current = onSelect;

  useEffect(() => {
    const node = containerRef.current;
    if (!node || mapRef.current) return;

    let cancelled = false;
    let resizeObserver: ResizeObserver | undefined;

    void (async () => {
      const leaflet = await import("leaflet");
      const L = leaflet.default ?? leaflet;
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        zoomControl: true,
        attributionControl: true,
        minZoom: 11,
      }).setView([54.352, 18.646], 13);
      mapRef.current = map;

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      window.setTimeout(() => map.invalidateSize(), 80);
      resizeObserver = new ResizeObserver(() => map.invalidateSize());
      resizeObserver.observe(containerRef.current);
      setMapReady(true);
    })();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current = [];
      setMapReady(false);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map) return;

    let cancelled = false;

    void (async () => {
      const leaflet = await import("leaflet");
      const L = leaflet.default ?? leaflet;
      if (cancelled || mapRef.current !== map) return;

      for (const marker of markersRef.current) marker.remove();
      markersRef.current = [];

      if (points.length === 0) return;

      const selected = selectedName ? points.find((point) => point.name === selectedName) : undefined;
      const limit = focus ? NEAR_PIN_LIMIT : MAP_PIN_LIMIT;
      const ordered = focus ? sortByDistance(points, focus) : points;
      const visible = (() => {
        const head = ordered.slice(0, limit);
        if (selected && !head.some((point) => point.name === selected.name)) {
          return [selected, ...head.slice(0, limit - 1)];
        }
        return head;
      })();

      const bounds = L.latLngBounds([]);
      for (const point of visible) {
        const isSelected = point.name === selectedName;
        const marker = L.marker([point.lat, point.lng], {
          icon: L.divIcon({
            className: isSelected ? "inpost-pin is-selected" : "inpost-pin",
            html: pinHtml(isSelected),
            iconSize: isSelected ? [40, 40] : [28, 28],
            iconAnchor: isSelected ? [20, 20] : [14, 14],
          }),
          title: `${point.name} — ${point.address}`,
          zIndexOffset: isSelected ? 900 : 0,
          riseOnHover: true,
        }).addTo(map);
        marker.bindTooltip(`${point.name} · ${point.address}`, {
          direction: "top",
          offset: [0, -14],
          opacity: 0.95,
        });
        marker.on("click", () => onSelectRef.current(point));
        markersRef.current.push(marker);
        bounds.extend([point.lat, point.lng]);
      }

      map.invalidateSize();
      if (focus) {
        // Zoom to the user first; then tighten around the nearest handful of lockers.
        if (visible.length >= 2 && bounds.isValid()) {
          map.fitBounds(bounds.pad(0.35), { maxZoom: 17, animate: true });
        } else {
          map.setView([focus.lat, focus.lng], 16, { animate: true });
        }
      } else if (selected) {
        map.setView([selected.lat, selected.lng], Math.max(map.getZoom(), 15));
      } else if (visible.length === 1) {
        map.setView([visible[0].lat, visible[0].lng], 15);
      } else if (bounds.isValid()) {
        map.fitBounds(bounds.pad(0.15), { maxZoom: 15, animate: false });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mapReady, points, selectedName, focus]);

  return <div ref={containerRef} className="h-full min-h-[280px] w-full rounded-[22px] bg-krem" />;
}
