import "server-only";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { hasSupabaseService, readAtelierState, writeAtelierState } from "@/lib/data/supabase-state";
import {
  applyTrafficEvent,
  emptyTrafficSnapshot,
  parseTrafficSnapshot,
  TRAFFIC_STATE_KEY,
  type TrafficKind,
  type TrafficSnapshot,
} from "@/lib/data/traffic-stats";

const DATA_DIR = path.join(process.cwd(), ".data");
const TRAFFIC_FILE = path.join(DATA_DIR, "traffic.json");

const globalStore = globalThis as typeof globalThis & {
  __twTraffic?: TrafficSnapshot;
  __twTrafficReady?: Promise<void>;
};

function writeDisk(snap: TrafficSnapshot) {
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(TRAFFIC_FILE, `${JSON.stringify(snap)}\n`, "utf8");
  } catch {
    /* local-only fallback */
  }
}

function readDisk(): TrafficSnapshot | null {
  if (!existsSync(TRAFFIC_FILE)) return null;
  try {
    return parseTrafficSnapshot(JSON.parse(readFileSync(TRAFFIC_FILE, "utf8")));
  } catch {
    return null;
  }
}

async function hydrate() {
  const remote = await readAtelierState<TrafficSnapshot>(TRAFFIC_STATE_KEY);
  if (remote) {
    globalStore.__twTraffic = parseTrafficSnapshot(remote);
    return;
  }
  globalStore.__twTraffic = readDisk() ?? emptyTrafficSnapshot();
}

export async function ensureTrafficHydrated() {
  if (!globalStore.__twTrafficReady) {
    globalStore.__twTrafficReady = hydrate().catch((error) => {
      globalStore.__twTrafficReady = undefined;
      throw error;
    });
  }
  await globalStore.__twTrafficReady;
  if (!globalStore.__twTraffic) globalStore.__twTraffic = emptyTrafficSnapshot();
}

export async function recordTrafficEvent(event: { kind: TrafficKind; path?: string; slug?: string }) {
  await ensureTrafficHydrated();
  const snap = applyTrafficEvent(globalStore.__twTraffic ?? emptyTrafficSnapshot(), event);
  globalStore.__twTraffic = snap;
  writeDisk(snap);
  await writeAtelierState(TRAFFIC_STATE_KEY, snap);
}

export async function getTrafficSnapshot() {
  await ensureTrafficHydrated();
  return globalStore.__twTraffic ?? emptyTrafficSnapshot();
}

export async function resetTrafficSnapshot() {
  const snap = emptyTrafficSnapshot();
  globalStore.__twTraffic = snap;
  writeDisk(snap);
  await writeAtelierState(TRAFFIC_STATE_KEY, snap);
  return snap;
}

export function trafficPersistsRemotely() {
  return hasSupabaseService();
}
