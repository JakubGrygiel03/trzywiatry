import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import {
  INPOST_OVERVIEW_CITIES,
  type InpostOverviewCluster,
} from "@/lib/inpost-overview";
import {
  isCityQuery,
  isLockerName,
  lockerMatchesPhrase,
  normalizePostal,
  slimShipXItem,
  type InpostPoint,
} from "@/lib/inpost-points";

export const runtime = "nodejs";

const SHIPX = "https://api-shipx-pl.easypack24.net/v1/points";
const CITY_HINT = /^[\p{L}][\p{L}\d\s.'-]{1,39}$/u;

function parseCoord(raw: string | null, min: number, max: number) {
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) && value >= min && value <= max ? value : null;
}

function parseZoom(raw: string | null) {
  if (!raw) return 14;
  const value = Number(raw);
  return Number.isFinite(value) ? Math.min(19, Math.max(6, value)) : 14;
}

function shipXBase() {
  const url = new URL(SHIPX);
  url.searchParams.set("type", "parcel_locker");
  return url;
}

function cityUrl(city: string, page: number, perPage = 80) {
  const url = shipXBase();
  url.searchParams.set("city", city);
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("page", String(page));
  return url;
}

async function fetchShipX(url: URL) {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 300 },
  });
  if (!response.ok) return { items: [] as unknown[], total: 0 };
  const payload = (await response.json()) as {
    items?: unknown;
    total_items?: unknown;
    count?: unknown;
  };
  const items = Array.isArray(payload.items) ? payload.items : [];
  const totalRaw = payload.total_items ?? payload.count;
  const total = typeof totalRaw === "number" && Number.isFinite(totalRaw) ? totalRaw : items.length;
  return { items, total };
}

async function fetchPoints(url: URL): Promise<InpostPoint[]> {
  const { items } = await fetchShipX(url);
  return items.map(slimShipXItem).filter((item): item is InpostPoint => item !== null);
}

async function fetchOverview(): Promise<InpostOverviewCluster[]> {
  const rows = await Promise.all(
    INPOST_OVERVIEW_CITIES.map(async (place) => {
      const { total, items } = await fetchShipX(cityUrl(place.city, 1, 1));
      const count = total > 0 ? total : items.length;
      if (count <= 0) return null;
      return { city: place.city, lat: place.lat, lng: place.lng, count };
    }),
  );
  return rows.filter((row): row is InpostOverviewCluster => row !== null);
}

function geoWindow(mode: string, zoom: number) {
  if (mode === "near") return { meters: 8_000, limit: 25 };
  if (mode === "explore") {
    if (zoom >= 16) return { meters: 1_800, limit: 35 };
    if (zoom >= 14) return { meters: 3_500, limit: 40 };
    return { meters: 6_000, limit: 40 };
  }
  return { meters: 12_000, limit: 80 };
}

const getOverview = unstable_cache(fetchOverview, ["inpost-city-overview"], { revalidate: 3600 });

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const mode = (requestUrl.searchParams.get("mode") ?? "search").trim();
  if (mode === "overview") {
    try {
      return NextResponse.json({ clusters: await getOverview() });
    } catch {
      return NextResponse.json({ clusters: [] }, { status: 502 });
    }
  }

  const lat = parseCoord(requestUrl.searchParams.get("lat"), 49, 55.2);
  const lng = parseCoord(requestUrl.searchParams.get("lng"), 14, 24.3);
  const postal =
    normalizePostal(requestUrl.searchParams.get("postal") ?? "") ??
    normalizePostal(requestUrl.searchParams.get("q") ?? "");
  const query = (requestUrl.searchParams.get("q") ?? "").trim();
  const cityHint = (requestUrl.searchParams.get("city") ?? "").trim();
  const cityFromForm = CITY_HINT.test(cityHint) ? cityHint : "";
  const zoom = parseZoom(requestUrl.searchParams.get("zoom"));

  try {
    if (lat !== null && lng !== null) {
      const window = geoWindow(mode, zoom);
      const url = shipXBase();
      url.searchParams.set("relative_point", `${lat},${lng}`);
      url.searchParams.set("sort_by", "distance");
      url.searchParams.set("max_distance", String(window.meters));
      url.searchParams.set("limit", String(window.limit));
      return NextResponse.json({ items: await fetchPoints(url) });
    }

    if (isLockerName(query)) {
      const url = shipXBase();
      url.searchParams.set("name", query.toUpperCase());
      return NextResponse.json({ items: await fetchPoints(url) });
    }

    if (isCityQuery(query)) {
      const items = await fetchPoints(cityUrl(query, 1, 80));
      return NextResponse.json({ items });
    }

    const phrase = query && !normalizePostal(query) && !isCityQuery(query) ? query : "";

    if (query && !postal && CITY_HINT.test(query) && query.includes(" ")) {
      const asCity = await fetchPoints(cityUrl(query, 1, 80));
      if (asCity.length > 0) return NextResponse.json({ items: asCity });
    }

    if (cityFromForm) {
      let items = await fetchPoints(cityUrl(cityFromForm, 1, 80));
      if (phrase) items = items.filter((point) => lockerMatchesPhrase(point, phrase));
      return NextResponse.json({ items });
    }

    if (postal) {
      const url = shipXBase();
      url.searchParams.set("relative_post_code", postal);
      url.searchParams.set("sort_by", "distance");
      url.searchParams.set("max_distance", "12000");
      url.searchParams.set("limit", "80");
      let items = await fetchPoints(url);
      if (phrase) items = items.filter((point) => lockerMatchesPhrase(point, phrase));
      return NextResponse.json({ items });
    }

    return NextResponse.json({ items: [] });
  } catch {
    return NextResponse.json({ items: [] }, { status: 502 });
  }
}
