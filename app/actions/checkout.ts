"use server";

import { checkoutSchema } from "@/lib/validations/checkout";
import { SHIPPING_METHODS, SITE } from "@/lib/constants";
import { addRuntimeOrder, nextOrderNumber, getRuntimeSettings } from "@/lib/data/runtime-store";
import { ensureOrdersHydrated, saveOrdersToDisk } from "@/lib/data/order-persist";
import { getAllProducts } from "@/lib/data/queries";
import { getCustomerSession } from "@/lib/customer-session";
import { orderPlacedAndStartedHtml, sendEmail } from "@/lib/resend";
import { buildP24Session } from "@/lib/p24";
import { getVacationCheckoutNote } from "@/lib/vacation-message";
import type { ShippingMethod, StoredOrder, StoredOrderItem } from "@/lib/types";
import { formatPLN } from "@/lib/format";
import { revalidatePath } from "next/cache";

type CartPayload = {
  variantId: string;
  quantity: number;
};

/**
 * Places the order, simulates successful payment in demo mode,
 * sets status to `processing`, and emails confirmation + start of fulfillment.
 */
export async function createCheckoutSession(
  _: { ok: boolean; message: string; orderNumber?: string },
  formData: FormData,
) {
  const parsed = checkoutSchema.safeParse({
    customerName: formData.get("customerName"),
    customerEmail: formData.get("customerEmail"),
    customerPhone: formData.get("customerPhone"),
    street: formData.get("street"),
    postalCode: formData.get("postalCode"),
    city: formData.get("city"),
    shippingMethod: formData.get("shippingMethod"),
    inpostLocker: formData.get("inpostLocker"),
    giftMessage: formData.get("giftMessage"),
    discountCode: formData.get("discountCode"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Uzupełnij dane dostawy." };
  }

  const cartRaw = formData.get("cart");
  const giftWrap = formData.get("hasGiftWrapping") === "true";
  let cartLines: CartPayload[] = [];
  try {
    cartLines = JSON.parse(String(cartRaw ?? "[]")) as CartPayload[];
  } catch {
    return { ok: false, message: "Koszyk jest uszkodzony. Odśwież stronę." };
  }

  if (cartLines.length === 0) {
    return { ok: false, message: "Koszyk jest pusty." };
  }

  const catalog = getAllProducts();
  const items: StoredOrderItem[] = [];
  let goods = 0;
  for (const line of cartLines) {
    const product = catalog.find((item) => item.variants.some((variant) => variant.id === line.variantId));
    const variant = product?.variants.find((item) => item.id === line.variantId);
    if (!product || !variant || !variant.isAvailable || variant.stockQuantity < line.quantity) {
      return { ok: false, message: `Brak stanu: ${product?.name ?? "pozycja"}.` };
    }
    const unit = variant.priceInCents ?? product.priceInCents;
    goods += unit * line.quantity;
    items.push({
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      variantTitle: variant.title,
      quantity: line.quantity,
      unitPriceInCents: unit,
    });
  }

  const settings = getRuntimeSettings();
  const shipping = SHIPPING_METHODS.find((method) => method.id === parsed.data.shippingMethod);
  const shippingCost =
    goods >= settings.freeShippingThresholdCents && parsed.data.shippingMethod !== "odbior"
      ? 0
      : (shipping?.priceInCents ?? 0);
  const giftCost = giftWrap ? settings.giftWrapPriceCents : 0;
  const discount =
    parsed.data.discountCode?.trim().toUpperCase() === settings.promoCode
      ? Math.round(goods * 0.15)
      : 0;
  const total = goods + shippingCost + giftCost - discount;
  ensureOrdersHydrated();
  const orderNumber = nextOrderNumber();
  const now = new Date().toISOString();
  const customer = await getCustomerSession();

  // Demo: no live P24 keys → treat as paid and start fulfillment immediately.
  const status = "processing" as const;

  const order: StoredOrder = {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    orderNumber,
    status,
    userId: customer?.id,
    statusHistory: [{ status, at: now }],
    customerEmail: parsed.data.customerEmail,
    customerName: parsed.data.customerName,
    customerPhone: parsed.data.customerPhone,
    street: parsed.data.street,
    postalCode: parsed.data.postalCode,
    city: parsed.data.city,
    shippingMethod: parsed.data.shippingMethod as ShippingMethod,
    inpostLocker: parsed.data.inpostLocker,
    notes: parsed.data.notes,
    items,
    hasGiftWrapping: giftWrap,
    giftMessage: giftWrap ? parsed.data.giftMessage : undefined,
    goodsInCents: goods,
    shippingCostInCents: shippingCost,
    giftWrappingCostCents: giftCost,
    discountAmountCents: discount,
    totalAmountInCents: total,
    discountCode: parsed.data.discountCode,
    payload: {
      orderNumber,
      customerName: parsed.data.customerName,
      customerEmail: parsed.data.customerEmail,
      total,
      discount,
      giftWrap: giftWrap ? 1 : 0,
      giftMessage: parsed.data.giftMessage ?? "",
      status,
    },
  };

  addRuntimeOrder(order);
  saveOrdersToDisk();
  revalidatePath("/konto");
  revalidatePath("/admin/zamowienia");

  const vacationNote = getVacationCheckoutNote(settings) ?? undefined;
  await sendEmail({
    to: order.customerEmail,
    subject: `Zamówienie ${orderNumber} · przyjęte i w realizacji`,
    html: orderPlacedAndStartedHtml(order, vacationNote),
  });

  const p24 = buildP24Session({
    sessionId: orderNumber,
    amountInCents: total,
    email: order.customerEmail,
    description: `Trzy Wiatry ${orderNumber}`,
    urlReturn: `${SITE.url}/zamowienie/potwierdzenie?order=${orderNumber}`,
    urlStatus: `${SITE.url}/api/webhooks/p24`,
  });

  return {
    ok: true,
    orderNumber,
    message: `Zamówienie ${orderNumber} złożone (${formatPLN(total)}). Potwierdzenie i start realizacji wysłaliśmy na ${order.customerEmail}. Status: w realizacji. Sesja P24: ${p24.sessionId} (demo).`,
  };
}
