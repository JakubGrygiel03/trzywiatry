"use client";

import { AdminField, AdminInput, AdminTextarea } from "@/components/admin/ui/admin-field";
import { AdminFormSection } from "@/components/admin/ui/admin-form-section";
import { SeoFields } from "@/components/admin/content-pages/b2b-overlay-fields";
import type { InfoPageOverlay } from "@/lib/cms/content-pages";

export function InfoOverlayFields({
  value,
  onChange,
  bodyRows = 4,
}: {
  value: InfoPageOverlay;
  onChange: (next: InfoPageOverlay) => void;
  bodyRows?: number;
}) {
  function patch(partial: Partial<InfoPageOverlay>) {
    onChange({ ...value, ...partial });
  }

  function patchItem(index: number, partial: Partial<InfoPageOverlay["items"][number]>) {
    onChange({
      ...value,
      items: value.items.map((item, i) => (i === index ? { ...item, ...partial } : item)),
    });
  }

  return (
    <div className="space-y-5">
      <AdminFormSection title="Nagłówek strony">
        <AdminField label="Etykieta" htmlFor="info-eyebrow" required>
          <AdminInput id="info-eyebrow" value={value.eyebrow} onChange={(e) => patch({ eyebrow: e.target.value })} />
        </AdminField>
        <AdminField label="Tytuł" htmlFor="info-title" required>
          <AdminInput id="info-title" value={value.title} onChange={(e) => patch({ title: e.target.value })} />
        </AdminField>
        <AdminField label="Wstęp" htmlFor="info-desc" required>
          <AdminTextarea id="info-desc" rows={3} value={value.description} onChange={(e) => patch({ description: e.target.value })} />
        </AdminField>
      </AdminFormSection>
      <AdminFormSection title="Sekcje" description="Pytania FAQ albo akapity poradnika.">
        {value.items.map((item, index) => (
          <div key={index} className="space-y-3 rounded-lg border border-czarny/8 p-4">
            <AdminField label="Nagłówek" htmlFor={`info-item-title-${index}`}>
              <AdminInput
                id={`info-item-title-${index}`}
                value={item.title}
                onChange={(e) => patchItem(index, { title: e.target.value })}
              />
            </AdminField>
            <AdminField label="Treść" htmlFor={`info-item-body-${index}`}>
              <AdminTextarea
                id={`info-item-body-${index}`}
                rows={bodyRows}
                value={item.body}
                onChange={(e) => patchItem(index, { body: e.target.value })}
              />
            </AdminField>
            <button
              type="button"
              className="text-xs text-czarny/50 hover:text-czerwony"
              onClick={() => patch({ items: value.items.filter((_, i) => i !== index) })}
            >
              Usuń sekcję
            </button>
          </div>
        ))}
        <button
          type="button"
          className="rounded-lg border border-czarny/12 px-3 py-2 text-xs"
          onClick={() => patch({ items: [...value.items, { title: "", body: "" }] })}
        >
          Dodaj sekcję
        </button>
      </AdminFormSection>
      <SeoFields value={value} onChange={patch} />
    </div>
  );
}
