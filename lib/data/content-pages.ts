import "server-only";
import { cache } from "react";
import { defaultContentOverlay } from "@/lib/cms/content-page-defaults";
import type { ContentOverlayMap, ContentPageKey } from "@/lib/cms/content-pages";
import { ensureAtelierHydrated, saveAtelierSnapshot } from "@/lib/data/atelier-persist";
import { runtimeStore } from "@/lib/data/runtime-store";
import { createServiceClient } from "@/lib/supabase/service";
import { normalizeContentOverlay } from "@/lib/validations/content-pages";

type OverlayRow = { type?: string; payload?: unknown };

function readCached<K extends ContentPageKey>(key: K): ContentOverlayMap[K] | null {
  const stored = runtimeStore.contentPages?.[key];
  return stored ? normalizeContentOverlay(key, stored) : null;
}

export function getCachedContentPage<K extends ContentPageKey>(key: K): ContentOverlayMap[K] {
  return readCached(key) ?? defaultContentOverlay(key);
}

export const getContentPage = cache(async function getContentPage<K extends ContentPageKey>(
  key: K,
): Promise<ContentOverlayMap[K]> {
  await ensureAtelierHydrated();
  const remote = await fetchOverlayFromSupabase(key);
  if (remote) {
    writeCache(key, remote);
    return remote;
  }
  return getCachedContentPage(key);
});

export async function persistContentPage(key: ContentPageKey, overlay: ContentOverlayMap[ContentPageKey]) {
  const next = normalizeContentOverlay(key, overlay);
  writeCache(key, next);
  const remote = await saveOverlayToSupabase(key, next);
  const disk = await saveAtelierSnapshot();
  return { overlay: next, stored: remote || disk };
}

function writeCache<K extends ContentPageKey>(key: K, overlay: ContentOverlayMap[K]) {
  runtimeStore.contentPages = { ...runtimeStore.contentPages, [key]: overlay };
}

function unwrapSections(sections: unknown) {
  if (!Array.isArray(sections) || sections.length === 0) return null;
  const first = sections[0] as OverlayRow;
  return first?.payload ?? first;
}

async function fetchOverlayFromSupabase<K extends ContentPageKey>(key: K) {
  const supabase = createServiceClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from("page_layouts").select("sections").eq("page_key", key).maybeSingle();
    if (error || !data) return null;
    return normalizeContentOverlay(key, unwrapSections(data.sections));
  } catch {
    return null;
  }
}

async function saveOverlayToSupabase<K extends ContentPageKey>(key: K, overlay: ContentOverlayMap[K]) {
  const supabase = createServiceClient();
  if (!supabase) return false;
  try {
    const { error } = await supabase.from("page_layouts").upsert(
      {
        page_key: key,
        sections: [{ id: "overlay", type: "overlay", enabled: true, payload: overlay }],
        updated_at: new Date().toISOString(),
      },
      { onConflict: "page_key" },
    );
    return !error;
  } catch {
    return false;
  }
}
