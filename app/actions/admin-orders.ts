"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertAdminSession } from "@/lib/admin-guard";
import { withCmsTick } from "@/lib/cms-redirect";
import { ensureAtelierHydrated, flushAtelierSave } from "@/lib/data/atelier-persist";
import { ensureOrdersHydrated, flushOrdersSave } from "@/lib/data/order-persist";
import {
  addRuntimeOrder,
  applyVariantStockDelta,
  deleteRuntimeOrder,
  getOrderById,
  getRuntimeCatalog,
  nextOrderNumber,
  updateOrderItemsInStore,
} from "@/lib/data/runtime-store";
import { sendMonthlyStudioReport } from "@/lib/reports/monthly-studio";
import { wrapEmail } from "@/lib/email/render";
import { sendEmail } from "@/lib/resend";
import { enabledShippingMethods, isEnabledShippingMethod } from "@/lib/shipping";
import { studioIdentity } from "@/lib/studio-identity";
import { getSettings } from "@/lib/data/queries";
import type { ShippingMethod, StoredOrder, StoredOrderItem } from "@/lib/types";
import { escapeHtml, firstZodMessage, emailSchema, plainText } from "@/lib/validations/safe-input";

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

const postalCode = z.string().trim().regex(/^\d{2}-\d{3}$/, "Kod pocztowy: 00-000");

export async function createManualOrder(formData: FormData) {
  await assertAdminSession();
  await ensureOrdersHydrated({ force: true });
  await ensureAtelierHydrated({ force: true });
  const parsed = z
    .object({
      customerName: plainText("Imię i nazwisko", 80, 2),
      customerEmail: emailSchema,
      customerPhone: z.string().trim().min(8, "Podaj telefon.").max(20),
      street: plainText("Ulica", 120, 3),
      postalCode,
      city: plainText("Miasto", 60, 2),
      shippingMethod: z.enum(["inpost", "kurier", "odbior"]),
      variantId: z.string().min(1, "Wybierz produkt."),
      quantity: qtySchema,
      notes: plainText("Uwagi", 500).optional(),
      markPaid: z.boolean(),
    })
    .safeParse({
      customerName: formData.get("customerName"),
      customerEmail: formData.get("customerEmail"),
      customerPhone: formData.get("customerPhone"),
      street: formData.get("street"),
      postalCode: formData.get("postalCode"),
      city: formData.get("city"),
      shippingMethod: formData.get("shippingMethod"),
      variantId: formData.get("variantId"),
      quantity: formData.get("quantity"),
      notes: formData.get("notes"),
      markPaid: formData.getAll("markPaid").includes("true"),
    });
  if (!parsed.success) {
    redirect(`/admin/zamowienia/nowe?blad=${encodeURIComponent(firstZodMessage(parsed.error))}`);
  }
  const data = parsed.data;
  const settings = getSettings();
  if (!isEnabledShippingMethod(data.shippingMethod, settings)) {
    redirect(`/admin/zamowienia/nowe?blad=${encodeURIComponent("Ta metoda dostawy jest wyłączona.")}`);
  }
  const catalog = getRuntimeCatalog();
  const product = catalog.find((item) => item.variants.some((variant) => variant.id === data.variantId));
  const variant = product?.variants.find((item) => item.id === data.variantId);
  if (!product || !variant) {
    redirect(`/admin/zamowienia/nowe?blad=${encodeURIComponent("Nie znaleziono wariantu.")}`);
  }
  const unit = variant.priceInCents ?? product.priceInCents;
  const goods = unit * data.quantity;
  const shipping = enabledShippingMethods(settings).find((row) => row.id === data.shippingMethod);
  const shippingCost =
    data.shippingMethod === "odbior" || goods >= settings.freeShippingThresholdCents ? 0 : (shipping?.priceInCents ?? 0);
  const now = new Date().toISOString();
  const status = data.markPaid ? "paid" : "pending";
  const items: StoredOrderItem[] = [
    {
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      variantTitle: variant.title,
      quantity: data.quantity,
      unitPriceInCents: unit,
    },
  ];
  const order: StoredOrder = {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    orderNumber: nextOrderNumber(),
    status,
    statusHistory: [{ status, at: now }],
    customerEmail: data.customerEmail,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    street: data.street,
    postalCode: data.postalCode,
    city: data.city,
    shippingMethod: data.shippingMethod as ShippingMethod,
    notes: data.notes,
    items,
    hasGiftWrapping: false,
    goodsInCents: goods,
    shippingCostInCents: shippingCost,
    giftWrappingCostCents: 0,
    discountAmountCents: 0,
    totalAmountInCents: goods + shippingCost,
    paymentProvider: "manual",
    paidAt: data.markPaid ? now : undefined,
    payload: {
      orderNumber: "",
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      total: goods + shippingCost,
      status,
      paymentProvider: "manual",
    },
  };
  order.payload.orderNumber = order.orderNumber;
  addRuntimeOrder(order);
  applyVariantStockDelta([{ variantId: variant.id, quantity: data.quantity }], -1);
  await flushOrdersSave();
  await flushAtelierSave();
  revalidatePath("/admin/zamowienia");
  revalidatePath("/admin/analityka");
  revalidatePath("/sklep", "layout");
  redirect(withCmsTick(`/admin/zamowienia/${order.id}?zapisano=1`));
}

export async function sendOrderCustomerMessage(formData: FormData) {
  await assertAdminSession();
  await ensureOrdersHydrated({ force: true });
  const id = String(formData.get("id") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim().slice(0, 120);
  const body = String(formData.get("body") ?? "").trim().slice(0, 4000);
  const order = getOrderById(id);
  if (!order) redirect("/admin/zamowienia?blad=1");
  if (subject.length < 3 || body.length < 4) {
    redirect(`/admin/zamowienia/${id}?blad=${encodeURIComponent("Wpisz temat i treść wiadomości.")}`);
  }
  const html = wrapEmail(
    `<p>Cześć ${escapeHtml(order.customerName)},</p><p>${escapeHtml(body).replace(/\n/g, "<br/>")}</p><p>Zamówienie ${escapeHtml(order.orderNumber)}.</p>`,
  );
  const mailed = await sendEmail({
    to: order.customerEmail,
    subject,
    html,
    replyTo: studioIdentity(getSettings()).email,
  });
  const params = new URLSearchParams({ wiadomosc: mailed.ok ? "1" : "0" });
  if (!mailed.ok) params.set("powod", (mailed.error ?? "e-mail nie wyszedł").slice(0, 220));
  redirect(withCmsTick(`/admin/zamowienia/${id}?${params}`));
}
