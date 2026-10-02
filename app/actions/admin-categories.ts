"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertAdminSession } from "@/lib/admin-guard";
import { withCmsTick } from "@/lib/cms-redirect";
import { ensureAtelierHydrated, flushAtelierSave } from "@/lib/data/atelier-persist";
import { getAllProducts, getProductCategories } from "@/lib/data/queries";
import { setRuntimeProductCategories } from "@/lib/data/runtime-store";
import { uniqueCategoryId } from "@/lib/product-categories";
import type { ProductDomain } from "@/lib/types";

const domains = ["ceramika", "drewno", "formy"] as const;

const createSchema = z.object({
  label: z.string().trim().min(2, "Podaj nazwę kategorii (min. 2 znaki).").max(48, "Nazwa: max 48 znaków."),
  domain: z.enum(domains),
});

const renameSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(2, "Podaj nazwę kategorii (min. 2 znaki).").max(48, "Nazwa: max 48 znaków."),
});

function revalidateCategories() {
  revalidatePath("/sklep");
  revalidatePath("/sklep", "layout");
  revalidatePath("/admin/produkty");
  revalidatePath("/admin/produkty/kategorie");
  revalidatePath("/admin/produkty/nowy");
}

function fail(message: string): never {
  redirect(withCmsTick(`/admin/produkty/kategorie?blad=${encodeURIComponent(message)}`));
}

export async function createProductCategory(formData: FormData) {
  await assertAdminSession();
  await ensureAtelierHydrated({ force: true });
  const parsed = createSchema.safeParse({
    label: formData.get("label"),
    domain: formData.get("domain"),
  });
  if (!parsed.success) {
    fail(parsed.error.issues[0]?.message ?? "Nie udało się dodać kategorii.");
  }

  const list = [...getProductCategories()];
  const id = uniqueCategoryId(list, parsed.data.label);
  list.push({ id, label: parsed.data.label, domain: parsed.data.domain as ProductDomain });
  setRuntimeProductCategories(list);
  await flushAtelierSave();
  revalidateCategories();
  redirect(withCmsTick("/admin/produkty/kategorie?zapisano=1"));
}

export async function renameProductCategory(formData: FormData) {
  await assertAdminSession();
  await ensureAtelierHydrated({ force: true });
  const parsed = renameSchema.safeParse({
    id: formData.get("id"),
    label: formData.get("label"),
  });
  if (!parsed.success) {
    fail(parsed.error.issues[0]?.message ?? "Nie udało się zapisać nazwy.");
  }

  const list = getProductCategories();
  const index = list.findIndex((row) => row.id === parsed.data.id);
  if (index < 0) fail("Nie znaleziono tej kategorii.");

  const next = list.map((row, i) => (i === index ? { ...row, label: parsed.data.label } : row));
  setRuntimeProductCategories(next);
  await flushAtelierSave();
  revalidateCategories();
  redirect(withCmsTick("/admin/produkty/kategorie?zapisano=1"));
}

export async function deleteProductCategory(formData: FormData) {
  await assertAdminSession();
  await ensureAtelierHydrated({ force: true });
  const id = String(formData.get("id") ?? "").trim();
  if (!id) fail("Nie znaleziono tej kategorii.");

  const used = getAllProducts().some((product) => product.category === id);
  if (used) {
    fail("Najpierw przenieś albo usuń produkty z tej kategorii — nie można skasować zajętej.");
  }

  const next = getProductCategories().filter((row) => row.id !== id);
  if (next.length === getProductCategories().length) fail("Nie znaleziono tej kategorii.");

  setRuntimeProductCategories(next);
  await flushAtelierSave();
  revalidateCategories();
  redirect(withCmsTick("/admin/produkty/kategorie?usunieto=1"));
}
