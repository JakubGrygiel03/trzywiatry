"use client";

import { useActionState } from "react";
import { submitB2BInquiry } from "@/app/actions/b2b";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";

const initial = { ok: false, message: "" };

export function B2BForm() {
  const [state, action, pending] = useActionState(submitB2BInquiry, initial);

  return (
    <form action={action} className="grid gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Field name="companyName" label="Nazwa firmy" />
        <Field name="nip" label="NIP" placeholder="0000000000" />
        <Field name="contactPerson" label="Osoba kontaktowa" />
        <Field name="email" label="E-mail" type="email" />
        <Field name="phone" label="Telefon" />
        <Field name="estimatedQuantity" label="Szacowana ilość" placeholder="np. 80 kubków / kwartał" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Opis współpracy</Label>
        <Textarea id="message" name="message" required placeholder="Logo, kolory, pojemności, deadline..." />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Wysyłam" : "Wyślij zapytanie"}
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
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} required placeholder={placeholder} />
    </div>
  );
}
