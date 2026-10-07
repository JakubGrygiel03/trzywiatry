import "server-only";

import { createServiceClient } from "@/lib/supabase/service";

export const ATELIER_STATE_KEYS = {
  shop: "shop",
  orders: "orders",
  customers: "customers",
} as const;

export function orderRowKey(orderNumber: string) {
  const slug = orderNumber.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  return `order_${slug}`;
}

export function hasSupabaseService() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}

export async function readAtelierState<T>(key: string): Promise<T | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from("atelier_state").select("payload").eq("key", key).maybeSingle();
    if (error || data?.payload == null || typeof data.payload !== "object") return null;
    return data.payload as T;
  } catch {
    return null;
  }
}

export async function writeAtelierState(key: string, payload: unknown) {
  const supabase = createServiceClient();
  if (!supabase) return false;
  try {
    const { error } = await supabase.from("atelier_state").upsert(
      { key, payload, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );
    if (error) {
      console.error("[atelier_state]", key, error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/** One row per order so a stale list write cannot erase a paid TW-0002. */
export async function readAtelierStatePrefix(prefix: string) {
  const supabase = createServiceClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.from("atelier_state").select("key, payload").like("key", `${prefix}%`);
    if (error || !Array.isArray(data)) return [];
    return data.filter((row) => row.payload && typeof row.payload === "object");
  } catch {
    return [];
  }
}
