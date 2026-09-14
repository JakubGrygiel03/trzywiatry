import { Building2, Mail } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/ui/admin-empty-state";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { ensureAtelierHydrated } from "@/lib/data/atelier-persist";
import { runtimeStore } from "@/lib/data/runtime-store";

export default async function AdminB2BPage() {
  await ensureAtelierHydrated();
  const inquiries = [...runtimeStore.b2b].reverse();
  const contacts = [...runtimeStore.contacts].reverse();

  return (
    <div className="mx-auto max-w-6xl space-y-12">
      <AdminPageHeader
        title="Zapytania"
        description="Formularz B2B i wiadomości z /kontakt — zostają po restarcie serwera lokalnego."
      />

      <section className="space-y-4">
        <h2 className="font-heading text-sm uppercase tracking-[0.14em] text-czarny/50">B2B / HoReCa</h2>
        {inquiries.length === 0 ? (
          <div className="rounded-xl border border-czarny/8 bg-bialy">
            <AdminEmptyState
              icon={Building2}
              title="Brak zapytań B2B"
              description="Gdy ktoś wyśle formularz na /b2b, zapytanie pojawi się tutaj."
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
                    <h3 className="font-medium text-czarny">{String(item.payload.companyName)}</h3>
                    <p className="mt-0.5 text-xs text-czarny/45">
                      {String(item.payload.contactPerson)} · NIP {String(item.payload.nip || "—")}
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
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-sm uppercase tracking-[0.14em] text-czarny/50">Kontakt</h2>
        {contacts.length === 0 ? (
          <div className="rounded-xl border border-czarny/8 bg-bialy">
            <AdminEmptyState
              icon={Mail}
              title="Brak wiadomości z /kontakt"
              description="Formularz kontaktowy zapisuje tu imię, e-mail i treść."
            />
          </div>
        ) : (
          <div className="space-y-3">
            {contacts.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-czarny/8 bg-bialy p-4 shadow-[0_1px_0_rgb(1_1_1/0.04)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-czarny">{String(item.payload.name)}</h3>
                    <p className="mt-0.5 text-xs text-czarny/45">
                      {String(item.payload.email)}
                      {item.payload.phone ? ` · ${String(item.payload.phone)}` : ""}
                    </p>
                  </div>
                  <time className="text-[11px] text-czarny/35">
                    {new Date(item.createdAt).toLocaleString("pl-PL")}
                  </time>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-czarny/70">{String(item.payload.message)}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
