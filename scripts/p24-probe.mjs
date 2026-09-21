import { readFileSync } from "fs";
import { createHash } from "crypto";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    }),
);

const sandbox = env.P24_SANDBOX !== "false";
const host = sandbox ? "https://sandbox.przelewy24.pl" : "https://secure.przelewy24.pl";
const merchantId = Number(env.P24_MERCHANT_ID || 0);
const posId = Number(env.P24_POS_ID || merchantId);
const crc = (env.P24_CRC || "").trim();
const apiKey = (env.P24_API_KEY || env.P24_REPORTS_KEY || "").trim();

console.log({
  host,
  merchantId,
  posId,
  crcLen: crc.length,
  apiKeyLen: apiKey.length,
  sandboxFlag: env.P24_SANDBOX,
  siteUrl: env.NEXT_PUBLIC_SITE_URL,
});

async function tryRegister(label, urls) {
  const sessionId = `TW-TEST-${Date.now()}-${label}`;
  const amount = 100;
  const signPayload = { sessionId, merchantId, amount, currency: "PLN", crc };
  const sign = createHash("sha384").update(JSON.stringify(signPayload)).digest("hex");
  const body = {
    merchantId,
    posId,
    sessionId,
    amount,
    currency: "PLN",
    description: "Test Trzy Wiatry",
    email: "test@example.com",
    country: "PL",
    language: "pl",
    encoding: "UTF-8",
    urlReturn: urls.urlReturn,
    urlStatus: urls.urlStatus,
    sign,
  };
  const auth = Buffer.from(`${posId}:${apiKey}`).toString("base64");
  const res = await fetch(`${host}/api/v1/transaction/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  console.log(`\n[${label}] status=${res.status}`);
  console.log(text.slice(0, 1000));
}

const auth = Buffer.from(`${posId}:${apiKey}`).toString("base64");
const access = await fetch(`${host}/api/v1/testAccess`, {
  headers: { Authorization: `Basic ${auth}`, Accept: "application/json" },
});
console.log(`\n[testAccess] status=${access.status}`);
console.log((await access.text()).slice(0, 500));

if (access.status === 401) {
  console.log(`
---
401 = złe dane logowania do API (nie CRC).
W panelu SANDBOX https://sandbox.przelewy24.pl/panel :
  • ID sklepu / POS  → P24_MERCHANT_ID + P24_POS_ID
  • Klucz CRC        → P24_CRC
  • Klucz API (raporty) → P24_API_KEY
P24_SANDBOX=true wymaga kluczy z panelu SANDBOX, nie z produkcji.
---`);
  process.exit(1);
}

await tryRegister("localhost", {
  urlReturn: "http://localhost:3000/zamowienie/potwierdzenie",
  urlStatus: "http://localhost:3000/api/webhooks/p24",
});

const publicBase = (env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
if (publicBase && !publicBase.includes("localhost")) {
  await tryRegister("public", {
    urlReturn: `${publicBase}/zamowienie/potwierdzenie`,
    urlStatus: `${publicBase}/api/webhooks/p24`,
  });
}
