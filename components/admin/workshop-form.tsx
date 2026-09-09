"use client";

import { useState } from "react";
import { AdminField, AdminInput, AdminTextarea } from "@/components/admin/ui/admin-field";
import { AdminFormActions } from "@/components/admin/ui/admin-form-actions";
import { AdminFormSection } from "@/components/admin/ui/admin-form-section";
import type { Workshop } from "@/lib/types";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** datetime-local needs local wall-clock without timezone suffix. */
function toLocalInputValue(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function WorkshopForm({
  action,
  workshop,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  workshop?: Workshop;
  submitLabel: string;
}) {
  const [title, setTitle] = useState(workshop?.title ?? "");
  const [slug, setSlug] = useState(workshop?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(workshop));

  return (
    <form action={action} className="space-y-6">
      {workshop ? <input type="hidden" name="id" value={workshop.id} /> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          <AdminFormSection title="Termin warsztatu" description="Dane widoczne na /warsztaty i w rezerwacji.">
            <AdminField label="Tytuł" htmlFor="title" required>
              <AdminInput
                id="title"
                name="title"
                required
                value={title}
                onChange={(event) => {
                  const next = event.target.value;
                  setTitle(next);
                  if (!slugTouched) setSlug(slugify(next));
                }}
              />
            </AdminField>

            <AdminField label="Adres URL (slug)" htmlFor="slug" required>
              <AdminInput
                id="slug"
                name="slug"
                required
                value={slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(event.target.value);
                }}
              />
            </AdminField>

            <AdminField label="Opis" htmlFor="description" required>
              <AdminTextarea
                id="description"
                name="description"
                required
                defaultValue={workshop?.description}
                className="min-h-32"
              />
            </AdminField>

            <div className="grid gap-5 sm:grid-cols-2">
              <AdminField label="Data i godzina" htmlFor="eventDateLocal" required>
                <AdminInput
                  id="eventDateLocal"
                  name="eventDateLocal"
                  type="datetime-local"
                  required
                  defaultValue={workshop ? toLocalInputValue(workshop.eventDate) : ""}
                />
              </AdminField>
              <AdminField label="Czas trwania (h)" htmlFor="durationHours" required>
                <AdminInput
                  id="durationHours"
                  name="durationHours"
                  type="number"
                  min={0.5}
                  step={0.5}
                  required
                  defaultValue={workshop?.durationHours ?? 3}
                />
              </AdminField>
            </div>
          </AdminFormSection>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-20 xl:self-start">
          <AdminFormSection title="Publikacja">
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-czarny/8 bg-krem/40 p-3">
              <input
                type="checkbox"
                name="isPublished"
                value="true"
                defaultChecked={workshop?.isPublished ?? true}
                className="mt-0.5 accent-czerwony"
              />
              <span className="text-sm">
                <span className="font-medium text-czarny">Opublikowany</span>
                <span className="mt-0.5 block text-xs text-czarny/45">Widoczny na stronie warsztatów</span>
              </span>
            </label>
          </AdminFormSection>

          <AdminFormSection title="Miejsca i cena">
            <AdminField label="Cena (zł)" htmlFor="priceZl" required>
              <AdminInput
                id="priceZl"
                name="priceZl"
                type="number"
                min={1}
                required
                defaultValue={workshop ? (workshop.priceInCents / 100).toFixed(0) : ""}
              />
            </AdminField>
            <AdminField label="Limit miejsc" htmlFor="maxAttendees" required>
              <AdminInput
                id="maxAttendees"
                name="maxAttendees"
                type="number"
                min={1}
                required
                defaultValue={workshop?.maxAttendees ?? 6}
              />
            </AdminField>
            <AdminField label="Zajęte miejsca" htmlFor="bookedSeats" hint="Aktualna liczba rezerwacji.">
              <AdminInput
                id="bookedSeats"
                name="bookedSeats"
                type="number"
                min={0}
                defaultValue={workshop?.bookedSeats ?? 0}
              />
            </AdminField>
          </AdminFormSection>

          <AdminFormSection title="Lokalizacja i zdjęcie">
            <AdminField label="Lokalizacja" htmlFor="location" required>
              <AdminInput
                id="location"
                name="location"
                required
                defaultValue={workshop?.location ?? "Pracownia Trzy Wiatry, Gdańsk"}
              />
            </AdminField>
            <AdminField label="URL zdjęcia" htmlFor="imageUrl">
              <AdminInput
                id="imageUrl"
                name="imageUrl"
                defaultValue={workshop?.imageUrl ?? "/brand/photos/mugs-clean.jpg"}
              />
            </AdminField>
          </AdminFormSection>
        </aside>
      </div>

      <AdminFormActions submitLabel={submitLabel} cancelHref="/admin/warsztaty" />
    </form>
  );
}
