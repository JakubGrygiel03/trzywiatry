import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { SITE } from "@/lib/constants";

const DATA_DIR = path.join(process.cwd(), ".data");
const AUTH_FILE = path.join(DATA_DIR, "admin-auth.json");

type AdminAuthFile = {
  email: string;
  passwordHash: string;
  updatedAt: string;
  resetTokenHash?: string;
  resetExpiresAt?: string;
};

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getAdminEmail() {
  return (process.env.ADMIN_EMAIL ?? SITE.email).trim().toLowerCase();
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

function verifyPassword(password: string, stored: string) {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, salt, expectedHex] = parts;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function defaultPassword() {
  return process.env.ADMIN_DEMO_PASSWORD ?? "atelier";
}

function readAuthFile(): AdminAuthFile | null {
  if (!existsSync(AUTH_FILE)) return null;
  try {
    return JSON.parse(readFileSync(AUTH_FILE, "utf8")) as AdminAuthFile;
  } catch {
    return null;
  }
}

function writeAuthFile(data: AdminAuthFile) {
  ensureDataDir();
  writeFileSync(AUTH_FILE, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

/** Loads credentials; seeds from env on first run (like WP first install). */
export function loadAdminAuth(): AdminAuthFile {
  const existing = readAuthFile();
  const email = getAdminEmail();

  if (existing?.passwordHash) {
    // Keep hash; sync email from env if admin changed ADMIN_EMAIL.
    if (existing.email !== email) {
      const next = { ...existing, email, updatedAt: new Date().toISOString() };
      writeAuthFile(next);
      return next;
    }
    return existing;
  }

  const seeded: AdminAuthFile = {
    email,
    passwordHash: hashPassword(defaultPassword()),
    updatedAt: new Date().toISOString(),
  };
  writeAuthFile(seeded);
  return seeded;
}

export function verifyAdminCredentials(email: string, password: string) {
  const auth = loadAdminAuth();
  const normalized = email.trim().toLowerCase();
  if (normalized !== auth.email) return false;
  return verifyPassword(password, auth.passwordHash);
}

export function updateAdminPassword(newPassword: string) {
  const auth = loadAdminAuth();
  writeAuthFile({
    email: auth.email,
    passwordHash: hashPassword(newPassword),
    updatedAt: new Date().toISOString(),
  });
}

/** Creates a one-time reset token (raw returned once; only hash is stored). */
export function createPasswordResetToken() {
  const raw = randomBytes(32).toString("hex");
  const auth = loadAdminAuth();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  writeAuthFile({
    ...auth,
    resetTokenHash: sha256(raw),
    resetExpiresAt: expiresAt,
  });
  return { token: raw, expiresAt };
}

export function consumePasswordResetToken(token: string) {
  const auth = loadAdminAuth();
  if (!auth.resetTokenHash || !auth.resetExpiresAt) {
    return { ok: false as const, reason: "invalid" as const };
  }
  if (new Date(auth.resetExpiresAt).getTime() < Date.now()) {
    clearResetToken(auth);
    return { ok: false as const, reason: "expired" as const };
  }
  const left = Buffer.from(sha256(token), "hex");
  const right = Buffer.from(auth.resetTokenHash, "hex");
  if (left.length !== right.length) {
    return { ok: false as const, reason: "invalid" as const };
  }
  if (!timingSafeEqual(left, right)) {
    return { ok: false as const, reason: "invalid" as const };
  }
  return { ok: true as const, auth };
}

function clearResetToken(auth: AdminAuthFile) {
  writeAuthFile({
    email: auth.email,
    passwordHash: auth.passwordHash,
    updatedAt: auth.updatedAt,
  });
}

export function setPasswordWithResetToken(token: string, newPassword: string) {
  const result = consumePasswordResetToken(token);
  if (!result.ok) return result;
  writeAuthFile({
    email: result.auth.email,
    passwordHash: hashPassword(newPassword),
    updatedAt: new Date().toISOString(),
  });
  return { ok: true as const };
}

export function getSiteBaseUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? SITE.url).replace(/\/$/, "");
}
