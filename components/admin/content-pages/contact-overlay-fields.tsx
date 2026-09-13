"use client";

import { SeoFields } from "@/components/admin/content-pages/b2b-overlay-fields";
import { AdminField, AdminInput, AdminTextarea } from "@/components/admin/ui/admin-field";
import { AdminFormSection } from "@/components/admin/ui/admin-form-section";
import type { ContactOverlay } from "@/lib/cms/content-pages";

export function ContactOverlayFields({
  value,
  onChange,
}: {
  value: ContactOverlay;
  onChange: (next: ContactOverlay) => void;
}) {
  function patch(partial: Partial<ContactOverlay>) {
    onChange({ ...value, ...partial });
  }

  return (
    <div className="space-y-5">
      <AdminFormSection title="Nakładka" description="Nagłówek strony i tytuły dwóch kolumn.">
        <AdminField label="Tytuł" htmlFor="contact-title" required>
          <AdminInput id="contact-title" value={value.title} onChange={(e) => patch({ title: e.target.value })} />
        </AdminField>
        <AdminField label="Podtytuł" htmlFor="contact-sub" required>
          <AdminTextarea id="contact-sub" rows={2} value={value.subtitle} onChange={(e) => patch({ subtitle: e.target.value })} />
        </AdminField>
        <AdminField label="Podtytuł po angielsku" htmlFor="contact-sub-en">
          <AdminTextarea id="contact-sub-en" rows={2} value={value.subtitleEn} onChange={(e) => patch({ subtitleEn: e.target.value })} />
        </AdminField>
        <AdminField label="Nagłówek formularza" htmlFor="contact-form-h" required>
          <AdminInput id="contact-form-h" value={value.formHeading} onChange={(e) => patch({ formHeading: e.target.value })} />
        </AdminField>
        <AdminField label="Nagłówek kontaktu bezpośredniego" htmlFor="contact-direct-h" required>
          <AdminInput id="contact-direct-h" value={value.directHeading} onChange={(e) => patch({ directHeading: e.target.value })} />
        </AdminField>
        <AdminField label="Wstęp przy formularzu" htmlFor="contact-intro">
          <AdminTextarea id="contact-intro" rows={2} value={value.formIntro} onChange={(e) => patch({ formIntro: e.target.value })} />
        </AdminField>
      </AdminFormSection>
      <SeoFields value={value} onChange={patch} />
    </div>
  );
}
