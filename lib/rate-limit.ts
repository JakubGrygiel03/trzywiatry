import { ipFromHeaders, ipFromRequest } from "@/lib/client-ip";

type Bucket = { count: number; resetAt: number };

const hits = new Map<string, Bucket>();
const MAX_KEYS = 4000;

function prune(now: number) {
  if (hits.size < MAX_KEYS) return;
  for (const [key, bucket] of hits) {
    if (bucket.resetAt <= now) hits.delete(key);
  }
  if (hits.size >= MAX_KEYS) hits.clear();
}

/** In-memory sliding window. Per-instance on Vercel — still stops naive floods. */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  prune(now);
  const current = hits.get(key);
  if (!current || current.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

export function rateLimitRequest(request: Request, bucket: string, limit: number, windowMs: number) {
  return rateLimit(`${bucket}:${ipFromRequest(request)}`, limit, windowMs);
}

export async function rateLimitAction(bucket: string, limit: number, windowMs: number) {
  const ip = await ipFromHeaders();
  return rateLimit(`${bucket}:${ip}`, limit, windowMs);
}

export const RATE = {
  login: { limit: 8, windowMs: 15 * 60_000 },
  form: { limit: 8, windowMs: 10 * 60_000 },
  upload: { limit: 20, windowMs: 10 * 60_000 },
  inpost: { limit: 60, windowMs: 60_000 },
  track: { limit: 45, windowMs: 60_000 },
} as const;
