import { Building2 } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/ui/admin-empty-state";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { runtimeStore } from "@/lib/data/runtime-store";

export default function AdminB2BPage() {
  const inquiries = [...runtimeStore.b2b].reverse();

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="Zapytania B2B"
        description="Skrzynka HoReCa — jak formularze kontaktowe w WordPressie, tylko z NIP i wolumenem."
      />

      {inquiries.length === 0 ? (
        <div className="rounded-xl border border-czarny/8 bg-bialy">
          <AdminEmptyState
            icon={Building2}
            title="Brak zapytań w tej sesji"
            description="Formularz /b2b zapisuje zgłoszenia tutaj na czas działania serwera deweloperskiego."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-czarny/8 bg-bialy p-4 shadow-[0_1px_0_rgb(1_1_1/0.04)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-medium text-czarny">{String(item.payload.companyName)}</h2>
                  <p className="mt-0.5 text-xs text-czarny/45">
                    {String(item.payload.contactPerson)} · NIP {String(item.payload.nip)}
                  </p>
                </div>
                <time className="text-[11px] text-czarny/35">
                  {new Date(item.createdAt).toLocaleString("pl-PL")}
                </time>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-czarny/70">{String(item.payload.message)}</p>
              <p className="mt-2 text-xs text-czarny/40">
                {String(item.payload.email)} · {String(item.payload.phone)} · wolumen:{" "}
                {String(item.payload.estimatedQuantity)}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
