"use server";

import { contactSchema, workshopBookingSchema } from "@/lib/validations/forms";
import { getWorkshopById, getWorkshopBySlug, remainingSeats } from "@/lib/data/queries";
import { saveAtelierSnapshot, ensureAtelierHydrated } from "@/lib/data/atelier-persist";
import { getRuntimeSettings, runtimeStore } from "@/lib/data/runtime-store";
import { renderEmailTemplate } from "@/lib/email/render";
import { sendEmail } from "@/lib/resend";
import { notifyStudioContact, notifyStudioWorkshop } from "@/lib/studio-notify";

export async function submitContact(_: { ok: boolean; message: string }, formData: FormData) {
  await ensureAtelierHydrated();
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
  await saveAtelierSnapshot();

  await notifyStudioContact(parsed.data);

  return {
    ok: true,
    message:
      "Wiadomość poszła do pracowni. Odpowiemy jak tylko zejdziemy od koła. / Message received — we will reply as soon as we step away from the wheel.",
  };
}

export async function bookWorkshop(_: { ok: boolean; message: string }, formData: FormData) {
  await ensureAtelierHydrated();
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

  if (!getRuntimeSettings().workshopsEnabled) {
    return { ok: false, message: "Rezerwacje warsztatów są teraz wyłączone. / Workshop bookings are currently closed." };
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
  await saveAtelierSnapshot();

  const ticket = renderEmailTemplate("workshop_ticket", {
    workshopTitle: workshop.title,
    seatsCount: String(parsed.data.seatsCount),
  });
  await Promise.all([
    sendEmail({
      to: parsed.data.attendeeEmail,
      subject: ticket.subject,
      html: ticket.html,
    }),
    notifyStudioWorkshop({
      workshopTitle: workshop.title,
      attendeeName: parsed.data.attendeeName,
      attendeeEmail: parsed.data.attendeeEmail,
      attendeePhone: parsed.data.attendeePhone,
      seatsCount: parsed.data.seatsCount,
    }),
  ]);

  return {
    ok: true,
    message:
      "Miejsce zarezerwowane. To nie jest opłacony bilet — potwierdzenie i płatność wyślemy mailem. / Seat held — this is not a paid ticket yet. We will email payment details.",
  };
}

export async function getWorkshopSlugAction(slug: string) {
  return getWorkshopBySlug(slug) ?? null;
}
