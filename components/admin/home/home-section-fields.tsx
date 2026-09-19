"use client";

import { CtaFields } from "@/components/admin/home/home-field-bits";
import { HomeBannerFields } from "@/components/admin/home/home-banner-fields";
import { HomeGlazeFields } from "@/components/admin/home/home-glaze-fields";
import { HomeHeroFields } from "@/components/admin/home/home-hero-fields";
import { HomePillarsFields } from "@/components/admin/home/home-pillars-fields";
import { AdminField, AdminInput, AdminTextarea } from "@/components/admin/ui/admin-field";
import type { HomeSection } from "@/lib/cms/home-layout";
import type { HeroPhotoOption } from "@/lib/data/queries";

export function HomeSectionFields({
  section,
  onChange,
  heroPhotos,
}: {
  section: HomeSection;
  onChange: (section: HomeSection) => void;
  heroPhotos: HeroPhotoOption[];
}) {
  if (section.type === "banner") return <HomeBannerFields section={section} onChange={onChange} />;
  if (section.type === "hero") {
    return <HomeHeroFields section={section} onChange={onChange} heroPhotos={heroPhotos} />;
  }
  if (section.type === "pillars") return <HomePillarsFields section={section} onChange={onChange} />;
  if (section.type === "featured") return <FeaturedFields section={section} onChange={onChange} />;
  if (section.type === "glaze") return <HomeGlazeFields section={section} onChange={onChange} />;
  if (section.type === "workshop") return <WorkshopFields section={section} onChange={onChange} />;
  return <NewsletterFields section={section} onChange={onChange} />;
}

function FeaturedFields({
  section,
  onChange,
}: {
  section: Extract<HomeSection, { type: "featured" }>;
  onChange: (section: Extract<HomeSection, { type: "featured" }>) => void;
}) {
  const p = section.payload;
  return (
    <div className="space-y-4">
      <AdminField label="Badge" htmlFor={`${section.id}-badge`}>
        <AdminInput id={`${section.id}-badge`} value={p.badge} onChange={(e) => onChange({ ...section, payload: { ...p, badge: e.target.value } })} />
      </AdminField>
      <AdminField label="Tytuł" htmlFor={`${section.id}-title`}>
        <AdminInput id={`${section.id}-title`} value={p.title} onChange={(e) => onChange({ ...section, payload: { ...p, title: e.target.value } })} />
      </AdminField>
      <AdminField label="Opis" htmlFor={`${section.id}-desc`}>
        <AdminTextarea id={`${section.id}-desc`} rows={3} value={p.description} onChange={(e) => onChange({ ...section, payload: { ...p, description: e.target.value } })} />
      </AdminField>
      <CtaFields
        id={section.id}
        prefix="Przycisk"
        label={p.ctaLabel}
        href={p.ctaHref}
        onChange={(cta) => onChange({ ...section, payload: { ...p, ctaLabel: cta.label, ctaHref: cta.href } })}
      />
    </div>
  );
}

function WorkshopFields({
  section,
  onChange,
}: {
  section: Extract<HomeSection, { type: "workshop" }>;
  onChange: (section: Extract<HomeSection, { type: "workshop" }>) => void;
}) {
  const p = section.payload;
  return (
    <div className="space-y-4">
      <AdminField label="Etykieta" htmlFor={`${section.id}-eyebrow`}>
        <AdminInput id={`${section.id}-eyebrow`} value={p.eyebrow} onChange={(e) => onChange({ ...section, payload: { ...p, eyebrow: e.target.value } })} />
      </AdminField>
      <AdminField label="Przycisk" htmlFor={`${section.id}-cta`}>
        <AdminInput id={`${section.id}-cta`} value={p.ctaLabel} onChange={(e) => onChange({ ...section, payload: { ...p, ctaLabel: e.target.value } })} />
      </AdminField>
      <p className="text-xs text-czarny/45">Tytuł, data i zdjęcie biorą się z najbliższego opublikowanego warsztatu.</p>
    </div>
  );
}

function NewsletterFields({
  section,
  onChange,
}: {
  section: Extract<HomeSection, { type: "newsletter" }>;
  onChange: (section: Extract<HomeSection, { type: "newsletter" }>) => void;
}) {
  const p = section.payload;
  return (
    <div className="space-y-4">
      <AdminField label="Etykieta" htmlFor={`${section.id}-eyebrow`}>
        <AdminInput id={`${section.id}-eyebrow`} value={p.eyebrow} onChange={(e) => onChange({ ...section, payload: { ...p, eyebrow: e.target.value } })} />
      </AdminField>
      <AdminField label="Tytuł" htmlFor={`${section.id}-title`}>
        <AdminInput id={`${section.id}-title`} value={p.title} onChange={(e) => onChange({ ...section, payload: { ...p, title: e.target.value } })} />
      </AdminField>
      <AdminField label="Tekst belki" htmlFor={`${section.id}-body`} hint="Bez jawnego kodu — klient dostaje go tylko mailem po zapisie.">
        <AdminTextarea
          id={`${section.id}-body`}
          rows={3}
          value={p.body}
          onChange={(e) => onChange({ ...section, payload: { ...p, body: e.target.value } })}
        />
      </AdminField>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Etykieta formularza" htmlFor={`${section.id}-form`}>
          <AdminInput id={`${section.id}-form`} value={p.formLabel} onChange={(e) => onChange({ ...section, payload: { ...p, formLabel: e.target.value } })} />
        </AdminField>
        <AdminField label="Przycisk" htmlFor={`${section.id}-btn`}>
          <AdminInput id={`${section.id}-btn`} value={p.buttonLabel} onChange={(e) => onChange({ ...section, payload: { ...p, buttonLabel: e.target.value } })} />
        </AdminField>
      </div>
    </div>
  );
}
