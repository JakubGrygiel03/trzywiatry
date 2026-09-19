"use client";

import { X } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { submitContact } from "@/app/actions/contact";
import { EmailField } from "@/components/forms/email-field";
import { PhoneField } from "@/components/forms/phone-field";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/field";

const initial = { ok: false, message: "" };
const labelClass = "font-sans text-sm font-normal normal-case tracking-normal text-czarny/75";

export function ContactForm({ intro }: { intro?: string }) {
  const [state, action, pending] = useActionState(submitContact, initial);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (state.ok && state.message) {
      setDialogOpen(true);
      // Controlled Phone/Email/Text fields ignore form.reset() — remount clears them.
      setFormKey((key) => key + 1);
    }
  }, [state]);

  useEffect(() => {
    if (!dialogOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [dialogOpen]);

  return (
    <>
      <form key={formKey} action={action} className="flex h-full flex-col" lang="pl" noValidate>
        {intro ? (
          <p className="mb-6 text-sm leading-relaxed text-czarny/55" lang="en">
            {intro}
          </p>
        ) : null}
        <div className="grid flex-1 gap-5 sm:grid-cols-2">
          <TextField
            name="name"
            label="Imię / Name"
            placeholder="Anna / John"
            labelClassName={labelClass}
          />
          <PhoneField
            name="phone"
            label="Telefon / Phone"
            required={false}
            labelClassName={labelClass}
          />
          <EmailField
            name="email"
            label="E-mail"
            className="sm:col-span-2"
            labelClassName={labelClass}
            placeholder="jan@example.pl"
          />
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="message" className={labelClass}>
              Wiadomość / Message <span className="text-czerwony">*</span>
            </Label>
            <Textarea
              id="message"
              name="message"
              required
              minLength={5}
              className="min-h-40"
              placeholder="Write in English if you prefer."
            />
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center gap-3 text-center">
          <Button type="submit" disabled={pending} className="min-w-[10rem]">
            {pending ? "Wysyłam… / Sending…" : "Wyślij / Send"}
          </Button>
          {!state.ok && state.message ? (
            <p className="text-sm leading-relaxed text-czerwony">{state.message}</p>
          ) : null}
        </div>
      </form>

      {dialogOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-czarny/40 p-5 backdrop-blur-[3px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-success-title"
          onClick={() => setDialogOpen(false)}
        >
          <div
            className="relative w-full max-w-[26rem] overflow-hidden rounded-[2rem] border border-czarny/8 bg-bialy shadow-[0_28px_70px_-32px_rgb(1_1_1_/_0.5)]"
            onClick={(e) => e.stopPropagation()}
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
              <p className="font-heading text-[10px] uppercase tracking-[0.24em] text-czerwony">
                Kontakt
              </p>
              <h2
                id="contact-success-title"
                className="mt-3 font-heading text-[1.45rem] uppercase leading-[1.15] tracking-[0.05em] text-czarny sm:text-[1.65rem]"
              >
                Wiadomość poszła
              </h2>
              <p className="mt-4 text-[15px] leading-[1.7] text-czarny/65 sm:text-base">
                Odpowiemy jak tylko zejdziemy od koła.
              </p>
              <p className="mt-3 text-[13px] leading-relaxed text-szary" lang="en">
                Message received — we will reply as soon as we step away from the wheel.
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
