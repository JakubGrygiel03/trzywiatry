import type { InpostPoint } from "@/lib/inpost-points";

export type InpostCluster = {
  id: string;
  lat: number;
  lng: number;
  points: InpostPoint[];
};

/** Street / building — one pin per locker. Below this, pins collapse into counts. */
export const INPOST_SPLIT_ZOOM = 16;
export const INPOST_OVERVIEW_ZOOM = 9;
export const INPOST_NEAR_ZOOM = 16;

type Project = (lat: number, lng: number) => { x: number; y: number };

function cellPx(zoom: number) {
  if (zoom >= 15) return 48;
  if (zoom >= 13) return 58;
  if (zoom >= 11) return 72;
  if (zoom >= 9) return 90;
  return 120;
}

/**
 * Grid clusters in screen pixels so a zoomed-out city is a few numbered
 * circles instead of a pile that hides the map.
 */
export function clusterInpostPoints(
  points: InpostPoint[],
  project: Project,
  zoom: number,
): InpostCluster[] {
  if (points.length === 0) return [];
  if (zoom >= INPOST_SPLIT_ZOOM) {
    return points.map((point) => ({
      id: point.name,
      lat: point.lat,
      lng: point.lng,
      points: [point],
    }));
  }

  const size = cellPx(zoom);
  const buckets = new Map<string, InpostPoint[]>();
  for (const point of points) {
    const { x, y } = project(point.lat, point.lng);
    const key = `${Math.round(x / size)}:${Math.round(y / size)}`;
    const bucket = buckets.get(key);
    if (bucket) bucket.push(point);
    else buckets.set(key, [point]);
  }

  return [...buckets.entries()].map(([id, group]) => ({
    id,
    lat: group.reduce((sum, item) => sum + item.lat, 0) / group.length,
    lng: group.reduce((sum, item) => sum + item.lng, 0) / group.length,
    points: group,
  }));
}
