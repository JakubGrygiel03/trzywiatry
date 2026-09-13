"use client";

import { useActionState } from "react";
import { bookWorkshop } from "@/app/actions/contact";
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
    <form action={action} className="space-y-4 rounded-[32px] border border-czarny/8 bg-krem p-7 md:p-8">
      <input type="hidden" name="workshopId" value={workshop.id} />
      <p className="font-heading text-sm uppercase tracking-[0.14em]">
        {soldOut ? "Brak miejsc" : `Zostało ${seats} z ${workshop.maxAttendees} miejsc`}
      </p>
      <p className="text-xs leading-relaxed text-czarny/50" lang="en">
        English welcome — Polish characters are not required.
      </p>
      <Field name="attendeeName" label="Imię i nazwisko / Full name" />
      <Field name="attendeeEmail" label="E-mail" type="email" />
      <Field name="attendeePhone" label="Telefon / Phone" />
      <div className="space-y-2">
        <Label htmlFor="seatsCount">Liczba miejsc / Seats</Label>
        <Input id="seatsCount" name="seatsCount" type="number" min={1} max={seats || 1} defaultValue={1} required />
      </div>
      <Button type="submit" disabled={pending || soldOut} className="w-full">
        {soldOut ? "Wyprzedane" : pending ? "Rezerwuję" : "Rezerwuj i płać"}
      </Button>
      {state.message ? <p className="text-sm text-czerwony">{state.message}</p> : null}
    </form>
  );
}

function Field({ name, label, type = "text" }: { name: string; label: string; type?: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} required />
    </div>
  );
}
