"use client";

import { CtaFields } from "@/components/admin/home/home-field-bits";
import { HeroPhotoPicker } from "@/components/admin/hero-photo-picker";
import { AdminField, AdminInput, AdminTextarea } from "@/components/admin/ui/admin-field";
import type { HomeSection } from "@/lib/cms/home-layout";
import type { HeroPhotoOption } from "@/lib/data/queries";

export function HomeHeroFields({
  section,
  onChange,
  heroPhotos,
}: {
  section: Extract<HomeSection, { type: "hero" }>;
  onChange: (section: Extract<HomeSection, { type: "hero" }>) => void;
  heroPhotos: HeroPhotoOption[];
}) {
  const p = section.payload;
  return (
    <div className="space-y-4">
      <AdminField label="Etykieta (bez warsztatów)" htmlFor={`${section.id}-eyebrow`}>
        <AdminInput
          id={`${section.id}-eyebrow`}
          value={p.eyebrow}
          onChange={(e) => onChange({ ...section, payload: { ...p, eyebrow: e.target.value } })}
        />
      </AdminField>
      <AdminField label="Etykieta (gdy warsztaty włączone)" htmlFor={`${section.id}-eyebrow-w`}>
        <AdminInput
          id={`${section.id}-eyebrow-w`}
          value={p.eyebrowWorkshops}
          onChange={(e) => onChange({ ...section, payload: { ...p, eyebrowWorkshops: e.target.value } })}
        />
      </AdminField>
      <AdminField label="Tytuł" htmlFor={`${section.id}-title`}>
        <AdminInput
          id={`${section.id}-title`}
          value={p.title}
          onChange={(e) => onChange({ ...section, payload: { ...p, title: e.target.value } })}
        />
      </AdminField>
      <AdminField label="Lead" htmlFor={`${section.id}-lead`}>
        <AdminTextarea
          id={`${section.id}-lead`}
          rows={3}
          value={p.lead}
          onChange={(e) => onChange({ ...section, payload: { ...p, lead: e.target.value } })}
        />
      </AdminField>
      <CtaFields
        id={section.id}
        prefix="Sklep"
        label={p.primaryCta.label}
        href={p.primaryCta.href}
        onChange={(primaryCta) => onChange({ ...section, payload: { ...p, primaryCta } })}
      />
      <CtaFields
        id={`${section.id}-w`}
        prefix="Warsztat"
        label={p.workshopCta.label}
        href={p.workshopCta.href}
        onChange={(workshopCta) => onChange({ ...section, payload: { ...p, workshopCta } })}
      />
      <CtaFields
        id={`${section.id}-a`}
        prefix="O nas"
        label={p.aboutCta.label}
        href={p.aboutCta.href}
        onChange={(aboutCta) => onChange({ ...section, payload: { ...p, aboutCta } })}
      />
      <div>
        <p className="mb-2 text-sm font-medium text-czarny/85">Zdjęcia w kadrze</p>
        <HeroPhotoPicker
          options={heroPhotos}
          initialSlots={p.slots}
          hideInput
          onChange={(slots) => onChange({ ...section, payload: { ...p, slots } })}
        />
      </div>
    </div>
  );
}
