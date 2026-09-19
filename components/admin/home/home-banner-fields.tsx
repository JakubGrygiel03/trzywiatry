"use client";

import { useState } from "react";
import { CtaFields } from "@/components/admin/home/home-field-bits";
import { AdminField, AdminInput, AdminSelect, AdminTextarea } from "@/components/admin/ui/admin-field";
import { defaultBannerPayload, type BannerPayload, type HomeSection } from "@/lib/cms/home-layout";

function NumberField({
  id,
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <AdminField label={label} htmlFor={id} hint={hint}>
      <AdminInput
        id={id}
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
    </AdminField>
  );
}

const PANEL_LABELS = ["Lewy kadr", "Środkowy kadr", "Prawy kadr"] as const;

export function HomeBannerFields({
  section,
  onChange,
}: {
  section: Extract<HomeSection, { type: "banner" }>;
  onChange: (section: Extract<HomeSection, { type: "banner" }>) => void;
}) {
  const p = {
    ...defaultBannerPayload(),
    ...section.payload,
    panels: (section.payload.panels?.length === 3
      ? section.payload.panels
      : defaultBannerPayload().panels) as BannerPayload["panels"],
  };
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState("");

  function patch(partial: Partial<BannerPayload>) {
    onChange({ ...section, payload: { ...p, ...partial } });
  }

  function setPanel(index: 0 | 1 | 2, url: string) {
    const panels: BannerPayload["panels"] = [...p.panels];
    panels[index] = url;
    patch({ panels });
  }

  async function onFile(index: 0 | 1 | 2, file: File | null) {
    if (!file) return;
    setUploadingIndex(index);
    setUploadError("");
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/admin/home-banner-upload", {
        method: "POST",
        body: fd,
        credentials: "same-origin",
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || "Upload nieudany.");
      setPanel(index, data.url);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload nieudany.");
    } finally {
      setUploadingIndex(null);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-czarny/50">
        Trzy zdjęcia w bibliotece (upload). Telefon = 1, tablet i typowy laptop (&lt;1400 px) = 2
        kadry (wybór poniżej), szeroki ekran (≥1400 px) = wszystkie 3.
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        {PANEL_LABELS.map((label, index) => {
          const i = index as 0 | 1 | 2;
          const src = p.panels[i];
          return (
            <div key={label} className="space-y-2 rounded-xl border border-czarny/10 bg-krem/40 p-3">
              <p className="text-xs font-medium text-czarny/80">{label}</p>
              {src ? (
                <div className="overflow-hidden rounded-lg border border-czarny/8 bg-bialy">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="aspect-[3/4] w-full object-cover" />
                </div>
              ) : (
                <div className="flex aspect-[3/4] items-center justify-center rounded-lg bg-bialy text-[11px] text-czarny/40">
                  Brak zdjęcia
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploadingIndex !== null}
                className="block w-full text-[11px] text-czarny/70 file:mr-2 file:rounded-full file:border-0 file:bg-czarny file:px-3 file:py-1.5 file:font-heading file:text-[9px] file:uppercase file:tracking-[0.14em] file:text-bialy"
                onChange={(e) => void onFile(i, e.target.files?.[0] ?? null)}
              />
              {uploadingIndex === i ? <p className="text-[11px] text-czarny/50">Wgrywam…</p> : null}
            </div>
          );
        })}
      </div>
      {uploadError ? <p className="text-xs text-czerwony">{uploadError}</p> : null}

      <AdminField
        label="Zdjęcie na telefonie / wąskim ekranie"
        htmlFor={`${section.id}-mobile`}
        hint="Poniżej ~768 px — jeden kadr."
      >
        <AdminSelect
          id={`${section.id}-mobile`}
          value={String(p.mobilePanel ?? 1)}
          onChange={(e) => patch({ mobilePanel: Number(e.target.value) as 0 | 1 | 2 })}
        >
          <option value="0">Lewy kadr</option>
          <option value="1">Środkowy kadr</option>
          <option value="2">Prawy kadr</option>
        </AdminSelect>
      </AdminField>

      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField
          label="Dwa kadry — lewy (tablet / laptop)"
          htmlFor={`${section.id}-tablet-a`}
          hint="Do ~1399 px szerokości. Od 1400 px widać wszystkie 3."
        >
          <AdminSelect
            id={`${section.id}-tablet-a`}
            value={String(p.tabletPanels?.[0] ?? 0)}
            onChange={(e) =>
              patch({
                tabletPanels: [
                  Number(e.target.value) as 0 | 1 | 2,
                  (p.tabletPanels?.[1] ?? 2) as 0 | 1 | 2,
                ],
              })
            }
          >
            <option value="0">Lewy kadr</option>
            <option value="1">Środkowy kadr</option>
            <option value="2">Prawy kadr</option>
          </AdminSelect>
        </AdminField>
        <AdminField label="Dwa kadry — prawy (tablet / laptop)" htmlFor={`${section.id}-tablet-b`}>
          <AdminSelect
            id={`${section.id}-tablet-b`}
            value={String(p.tabletPanels?.[1] ?? 2)}
            onChange={(e) =>
              patch({
                tabletPanels: [
                  (p.tabletPanels?.[0] ?? 0) as 0 | 1 | 2,
                  Number(e.target.value) as 0 | 1 | 2,
                ],
              })
            }
          >
            <option value="0">Lewy kadr</option>
            <option value="1">Środkowy kadr</option>
            <option value="2">Prawy kadr</option>
          </AdminSelect>
        </AdminField>
      </div>

      <AdminField label="Etykieta" htmlFor={`${section.id}-eyebrow`}>
        <AdminInput
          id={`${section.id}-eyebrow`}
          value={p.eyebrow}
          onChange={(e) => patch({ eyebrow: e.target.value })}
        />
      </AdminField>
      <AdminField label="Tytuł" htmlFor={`${section.id}-title`} required>
        <AdminInput id={`${section.id}-title`} value={p.title} onChange={(e) => patch({ title: e.target.value })} />
      </AdminField>
      <AdminField label="Podtytuł" htmlFor={`${section.id}-sub`}>
        <AdminTextarea
          id={`${section.id}-sub`}
          rows={3}
          value={p.subtitle}
          onChange={(e) => patch({ subtitle: e.target.value })}
        />
      </AdminField>

      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Wyrównanie tekstu" htmlFor={`${section.id}-align`}>
          <AdminSelect
            id={`${section.id}-align`}
            value={p.textAlign}
            onChange={(e) => patch({ textAlign: e.target.value as BannerPayload["textAlign"] })}
          >
            <option value="left">Lewo</option>
            <option value="center">Środek</option>
            <option value="right">Prawo</option>
          </AdminSelect>
        </AdminField>
        <AdminField label="Kolor tekstu" htmlFor={`${section.id}-color`}>
          <AdminSelect
            id={`${section.id}-color`}
            value={p.textColor}
            onChange={(e) => patch({ textColor: e.target.value as BannerPayload["textColor"] })}
          >
            <option value="bialy">Biały (na ciemnym zdjęciu)</option>
            <option value="czarny">Czarny (na jasnym zdjęciu)</option>
          </AdminSelect>
        </AdminField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          id={`${section.id}-overlay`}
          label="Przyciemnienie (%)"
          value={p.overlayOpacity}
          min={0}
          max={80}
          onChange={(overlayOpacity) => patch({ overlayOpacity })}
        />
        <NumberField
          id={`${section.id}-gap`}
          label="Przerwa między kadrami (px)"
          value={p.panelGap ?? 10}
          min={0}
          max={24}
          onChange={(panelGap) => patch({ panelGap })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          id={`${section.id}-inset`}
          label="Margines dookoła kadrów (px)"
          hint="Zwykle 0. Przerwa między kadrami osobno powyżej."
          value={p.panelInset ?? 0}
          min={0}
          max={12}
          onChange={(panelInset) => patch({ panelInset })}
        />
        <NumberField
          id={`${section.id}-h`}
          label="Wysokość (vh) — 95–100 = cały ekran pod nav"
          value={p.minHeightVh}
          min={28}
          max={100}
          onChange={(minHeightVh) => patch({ minHeightVh })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          id={`${section.id}-px`}
          label="Margines tekstu w poziomie (px)"
          value={p.contentPaddingX}
          min={8}
          max={120}
          onChange={(contentPaddingX) => patch({ contentPaddingX })}
        />
        <NumberField
          id={`${section.id}-py`}
          label="Margines tekstu w pionie (px)"
          value={p.contentPaddingY}
          min={16}
          max={160}
          onChange={(contentPaddingY) => patch({ contentPaddingY })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          id={`${section.id}-mt`}
          label="Odstęp nad sekcją (px)"
          value={p.marginTop}
          min={0}
          max={160}
          onChange={(marginTop) => patch({ marginTop })}
        />
        <NumberField
          id={`${section.id}-mb`}
          label="Odstęp pod sekcją (px)"
          value={p.marginBottom}
          min={0}
          max={160}
          onChange={(marginBottom) => patch({ marginBottom })}
        />
      </div>

      <CtaFields
        id={section.id}
        prefix="Przycisk „zobacz więcej” (scroll w dół)"
        label={p.ctaLabel}
        href={p.ctaHref}
        onChange={(cta) =>
          patch({
            ctaLabel: cta.label || "Zobacz więcej",
            ctaHref: cta.href.startsWith("#") ? cta.href : "#hero-atelier",
          })
        }
      />
      <p className="text-xs text-czarny/45">
        Link ustaw na <code className="text-czarny/70">#hero-atelier</code> — przycisk przewija do sekcji Trzy
        Wiatry pod banerem, nie do sklepu.
      </p>
    </div>
  );
}
