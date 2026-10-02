import { sendOrderCustomerMessage } from "@/app/actions/admin-orders";
import { AdminField, AdminInput, AdminTextarea } from "@/components/admin/ui/admin-field";

export function AdminOrderMessageForm({ orderId }: { orderId: string }) {
  return (
    <form action={sendOrderCustomerMessage} className="space-y-3 rounded-xl border border-czarny/8 bg-bialy p-5">
      <input type="hidden" name="id" value={orderId} />
      <h2 className="text-base font-semibold text-czarny">Wiadomość do klienta</h2>
      <p className="text-xs text-czarny/45">Pójdzie na e-mail z zamówienia. Odpowiedź wraca na skrzynkę pracowni.</p>
      <AdminField label="Temat" htmlFor="subject" required>
        <AdminInput id="subject" name="subject" required defaultValue="Wiadomość z pracowni Trzy Wiatry" />
      </AdminField>
      <AdminField label="Treść" htmlFor="body" required>
        <AdminTextarea id="body" name="body" rows={5} required />
      </AdminField>
      <button type="submit" className="h-11 rounded-lg bg-czarny px-4 text-xs font-medium text-bialy hover:bg-czerwony">
        Wyślij
      </button>
    </form>
  );
}
