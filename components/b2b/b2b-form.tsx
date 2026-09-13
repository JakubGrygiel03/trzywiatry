"use client";

import { useActionState } from "react";
import { submitB2BInquiry } from "@/app/actions/b2b";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";

const initial = { ok: false, message: "" };

export function B2BForm({ intro }: { intro?: string }) {
  const [state, action, pending] = useActionState(submitB2BInquiry, initial);

  return (
    <form action={action} className="grid gap-5">
      {intro ? (
        <p className="text-sm leading-relaxed text-czarny/55" lang="en">
          {intro}
        </p>
      ) : null}
      <div className="grid gap-5 md:grid-cols-2">
        <Field name="companyName" label="Nazwa firmy / Company" />
        <Field name="nip" label="NIP / VAT" placeholder="PL1234567890 / DE123456789" required={false} />
        <Field name="contactPerson" label="Osoba kontaktowa / Contact" />
        <Field name="email" label="E-mail" type="email" placeholder="you@email.com" />
        <Field name="phone" label="Telefon / Phone" placeholder="+49 151 0000000" />
        <Field name="estimatedQuantity" label="Szacowana ilość / Quantity" placeholder="80 cups / quarter" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Opis współpracy / Brief</Label>
        <Textarea
          id="message"
          name="message"
          required
          placeholder="Logo, colours, capacities, deadline…"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Wysyłam / Sending" : "Wyślij zapytanie / Send inquiry"}
      </Button>
      {state.message ? <p className="text-sm text-czerwony">{state.message}</p> : null}
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  placeholder,
  required = true,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} required={required} placeholder={placeholder} />
    </div>
  );
}
