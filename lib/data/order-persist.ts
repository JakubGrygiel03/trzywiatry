import "server-only";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { runtimeStore } from "@/lib/data/runtime-store";
import type { StoredOrder } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), ".data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

let hydrated = false;

function loadPersistedOrders(): StoredOrder[] {
  if (!existsSync(ORDERS_FILE)) return [];
  try {
    const data: unknown = JSON.parse(readFileSync(ORDERS_FILE, "utf8"));
    return Array.isArray(data) ? (data as StoredOrder[]) : [];
  } catch {
    return [];
  }
}

export function ensureOrdersHydrated() {
  if (hydrated) return;
  const disk = loadPersistedOrders();
  if (runtimeStore.orders.length === 0 && disk.length > 0) {
    runtimeStore.orders = disk;
  }
  hydrated = true;
}

export function saveOrdersToDisk() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(ORDERS_FILE, `${JSON.stringify(runtimeStore.orders, null, 2)}\n`, "utf8");
}
