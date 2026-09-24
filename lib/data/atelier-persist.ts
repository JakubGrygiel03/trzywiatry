import "server-only";

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { ContentOverlayMap } from "@/lib/cms/content-pages";
import type { HomeSection } from "@/lib/cms/home-layout";
import {
  consumeDirtySettingsKeys,
  getCatalogSeedSignature,
  getRuntimeSettings,
  runtimeStore,
  setAtelierPersister,
  setCatalogSeedSignature,
} from "@/lib/data/runtime-store";
import { ATELIER_STATE_KEYS, hasSupabaseService, readAtelierState, writeAtelierState } from "@/lib/data/supabase-state";
import { mergeNewsletterSnapshot } from "@/lib/newsletter-coupons";
import type { BlogPost, Collection, Product, StudioSettings, Workshop } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), ".data");
const STATE_FILE = path.join(DATA_DIR, "atelier.json");

type Inquiry = { id: string; createdAt: string; payload: Record<string, string | number> };

export type AtelierSnapshot = {
  seedSignature?: string;
  settings?: StudioSettings;
  catalog?: Product[];
  blogPosts?: BlogPost[];
  workshops?: Workshop[];
  emailTemplates?: Record<string, { subject: string; body: string }>;
  collections?: Collection[];
  b2b?: Inquiry[];
  contacts?: Inquiry[];
  newsletter?: string[];
  newsletterCoupons?: unknown;
  bookings?: Inquiry[];
  homeLayout?: HomeSection[];
  contentPages?: Partial<ContentOverlayMap>;
};

let hydratePromise: Promise<void> | null = null;
let hydratedAt = 0;
let pendingSave: Promise<boolean> | null = null;
const HYDRATE_TTL_MS = 5_000;

function loadSnapshot(): AtelierSnapshot | null {
  if (!existsSync(STATE_FILE)) return null;
  try {
    const data: unknown = JSON.parse(readFileSync(STATE_FILE, "utf8"));
    return data && typeof data === "object" ? (data as AtelierSnapshot) : null;
  } catch {
    return null;
  }
}

function applySnapshot(snap: AtelierSnapshot) {
  if (snap.settings) {
    runtimeStore.settings = { ...runtimeStore.settings, ...snap.settings };
  }
  if (Array.isArray(snap.catalog) && snap.catalog.length > 0) runtimeStore.catalog = snap.catalog;
  if (Array.isArray(snap.blogPosts) && snap.blogPosts.length > 0) runtimeStore.blogPosts = snap.blogPosts;
  if (Array.isArray(snap.workshops) && snap.workshops.length > 0) runtimeStore.workshops = snap.workshops;
  if (snap.emailTemplates) runtimeStore.emailTemplates = snap.emailTemplates;
  if (Array.isArray(snap.collections) && snap.collections.length > 0) {
    runtimeStore.collections = snap.collections;
  }
  if (Array.isArray(snap.b2b)) runtimeStore.b2b = snap.b2b;
  if (Array.isArray(snap.contacts)) runtimeStore.contacts = snap.contacts;
  mergeNewsletterSnapshot({
    newsletter: snap.newsletter,
    newsletterCoupons: snap.newsletterCoupons,
  });
  if (Array.isArray(snap.bookings)) runtimeStore.bookings = snap.bookings;
  if (Array.isArray(snap.homeLayout) && snap.homeLayout.length > 0) {
    runtimeStore.homeLayout = snap.homeLayout;
  }
  if (snap.contentPages) runtimeStore.contentPages = snap.contentPages;
  if (snap.seedSignature) setCatalogSeedSignature(snap.seedSignature);
}

/** Shop flags live only in admin settings — a stale isolate must not turn them back on. */
function mergeSettingsForSave(local: StudioSettings, remote?: StudioSettings): StudioSettings {
  const dirty = consumeDirtySettingsKeys();
  if (!remote) return local;
  const merged: StudioSettings = { ...remote, ...local };
  const flags = ["giftWrapEnabled", "workshopsEnabled", "maintenanceMode"] as const;
  const localAt = local.settingsUpdatedAt ?? "";
  const remoteAt = remote.settingsUpdatedAt ?? "";
  for (const key of flags) {
    if (dirty.has(key)) continue;
    if (typeof remote[key] !== "boolean") continue;
    if (!localAt || remoteAt >= localAt) merged[key] = remote[key];
  }
  return merged;
}

function captureSnapshot(remote?: AtelierSnapshot): AtelierSnapshot {
  return {
    seedSignature: getCatalogSeedSignature(),
    settings: mergeSettingsForSave(getRuntimeSettings(), remote?.settings),
    catalog: runtimeStore.catalog,
    blogPosts: runtimeStore.blogPosts,
    workshops: runtimeStore.workshops,
    emailTemplates: runtimeStore.emailTemplates,
    collections: runtimeStore.collections,
    b2b: runtimeStore.b2b,
    contacts: runtimeStore.contacts,
    newsletter: runtimeStore.newsletter,
    newsletterCoupons: runtimeStore.newsletterCoupons,
    bookings: runtimeStore.bookings,
    homeLayout: runtimeStore.homeLayout,
    contentPages: runtimeStore.contentPages,
  };
}

function writeDisk(snap: AtelierSnapshot) {
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(STATE_FILE, `${JSON.stringify(snap)}\n`, "utf8");
    return true;
  } catch {
    return false;
  }
}

async function hydrate() {
  const remote = await readAtelierState<AtelierSnapshot>(ATELIER_STATE_KEYS.shop);
  if (remote && (remote.catalog?.length || remote.settings)) {
    applySnapshot(remote);
    return;
  }
  const disk = loadSnapshot();
  if (disk) applySnapshot(disk);
}

/** Restore catalog after restart — Supabase on Vercel, `.data` locally. */
export async function ensureAtelierHydrated(options?: { force?: boolean }) {
  // Warm isolates keep the first snapshot forever — gift wrap / coupons look “stuck”.
  const stale = Date.now() - hydratedAt > HYDRATE_TTL_MS;
  if (options?.force || !hydratePromise || stale) {
    hydratePromise = hydrate().then(
      () => {
        hydratedAt = Date.now();
      },
      (error) => {
        hydratePromise = null;
        hydratedAt = 0;
        throw error;
      },
    );
  }
  await hydratePromise;
}

export async function saveAtelierSnapshot() {
  const remote = await readAtelierState<AtelierSnapshot>(ATELIER_STATE_KEYS.shop);
  if (remote) {
    mergeNewsletterSnapshot({
      newsletter: remote.newsletter,
      newsletterCoupons: remote.newsletterCoupons,
    });
  }
  const snap = captureSnapshot(remote ?? undefined);
  const disk = writeDisk(snap);
  const wroteRemote = await writeAtelierState(ATELIER_STATE_KEYS.shop, snap);
  return wroteRemote || (disk && process.env.VERCEL !== "1");
}

export async function flushAtelierSave() {
  if (pendingSave) await pendingSave;
  else await saveAtelierSnapshot();
}

export function atelierDiskPersistsAcrossDeploys() {
  return process.env.VERCEL !== "1";
}

export function atelierRemotePersists() {
  return hasSupabaseService();
}

setAtelierPersister(() => {
  pendingSave = saveAtelierSnapshot();
});
