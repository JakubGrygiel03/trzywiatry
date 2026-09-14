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
    env[t.slice(0, i)] = t.slice(i + 1).replace(/^['"]|['"]$/g, "");
  }
  return env;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
if (!url || !key) {
  console.log("MISSING_SERVICE_ROLE", Boolean(url), Boolean(key));
  process.exit(1);
}

console.log("KEY_SHAPE", key.startsWith("eyJ") ? "jwt" : key.slice(0, 8), "len", key.length, "dots", key.split(".").length - 1);
if (key.includes(".")) {
  const payload = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString("utf8"));
  console.log("JWT_ROLE", payload.role || "(none)");
}
const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const { data, error } = await supabase.from("atelier_state").select("key, updated_at");
if (error) {
  console.log("TABLE_ERROR", error.code || "", error.message);
  process.exit(2);
}

const keys = (data ?? []).map((row) => `${row.key}@${row.updated_at}`);
console.log("TABLE_OK", keys.length ? keys.join(",") : "(empty)");

if (existsSync(".data/atelier.json") || existsSync(".data/orders.json")) {
  console.log("LOCAL_SNAPSHOTS", [
    existsSync(".data/atelier.json") ? "shop" : null,
    existsSync(".data/orders.json") ? "orders" : null,
    existsSync(".data/customer-users.json") ? "customers" : null,
  ].filter(Boolean).join(","));
}
