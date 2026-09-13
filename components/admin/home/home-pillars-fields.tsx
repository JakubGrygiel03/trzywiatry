"use client";

import { PillarEditor } from "@/components/admin/home/home-field-bits";
import { AdminField, AdminInput, AdminTextarea } from "@/components/admin/ui/admin-field";
import type { HomeSection } from "@/lib/cms/home-layout";

export function HomePillarsFields({
  section,
  onChange,
}: {
  section: Extract<HomeSection, { type: "pillars" }>;
  onChange: (section: Extract<HomeSection, { type: "pillars" }>) => void;
}) {
  const p = section.payload;
  return (
    <div className="space-y-4">
      <AdminField label="Etykieta" htmlFor={`${section.id}-eyebrow`}>
        <AdminInput
          id={`${section.id}-eyebrow`}
          value={p.eyebrow}
          onChange={(e) => onChange({ ...section, payload: { ...p, eyebrow: e.target.value } })}
        />
      </AdminField>
      <AdminField label="Tytuł" htmlFor={`${section.id}-title`}>
        <AdminInput
          id={`${section.id}-title`}
          value={p.title}
          onChange={(e) => onChange({ ...section, payload: { ...p, title: e.target.value } })}
        />
      </AdminField>
      <AdminField label="Opis (warsztaty włączone)" htmlFor={`${section.id}-desc`}>
        <AdminTextarea
          id={`${section.id}-desc`}
          rows={3}
          value={p.description}
          onChange={(e) => onChange({ ...section, payload: { ...p, description: e.target.value } })}
        />
      </AdminField>
      <AdminField label="Opis (bez warsztatów)" htmlFor={`${section.id}-desc2`}>
        <AdminTextarea
          id={`${section.id}-desc2`}
          rows={3}
          value={p.descriptionNoWorkshops}
          onChange={(e) => onChange({ ...section, payload: { ...p, descriptionNoWorkshops: e.target.value } })}
        />
      </AdminField>
      {p.cards.map((card, index) => (
        <PillarEditor
          key={card.mark}
          title={`Karta ${index + 1}`}
          card={card}
          onChange={(next) => {
            const cards = [...p.cards] as typeof p.cards;
            cards[index] = next;
            onChange({ ...section, payload: { ...p, cards } });
          }}
        />
      ))}
      <PillarEditor
        title="Karta warsztatów"
        card={p.workshopCard}
        onChange={(workshopCard) => onChange({ ...section, payload: { ...p, workshopCard } })}
      />
      <PillarEditor
        title="Karta B2B (gdy warsztaty wyłączone)"
        card={p.b2bCard}
        onChange={(b2bCard) => onChange({ ...section, payload: { ...p, b2bCard } })}
      />
    </div>
  );
}
