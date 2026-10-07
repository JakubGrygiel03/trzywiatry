import "server-only";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { mergeOrderLists } from "@/lib/data/order-merge";
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
  runtimeStore.orders = mergeOrderLists([
    runtimeStore.orders,
    Array.isArray(remote?.orders) ? remote.orders : [],
    loadPersistedOrders(),
  ]);
}

export async function ensureOrdersHydrated(options?: { force?: boolean }) {
  // Serverless warm instances cache the first hydrate — force re-read after P24 return / webhook.
  if (options?.force || !hydratePromise) {
    hydratePromise = hydrate();
  }
  await hydratePromise;
}

export function saveOrdersToDisk() {
  writeDisk();
  pendingSave = writeAtelierState(ATELIER_STATE_KEYS.orders, { orders: runtimeStore.orders });
}

async function mergeRemoteThenWrite() {
  const remote = await readAtelierState<{ orders?: StoredOrder[] }>(ATELIER_STATE_KEYS.orders);
  runtimeStore.orders = mergeOrderLists([
    runtimeStore.orders,
    Array.isArray(remote?.orders) ? remote.orders : [],
  ]);
  writeDisk();
  pendingSave = writeAtelierState(ATELIER_STATE_KEYS.orders, { orders: runtimeStore.orders });
  return pendingSave;
}

export async function flushOrdersSave() {
  return mergeRemoteThenWrite();
}
