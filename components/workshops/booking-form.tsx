"use client";

import { useActionState } from "react";
import { bookWorkshop } from "@/app/actions/contact";
import { EmailField } from "@/components/forms/email-field";
import { PhoneField } from "@/components/forms/phone-field";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { remainingSeats } from "@/lib/data/queries";
import type { Workshop } from "@/lib/types";

const initial = { ok: false, message: "" };

export function BookingForm({ workshop }: { workshop: Workshop }) {
  const seats = remainingSeats(workshop);
  const [state, action, pending] = useActionState(bookWorkshop, initial);
  const soldOut = seats <= 0;

  return (
    <form action={action} className="space-y-4 rounded-[32px] border border-czarny/8 bg-krem p-7 md:p-8" noValidate>
      <input type="hidden" name="workshopId" value={workshop.id} />
      <p className="font-heading text-sm uppercase tracking-[0.14em]">
        {soldOut ? "Brak miejsc" : `Zostało ${seats} z ${workshop.maxAttendees} miejsc`}
      </p>
      <p className="text-xs leading-relaxed text-czarny/50" lang="en">
        English welcome — Polish characters are not required.
      </p>
      <TextField name="attendeeName" label="Imię i nazwisko / Full name" />
      <EmailField name="attendeeEmail" label="E-mail" placeholder="jan@example.pl" />
      <PhoneField name="attendeePhone" label="Telefon / Phone" />
      <div className="space-y-2">
        <Label htmlFor="seatsCount">Liczba miejsc / Seats</Label>
        <Input id="seatsCount" name="seatsCount" type="number" min={1} max={seats || 1} defaultValue={1} required />
      </div>
      <Button type="submit" disabled={pending || soldOut} className="w-full">
        {soldOut ? "Wyprzedane" : pending ? "Rezerwuję" : "Rezerwuj miejsce"}
      </Button>
      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-czarny/70" : "text-czerwony"}`}>{state.message}</p>
      ) : null}
    </form>
  );
}
