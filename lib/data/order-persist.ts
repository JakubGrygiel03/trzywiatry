import "server-only";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { runtimeStore } from "@/lib/data/runtime-store";
import { ATELIER_STATE_KEYS, readAtelierState, writeAtelierState } from "@/lib/data/supabase-state";
import type { StoredOrder } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), ".data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

let hydratePromise: Promise<void> | null = null;
let pendingSave: Promise<boolean> | null = null;

function loadPersistedOrders(): StoredOrder[] {
  if (!existsSync(ORDERS_FILE)) return [];
  try {
    const data: unknown = JSON.parse(readFileSync(ORDERS_FILE, "utf8"));
    return Array.isArray(data) ? (data as StoredOrder[]) : [];
  } catch {
    return [];
  }
}

function writeDisk() {
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(ORDERS_FILE, `${JSON.stringify(runtimeStore.orders, null, 2)}\n`, "utf8");
    return true;
  } catch {
    return false;
  }
}

async function hydrate() {
  const remote = await readAtelierState<{ orders?: StoredOrder[] }>(ATELIER_STATE_KEYS.orders);
  if (Array.isArray(remote?.orders) && remote.orders.length > 0) {
    runtimeStore.orders = remote.orders;
    return;
  }
  const disk = loadPersistedOrders();
  if (runtimeStore.orders.length === 0 && disk.length > 0) {
    runtimeStore.orders = disk;
  }
}

export async function ensureOrdersHydrated() {
  if (!hydratePromise) hydratePromise = hydrate();
  await hydratePromise;
}

export function saveOrdersToDisk() {
  writeDisk();
  pendingSave = writeAtelierState(ATELIER_STATE_KEYS.orders, { orders: runtimeStore.orders });
}

export async function flushOrdersSave() {
  writeDisk();
  pendingSave = writeAtelierState(ATELIER_STATE_KEYS.orders, { orders: runtimeStore.orders });
  return pendingSave;
}
