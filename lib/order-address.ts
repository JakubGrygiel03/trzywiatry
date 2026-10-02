import type { StoredOrder } from "@/lib/types";

export function orderHasCompanyInvoice(order: StoredOrder) {
  return Boolean(order.companyName?.trim() || order.nip?.trim());
}

export function orderHasSeparateShipping(order: StoredOrder) {
  return Boolean(order.shippingStreet?.trim());
}

export function orderParcelStreet(order: StoredOrder) {
  return order.shippingStreet?.trim() || order.street;
}

export function orderParcelPostalCode(order: StoredOrder) {
  return order.shippingPostalCode?.trim() || order.postalCode;
}

export function orderParcelCity(order: StoredOrder) {
  return order.shippingCity?.trim() || order.city;
}

export function formatOrderInvoiceLine(order: StoredOrder) {
  return `${order.street}, ${order.postalCode} ${order.city}`;
}

export function formatOrderParcelLine(order: StoredOrder) {
  return `${orderParcelStreet(order)}, ${orderParcelPostalCode(order)} ${orderParcelCity(order)}`;
}
