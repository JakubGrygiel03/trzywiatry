import { notFound } from "next/navigation";
import { connection } from "next/server";
import { OrderInvoice } from "@/components/invoice/order-invoice";
import { ensureAtelierHydrated } from "@/lib/data/atelier-persist";
import { ensureOrdersHydrated } from "@/lib/data/order-persist";
import { getSettings } from "@/lib/data/queries";
import { getOrderById, getOrderByNumber } from "@/lib/data/runtime-store";
import { studioIdentity } from "@/lib/studio-identity";

export const dynamic = "force-dynamic";

export default async function AdminInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  await ensureOrdersHydrated({ force: true });
  await ensureAtelierHydrated({ force: true });
  const { id } = await params;
  const order = getOrderById(id) ?? getOrderByNumber(id);
  if (!order) notFound();
  const settings = getSettings();
  return <OrderInvoice order={order} identity={studioIdentity(settings)} settings={settings} />;
}
