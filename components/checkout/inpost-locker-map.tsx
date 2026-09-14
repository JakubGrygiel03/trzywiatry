"use client";

import { useEffect, useRef, useState } from "react";
import type { InpostPoint } from "@/lib/inpost-points";
import "leaflet/dist/leaflet.css";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function pinHtml(name: string, selected: boolean) {
  const label = escapeHtml(name);
  const size = selected ? 52 : 44;
  const bg = selected ? "#D39058" : "#9C644E";
  const box =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21 8.5 12 3 3 8.5v7L12 21l9-5.5v-7Z" stroke="#fff" stroke-width="2.2" stroke-linejoin="round"/><path d="M3 8.5 12 14l9-5.5M12 14v7" stroke="#fff" stroke-width="2.2" stroke-linejoin="round"/></svg>';
  const caption = selected
    ? `<span style="margin-top:4px;padding:3px 10px;border-radius:999px;background:#fff;font:600 11px/1.2 ui-monospace,monospace;letter-spacing:.04em;color:#010101;box-shadow:0 1px 4px rgba(1,1,1,.2);white-space:nowrap">${label}</span>`
    : "";
  return `<div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 3px 8px rgba(1,1,1,.4))" aria-hidden="true"><span style="display:grid;place-items:center;width:${size}px;height:${size}px;border-radius:999px;border:3px solid #fff;background:${bg}">${box}</span>${caption}</div>`;
}

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

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
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

      const bounds = L.latLngBounds([]);
      for (const point of points) {
        const selected = point.name === selectedName;
        const marker = L.marker([point.lat, point.lng], {
          icon: L.divIcon({
            className: selected ? "inpost-pin is-selected" : "inpost-pin",
            html: pinHtml(point.name, selected),
            iconSize: selected ? [96, 64] : [48, 48],
            iconAnchor: selected ? [48, 48] : [24, 24],
          }),
          title: `${point.name} — ${point.address}`,
          zIndexOffset: selected ? 900 : 0,
          riseOnHover: true,
        }).addTo(map);
        marker.bindTooltip(`${point.name}`, {
          direction: "top",
          offset: [0, -18],
          opacity: 0.95,
        });
        marker.on("click", () => onSelectRef.current(point));
        markersRef.current.push(marker);
        bounds.extend([point.lat, point.lng]);
      }

      map.invalidateSize();
      if (selectedName) {
        const selected = points.find((point) => point.name === selectedName);
        if (selected) map.setView([selected.lat, selected.lng], Math.max(map.getZoom(), 15));
      } else if (points.length === 1) {
        map.setView([points[0].lat, points[0].lng], 15);
      } else if (bounds.isValid()) {
        map.fitBounds(bounds.pad(0.1), { maxZoom: 14, animate: false });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mapReady, points, selectedName]);

  return <div ref={containerRef} className="h-full min-h-[260px] w-full rounded-[22px] bg-krem" />;
}
