import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

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

const local = loadEnv();
let siteUrl = local.NEXT_PUBLIC_SITE_URL || "https://trzywiatry.vercel.app";
try {
  const host = new URL(siteUrl).hostname;
  console.log("SITE_HOST", host);
  if (host === "localhost" || host === "127.0.0.1") {
    siteUrl = "https://trzywiatry.vercel.app";
    console.log("SITE_HOST_OVERRIDE", "trzywiatry.vercel.app");
  }
} catch {
  siteUrl = "https://trzywiatry.vercel.app";
}

const values = {
  NEXT_PUBLIC_SITE_URL: siteUrl,
  NEXT_PUBLIC_SUPABASE_URL: local.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: local.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: local.SUPABASE_SERVICE_ROLE_KEY,
  ADMIN_EMAIL: local.ADMIN_EMAIL,
  ADMIN_DEMO_PASSWORD: local.ADMIN_DEMO_PASSWORD,
  CUSTOMER_SESSION_SECRET: local.CUSTOMER_SESSION_SECRET,
  RESEND_API_KEY: local.RESEND_API_KEY,
  NEWSLETTER_FROM_EMAIL: local.NEWSLETTER_FROM_EMAIL,
  P24_MERCHANT_ID: local.P24_MERCHANT_ID,
  P24_POS_ID: local.P24_POS_ID,
  P24_CRC: local.P24_CRC,
  P24_API_KEY: local.P24_API_KEY,
  P24_SANDBOX: local.P24_SANDBOX,
};

const publicNames = new Set([
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEWSLETTER_FROM_EMAIL",
  "ADMIN_EMAIL",
]);

const p24Only = process.argv.includes("--p24-only");
const p24Names = new Set(["P24_MERCHANT_ID", "P24_POS_ID", "P24_CRC", "P24_API_KEY", "P24_SANDBOX"]);
const environments = ["production", "preview", "development"];

function vercel(args, input) {
  return spawnSync("npx.cmd", ["vercel", ...args, "--scope", "jakub-grygiel", "--project", "trzywiatry", "--yes"], {
    encoding: "utf8",
    input,
    shell: true,
    windowsHide: true,
  });
}

for (const [name, value] of Object.entries(values)) {
  if (p24Only && !p24Names.has(name)) continue;
  if (!value) {
    console.log("SKIP_EMPTY", name);
    continue;
  }
  if (p24Names.has(name)) {
    for (const envName of environments) {
      vercel(["env", "rm", name, envName]);
    }
  }
  const flag = publicNames.has(name) ? "--no-sensitive" : "--sensitive";
  const result = vercel(["env", "add", name, "production,preview,development", flag], `${value}\n`);
  const out = `${result.error?.message || ""}\n${result.stdout || ""}${result.stderr || ""}`.replaceAll(value, "[redacted]");
  if (result.status === 0) console.log("ADDED", name);
  else console.log("FAILED", name, result.status, out.slice(-400).trim());
}
