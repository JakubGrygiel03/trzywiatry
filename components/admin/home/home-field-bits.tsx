"use client";

import { AdminField, AdminInput, AdminTextarea } from "@/components/admin/ui/admin-field";
import type { PillarCard } from "@/lib/cms/home-layout";

export function CtaFields({
  id,
  prefix,
  label,
  href,
  onChange,
}: {
  id: string;
  prefix: string;
  label: string;
  href: string;
  onChange: (cta: { label: string; href: string }) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <AdminField label={`${prefix} — etykieta`} htmlFor={`${id}-cta-l`}>
        <AdminInput id={`${id}-cta-l`} value={label} onChange={(e) => onChange({ label: e.target.value, href })} />
      </AdminField>
      <AdminField label={`${prefix} — link`} htmlFor={`${id}-cta-h`}>
        <AdminInput id={`${id}-cta-h`} value={href} onChange={(e) => onChange({ label, href: e.target.value })} />
      </AdminField>
    </div>
  );
}

export function PillarEditor({
  title,
  card,
  onChange,
}: {
  title: string;
  card: PillarCard;
  onChange: (card: PillarCard) => void;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-czarny/8 bg-krem/30 p-3">
      <p className="text-xs font-medium text-czarny/55">{title}</p>
      <AdminField label="Tytuł">
        <AdminInput value={card.title} onChange={(e) => onChange({ ...card, title: e.target.value })} />
      </AdminField>
      <AdminField label="Opis">
        <AdminTextarea rows={2} value={card.copy} onChange={(e) => onChange({ ...card, copy: e.target.value })} />
      </AdminField>
      <AdminField label="Link">
        <AdminInput value={card.href} onChange={(e) => onChange({ ...card, href: e.target.value })} />
      </AdminField>
    </div>
  );
}
