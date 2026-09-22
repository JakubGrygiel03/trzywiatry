import { wrapEmail } from "@/lib/email/render";
import { ensureOrdersHydrated } from "@/lib/data/order-persist";
import { runtimeStore } from "@/lib/data/runtime-store";
import { sendEmail } from "@/lib/resend";
import { studioNotifyInboxes } from "@/lib/studio-notify";
import {
  analysisHtml,
  analysisToCsv,
  lineItemsToCsv,
  monthWindow,
  ordersInWindow,
  ordersToCsv,
} from "@/lib/reports/orders-csv";

export async function sendMonthlyStudioReport(options?: { month?: string }) {
  await ensureOrdersHydrated();
  const window = monthWindow(options?.month);
  const orders = ordersInWindow(runtimeStore.orders, window);
  const stats = analysisHtml(orders, window);
  const inboxes = studioNotifyInboxes();
  const attachments = [
    {
      filename: `trzywiatry-zamowienia-${window.key}.csv`,
      content: ordersToCsv(orders),
      contentType: "text/csv; charset=utf-8",
    },
    {
      filename: `trzywiatry-analiza-${window.key}.csv`,
      content: analysisToCsv(orders, window),
      contentType: "text/csv; charset=utf-8",
    },
    {
      filename: `trzywiatry-pozycje-${window.key}.csv`,
      content: lineItemsToCsv(orders),
      contentType: "text/csv; charset=utf-8",
    },
  ];

  const html = wrapEmail(`
    <h1 style="margin:0 0 8px;font-size:24px;line-height:1.2">Raport miesięczny</h1>
    <p style="margin:0 0 18px;font-size:14px;color:#666">${window.label}</p>
    <p style="margin:0 0 10px;font-size:15px">Zamówienia: <strong>${stats.count}</strong> · opłacone: <strong>${stats.paid}</strong></p>
    <p style="margin:0 0 10px;font-size:15px">Przychód (opłacone): <strong>${stats.revenueLabel}</strong></p>
    <p style="margin:0 0 10px;font-size:15px">Średnia wartość: <strong>${stats.aovLabel}</strong></p>
    <p style="margin:0 0 10px;font-size:15px">Czeka na płatność: ${stats.pending} · anulowane: ${stats.cancelled}</p>
    <p style="margin:18px 0 0;font-size:13px;color:#666">W załącznikach: lista zamówień, analiza i pozycje (CSV, Excel otwiera średnikiem).</p>
  `);

  if (inboxes.length === 0) {
    return { ok: false as const, periodLabel: window.label, error: "Brak skrzynki pracowni." };
  }

  const results = await Promise.all(
    inboxes.map((to) =>
      sendEmail({
        to,
        subject: `Raport ${window.label} · ${stats.paid} opłaconych · ${stats.revenueLabel}`,
        html,
        attachments,
      }),
    ),
  );
  const ok = results.some((item) => item.ok);
  return {
    ok,
    periodLabel: window.label,
    error: ok ? undefined : results[0]?.error ?? "send-failed",
  };
}
