import { p24MethodLabel } from "@/lib/p24-methods";
import type { StoredOrder } from "@/lib/types";

/** Stub when P24 was paid but the CMS row was overwritten. Studio fills address from the payment-day mail. */
export function recoveredP24Order(input: {
  orderNumber: string;
  sessionId: string;
  amountInCents: number;
  paymentId?: string;
  p24OrderId?: string;
  customerEmail?: string;
  customerName?: string;
  methodId?: number;
  paidAt?: string;
}): StoredOrder {
  const methodId = input.methodId;
  const paidAt = input.paidAt ?? new Date().toISOString();
  const customerEmail = input.customerEmail?.trim() || "kontakt@trzywiatry.pl";
  const customerName = input.customerName?.trim() || "Do uzupełnienia (P24)";
  const paymentId = input.paymentId ?? input.p24OrderId ?? "";
  return {
    id: crypto.randomUUID(),
    createdAt: paidAt,
    updatedAt: new Date().toISOString(),
    orderNumber: input.orderNumber,
    status: "paid",
    statusHistory: [
      { status: "pending", at: paidAt },
      { status: "paid", at: paidAt },
    ],
    customerEmail,
    customerName,
    customerPhone: "",
    street: "",
    postalCode: "",
    city: "",
    shippingMethod: "odbior",
    notes:
      "Odzyskane z Przelewy24: rekord zniknął przy zapisie serwera. Uzupełnij adres i pozycje z maila „Nowe zamówienie” z dnia płatności.",
    items: [],
    hasGiftWrapping: false,
    goodsInCents: input.amountInCents,
    shippingCostInCents: 0,
    giftWrappingCostCents: 0,
    discountAmountCents: 0,
    totalAmountInCents: input.amountInCents,
    paymentProvider: "p24",
    paymentId,
    p24SessionId: input.sessionId,
    paymentMethodId: methodId,
    paymentMethodLabel: p24MethodLabel(methodId),
    paidAt,
    payload: {
      orderNumber: input.orderNumber,
      customerName,
      customerEmail,
      total: input.amountInCents,
      status: "paid",
      paymentProvider: "p24",
      recoveredFromP24: 1,
    },
  };
}
