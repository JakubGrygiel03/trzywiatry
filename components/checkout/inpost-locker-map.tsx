"use client";

import { useEffect, useRef, useState } from "react";
import {
  clusterInpostPoints,
  INPOST_NEAR_ZOOM,
  INPOST_OVERVIEW_ZOOM,
  INPOST_SPLIT_ZOOM,
} from "@/lib/inpost-clusters";
import { inpostClusterHtml, inpostClusterSize, inpostPinHtml } from "@/lib/inpost-map-icons";
import type { InpostOverviewCluster } from "@/lib/inpost-overview";
import type { InpostPoint } from "@/lib/inpost-points";
import "leaflet/dist/leaflet.css";

const POLAND_BOUNDS: [[number, number], [number, number]] = [
  [49.0, 14.07],
  [55.12, 24.15],
];

export function InpostLockerMap({
  points,
  selectedName,
  focus = null,
  fit = "auto",
  onSelect,
  onIdle,
  onCity,
}: {
  points: InpostPoint[];
  selectedName?: string;
  focus?: { lat: number; lng: number } | null;
  fit?: "auto" | "none";
  onSelect: (point: InpostPoint) => void;
  onIdle?: (center: { lat: number; lng: number }, zoom: number) => void;
  onCity?: (city: string, center: { lat: number; lng: number }) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelect);
  const onIdleRef = useRef(onIdle);
  const onCityRef = useRef(onCity);
  const pointsRef = useRef(points);
  const selectedRef = useRef(selectedName);
  const overviewRef = useRef<InpostOverviewCluster[]>([]);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const layerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const ignoreMoveUntil = useRef(0);
  const paintRef = useRef(() => {});
  const [mapReady, setMapReady] = useState(false);
  onSelectRef.current = onSelect;
  onIdleRef.current = onIdle;
  onCityRef.current = onCity;
  pointsRef.current = points;
  selectedRef.current = selectedName;

  function paint() {
    const map = mapRef.current;
    const layer = layerRef.current;
    const L = leafletRef.current;
    if (!map || !layer || !L) return;
    layer.clearLayers();
    const zoom = map.getZoom();
    const selected = selectedRef.current
      ? pointsRef.current.find((point) => point.name === selectedRef.current)
      : undefined;

    if (zoom < INPOST_OVERVIEW_ZOOM && overviewRef.current.length > 0) {
      for (const city of overviewRef.current) {
        addCountMarker(L, layer, city.lat, city.lng, city.count, `${city.city}: ${city.count} paczkomatów`, () => {
          ignoreMoveUntil.current = Date.now() + 700;
          map.setView([city.lat, city.lng], 12, { animate: true });
          onCityRef.current?.(city.city, { lat: city.lat, lng: city.lng });
        });
      }
      if (selected) addPin(L, layer, selected, true, onSelectRef);
      return;
    }

    const rest = selected
      ? pointsRef.current.filter((point) => point.name !== selected.name)
      : pointsRef.current;
    for (const cluster of clusterInpostPoints(
      rest,
      (lat, lng) => map.latLngToLayerPoint(L.latLng(lat, lng)),
      zoom,
    )) {
      if (cluster.points.length === 1) {
        addPin(L, layer, cluster.points[0]!, false, onSelectRef);
        continue;
      }
      addCountMarker(
        L,
        layer,
        cluster.lat,
        cluster.lng,
        cluster.points.length,
        `${cluster.points.length} paczkomatów w okolicy`,
        () => {
          const bounds = L.latLngBounds(cluster.points.map((point) => [point.lat, point.lng]));
          ignoreMoveUntil.current = Date.now() + 500;
          map.fitBounds(bounds.pad(0.4), { maxZoom: INPOST_SPLIT_ZOOM, animate: true });
        },
      );
    }
    if (selected) addPin(L, layer, selected, true, onSelectRef);
  }
  paintRef.current = paint;

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
        minZoom: 5,
        maxBounds: L.latLngBounds(POLAND_BOUNDS[0], POLAND_BOUNDS[1]),
        maxBoundsViscosity: 0.85,
      });
      map.fitBounds(L.latLngBounds(POLAND_BOUNDS[0], POLAND_BOUNDS[1]), { padding: [12, 12], animate: false });
      mapRef.current = map;
      leafletRef.current = L;
      layerRef.current = L.layerGroup().addTo(map);
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
      map.on("zoomend", () => {
        paintRef.current();
        emitIdle();
      });
      map.on("moveend", () => paintRef.current());
      ignoreMoveUntil.current = Date.now() + 1200;
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
      layerRef.current = null;
      leafletRef.current = null;
      setMapReady(false);
    };
  }, []);

  useEffect(() => {
    if (!mapReady) return;
    let cancelled = false;
    void fetch("/api/inpost/points?mode=overview")
      .then(async (response) => {
        const payload = (await response.json()) as { clusters?: InpostOverviewCluster[] };
        if (cancelled) return;
        overviewRef.current = payload.clusters ?? [];
        paintRef.current();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!mapReady || !map || !L) return;
    paintRef.current();
    if (fit === "none") return;
    ignoreMoveUntil.current = Date.now() + 700;
    if (focus) {
      map.setView([focus.lat, focus.lng], INPOST_NEAR_ZOOM, { animate: true });
      return;
    }
    const selected = selectedName ? points.find((point) => point.name === selectedName) : undefined;
    if (selected) {
      map.setView([selected.lat, selected.lng], Math.max(map.getZoom(), INPOST_SPLIT_ZOOM));
      return;
    }
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], INPOST_NEAR_ZOOM);
      return;
    }
    const group = L.latLngBounds(points.map((point) => [point.lat, point.lng]));
    if (points.length >= 2 && group.isValid()) {
      map.fitBounds(group.pad(0.18), { maxZoom: 12, animate: true });
    }
  }, [mapReady, points, selectedName, focus, fit]);

  return <div ref={containerRef} className="h-full min-h-[280px] w-full rounded-[22px] bg-krem" />;
}

function addCountMarker(
  L: typeof import("leaflet"),
  layer: import("leaflet").LayerGroup,
  lat: number,
  lng: number,
  count: number,
  title: string,
  onClick: () => void,
) {
  const size = inpostClusterSize(count);
  const marker = L.marker([lat, lng], {
    icon: L.divIcon({
      className: "inpost-pin inpost-cluster",
      html: inpostClusterHtml(count),
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    }),
    title,
    zIndexOffset: 200,
  });
  marker.bindTooltip(title, { direction: "top", offset: [0, -12], opacity: 0.95 });
  marker.on("click", onClick);
  marker.addTo(layer);
}

function addPin(
  L: typeof import("leaflet"),
  layer: import("leaflet").LayerGroup,
  point: InpostPoint,
  selected: boolean,
  onSelectRef: { current: (point: InpostPoint) => void },
) {
  const marker = L.marker([point.lat, point.lng], {
    icon: L.divIcon({
      className: selected ? "inpost-pin is-selected" : "inpost-pin",
      html: inpostPinHtml(selected),
      iconSize: selected ? [40, 40] : [30, 30],
      iconAnchor: selected ? [20, 20] : [15, 15],
    }),
    title: `${point.name} — ${point.address}`,
    zIndexOffset: selected ? 900 : 0,
    riseOnHover: true,
  });
  marker.bindTooltip(`${point.name} · ${point.address}`, {
    direction: "top",
    offset: [0, -14],
    opacity: 0.95,
  });
  marker.on("click", () => onSelectRef.current(point));
  marker.addTo(layer);
}
