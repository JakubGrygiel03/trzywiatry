"use server";

import { contactSchema, workshopBookingSchema } from "@/lib/validations/forms";
import { SITE } from "@/lib/constants";
import { getWorkshopById, getWorkshopBySlug, remainingSeats } from "@/lib/data/queries";
import { runtimeStore } from "@/lib/data/runtime-store";
import { renderEmailTemplate } from "@/lib/email/render";
import { sendEmail } from "@/lib/resend";
import { escapeHtml } from "@/lib/validations/safe-input";

export async function submitContact(_: { ok: boolean; message: string }, formData: FormData) {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    phone: String(formData.get("phone") ?? "").trim() || undefined,
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Uzupełnij wiadomość. / Please complete the message." };
  }

  runtimeStore.contacts.push({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    payload: parsed.data,
  });

  await sendEmail({
    to: SITE.email,
    subject: `Kontakt · ${parsed.data.name}`,
    html: `<p><strong>${escapeHtml(parsed.data.name)}</strong></p>
      <p>${escapeHtml(parsed.data.email)}${parsed.data.phone ? ` · ${escapeHtml(parsed.data.phone)}` : ""}</p>
      <p>${escapeHtml(parsed.data.message)}</p>`,
  });

  return {
    ok: true,
    message:
      "Wiadomość poszła do pracowni. Odpowiemy jak tylko zejdziemy od koła. / Message received — we will reply as soon as we step away from the wheel.",
  };
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
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Sprawdź dane rezerwacji. / Check the booking details." };
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

  const ticket = renderEmailTemplate("workshop_ticket", {
    workshopTitle: workshop.title,
    seatsCount: String(parsed.data.seatsCount),
  });
  await sendEmail({
    to: parsed.data.attendeeEmail,
    subject: ticket.subject,
    html: ticket.html,
  });

  return {
    ok: true,
    message: "Miejsce zarezerwowane. Bilet PDF wyślemy po podpięciu P24 — na razie to potwierdzenie demo.",
  };
}

export async function getWorkshopSlugAction(slug: string) {
  return getWorkshopBySlug(slug) ?? null;
}
