import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, isAdminCookieValue } from "@/lib/admin-session";
import { ensureAtelierHydrated } from "@/lib/data/atelier-persist";

/** Server Actions must not trust the URL — cookie is the gate. */
export async function assertAdminSession() {
  await ensureAtelierHydrated();
  const store = await cookies();
  if (!isAdminCookieValue(store.get(ADMIN_COOKIE)?.value)) {
    redirect("/admin/logowanie");
  }
}
