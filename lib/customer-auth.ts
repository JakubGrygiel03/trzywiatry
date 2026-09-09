import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { SITE } from "@/lib/constants";
import { verifyCustomerSessionCookie } from "@/lib/customer-session-token";

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
  ensureDataDir();
  writeFileSync(USERS_FILE, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function findCustomerByEmail(email: string) {
  const normalized = normalizeEmail(email);
  return readUsersFile().users.find((user) => user.email === normalized) ?? null;
}

export function findCustomerById(id: string) {
  return readUsersFile().users.find((user) => user.id === id) ?? null;
}

export function registerCustomer(input: { email: string; password: string; name: string }) {
  const email = normalizeEmail(input.email);
  const file = readUsersFile();
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
  };
  file.users.push(user);
  writeUsersFile(file);
  return { ok: true as const, user };
}

export function verifyCustomerCredentials(email: string, password: string) {
  const user = findCustomerByEmail(email);
  if (!user) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;
  return user;
}

export function updateCustomerPassword(userId: string, newPassword: string) {
  const file = readUsersFile();
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
  const file = readUsersFile();
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
  const file = readUsersFile();
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

export function getSiteBaseUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? SITE.url).replace(/\/$/, "");
}

export function parseCustomerSessionValue(raw: string | undefined) {
  const verified = verifyCustomerSessionCookie(raw);
  if (!verified) return null;
  const user = findCustomerById(verified.id);
  if (!user || user.email !== verified.email) return null;
  return user;
}

