import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { ATELIER_STATE_KEYS, readAtelierState, writeAtelierState } from "@/lib/data/supabase-state";
import { verifyCustomerSessionCookie } from "@/lib/customer-session-token";

export { getPublicSiteUrl as getSiteBaseUrl } from "@/lib/site-url";
export { CUSTOMER_COOKIE, createCustomerSessionValue, verifyCustomerSessionCookie } from "@/lib/customer-session-token";

const DATA_DIR = path.join(process.cwd(), ".data");
const USERS_FILE = path.join(DATA_DIR, "customer-users.json");

export type CustomerUser = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
  /** Missing on legacy rows = already trusted. New signups start as `false`. */
  emailVerified?: boolean;
  confirmTokenHash?: string;
  confirmExpiresAt?: string;
  resetTokenHash?: string;
  resetExpiresAt?: string;
};

type UsersFile = { users: CustomerUser[] };

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
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
  const actual = scryptSync(password, salt!, 64);
  const expected = Buffer.from(expectedHex!, "hex");
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function readUsersFile(): UsersFile {
  if (!existsSync(USERS_FILE)) return { users: [] };
  try {
    const parsed = JSON.parse(readFileSync(USERS_FILE, "utf8")) as UsersFile;
    return { users: Array.isArray(parsed.users) ? parsed.users : [] };
  } catch {
    return { users: [] };
  }
}

