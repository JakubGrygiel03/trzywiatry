"use server";

import { revalidatePath } from "next/cache";
import { checkoutSchema } from "@/lib/validations/checkout";
import { SHIPPING_METHODS, SITE } from "@/lib/constants";
import {
  addRuntimeOrder,
  applyVariantStockDelta,
  getRuntimeSettings,
  nextOrderNumber,
  setOrderP24SessionInStore,
} from "@/lib/data/runtime-store";
import { ensureOrdersHydrated, flushOrdersSave } from "@/lib/data/order-persist";
import { ensureAtelierHydrated, flushAtelierSave } from "@/lib/data/atelier-persist";
import { getAllProducts } from "@/lib/data/queries";
import { getCustomerSession } from "@/lib/customer-session";
import { orderPlacedEmail, sendEmail } from "@/lib/resend";
import { notifyStudioNewOrder } from "@/lib/studio-notify";
import { buildP24Session, registerP24Transaction } from "@/lib/p24";
import { resolvePaymentAccess } from "@/lib/payment-access";
import { storefrontClosedMessage } from "@/lib/maintenance";
import { getVacationCheckoutNote } from "@/lib/vacation-message";
import { getPublicSiteUrl } from "@/lib/site-url";
import { reserveCouponForOrder, resolveCheckoutDiscount } from "@/lib/newsletter-coupons";
import type { ShippingMethod, StoredOrder, StoredOrderItem } from "@/lib/types";
import { formatPLN } from "@/lib/format";

type CartPayload = { variantId: string; quantity: number };

function formText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

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
    customerName: formText(formData, "customerName"),
    customerEmail: formText(formData, "customerEmail"),
    customerPhone: formText(formData, "customerPhone"),
    street: formText(formData, "street"),
    postalCode: formText(formData, "postalCode"),
    city: formText(formData, "city"),
    shippingMethod: formText(formData, "shippingMethod"),
    inpostLocker: formText(formData, "inpostLocker"),
    giftMessage: formText(formData, "giftMessage"),
    discountCode: formText(formData, "discountCode"),
    notes: formText(formData, "notes"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Uzupełnij dane dostawy." };
  }

  const cartRaw = formData.get("cart");
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
  const closed = await storefrontClosedMessage();
  if (closed) {
    return { ok: false, message: closed };
  }
  const settings = getRuntimeSettings();

  const giftWrap = settings.giftWrapEnabled && formData.get("hasGiftWrapping") === "true";

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
    const variantTitle =
      [variant.color, variant.capacityMl ? `${variant.capacityMl} ml` : null]
        .filter(Boolean)
        .join(" · ") || variant.title;
    items.push({
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      variantTitle,
      quantity: line.quantity,
      unitPriceInCents: unit,
    });
  }

  const shipping = SHIPPING_METHODS.find((method) => method.id === parsed.data.shippingMethod);
  const shippingCost =
    goods >= settings.freeShippingThresholdCents ? 0 : (shipping?.priceInCents ?? 0);
  const giftCost = giftWrap ? settings.giftWrapPriceCents : 0;
  const discountResult = resolveCheckoutDiscount(
    parsed.data.discountCode,
    goods,
    settings.promoCode,
  );
  if (!discountResult.ok) {
    return { ok: false, message: discountResult.message };
  }
  const discount = discountResult.amountCents;
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
    discountCode: discountResult.code,
    paymentProvider: "p24",
    payload: {
      orderNumber,
      customerName: parsed.data.customerName,
      customerEmail: parsed.data.customerEmail,
      total,
      discount,
      giftWrap: giftWrap ? 1 : 0,
      giftMessage: parsed.data.giftMessage ?? "",
      status,
      paymentProvider: "p24",
    },
  };

  if (discountResult.unique && discountResult.code) {
    if (!reserveCouponForOrder(discountResult.code, order.id)) {
      return { ok: false, message: "Ten kod rabatowy jest już używany przy innym zamówieniu." };
    }
  }
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
  const [mailed] = await Promise.all([
    sendEmail({
      to: order.customerEmail,
      subject: placed.subject,
      html: placed.html,
    }),
    notifyStudioNewOrder(order),
  ]);

  const origin = getPublicSiteUrl();
  const confirmQuery = new URLSearchParams({
    order: orderNumber,
    k: order.id,
  });
  if (!mailed.ok) confirmQuery.set("mail", "0");
  const confirmPath = `/zamowienie/potwierdzenie?${confirmQuery}`;
  const p24 = buildP24Session({
    sessionId: orderNumber,
    amountInCents: total,
    email: order.customerEmail,
    description: `Trzy Wiatry ${orderNumber}`,
    // Canonical public URL — avoids www/apex/host mismatch after P24 redirect.
    urlReturn: `${origin}${confirmPath}`,
    urlStatus: `${origin}/api/webhooks/p24`,
  });

  if ((await resolvePaymentAccess()).canPay) {
    const registered = await registerP24Transaction(p24);
    if (registered.ok) {
      setOrderP24SessionInStore(order.id, orderNumber);
      await flushOrdersSave();
      return {
        ok: true,
        orderNumber,
        redirectTo: registered.redirectUrl,
        message: `Zamówienie ${orderNumber} zapisane. Przekierowujemy do płatności…`,
      };
    }
    const payCode =
      registered.reason === "auth-failed"
        ? "auth"
        : registered.reason === "network-failed"
          ? "net"
          : "0";
    confirmQuery.set("pay", payCode);
    return {
      ok: true,
      orderNumber,
      redirectTo: `/zamowienie/potwierdzenie?${confirmQuery}`,
      message: `Zamówienie ${orderNumber} zapisane, ale płatność P24 nie wystartowała. Spróbuj jeszcze raz albo napisz na ${SITE.email}.`,
    };
  }

  console.warn("[p24] checkout skipped — payments disabled or missing credentials");

  return {
    ok: true,
    orderNumber,
    redirectTo: confirmPath,
    message: mailed.ok
      ? `Zamówienie ${orderNumber} złożone (${formatPLN(total)}). Status: oczekuje na płatność. Potwierdzenie wysłaliśmy na ${order.customerEmail}.`
      : `Zamówienie ${orderNumber} złożone (${formatPLN(total)}). Status: oczekuje na płatność. E-mail nie wyszedł — napisz na ${SITE.email} jeśli nie dostaniesz potwierdzenia.`,
  };
}
