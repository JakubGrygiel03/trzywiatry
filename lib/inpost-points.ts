export type InpostPoint = {
  name: string;
  address: string;
  description: string;
  lat: number;
  lng: number;
  distance?: number;
};

export function formatLockerLabel(point: InpostPoint) {
  const label = point.description
    ? `${point.name} · ${point.address} (${point.description})`
    : `${point.name} · ${point.address}`;
  return label.slice(0, 180);
}

export function normalizePostal(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 5) return null;
  return `${digits.slice(0, 2)}-${digits.slice(2)}`;
}

/** ShipX locker codes: GDA09M, WAW123A */
export function isLockerName(raw: string) {
  return /^[A-Za-z]{2,3}\d+[A-Za-z]?$/.test(raw.trim());
}

/** Single city token — “Gdańsk”, not a street like “Targ Sienny”. */
export function isCityQuery(raw: string) {
  const query = raw.trim();
  if (query.length < 2 || query.includes(" ")) return false;
  return /^[\p{L}][\p{L}.'-]{1,39}$/u.test(query);
}

function fold(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/** Match street / landmark / locker code against a typed phrase. */
export function lockerMatchesPhrase(point: InpostPoint, phrase: string) {
  const words = fold(phrase)
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}\d]/gu, ""))
    .filter((word) => word.length >= 2);
  if (words.length === 0) return true;
  const blob = fold(`${point.name} ${point.address} ${point.description}`);
  return words.every((word) => blob.includes(word));
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function slimShipXItem(value: unknown): InpostPoint | null {
  const item = asRecord(value);
  const location = asRecord(item?.location);
  const address = asRecord(item?.address);
  const name = typeof item?.name === "string" ? item.name.trim() : "";
  const lat = asNumber(location?.latitude);
  const lng = asNumber(location?.longitude);
  if (!name || lat === null || lng === null) return null;

  const line1 = typeof address?.line1 === "string" ? address.line1.trim() : "";
  const line2 = typeof address?.line2 === "string" ? address.line2.trim() : "";
  const description = typeof item?.location_description === "string" ? item.location_description.trim() : "";
  const distance = asNumber(item?.distance) ?? undefined;

  return {
    name,
    address: [line1, line2].filter(Boolean).join(", "),
    description,
    lat,
    lng,
    distance,
  };
}
