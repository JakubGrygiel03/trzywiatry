/**
 * Push tmp-woo-catalog-import.json into .data/atelier.json + Supabase atelier_state.shop
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import path from "node:path";

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

const env = loadEnv();
const catalogPath = path.resolve("tmp-woo-catalog-import.json");
if (!existsSync(catalogPath)) {
  console.error("Missing tmp-woo-catalog-import.json — run import-woo-csv.mjs first");
  process.exit(1);
}
const products = JSON.parse(readFileSync(catalogPath, "utf8"));

const dataDir = path.resolve(".data");
if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
const atelierPath = path.join(dataDir, "atelier.json");
const snap = existsSync(atelierPath) ? JSON.parse(readFileSync(atelierPath, "utf8")) : {};

const signature = products
  .map((p) => `${p.id}:${p.slug}:${p.variants.length}:${p.images[0] ?? ""}`)
  .join("|");

snap.catalog = products;
snap.seedSignature = signature;
writeFileSync(atelierPath, `${JSON.stringify(snap, null, 2)}\n`);
console.log("LOCAL_OK", products.length, "products");

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { error } = await supabase.from("atelier_state").upsert(
  { key: "shop", payload: snap, updated_at: new Date().toISOString() },
  { onConflict: "key" },
);
if (error) {
  console.error("UPSERT_FAIL", error.message);
  process.exit(2);
}
console.log("SUPABASE_OK shop");
