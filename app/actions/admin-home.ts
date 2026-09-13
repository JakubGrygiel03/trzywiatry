"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { persistHomeLayout } from "@/lib/data/home-layout";
import { getRuntimeSettings } from "@/lib/data/runtime-store";
import { explainHomeLayoutIssues, homeLayoutSchema } from "@/lib/validations/home-layout";

export async function saveHomeLayout(formData: FormData) {
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

  await persistHomeLayout(parsed.data);
  revalidatePath("/");
  revalidatePath("/kolekcje", "layout");
  revalidatePath("/admin/strona-glowna");
  revalidatePath("/admin/ustawienia-sklepu");
  redirect("/admin/strona-glowna?zapisano=1");
}