function writeUsersFile(data: UsersFile) {
  usersCache = data.users;
  ensureDataDir();
  try {
    writeFileSync(USERS_FILE, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  } catch {
    // Vercel read-only FS — memory + Supabase remain.
  }
  pendingCustomerSave = writeAtelierState(ATELIER_STATE_KEYS.customers, data);
}

let usersCache: CustomerUser[] | null = null;
let customersHydrate: Promise<void> | null = null;
let pendingCustomerSave: Promise<boolean> | null = null;

/** Prefer the newest row per email so local register is not wiped by a stale Supabase payload. */
function mergeCustomerLists(remote: CustomerUser[], local: CustomerUser[]) {
  const byEmail = new Map<string, CustomerUser>();
  for (const user of [...remote, ...local]) {
    const prev = byEmail.get(user.email);
    if (!prev) {
      byEmail.set(user.email, user);
      continue;
    }
    const prevTs = Date.parse(prev.updatedAt) || 0;
    const nextTs = Date.parse(user.updatedAt) || 0;
    byEmail.set(user.email, nextTs >= prevTs ? user : prev);
  }
  return [...byEmail.values()];
}

export async function ensureCustomersHydrated() {
  if (!customersHydrate) {
    customersHydrate = (async () => {
      const local = readUsersFile().users;
      const remote = await readAtelierState<UsersFile>(ATELIER_STATE_KEYS.customers);
      if (Array.isArray(remote?.users)) {
        const merged = mergeCustomerLists(remote.users, local);
        usersCache = merged;
        // Seed empty remote from local (common after first Vercel deploy).
        if (remote.users.length === 0 && local.length > 0) {
          pendingCustomerSave = writeAtelierState(ATELIER_STATE_KEYS.customers, { users: merged });
        }
        return;
      }
      usersCache = local;
    })();
  }
  await customersHydrate;
}

export async function flushCustomersSave() {
  if (pendingCustomerSave) await pendingCustomerSave;
}

function currentUsers(): CustomerUser[] {
  if (usersCache) return usersCache;
  return readUsersFile().users;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function findCustomerByEmail(email: string) {
  const normalized = normalizeEmail(email);
  return currentUsers().find((user) => user.email === normalized) ?? null;
}

export function findCustomerById(id: string) {
  return currentUsers().find((user) => user.id === id) ?? null;
}

export function isCustomerEmailVerified(user: CustomerUser) {
  return user.emailVerified !== false;
}

/** Used when outbound confirm mail fails in development so login is not a dead end. */
export function markCustomerEmailVerified(email: string) {
  const file: UsersFile = { users: [...currentUsers()] };
  const index = file.users.findIndex((user) => user.email === normalizeEmail(email));
  if (index < 0) return false;
  const current = file.users[index]!;
  file.users[index] = {
    ...current,
    emailVerified: true,
    confirmTokenHash: undefined,
    confirmExpiresAt: undefined,
    updatedAt: new Date().toISOString(),
  };
  writeUsersFile(file);
  return true;
}

function issueConfirmSecret() {
  const token = randomBytes(32).toString("hex");
  return {
    token,
    confirmTokenHash: sha256(token),
    confirmExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

export function registerCustomer(input: { email: string; password: string; name: string }) {
  const email = normalizeEmail(input.email);
  const file: UsersFile = { users: [...currentUsers()] };
  if (file.users.some((user) => user.email === email)) {
    return { ok: false as const, reason: "exists" as const };
  }

  const now = new Date().toISOString();
  const user: CustomerUser = {
    id: `u-${randomBytes(6).toString("hex")}`,
    email,
    name: input.name.trim(),
    passwordHash: hashPassword(input.password),
    createdAt: now,
    updatedAt: now,
    // Email confirm is off for now — activate immediately after signup.
    emailVerified: true,
  };
  file.users.push(user);
  writeUsersFile(file);
  return { ok: true as const, user };
}

export function issueEmailConfirmToken(email: string) {
  const file: UsersFile = { users: [...currentUsers()] };
  const index = file.users.findIndex((user) => user.email === normalizeEmail(email));
  if (index < 0) return { ok: false as const, reason: "missing" as const };

  const current = file.users[index]!;
  if (isCustomerEmailVerified(current)) return { ok: false as const, reason: "already" as const };

  const confirm = issueConfirmSecret();
  file.users[index] = {
    ...current,
    confirmTokenHash: confirm.confirmTokenHash,
    confirmExpiresAt: confirm.confirmExpiresAt,
    updatedAt: new Date().toISOString(),
  };
  writeUsersFile(file);
  return { ok: true as const, token: confirm.token, user: file.users[index]! };
}

export function confirmCustomerEmail(token: string) {
  const file: UsersFile = { users: [...currentUsers()] };
  const tokenHash = sha256(token);
  const index = file.users.findIndex((user) => user.confirmTokenHash === tokenHash);
  if (index < 0) return { ok: false as const, reason: "invalid" as const };

  const user = file.users[index]!;
  if (!user.confirmExpiresAt || new Date(user.confirmExpiresAt).getTime() < Date.now()) {
    file.users[index] = { ...user, confirmTokenHash: undefined, confirmExpiresAt: undefined };
    writeUsersFile(file);
    return { ok: false as const, reason: "expired" as const };
  }

  file.users[index] = {
    ...user,
    emailVerified: true,
    confirmTokenHash: undefined,
    confirmExpiresAt: undefined,
    updatedAt: new Date().toISOString(),
  };
  writeUsersFile(file);
  return { ok: true as const, user: file.users[index]! };
}

export function verifyCustomerCredentials(email: string, password: string) {
  const user = findCustomerByEmail(email);
  if (!user) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;
  return user;
}

export function updateCustomerPassword(userId: string, newPassword: string) {
  const file: UsersFile = { users: [...currentUsers()] };
  const index = file.users.findIndex((user) => user.id === userId);
  if (index < 0) return false;
  const current = file.users[index]!;
  file.users[index] = {
    ...current,
    passwordHash: hashPassword(newPassword),
    updatedAt: new Date().toISOString(),
    resetTokenHash: undefined,
    resetExpiresAt: undefined,
  };
  writeUsersFile(file);
  return true;
}

export function createCustomerPasswordResetToken(email: string) {
  const file: UsersFile = { users: [...currentUsers()] };
  const index = file.users.findIndex((user) => user.email === normalizeEmail(email));
  if (index < 0) return null;

  const raw = randomBytes(32).toString("hex");
  const current = file.users[index]!;
  file.users[index] = {
    ...current,
    resetTokenHash: sha256(raw),
    resetExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  };
  writeUsersFile(file);
  return { token: raw, user: file.users[index]! };
}

export function setCustomerPasswordWithResetToken(token: string, newPassword: string) {
  const file: UsersFile = { users: [...currentUsers()] };
  const tokenHash = sha256(token);
  const index = file.users.findIndex((user) => user.resetTokenHash === tokenHash);
  if (index < 0) return { ok: false as const, reason: "invalid" as const };

  const user = file.users[index]!;
  if (!user.resetExpiresAt || new Date(user.resetExpiresAt).getTime() < Date.now()) {
    file.users[index] = { ...user, resetTokenHash: undefined, resetExpiresAt: undefined };
    writeUsersFile(file);
    return { ok: false as const, reason: "expired" as const };
  }

  file.users[index] = {
    ...user,
    passwordHash: hashPassword(newPassword),
    updatedAt: new Date().toISOString(),
    resetTokenHash: undefined,
    resetExpiresAt: undefined,
  };
  writeUsersFile(file);
  return { ok: true as const, user: file.users[index]! };
}

export function parseCustomerSessionValue(raw: string | undefined) {
  const verified = verifyCustomerSessionCookie(raw);
  if (!verified) return null;
  const user = findCustomerById(verified.id);
  if (!user || user.email !== verified.email) return null;
  if (!isCustomerEmailVerified(user)) return null;
  return user;
}

