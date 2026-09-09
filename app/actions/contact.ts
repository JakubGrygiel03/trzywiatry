"use server";

import { contactSchema, workshopBookingSchema } from "@/lib/validations/forms";
import { SITE } from "@/lib/constants";
import { getWorkshopById, getWorkshopBySlug, remainingSeats } from "@/lib/data/queries";
import { runtimeStore } from "@/lib/data/runtime-store";
import { sendEmail } from "@/lib/resend";

export async function submitContact(_: { ok: boolean; message: string }, formData: FormData) {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    phone: String(formData.get("phone") ?? "").trim() || undefined,
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Uzupełnij wiadomość." };
  }

  runtimeStore.contacts.push({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    payload: parsed.data,
  });

  await sendEmail({
    to: SITE.email,
    subject: `Kontakt · ${parsed.data.name}`,
    html: `<p><strong>${parsed.data.name}</strong></p>
      <p>${parsed.data.email}${parsed.data.phone ? ` · ${parsed.data.phone}` : ""}</p>
      <p>${parsed.data.message}</p>`,
  });

  return { ok: true, message: "Wiadomość poszła do pracowni. Odpowiemy jak tylko zejdziemy od koła." };
}

export async function bookWorkshop(_: { ok: boolean; message: string }, formData: FormData) {
  const parsed = workshopBookingSchema.safeParse({
    workshopId: formData.get("workshopId"),
    attendeeName: formData.get("attendeeName"),
    attendeeEmail: formData.get("attendeeEmail"),
    attendeePhone: formData.get("attendeePhone"),
    seatsCount: formData.get("seatsCount"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Sprawdź dane rezerwacji." };
  }

  const workshop = getWorkshopById(parsed.data.workshopId);
  if (!workshop) {
    return { ok: false, message: "Nie znaleziono terminu." };
  }

  if (remainingSeats(workshop) < parsed.data.seatsCount) {
    return { ok: false, message: "Brak wolnych miejsc na ten termin." };
  }

  workshop.bookedSeats += parsed.data.seatsCount;
  runtimeStore.bookings.push({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    payload: parsed.data,
  });

  await sendEmail({
    to: parsed.data.attendeeEmail,
    subject: `Bilet · ${workshop.title}`,
    html: `<p>Rezerwacja potwierdzona: ${workshop.title}. Liczba miejsc: ${parsed.data.seatsCount}.</p>`,
  });

  return {
    ok: true,
    message: "Miejsce zarezerwowane. Bilet PDF wyślemy po podpięciu P24 — na razie to potwierdzenie demo.",
  };
}

export async function getWorkshopSlugAction(slug: string) {
  return getWorkshopBySlug(slug) ?? null;
}
