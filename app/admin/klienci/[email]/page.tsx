import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { saveCustomerNote } from "@/app/actions/admin-customers";
import { AdminAlert } from "@/components/admin/ui/admin-alert";
import { AdminField, AdminTextarea } from "@/components/admin/ui/admin-field";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { getCustomerNote, normalizeCustomerEmail } from "@/lib/customer-notes";
import { ensureAtelierHydrated } from "@/lib/data/atelier-persist";
import { ensureOrdersHydrated } from "@/lib/data/order-persist";
import { runtimeStore } from "@/lib/data/runtime-store";
import { formatDate, formatPLN } from "@/lib/format";
import { isAbandonedCheckout } from "@/lib/orders/studio-queue";

export const dynamic = "force-dynamic";

export default async function AdminCustomerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ email: string }>;
  searchParams: Promise<{ zapisano?: string }>;
}) {
  await connection();
  await ensureOrdersHydrated({ force: true });
  await ensureAtelierHydrated({ force: true });
  const { email: raw } = await params;
  const email = normalizeCustomerEmail(decodeURIComponent(raw));
  const { zapisano } = await searchParams;
  const orders = runtimeStore.orders.filter(
    (order) => !isAbandonedCheckout(order) && normalizeCustomerEmail(order.customerEmail) === email,
  );
  if (orders.length === 0) notFound();
  const latest = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]!;
  const note = getCustomerNote(email);

  return (
    <div className="mx-auto max-w-3xl">
      <AdminPageHeader
        title={latest.customerName}
        description={`${email} · ${latest.customerPhone}`}
        actions={
          <Link href="/admin/klienci" className="rounded-lg border border-czarny/12 px-3.5 py-2 text-xs">
            ← Lista
          </Link>
        }
      />
      {zapisano ? <AdminAlert variant="success">Zapisano notatkę.</AdminAlert> : null}
      <form action={saveCustomerNote} className="mb-6 rounded-xl border border-czarny/8 bg-bialy p-5">
        <input type="hidden" name="email" value={email} />
        <AdminField label="Notatka wewnętrzna" htmlFor="note" hint="Tylko w CMS — klient tego nie widzi.">
          <AdminTextarea id="note" name="note" rows={5} defaultValue={note?.note ?? ""} />
        </AdminField>
        <button type="submit" className="mt-3 h-11 rounded-lg bg-czarny px-4 text-xs font-medium text-bialy hover:bg-czerwony">
          Zapisz notatkę
        </button>
      </form>
      <ul className="divide-y divide-czarny/6 overflow-hidden rounded-xl border border-czarny/8 bg-bialy">
        {orders.map((order) => (
          <li key={order.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
            <Link href={`/admin/zamowienia/${order.id}`} className="text-czerwony">
              {order.orderNumber}
            </Link>
            <span className="text-czarny/45">{formatDate(order.createdAt)}</span>
            <span>{formatPLN(order.totalAmountInCents)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
