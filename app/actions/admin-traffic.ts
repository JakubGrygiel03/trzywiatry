"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdminSession } from "@/lib/admin-guard";
import { resetTrafficSnapshot } from "@/lib/data/traffic-persist";

export async function clearTrafficStats() {
  await assertAdminSession();
  await resetTrafficSnapshot();
  revalidatePath("/admin/ruch");
  redirect("/admin/ruch?wyczyszczono=1");
}
