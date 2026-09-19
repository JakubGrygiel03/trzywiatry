"use client";

import { X } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { submitB2BInquiry, type B2BFormState } from "@/app/actions/b2b";
import { EmailField } from "@/components/forms/email-field";
import { PhoneField } from "@/components/forms/phone-field";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";

const initial: B2BFormState = { ok: false, message: "" };

export function B2BForm({ intro }: { intro?: string }) {
  const [state, action, pending] = useActionState(submitB2BInquiry, initial);
  const [dialogOpen, setDialogOpen] = useState(false);
  const values = state.values;

  useEffect(() => {
    if (state.ok) setDialogOpen(true);
  }, [state]);

  useEffect(() => {
    if (!dialogOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [dialogOpen]);

  const formKey = state.ok
    ? `ok-${state.message}`
    : values
      ? `err-${state.message}-${values.email}-${values.message.length}`
      : "b2b-form";

  return (
    <>
      <form key={formKey} action={action} className="grid gap-5" noValidate>
        {intro ? (
          <p className="text-sm leading-relaxed text-czarny/55" lang="en">
            {intro}
          </p>
        ) : null}
        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            name="companyName"
            label="Nazwa firmy / Company"
            defaultValue={values?.companyName}
          />
          <Field
            name="nip"
            label="NIP / VAT"
            placeholder="PL1234567890 / DE123456789"
            required={false}
            defaultValue={values?.nip}
          />
          <TextField
            name="contactPerson"
            label="Osoba kontaktowa / Contact"
            defaultValue={values?.contactPerson}
          />
          <EmailField name="email" label="E-mail" defaultValue={values?.email} placeholder="jan@firma.pl" />
          <PhoneField name="phone" label="Telefon / Phone" defaultValue={values?.phone} />
          <Field
            name="estimatedQuantity"
            label="Szacowana ilość / Quantity"
            placeholder="80 cups / quarter"
            defaultValue={values?.estimatedQuantity}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">Opis współpracy / Brief</Label>
          <Textarea
            id="message"
            name="message"
            required
            minLength={5}
            placeholder="Logo, colours, capacities, deadline…"
            defaultValue={values?.message}
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Wysyłam / Sending" : "Wyślij zapytanie / Send inquiry"}
        </Button>
        {!state.ok && state.message ? <p className="text-sm text-czerwony">{state.message}</p> : null}
      </form>

      {dialogOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-czarny/40 p-5 backdrop-blur-[3px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="b2b-success-title"
          onClick={() => setDialogOpen(false)}
        >
          <div
            className="relative w-full max-w-[26rem] overflow-hidden rounded-[2rem] border border-czarny/8 bg-bialy shadow-[0_28px_70px_-32px_rgb(1_1_1_/_0.5)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="h-1.5 bg-gradient-to-r from-czerwony via-ceglany to-czerwony/70" aria-hidden />

            <button
              type="button"
              onClick={() => setDialogOpen(false)}
              aria-label="Zamknij komunikat"
              className="absolute right-3.5 top-5 flex h-9 w-9 items-center justify-center rounded-full text-czarny/45 transition-colors hover:bg-krem hover:text-czarny"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>

            <div className="px-7 pb-7 pt-8 sm:px-9 sm:pb-9 sm:pt-9">
              <p className="font-heading text-[10px] uppercase tracking-[0.24em] text-czerwony">B2B · HoReCa</p>
              <h2
                id="b2b-success-title"
                className="mt-3 font-heading text-[1.45rem] uppercase leading-[1.15] tracking-[0.05em] text-czarny sm:text-[1.65rem]"
              >
                Zapytanie wysłane
              </h2>
              <p className="mt-4 text-[15px] leading-[1.7] text-czarny/65 sm:text-base">
                Dziękujemy. Oddzwonimy z wyceną w ciągu dwóch dni roboczych.
              </p>
              <p className="mt-3 text-[13px] leading-relaxed text-szary" lang="en">
                Thank you — we will reply with a quote within two working days.
              </p>

              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-czarny px-5 py-3.5 font-heading text-[11px] uppercase tracking-[0.2em] text-bialy transition-colors hover:bg-czerwony"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Field({
  name,
  label,
  type = "text",
  placeholder,
  required = true,
  defaultValue,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
      />
    </div>
  );
}
