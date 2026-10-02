import "server-only";

import { runtimeStore } from "@/lib/data/runtime-store";
import type { CustomerNote, StoredOrder } from "@/lib/types";

function notes() {
  if (!Array.isArray(runtimeStore.customerNotes)) runtimeStore.customerNotes = [];
  return runtimeStore.customerNotes;
}

export function normalizeCustomerEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getCustomerNote(email: string) {
  const key = normalizeCustomerEmail(email);
  return notes().find((row) => row.email === key);
}

export function upsertCustomerNote(email: string, note: string) {
  const key = normalizeCustomerEmail(email);
  const list = notes();
  const index = list.findIndex((row) => row.email === key);
  const row: CustomerNote = { email: key, note: note.trim().slice(0, 2000), updatedAt: new Date().toISOString() };
  if (index >= 0) list[index] = row;
  else list.push(row);
}

export function customersFromOrders(orders: StoredOrder[]) {
  const map = new Map<
    string,
    { email: string; name: string; phone: string; orders: number; spent: number; lastAt: string }
  >();
  for (const order of orders) {
    const email = normalizeCustomerEmail(order.customerEmail);
    if (!email) continue;
    const prev = map.get(email);
    const spent = order.status === "cancelled" ? 0 : order.totalAmountInCents;
    if (!prev) {
      map.set(email, {
        email,
        name: order.customerName,
        phone: order.customerPhone,
        orders: 1,
        spent,
        lastAt: order.createdAt,
      });
      continue;
    }
    prev.orders += 1;
    prev.spent += spent;
    if (order.createdAt > prev.lastAt) {
      prev.lastAt = order.createdAt;
      prev.name = order.customerName;
      prev.phone = order.customerPhone;
    }
  }
  return [...map.values()].sort((a, b) => b.lastAt.localeCompare(a.lastAt));
}
