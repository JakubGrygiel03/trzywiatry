import "server-only";

import { createHmac } from "crypto";
import { isMintedNewsletterCode, normalizeCouponCode } from "@/lib/coupon-code";

/** Same alphabet as minted TW- codes — skip I/O/0/1. */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const RANDOM_LEN = 4;
const CHECK_LEN = 2;

function signingSecret() {
  return (process.env.NEWSLETTER_CODE_SECRET ?? process.env.P24_CRC ?? "").trim();
}

export function canSignNewsletterCodes() {
  return signingSecret().length >= 8;
}

function checksum(body: string) {
  const digest = createHmac("sha256", signingSecret()).update(`tw-nl:v1:${body}`).digest();
  let out = "";
  for (let i = 0; i < CHECK_LEN; i += 1) {
    out += ALPHABET[digest[i]! % ALPHABET.length];
  }
  return out;
}

/** TW- + 4 random + 2 HMAC chars. Random TW-XXXXXX will almost never match. */
export function mintSignedNewsletterCode(taken: (code: string) => boolean) {
  if (!canSignNewsletterCodes()) return null;
  for (let attempt = 0; attempt < 16; attempt += 1) {
    const bytes = crypto.getRandomValues(new Uint8Array(RANDOM_LEN));
    const body = Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join("");
    const code = `TW-${body}${checksum(body)}`;
    if (!taken(code)) return code;
  }
  return null;
}

export function isSignedNewsletterCode(raw: string) {
  if (!canSignNewsletterCodes()) return false;
  const code = normalizeCouponCode(raw);
  if (!isMintedNewsletterCode(code)) return false;
  const body = code.slice(3, 3 + RANDOM_LEN);
  const check = code.slice(3 + RANDOM_LEN);
  return check === checksum(body);
}
