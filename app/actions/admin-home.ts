"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { persistHomeLayout } from "@/lib/data/home-layout";
import { atelierDiskPersistsAcrossDeploys } from "@/lib/data/atelier-persist";
import { getRuntimeSettings } from "@/lib/data/runtime-store";
import { explainHomeLayoutIssues, homeLayoutSchema } from "@/lib/validations/home-layout";
import { assertAdminSession } from "@/lib/admin-guard";

export async function saveHomeLayout(formData: FormData) {
  await assertAdminSession();
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(String(formData.get("sections") ?? "[]"));
  } catch {
    redirect("/admin/strona-glowna?blad=Nie+uda%C5%82o+si%C4%99+odczyta%C4%87+uk%C5%82adu.+Od%C5%9Bwie%C5%BC+stron%C4%99.");
  }

  const issue = explainHomeLayoutIssues(parsedJson, getRuntimeSettings().promoCode);
  const parsed = homeLayoutSchema.safeParse(parsedJson);
  if (issue || !parsed.success) {
    redirect(`/admin/strona-glowna?blad=${encodeURIComponent(issue ?? "Sprawdź tytuły i linki w sekcjach.")}`);
  }

  const { stored } = await persistHomeLayout(parsed.data);
  if (!stored && !atelierDiskPersistsAcrossDeploys()) {
    redirect(
      `/admin/strona-glowna?blad=${encodeURIComponent("Nie zapisano w bazie. Sprawdź SUPABASE_SERVICE_ROLE_KEY oraz tabele page_layouts i atelier_state.")}`,
    );
  }
  revalidatePath("/");
  revalidatePath("/kolekcje", "layout");
  revalidatePath("/admin/strona-glowna");
  revalidatePath("/admin/ustawienia-sklepu");
  redirect("/admin/strona-glowna?zapisano=1");
}
