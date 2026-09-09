"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getAllWorkshops, getWorkshopById } from "@/lib/data/queries";
import {
  deleteRuntimeWorkshop,
  upsertRuntimeWorkshop,
} from "@/lib/data/runtime-store";
import type { Workshop } from "@/lib/types";

const workshopSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "Podaj tytuł warsztatu"),
  slug: z.string().min(2, "Podaj slug"),
  description: z.string().min(20, "Opis min. 20 znaków"),
  eventDateLocal: z.string().min(1, "Podaj datę i godzinę"),
  durationHours: z.coerce.number().positive("Czas trwania musi być > 0"),
  priceZl: z.coerce.number().positive("Cena musi być > 0"),
  maxAttendees: z.coerce.number().int().positive("Podaj maksymalną liczbę miejsc"),
  bookedSeats: z.coerce.number().int().min(0).default(0),
  location: z.string().min(3, "Podaj lokalizację"),
  imageUrl: z.string().min(1, "Podaj URL zdjęcia"),
  isPublished: z.boolean(),
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseForm(formData: FormData) {
  return workshopSchema.safeParse({
    id: String(formData.get("id") ?? "").trim() || undefined,
    title: formData.get("title"),
    slug: String(formData.get("slug") ?? "").trim() || slugify(String(formData.get("title") ?? "")),
    description: formData.get("description"),
    eventDateLocal: formData.get("eventDateLocal"),
    durationHours: formData.get("durationHours"),
    priceZl: formData.get("priceZl"),
    maxAttendees: formData.get("maxAttendees"),
    bookedSeats: formData.get("bookedSeats") || 0,
    location: formData.get("location"),
    imageUrl: String(formData.get("imageUrl") ?? "").trim() || "/brand/photos/mugs-clean.jpg",
    isPublished: formData.get("isPublished") === "true",
  });
}

function toIsoFromLocal(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function revalidateWorkshops(slug: string) {
  revalidatePath("/warsztaty");
  revalidatePath(`/warsztaty/${slug}`);
  revalidatePath("/admin/warsztaty");
  revalidatePath("/", "layout");
}

export async function createWorkshop(formData: FormData) {
  const parsed = parseForm(formData);
  if (!parsed.success) {
    redirect(`/admin/warsztaty/nowy?blad=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Błąd")}`);
  }

  const data = parsed.data;
  const eventDate = toIsoFromLocal(data.eventDateLocal);
  if (!eventDate) {
    redirect("/admin/warsztaty/nowy?blad=" + encodeURIComponent("Nieprawidłowa data."));
  }

  if (data.bookedSeats > data.maxAttendees) {
    redirect("/admin/warsztaty/nowy?blad=" + encodeURIComponent("Zajęte miejsca nie mogą przekraczać limitu."));
  }

  const slugTaken = getAllWorkshops().some((workshop) => workshop.slug === data.slug);
  if (slugTaken) {
    redirect("/admin/warsztaty/nowy?blad=" + encodeURIComponent("Slug jest już zajęty."));
  }

  const workshop: Workshop = {
    id: `w-${crypto.randomUUID().slice(0, 10)}`,
    title: data.title,
    slug: data.slug,
    description: data.description,
    eventDate,
    durationHours: data.durationHours,
    priceInCents: Math.round(data.priceZl * 100),
    maxAttendees: data.maxAttendees,
    bookedSeats: data.bookedSeats,
    isPublished: data.isPublished,
    location: data.location,
    imageUrl: data.imageUrl,
  };

  upsertRuntimeWorkshop(workshop);
  revalidateWorkshops(workshop.slug);
  redirect(`/admin/warsztaty/${workshop.id}?zapisano=1`);
}

export async function updateWorkshop(formData: FormData) {
  const parsed = parseForm(formData);
  if (!parsed.success || !parsed.data.id) {
    redirect("/admin/warsztaty?blad=1");
  }

  const data = parsed.data;
  const existing = getWorkshopById(data.id!);
  if (!existing) redirect("/admin/warsztaty?blad=1");

  const eventDate = toIsoFromLocal(data.eventDateLocal);
  if (!eventDate) {
    redirect(`/admin/warsztaty/${existing.id}?blad=` + encodeURIComponent("Nieprawidłowa data."));
  }

  if (data.bookedSeats > data.maxAttendees) {
    redirect(
      `/admin/warsztaty/${existing.id}?blad=` + encodeURIComponent("Zajęte miejsca nie mogą przekraczać limitu."),
    );
  }

  const slugTaken = getAllWorkshops().some(
    (workshop) => workshop.slug === data.slug && workshop.id !== existing.id,
  );
  if (slugTaken) {
    redirect(`/admin/warsztaty/${existing.id}?blad=` + encodeURIComponent("Slug jest już zajęty."));
  }

  const workshop: Workshop = {
    ...existing,
    title: data.title,
    slug: data.slug,
    description: data.description,
    eventDate,
    durationHours: data.durationHours,
    priceInCents: Math.round(data.priceZl * 100),
    maxAttendees: data.maxAttendees,
    bookedSeats: data.bookedSeats,
    isPublished: data.isPublished,
    location: data.location,
    imageUrl: data.imageUrl,
  };

  upsertRuntimeWorkshop(workshop);
  revalidateWorkshops(workshop.slug);
  redirect(`/admin/warsztaty/${workshop.id}?zapisano=1`);
}

export async function deleteWorkshop(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const existing = getWorkshopById(id);
  if (!existing) redirect("/admin/warsztaty?blad=1");

  deleteRuntimeWorkshop(id);
  revalidateWorkshops(existing.slug);
  redirect("/admin/warsztaty?usunieto=1");
}
