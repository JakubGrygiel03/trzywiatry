"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertAdminSession } from "@/lib/admin-guard";
import { withCmsTick } from "@/lib/cms-redirect";
import { ensureAtelierHydrated, flushAtelierSave } from "@/lib/data/atelier-persist";
import { ensureOrdersHydrated, flushOrdersSave } from "@/lib/data/order-persist";
import {
  deleteRuntimeOrder,
  getOrderById,
  getRuntimeCatalog,
  updateOrderItemsInStore,
} from "@/lib/data/runtime-store";
import { sendMonthlyStudioReport } from "@/lib/reports/monthly-studio";
import type { StoredOrderItem } from "@/lib/types";

function failItems(orderId: string, message: string): never {
  redirect(withCmsTick(`/admin/zamowienia/${orderId}?blad=${encodeURIComponent(message)}`));
}

function okItems(orderId: string): never {
  redirect(withCmsTick(`/admin/zamowienia/${orderId}?pozycje=1`));
}

async function persistOrderItems(orderId: string, items: StoredOrderItem[]) {
  const result = updateOrderItemsInStore(orderId, items);
  if (!result.ok) failItems(orderId, result.error);
  await flushOrdersSave();
  await flushAtelierSave();
  revalidatePath("/admin/zamowienia");
  revalidatePath(`/admin/zamowienia/${orderId}`);
  revalidatePath("/admin/analityka");
  revalidatePath("/konto");
  revalidatePath(`/konto/zamowienia/${orderId}`);
  revalidatePath("/sklep", "layout");
  okItems(orderId);
}

async function loadOrderForEdit(orderId: string) {
  await ensureOrdersHydrated({ force: true });
  await ensureAtelierHydrated({ force: true });
  const order = getOrderById(orderId);
  if (!order) failItems(orderId, "Nie znaleziono zamówienia.");
  return order;
}

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
  redirect(withCmsTick(`/admin/zamowienia?usunieto=${encodeURIComponent(removed.orderNumber)}`));
}

export async function sendStudioMonthlyReport(formData: FormData) {
  await assertAdminSession();
  const month = String(formData.get("month") ?? "").trim() || undefined;
  const result = await sendMonthlyStudioReport({ month });
  const flag = result.ok ? "1" : "0";
  const params = new URLSearchParams({ raport: flag, okres: result.periodLabel });
  if (!result.ok && result.error) params.set("powod", result.error.slice(0, 220));
  redirect(withCmsTick(`/admin/zamowienia?${params}`));
}

const qtySchema = z.coerce.number().int().min(1, "Ilość min. 1.").max(99, "Ilość max. 99.");

export async function addCatalogOrderItem(formData: FormData) {
  await assertAdminSession();
  const orderId = String(formData.get("orderId") ?? "").trim();
  if (!orderId) redirect("/admin/zamowienia?blad=1");

  const parsed = z
    .object({ variantId: z.string().trim().min(1, "Wybierz produkt."), quantity: qtySchema })
    .safeParse({ variantId: formData.get("variantId"), quantity: formData.get("quantity") });
  if (!parsed.success) failItems(orderId, parsed.error.issues[0]?.message ?? "Podaj produkt i ilość.");

  const order = await loadOrderForEdit(orderId);
  let found: { productId: string; name: string; variantId: string; title: string; price: number } | null = null;
  for (const product of getRuntimeCatalog()) {
    const variant = product.variants.find((row) => row.id === parsed.data.variantId);
    if (!variant) continue;
    found = {
      productId: product.id,
      name: product.name,
      variantId: variant.id,
      title: variant.title,
      price: variant.priceInCents ?? product.priceInCents,
    };
    break;
  }
  if (!found) failItems(orderId, "Nie znaleziono produktu w katalogu.");

  const items = [...order.items];
  const existing = items.findIndex(
    (item) => item.variantId === found.variantId && !item.productId.startsWith("custom:"),
  );
  if (existing >= 0) {
    const current = items[existing]!;
    items[existing] = { ...current, quantity: current.quantity + parsed.data.quantity };
  } else {
    items.push({
      productId: found.productId,
      variantId: found.variantId,
      productName: found.name,
      variantTitle: found.title,
      quantity: parsed.data.quantity,
      unitPriceInCents: found.price,
    });
  }
  await persistOrderItems(orderId, items);
}

export async function addCustomOrderItem(formData: FormData) {
  await assertAdminSession();
  const orderId = String(formData.get("orderId") ?? "").trim();
  if (!orderId) redirect("/admin/zamowienia?blad=1");

  const parsed = z
    .object({
      name: z.string().trim().min(2, "Podaj nazwę pozycji.").max(80),
      variantTitle: z.string().trim().max(80).optional(),
      priceZl: z.coerce.number().min(0, "Cena nie może być ujemna.").max(20000),
      quantity: qtySchema,
    })
    .safeParse({
      name: formData.get("name"),
      variantTitle: String(formData.get("variantTitle") ?? "").trim() || undefined,
      priceZl: formData.get("priceZl"),
      quantity: formData.get("quantity"),
    });
  if (!parsed.success) failItems(orderId, parsed.error.issues[0]?.message ?? "Uzupełnij pozycję indywidualną.");

  const order = await loadOrderForEdit(orderId);
  const customId = `custom:${crypto.randomUUID()}`;
  await persistOrderItems(orderId, [
    ...order.items,
    {
      productId: customId,
      variantId: customId,
      productName: parsed.data.name,
      variantTitle: parsed.data.variantTitle ?? "Indywidualne",
      quantity: parsed.data.quantity,
      unitPriceInCents: Math.round(parsed.data.priceZl * 100),
    },
  ]);
}

export async function updateOrderItemQuantity(formData: FormData) {
  await assertAdminSession();
  const orderId = String(formData.get("orderId") ?? "").trim();
  if (!orderId) redirect("/admin/zamowienia?blad=1");
  const index = z.coerce.number().int().min(0).safeParse(formData.get("index"));
  const quantity = qtySchema.safeParse(formData.get("quantity"));
  if (!index.success || !quantity.success) failItems(orderId, "Nieprawidłowa ilość.");

  const order = await loadOrderForEdit(orderId);
  if (index.data >= order.items.length) failItems(orderId, "Nie znaleziono tej pozycji.");
  const items = order.items.map((item, i) => (i === index.data ? { ...item, quantity: quantity.data } : item));
  await persistOrderItems(orderId, items);
}

export async function removeOrderItem(formData: FormData) {
  await assertAdminSession();
  const orderId = String(formData.get("orderId") ?? "").trim();
  if (!orderId) redirect("/admin/zamowienia?blad=1");
  const index = z.coerce.number().int().min(0).safeParse(formData.get("index"));
  if (!index.success) failItems(orderId, "Nie znaleziono tej pozycji.");

  const order = await loadOrderForEdit(orderId);
  if (index.data >= order.items.length) failItems(orderId, "Nie znaleziono tej pozycji.");
  await persistOrderItems(
    orderId,
    order.items.filter((_, i) => i !== index.data),
  );
}
