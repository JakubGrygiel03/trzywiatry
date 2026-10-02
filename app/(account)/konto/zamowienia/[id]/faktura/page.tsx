import { notFound, redirect } from "next/navigation";
import { OrderInvoice } from "@/components/invoice/order-invoice";
import { getCustomerSession } from "@/lib/customer-session";
import { getCustomerOrder } from "@/lib/data/orders";
import { getSettings } from "@/lib/data/queries";
import { studioIdentity } from "@/lib/studio-identity";

export const dynamic = "force-dynamic";

export default async function CustomerInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCustomerSession();
  if (!user) redirect("/konto/logowanie");
  const { id } = await params;
  const order = await getCustomerOrder(id, user);
  if (!order) notFound();
  const settings = getSettings();
  return <OrderInvoice order={order} identity={studioIdentity(settings)} settings={settings} />;
}
