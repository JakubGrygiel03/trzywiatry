"use client";

import { CmsImagePicker } from "@/components/admin/cms-image-picker";
import { AdminField, AdminInput, AdminTextarea } from "@/components/admin/ui/admin-field";
import { emptyComparePair, type HomeSection } from "@/lib/cms/home-layout";

export function HomeCompareFields({
  section,
  onChange,
}: {
  section: Extract<HomeSection, { type: "compare" }>;
  onChange: (section: Extract<HomeSection, { type: "compare" }>) => void;
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
      <AdminField label="Opis" htmlFor={`${section.id}-desc`}>
        <AdminTextarea
          id={`${section.id}-desc`}
          rows={3}
          value={p.description}
          onChange={(e) => onChange({ ...section, payload: { ...p, description: e.target.value } })}
        />
      </AdminField>
      {p.pairs.map((pair, index) => (
        <div key={pair.id} className="space-y-3 rounded-xl border border-czarny/8 bg-krem/40 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-heading text-[11px] uppercase tracking-[0.14em] text-czerwony">Para {index + 1}</p>
            {p.pairs.length > 1 ? (
              <button
                type="button"
                className="text-xs text-czerwony underline-offset-2 hover:underline"
                onClick={() =>
                  onChange({ ...section, payload: { ...p, pairs: p.pairs.filter((item) => item.id !== pair.id) } })
                }
              >
                Usuń
              </button>
            ) : null}
          </div>
          <AdminField label="Tytuł pary">
            <AdminInput
              value={pair.title}
              onChange={(e) => {
                const pairs = p.pairs.map((item) => (item.id === pair.id ? { ...item, title: e.target.value } : item));
                onChange({ ...section, payload: { ...p, pairs } });
              }}
            />
          </AdminField>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-medium text-czarny/60">Przed</p>
              <AdminInput
                value={pair.beforeLabel}
                onChange={(e) => {
                  const pairs = p.pairs.map((item) =>
                    item.id === pair.id ? { ...item, beforeLabel: e.target.value } : item,
                  );
                  onChange({ ...section, payload: { ...p, pairs } });
                }}
              />
              <CmsImagePicker
                value={pair.before}
                onChange={(url) => {
                  const pairs = p.pairs.map((item) => (item.id === pair.id ? { ...item, before: url } : item));
                  onChange({ ...section, payload: { ...p, pairs } });
                }}
                aspectClass="aspect-square"
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-czarny/60">Po</p>
              <AdminInput
                value={pair.afterLabel}
                onChange={(e) => {
                  const pairs = p.pairs.map((item) =>
                    item.id === pair.id ? { ...item, afterLabel: e.target.value } : item,
                  );
                  onChange({ ...section, payload: { ...p, pairs } });
                }}
              />
              <CmsImagePicker
                value={pair.after}
                onChange={(url) => {
                  const pairs = p.pairs.map((item) => (item.id === pair.id ? { ...item, after: url } : item));
                  onChange({ ...section, payload: { ...p, pairs } });
                }}
                aspectClass="aspect-square"
              />
            </div>
          </div>
        </div>
      ))}
      {p.pairs.length < 4 ? (
        <button
          type="button"
          className="text-xs font-medium text-czerwony underline-offset-2 hover:underline"
          onClick={() => onChange({ ...section, payload: { ...p, pairs: [...p.pairs, emptyComparePair()] } })}
        >
          Dodaj kolejną parę
        </button>
      ) : null}
    </div>
  );
}
