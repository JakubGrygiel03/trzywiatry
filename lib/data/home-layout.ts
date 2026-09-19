import "server-only";
import { HOME_PAGE_KEY, defaultHomeLayout, findHomeSection, type HomeSection } from "@/lib/cms/home-layout";
import { ensureAtelierHydrated, saveAtelierSnapshot } from "@/lib/data/atelier-persist";
import { runtimeStore, updateRuntimeSettings, upsertCollectionsFromGlaze } from "@/lib/data/runtime-store";
import { createServiceClient } from "@/lib/supabase/service";
import { normalizeHomeLayout } from "@/lib/validations/home-layout";

export function getCachedHomeLayout(): HomeSection[] {
  if (Array.isArray(runtimeStore.homeLayout) && runtimeStore.homeLayout.length > 0) {
    return normalizeHomeLayout(runtimeStore.homeLayout);
  }
  return defaultHomeLayout();
}

/** Storefront — use atelier memory; skip a second `page_layouts` fetch on every home view. */
export async function getHomeLayout(): Promise<HomeSection[]> {
  await ensureAtelierHydrated();
  return getCachedHomeLayout();
}

/** Admin home editor — refresh from Supabase when available. */
export async function getHomeLayoutFresh(): Promise<HomeSection[]> {
  await ensureAtelierHydrated();
  const remote = await fetchHomeLayoutFromSupabase();
  if (remote) {
    const normalized = normalizeHomeLayout(remote);
    runtimeStore.homeLayout = normalized;
    return normalized;
  }
  return getCachedHomeLayout();
}

export async function persistHomeLayout(sections: HomeSection[]) {
  const next = normalizeHomeLayout(sections);
  runtimeStore.homeLayout = next;
  syncSettingsFromHomeLayout(next);
  const remote = await saveHomeLayoutToSupabase(next);
  const disk = await saveAtelierSnapshot();
  return { sections: next, stored: remote || disk };
}

export function syncSettingsFromHomeLayout(sections: HomeSection[]) {
  const hero = findHomeSection(sections, "hero");
  const newsletter = findHomeSection(sections, "newsletter");
  const glaze = findHomeSection(sections, "glaze");
  if (glaze?.payload.lines) upsertCollectionsFromGlaze(glaze.payload.lines);
  updateRuntimeSettings({
    heroSlots: hero?.payload.slots ?? [],
    newsletterEnabled: newsletter?.enabled ?? true,
    newsletterEyebrow: newsletter?.payload.eyebrow,
    newsletterTitle: newsletter?.payload.title,
    newsletterBody: newsletter?.payload.body,
    newsletterFormLabel: newsletter?.payload.formLabel,
    newsletterButtonLabel: newsletter?.payload.buttonLabel,
  });
}

async function fetchHomeLayoutFromSupabase(): Promise<HomeSection[] | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("page_layouts")
      .select("sections")
      .eq("page_key", HOME_PAGE_KEY)
      .maybeSingle();
    if (error || !data) return null;
    return normalizeHomeLayout(data.sections);
  } catch {
    return null;
  }
}

async function saveHomeLayoutToSupabase(sections: HomeSection[]) {
  const supabase = createServiceClient();
  if (!supabase) return false;
  try {
    const { error } = await supabase.from("page_layouts").upsert(
      {
        page_key: HOME_PAGE_KEY,
        sections,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "page_key" },
    );
    return !error;
  } catch {
    return false;
  }
}
