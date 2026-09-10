/** Shared admin session cookie — used by login API, Server Actions, and proxy. */

export const ADMIN_COOKIE = "tw-admin";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 14;

export function adminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: ADMIN_COOKIE_MAX_AGE,
    expires: new Date(Date.now() + ADMIN_COOKIE_MAX_AGE * 1000),
  };
}

export function isAdminCookieValue(value: string | undefined) {
  return value === "1";
}
