export const TRAFFIC_STATE_KEY = "traffic";

export type TrafficKind = "page" | "product_click" | "product_view" | "cart";

export type TrafficProductRow = {
  views: number;
  clicks: number;
  carts: number;
  lastSeenAt: string;
};

export type TrafficSnapshot = {
  startedAt: string;
  pageViews: number;
  days: Record<string, number>;
  paths: Record<string, number>;
  products: Record<string, TrafficProductRow>;
};

const MAX_PRODUCTS = 80;
const MAX_DAYS = 60;
const SLUG = /^[a-z0-9][a-z0-9-]{0,79}$/;

export function emptyTrafficSnapshot(now = new Date()): TrafficSnapshot {
  return { startedAt: now.toISOString(), pageViews: 0, days: {}, paths: {}, products: {} };
}

export function isTrafficKind(value: unknown): value is TrafficKind {
  return value === "page" || value === "product_click" || value === "product_view" || value === "cart";
}

export function isSafeProductSlug(value: string) {
  return SLUG.test(value) && !value.includes("..");
}

export function dayKey(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

export function bucketPublicPath(path: string) {
  const clean = path.split("?")[0] || "/";
  if (clean.startsWith("/admin") || clean.startsWith("/konto") || clean.startsWith("/api")) return null;
  if (clean === "/") return "/";
  if (/^\/sklep\/[^/]+/.test(clean)) return "/sklep/:produkt";
  if (clean.startsWith("/sklep")) return "/sklep";
  if (clean.startsWith("/warsztaty")) return "/warsztaty";
  if (clean.startsWith("/o-nas")) return "/o-nas";
  if (clean.startsWith("/blog")) return "/blog";
  if (clean.startsWith("/b2b")) return "/b2b";
  if (clean.startsWith("/kontakt")) return "/kontakt";
  if (clean.startsWith("/kolekcje")) return "/kolekcje";
  return "/inne";
}

function ensureProduct(snap: TrafficSnapshot, slug: string, at: string) {
  const current = snap.products[slug] ?? { views: 0, clicks: 0, carts: 0, lastSeenAt: at };
  current.lastSeenAt = at;
  snap.products[slug] = current;
  return current;
}

function prune(snap: TrafficSnapshot) {
  const days = Object.keys(snap.days).sort();
  while (days.length > MAX_DAYS) {
    const old = days.shift();
    if (old) delete snap.days[old];
  }
  const ranked = Object.entries(snap.products).sort(
    (a, b) => scoreProduct(b[1]) - scoreProduct(a[1]) || b[1].lastSeenAt.localeCompare(a[1].lastSeenAt),
  );
  if (ranked.length <= MAX_PRODUCTS) return;
  snap.products = Object.fromEntries(ranked.slice(0, MAX_PRODUCTS));
}

export function scoreProduct(row: TrafficProductRow) {
  return row.carts * 5 + row.clicks * 3 + row.views;
}

export function applyTrafficEvent(
  snap: TrafficSnapshot,
  event: { kind: TrafficKind; path?: string; slug?: string },
  now = new Date(),
) {
  const at = now.toISOString();
  const today = dayKey(now);

  if (event.kind === "page") {
    const bucket = bucketPublicPath(event.path ?? "/");
    if (!bucket) return snap;
    snap.pageViews += 1;
    snap.days[today] = (snap.days[today] ?? 0) + 1;
    snap.paths[bucket] = (snap.paths[bucket] ?? 0) + 1;
  }

  const slug = event.slug?.trim() ?? "";
  if (slug && isSafeProductSlug(slug)) {
    const row = ensureProduct(snap, slug, at);
    if (event.kind === "product_click") row.clicks += 1;
    if (event.kind === "product_view") row.views += 1;
    if (event.kind === "cart") row.carts += 1;
  }

  prune(snap);
  return snap;
}

export function parseTrafficSnapshot(raw: unknown): TrafficSnapshot {
  const empty = emptyTrafficSnapshot();
  if (!raw || typeof raw !== "object") return empty;
  const rec = raw as Partial<TrafficSnapshot>;
  return {
    startedAt: typeof rec.startedAt === "string" ? rec.startedAt : empty.startedAt,
    pageViews: Number(rec.pageViews) || 0,
    days: rec.days && typeof rec.days === "object" ? rec.days : {},
    paths: rec.paths && typeof rec.paths === "object" ? rec.paths : {},
    products: rec.products && typeof rec.products === "object" ? rec.products : {},
  };
}
