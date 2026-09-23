import { NextResponse } from "next/server";
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
const CITY_PAGE_SIZE = 500;
const CITY_MAX_PAGES = 8;

function parseCoord(raw: string | null, min: number, max: number) {
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) && value >= min && value <= max ? value : null;
}

function shipXBase() {
  const url = new URL(SHIPX);
  url.searchParams.set("type", "parcel_locker");
  return url;
}

function cityUrl(city: string, page: number) {
  const url = shipXBase();
  url.searchParams.set("city", city);
  url.searchParams.set("per_page", String(CITY_PAGE_SIZE));
  url.searchParams.set("page", String(page));
  return url;
}

async function fetchPoints(url: URL): Promise<InpostPoint[]> {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 300 },
  });
  if (!response.ok) return [];
  const payload = (await response.json()) as { items?: unknown };
  if (!Array.isArray(payload.items)) return [];
  return payload.items
    .map(slimShipXItem)
    .filter((item): item is InpostPoint => item !== null);
}

/** Warsaw/Kraków exceed one ShipX page — walk until a short page. */
async function fetchCityAll(city: string) {
  const collected: InpostPoint[] = [];
  for (let page = 1; page <= CITY_MAX_PAGES; page += 1) {
    const batch = await fetchPoints(cityUrl(city, page));
    collected.push(...batch);
    if (batch.length < CITY_PAGE_SIZE) break;
  }
  return collected;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const lat = parseCoord(requestUrl.searchParams.get("lat"), 49, 55.2);
  const lng = parseCoord(requestUrl.searchParams.get("lng"), 14, 24.3);
  const postal =
    normalizePostal(requestUrl.searchParams.get("postal") ?? "") ??
    normalizePostal(requestUrl.searchParams.get("q") ?? "");
  const query = (requestUrl.searchParams.get("q") ?? "").trim();
  const cityHint = (requestUrl.searchParams.get("city") ?? "").trim();
  const cityFromForm = CITY_HINT.test(cityHint) ? cityHint : "";

  try {
    if (lat !== null && lng !== null) {
      const url = shipXBase();
      url.searchParams.set("relative_point", `${lat},${lng}`);
      url.searchParams.set("sort_by", "distance");
      url.searchParams.set("max_distance", "50000");
      url.searchParams.set("limit", "250");
      return NextResponse.json({ items: await fetchPoints(url) });
    }

    if (isLockerName(query)) {
      const url = shipXBase();
      url.searchParams.set("name", query.toUpperCase());
      return NextResponse.json({ items: await fetchPoints(url) });
    }

    if (isCityQuery(query)) {
      return NextResponse.json({ items: await fetchCityAll(query) });
    }

    const phrase = query && !normalizePostal(query) ? query : "";

    // Two-word cities (Nowy Sącz) vs streets (Targ Sienny): try city first.
    if (phrase && CITY_HINT.test(phrase)) {
      const asCity = await fetchCityAll(phrase);
      if (asCity.length > 0) {
        return NextResponse.json({ items: asCity });
      }
    }

    // City from checkout wins over postcode radius — Gdańsk must not shrink to Jasień.
    if (cityFromForm) {
      let items = await fetchCityAll(cityFromForm);
      if (phrase) {
        items = items.filter((point) => lockerMatchesPhrase(point, phrase));
      }
      return NextResponse.json({ items });
    }

    if (postal) {
      const url = shipXBase();
      url.searchParams.set("relative_post_code", postal);
      url.searchParams.set("sort_by", "distance");
      url.searchParams.set("max_distance", "50000");
      url.searchParams.set("limit", "500");
      let items = await fetchPoints(url);
      if (phrase) {
        items = items.filter((point) => lockerMatchesPhrase(point, phrase));
      }
      return NextResponse.json({ items });
    }

    return NextResponse.json({ items: [] });
  } catch {
    return NextResponse.json({ items: [] }, { status: 502 });
  }
}
