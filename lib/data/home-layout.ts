import "server-only";
import { HOME_PAGE_KEY, defaultHomeLayout, findHomeSection, type HomeSection } from "@/lib/cms/home-layout";
import { runtimeStore, updateRuntimeSettings, upsertCollectionsFromGlaze } from "@/lib/data/runtime-store";
import { createServiceClient } from "@/lib/supabase/service";
import { normalizeHomeLayout } from "@/lib/validations/home-layout";

export function getCachedHomeLayout(): HomeSection[] {
  if (Array.isArray(runtimeStore.homeLayout) && runtimeStore.homeLayout.length > 0) {
    return normalizeHomeLayout(runtimeStore.homeLayout);
  }
  return defaultHomeLayout();
}

export async function getHomeLayout(): Promise<HomeSection[]> {
  const remote = await fetchHomeLayoutFromSupabase();
  if (remote) {
    runtimeStore.homeLayout = remote;
    return remote;
  }
  return getCachedHomeLayout();
}

export async function persistHomeLayout(sections: HomeSection[]) {
  const next = normalizeHomeLayout(sections);
  runtimeStore.homeLayout = next;
  syncSettingsFromHomeLayout(next);
  const stored = await saveHomeLayoutToSupabase(next);
  return { sections: next, stored };
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
