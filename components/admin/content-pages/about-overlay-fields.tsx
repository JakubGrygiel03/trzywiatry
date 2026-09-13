"use client";

import { SeoFields } from "@/components/admin/content-pages/b2b-overlay-fields";
import { AdminField, AdminInput, AdminTextarea } from "@/components/admin/ui/admin-field";
import { AdminFormSection } from "@/components/admin/ui/admin-form-section";
import type { AboutOverlay } from "@/lib/cms/content-pages";

export function AboutOverlayFields({
  value,
  onChange,
}: {
  value: AboutOverlay;
  onChange: (next: AboutOverlay) => void;
}) {
  function patch(partial: Partial<AboutOverlay>) {
    onChange({ ...value, ...partial });
  }

  function setParagraph(index: number, text: string) {
    patch({ paragraphs: value.paragraphs.map((item, i) => (i === index ? text : item)) });
  }

  return (
    <div className="space-y-5">
      <AdminFormSection title="Nakładka" description="Tytuł strony, zdjęcie i historia pracowni.">
        <AdminField label="Tytuł strony" htmlFor="about-title" required>
          <AdminInput id="about-title" value={value.title} onChange={(e) => patch({ title: e.target.value })} />
        </AdminField>
        <AdminField label="Nagłówek historii" htmlFor="about-heading" required>
          <AdminInput id="about-heading" value={value.heading} onChange={(e) => patch({ heading: e.target.value })} />
        </AdminField>
        {value.paragraphs.map((paragraph, index) => (
          <AdminField key={index} label={`Akapit ${index + 1}`} htmlFor={`about-p-${index}`} required>
            <AdminTextarea
              id={`about-p-${index}`}
              rows={4}
              value={paragraph}
              onChange={(e) => setParagraph(index, e.target.value)}
            />
          </AdminField>
        ))}
        <div className="flex gap-3">
          {value.paragraphs.length < 6 ? (
            <button
              type="button"
              className="text-sm text-czerwony underline-offset-2 hover:underline"
              onClick={() => patch({ paragraphs: [...value.paragraphs, ""] })}
            >
              Dodaj akapit
            </button>
          ) : null}
          {value.paragraphs.length > 1 ? (
            <button
              type="button"
              className="text-sm text-czarny/50 underline-offset-2 hover:underline"
              onClick={() => patch({ paragraphs: value.paragraphs.slice(0, -1) })}
            >
              Usuń ostatni
            </button>
          ) : null}
        </div>
      </AdminFormSection>
      <AdminFormSection title="Zdjęcie i galeria">
        <AdminField label="Ścieżka zdjęcia" htmlFor="about-src" required hint="Zaczyna się od / — np. /brand/photos/o-nas-rodzina.jpg">
          <AdminInput id="about-src" value={value.imageSrc} onChange={(e) => patch({ imageSrc: e.target.value })} />
        </AdminField>
        <AdminField label="Opis zdjęcia" htmlFor="about-alt" required>
          <AdminInput id="about-alt" value={value.imageAlt} onChange={(e) => patch({ imageAlt: e.target.value })} />
        </AdminField>
        <AdminField label="Tytuł galerii" htmlFor="about-gallery" required>
          <AdminInput id="about-gallery" value={value.galleryTitle} onChange={(e) => patch({ galleryTitle: e.target.value })} />
        </AdminField>
      </AdminFormSection>
      <SeoFields value={value} onChange={patch} />
    </div>
  );
}
