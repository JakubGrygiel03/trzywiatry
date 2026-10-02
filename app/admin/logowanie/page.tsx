import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, isAdminCookieValue } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

/** CMS uses the same login as customers (`/konto/logowanie`). */
export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ zresetowano?: string; blad?: string }>;
}) {
  const store = await cookies();
  if (isAdminCookieValue(store.get(ADMIN_COOKIE)?.value)) {
    redirect("/admin");
  }

  const query = await searchParams;
  const next = new URLSearchParams();
  if (query.blad) next.set("blad", query.blad);
  if (query.zresetowano) next.set("blad", "zresetowano");
  redirect(`/konto/logowanie${next.toString() ? `?${next}` : ""}`);
}
