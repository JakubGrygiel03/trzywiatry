"use client";

import { useEffect, useRef, useState } from "react";
import type { InpostPoint } from "@/lib/inpost-points";
import "leaflet/dist/leaflet.css";

const POLAND_CENTER: [number, number] = [52.12, 19.4];
const POLAND_BOUNDS: [[number, number], [number, number]] = [
  [49.0, 14.07],
  [55.12, 24.15],
];
const MAX_PINS = 280;

function pinHtml(selected: boolean) {
  const size = selected ? 40 : 30;
  const icon = selected ? 18 : 14;
  const bg = selected ? "#D39058" : "#9C644E";
  const ring = selected ? "3px solid #fff" : "2px solid #fff";
  const parcel = `<svg width="${icon}" height="${icon}" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3.2 20 7.5v9L12 20.8 4 16.5v-9L12 3.2Z" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 12.2 20 7.5M12 12.2 4 7.5M12 12.2V20.8" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  return `<div style="width:${size}px;height:${size}px;border-radius:999px;background:${bg};border:${ring};box-shadow:0 2px 6px rgba(1,1,1,.3);display:flex;align-items:center;justify-center" aria-hidden="true">${parcel}</div>`;
}

function pinsForView(
  points: InpostPoint[],
  contains: (lat: number, lng: number) => boolean,
  selectedName?: string,
) {
  const selected = selectedName ? points.find((point) => point.name === selectedName) : undefined;
  const inView = points.filter((point) => contains(point.lat, point.lng));
  const head = inView.slice(0, MAX_PINS);
  if (selected && !head.some((point) => point.name === selected.name)) {
    return [selected, ...head.slice(0, MAX_PINS - 1)];
  }
  return head;
}

export function InpostLockerMap({
  points,
  selectedName,
  focus = null,
  fit = "auto",
  onSelect,
  onIdle,
}: {
  points: InpostPoint[];
  selectedName?: string;
  focus?: { lat: number; lng: number } | null;
  /** `none` while the customer pans Poland so we don't yank the view back. */
  fit?: "auto" | "none";
  onSelect: (point: InpostPoint) => void;
  onIdle?: (center: { lat: number; lng: number }, zoom: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelect);
  const onIdleRef = useRef(onIdle);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markersRef = useRef<import("leaflet").Marker[]>([]);
  const ignoreMoveUntil = useRef(0);
  const [mapReady, setMapReady] = useState(false);
  onSelectRef.current = onSelect;
  onIdleRef.current = onIdle;

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
        minZoom: 6,
        maxBounds: L.latLngBounds(POLAND_BOUNDS[0], POLAND_BOUNDS[1]),
        maxBoundsViscosity: 0.85,
      }).setView(POLAND_CENTER, 6);
      mapRef.current = map;

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const emitIdle = () => {
        if (Date.now() < ignoreMoveUntil.current) return;
        const center = map.getCenter();
        onIdleRef.current?.({ lat: center.lat, lng: center.lng }, map.getZoom());
      };
      map.on("dragend", emitIdle);
      map.on("zoomend", emitIdle);

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

      const bounds = map.getBounds().pad(0.2);
      const visible = pinsForView(
        points,
        (lat, lng) => bounds.contains(L.latLng(lat, lng)),
        selectedName,
      );

      const fitBounds = L.latLngBounds([]);
      for (const point of visible) {
        const isSelected = point.name === selectedName;
        const marker = L.marker([point.lat, point.lng], {
          icon: L.divIcon({
            className: isSelected ? "inpost-pin is-selected" : "inpost-pin",
            html: pinHtml(isSelected),
            iconSize: isSelected ? [40, 40] : [30, 30],
            iconAnchor: isSelected ? [20, 20] : [15, 15],
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
        fitBounds.extend([point.lat, point.lng]);
      }

      map.invalidateSize();
      ignoreMoveUntil.current = Date.now() + 700;
      if (fit === "none") return;
      if (focus) {
        if (visible.length >= 2 && fitBounds.isValid()) {
          map.fitBounds(fitBounds.pad(0.35), { maxZoom: 17, animate: true });
        } else {
          map.setView([focus.lat, focus.lng], 16, { animate: true });
        }
      } else if (selectedName) {
        const selected = points.find((point) => point.name === selectedName);
        if (selected) map.setView([selected.lat, selected.lng], Math.max(map.getZoom(), 14));
      } else if (visible.length === 1) {
        map.setView([visible[0].lat, visible[0].lng], 15);
      } else if (fitBounds.isValid() && points.length > 0) {
        map.fitBounds(fitBounds.pad(0.12), { maxZoom: 14, animate: false });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mapReady, points, selectedName, focus, fit]);

  return <div ref={containerRef} className="h-full min-h-[280px] w-full rounded-[22px] bg-krem" />;
}
