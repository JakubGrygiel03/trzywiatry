import { NextResponse } from "next/server";
import { INPOST_ATELIER_POSTAL, normalizePostal, slimShipXItem } from "@/lib/inpost-points";

export const runtime = "nodejs";

const SHIPX = "https://api-shipx-pl.easypack24.net/v1/points";
const CITY_OR_NAME = /^[\p{L}\d][\p{L}\d\s.'-]{0,39}$/u;
const LOCKER_NAME = /^[A-Za-z]{2,3}\d+[A-Za-z]?$/;

function parseCoord(raw: string | null, min: number, max: number) {
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) && value >= min && value <= max ? value : null;
}

function buildShipXUrl(requestUrl: URL) {
  const url = new URL(SHIPX);
  url.searchParams.set("type", "parcel_locker");
  url.searchParams.set("limit", "30");

  const lat = parseCoord(requestUrl.searchParams.get("lat"), 49, 55.2);
  const lng = parseCoord(requestUrl.searchParams.get("lng"), 14, 24.3);
  const postal =
    normalizePostal(requestUrl.searchParams.get("postal") ?? "") ??
    normalizePostal(requestUrl.searchParams.get("q") ?? "");
  const query = (requestUrl.searchParams.get("q") ?? "").trim();

  if (lat !== null && lng !== null) {
    url.searchParams.set("relative_point", `${lat},${lng}`);
    url.searchParams.set("sort_by", "distance");
    url.searchParams.set("max_distance", "20000");
    return url;
  }

  if (postal) {
    url.searchParams.set("relative_post_code", postal);
    url.searchParams.set("sort_by", "distance");
    url.searchParams.set("max_distance", "20000");
    return url;
  }

  if (LOCKER_NAME.test(query)) {
    url.searchParams.set("name", query.toUpperCase());
    return url;
  }

  if (query.length >= 2 && CITY_OR_NAME.test(query)) {
    url.searchParams.set("city", query);
    return url;
  }

  url.searchParams.set("relative_post_code", INPOST_ATELIER_POSTAL);
  url.searchParams.set("sort_by", "distance");
  return url;
}

export async function GET(request: Request) {
  const shipxUrl = buildShipXUrl(new URL(request.url));

  try {
    const response = await fetch(shipxUrl, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });
    if (!response.ok) {
      return NextResponse.json({ items: [] }, { status: 502 });
    }

    const payload = (await response.json()) as { items?: unknown };
    const items = Array.isArray(payload.items)
      ? payload.items.map(slimShipXItem).filter((item): item is NonNullable<typeof item> => item !== null)
      : [];

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] }, { status: 502 });
  }
}
