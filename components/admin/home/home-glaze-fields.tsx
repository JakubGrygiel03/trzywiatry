"use client";

import { Plus, Trash2 } from "lucide-react";
import { AdminField, AdminInput, AdminSelect, AdminTextarea } from "@/components/admin/ui/admin-field";
import { emptyGlazeLine, type HomeSection } from "@/lib/cms/home-layout";
import { GLAZE, type GlazeKey } from "@/lib/visual";

const SWATCHES = Object.keys(GLAZE) as GlazeKey[];

export function HomeGlazeFields({
  section,
  onChange,
}: {
  section: Extract<HomeSection, { type: "glaze" }>;
  onChange: (section: Extract<HomeSection, { type: "glaze" }>) => void;
}) {
  const p = section.payload;
  const lines = p.lines ?? [];

  function updateLine(index: number, patch: Partial<(typeof lines)[number]>) {
    const next = lines.map((line, i) => (i === index ? { ...line, ...patch } : line));
    onChange({ ...section, payload: { ...p, lines: next } });
  }

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
      <AdminField label="Opis sekcji" htmlFor={`${section.id}-desc`}>
        <AdminTextarea
          id={`${section.id}-desc`}
          rows={3}
          value={p.description}
          onChange={(e) => onChange({ ...section, payload: { ...p, description: e.target.value } })}
        />
      </AdminField>

      <p className="text-sm font-medium text-czarny/85">Linie na stronie głównej</p>
      <p className="text-xs leading-relaxed text-czarny/45">
        Nazwa i opis zapisują się też na /kolekcje/… Link nowej linii możesz dać na /sklep, dopóki nie ma tam naczyń.
      </p>

      {lines.map((line, index) => (
        <div key={line.id} className="space-y-3 rounded-lg border border-czarny/8 bg-krem/30 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-czarny/55">Linia {index + 1}</p>
            <button
              type="button"
              disabled={lines.length <= 1}
              onClick={() =>
                onChange({ ...section, payload: { ...p, lines: lines.filter((_, i) => i !== index) } })
              }
              className="text-czarny/35 hover:text-czerwony disabled:opacity-30"
              aria-label={`Usuń ${line.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <AdminField label="Nazwa">
            <AdminInput value={line.name} onChange={(e) => updateLine(index, { name: e.target.value })} />
          </AdminField>
          <AdminField label="Opis">
            <AdminTextarea rows={2} value={line.description} onChange={(e) => updateLine(index, { description: e.target.value })} />
          </AdminField>
          <div className="grid gap-3 sm:grid-cols-2">
            <AdminField label="Slug / adres kolekcji">
              <AdminInput
                value={line.slug}
                onChange={(e) => {
                  const slug = e.target.value.toLowerCase().replaceAll(" ", "-");
                  updateLine(index, {
                    slug,
                    href: line.href.startsWith("/kolekcje/") ? `/kolekcje/${slug || line.slug}` : line.href,
                  });
                }}
              />
            </AdminField>
            <AdminField label="Próbka koloru">
              <AdminSelect
                value={line.swatch}
                onChange={(e) => updateLine(index, { swatch: e.target.value as GlazeKey })}
              >
                {SWATCHES.map((key) => (
                  <option key={key} value={key}>
                    {GLAZE[key].name}
                  </option>
                ))}
              </AdminSelect>
            </AdminField>
          </div>
          <AdminField label="Link po kliknięciu">
            <AdminInput value={line.href} onChange={(e) => updateLine(index, { href: e.target.value })} />
          </AdminField>
        </div>
      ))}

      {lines.length < 8 ? (
        <button
          type="button"
          onClick={() => onChange({ ...section, payload: { ...p, lines: [...lines, emptyGlazeLine()] } })}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-czerwony hover:underline"
        >
          <Plus className="h-3.5 w-3.5" />
          Dodaj linię szkliwa
        </button>
      ) : null}
    </div>
  );
}
