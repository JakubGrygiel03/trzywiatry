"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdminSession } from "@/lib/admin-guard";
import { withCmsTick } from "@/lib/cms-redirect";
import { ensureAtelierHydrated, flushAtelierSave } from "@/lib/data/atelier-persist";
import { normalizeCustomerEmail, upsertCustomerNote } from "@/lib/customer-notes";

export async function saveCustomerNote(formData: FormData) {
  await assertAdminSession();
  await ensureAtelierHydrated({ force: true });
  const email = normalizeCustomerEmail(String(formData.get("email") ?? ""));
  const note = String(formData.get("note") ?? "");
  if (!email.includes("@")) redirect("/admin/klienci?blad=1");
  upsertCustomerNote(email, note);
  await flushAtelierSave();
  revalidatePath("/admin/klienci");
  revalidatePath(`/admin/klienci/${encodeURIComponent(email)}`);
  redirect(withCmsTick(`/admin/klienci/${encodeURIComponent(email)}?zapisano=1`));
}
