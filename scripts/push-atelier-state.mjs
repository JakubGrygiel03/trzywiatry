import { readFileSync, existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const env = {};
  const text = readFileSync(".env.local", "utf8");
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    env[t.slice(0, i)] = t.slice(i + 1).replace(/^['"]|['"]$/g, "").trim();
  }
  return env;
}

function readJson(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const rows = [];
const shop = readJson(".data/atelier.json");
if (shop && typeof shop === "object") rows.push({ key: "shop", payload: shop });
const orders = readJson(".data/orders.json");
if (Array.isArray(orders)) rows.push({ key: "orders", payload: { orders } });
const customers = readJson(".data/customer-users.json");
if (customers && typeof customers === "object") rows.push({ key: "customers", payload: customers });

if (rows.length === 0) {
  console.log("NO_LOCAL_SNAPSHOTS");
  process.exit(1);
}

for (const row of rows) {
  const { error } = await supabase.from("atelier_state").upsert(
    { key: row.key, payload: row.payload, updated_at: new Date().toISOString() },
    { onConflict: "key" },
  );
  if (error) {
    console.log("UPSERT_FAIL", row.key, error.code || "", error.message);
    process.exit(2);
  }
  console.log("UPSERT_OK", row.key);
}
