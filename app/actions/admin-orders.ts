"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdminSession } from "@/lib/admin-guard";
import { flushAtelierSave } from "@/lib/data/atelier-persist";
import { ensureOrdersHydrated, flushOrdersSave } from "@/lib/data/order-persist";
import { deleteRuntimeOrder } from "@/lib/data/runtime-store";
import { sendMonthlyStudioReport } from "@/lib/reports/monthly-studio";

export async function deleteOrder(formData: FormData) {
  await assertAdminSession();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/zamowienia?blad=1");

  await ensureOrdersHydrated();
  const removed = deleteRuntimeOrder(id);
  if (!removed) redirect("/admin/zamowienia?blad=1");

  await flushOrdersSave();
  await flushAtelierSave();
  revalidatePath("/admin/zamowienia");
  revalidatePath("/admin/analityka");
  revalidatePath("/konto");
  revalidatePath("/sklep", "layout");
  redirect(`/admin/zamowienia?usunieto=${encodeURIComponent(removed.orderNumber)}`);
}

export async function sendStudioMonthlyReport(formData: FormData) {
  await assertAdminSession();
  const month = String(formData.get("month") ?? "").trim() || undefined;
  const result = await sendMonthlyStudioReport({ month });
  const flag = result.ok ? "1" : "0";
  const params = new URLSearchParams({ raport: flag, okres: result.periodLabel });
  if (!result.ok && result.error) params.set("powod", result.error.slice(0, 220));
  redirect(`/admin/zamowienia?${params}`);
}
