"use server";

import { revalidatePath } from "next/cache";
import { checkoutSchema } from "@/lib/validations/checkout";
import { SHIPPING_METHODS, SITE } from "@/lib/constants";
import {
  addRuntimeOrder,
  applyVariantStockDelta,
  getRuntimeSettings,
  nextOrderNumber,
} from "@/lib/data/runtime-store";
import { ensureOrdersHydrated, flushOrdersSave } from "@/lib/data/order-persist";
import { ensureAtelierHydrated, flushAtelierSave } from "@/lib/data/atelier-persist";
import { getAllProducts } from "@/lib/data/queries";
import { getCustomerSession } from "@/lib/customer-session";
import { orderPlacedEmail, sendEmail } from "@/lib/resend";
import { buildP24Session, hasP24Credentials, registerP24Transaction } from "@/lib/p24";
import { getVacationCheckoutNote } from "@/lib/vacation-message";
import type { ShippingMethod, StoredOrder, StoredOrderItem } from "@/lib/types";
import { formatPLN } from "@/lib/format";

type CartPayload = { variantId: string; quantity: number };

export type CheckoutState = {
  ok: boolean;
  message: string;
  orderNumber?: string;
  redirectTo?: string;
};

/**
 * Creates a pending order, reserves stock, then starts P24 when keys exist.
 * Never marks the order as paid without a verified payment.
 */
export async function createCheckoutSession(
  _: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
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

  await ensureAtelierHydrated();

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
  const promo = (settings.promoCode ?? "").trim().toUpperCase();
  const discount =
    promo && parsed.data.discountCode?.trim().toUpperCase() === promo
      ? Math.round(goods * 0.15)
      : 0;
  const total = goods + shippingCost + giftCost - discount;
  await ensureOrdersHydrated();
  const orderNumber = nextOrderNumber();
  const now = new Date().toISOString();
  const customer = await getCustomerSession();
  const status = "pending" as const;

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
  applyVariantStockDelta(
    cartLines.map((line) => ({ variantId: line.variantId, quantity: line.quantity })),
    -1,
  );
  await flushOrdersSave();
  await flushAtelierSave();
  revalidatePath("/konto");
  revalidatePath("/admin/zamowienia");
  revalidatePath("/sklep");

  const vacationNote = getVacationCheckoutNote(settings) ?? undefined;
  const placed = orderPlacedEmail(order, vacationNote);
  const mailed = await sendEmail({
    to: order.customerEmail,
    subject: placed.subject,
    html: placed.html,
  });

  const confirmPath = `/zamowienie/potwierdzenie?order=${encodeURIComponent(orderNumber)}&k=${encodeURIComponent(order.id)}${mailed.ok ? "" : "&mail=0"}`;
  const p24 = buildP24Session({
    sessionId: orderNumber,
    amountInCents: total,
    email: order.customerEmail,
    description: `Trzy Wiatry ${orderNumber}`,
    urlReturn: `${SITE.url}${confirmPath}`,
    urlStatus: `${SITE.url}/api/webhooks/p24`,
  });

  if (hasP24Credentials()) {
    const registered = await registerP24Transaction(p24);
    if (registered.ok) {
      return {
        ok: true,
        orderNumber,
        redirectTo: registered.redirectUrl,
        message: `Zamówienie ${orderNumber} zapisane. Przekierowujemy do płatności…`,
      };
    }
  }

  return {
    ok: true,
    orderNumber,
    redirectTo: confirmPath,
    message: mailed.ok
      ? `Zamówienie ${orderNumber} złożone (${formatPLN(total)}). Status: oczekuje na płatność. Potwierdzenie wysłaliśmy na ${order.customerEmail}.`
      : `Zamówienie ${orderNumber} złożone (${formatPLN(total)}). Status: oczekuje na płatność. E-mail nie wyszedł — napisz na ${SITE.email} jeśli nie dostaniesz potwierdzenia.`,
  };
}
