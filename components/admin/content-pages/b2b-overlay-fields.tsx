"use client";

import { AdminField, AdminInput, AdminTextarea } from "@/components/admin/ui/admin-field";
import { AdminFormSection } from "@/components/admin/ui/admin-form-section";
import type { B2BOverlay } from "@/lib/cms/content-pages";

export function B2BOverlayFields({
  value,
  onChange,
}: {
  value: B2BOverlay;
  onChange: (next: B2BOverlay) => void;
}) {
  function patch(partial: Partial<B2BOverlay>) {
    onChange({ ...value, ...partial });
  }

  return (
    <div className="space-y-5">
      <AdminFormSection title="Nakładka" description="Teksty po lewej stronie formularza.">
        <AdminField label="Etykieta" htmlFor="b2b-eyebrow" required>
          <AdminInput id="b2b-eyebrow" value={value.eyebrow} onChange={(e) => patch({ eyebrow: e.target.value })} />
        </AdminField>
        <AdminField label="Tytuł" htmlFor="b2b-title" required>
          <AdminInput id="b2b-title" value={value.title} onChange={(e) => patch({ title: e.target.value })} />
        </AdminField>
        <AdminField label="Opis" htmlFor="b2b-desc" required>
          <AdminTextarea id="b2b-desc" rows={4} value={value.description} onChange={(e) => patch({ description: e.target.value })} />
        </AdminField>
        <AdminField label="Opis po angielsku" htmlFor="b2b-desc-en" hint="Osobna linijka pod opisem. Zostaw puste, jeśli nie potrzebujesz.">
          <AdminTextarea id="b2b-desc-en" rows={2} value={value.descriptionEn} onChange={(e) => patch({ descriptionEn: e.target.value })} />
        </AdminField>
        <AdminField label="Wstęp przy formularzu" htmlFor="b2b-intro">
          <AdminTextarea id="b2b-intro" rows={2} value={value.formIntro} onChange={(e) => patch({ formIntro: e.target.value })} />
        </AdminField>
        <AdminField label="Podpis kadru" htmlFor="b2b-caption">
          <AdminInput id="b2b-caption" value={value.frameCaption} onChange={(e) => patch({ frameCaption: e.target.value })} />
        </AdminField>
      </AdminFormSection>
      <SeoFields value={value} onChange={patch} />
    </div>
  );
}

export function SeoFields({
  value,
  onChange,
}: {
  value: { metaTitle: string; metaDescription: string };
  onChange: (partial: { metaTitle?: string; metaDescription?: string }) => void;
}) {
  return (
    <AdminFormSection title="SEO" description="Tytuł karty w przeglądarce i opis w Google.">
      <AdminField label="Tytuł SEO" htmlFor="meta-title" required>
        <AdminInput id="meta-title" value={value.metaTitle} onChange={(e) => onChange({ metaTitle: e.target.value })} />
      </AdminField>
      <AdminField label="Opis SEO" htmlFor="meta-desc" required>
        <AdminTextarea id="meta-desc" rows={3} value={value.metaDescription} onChange={(e) => onChange({ metaDescription: e.target.value })} />
      </AdminField>
    </AdminFormSection>
  );
}
