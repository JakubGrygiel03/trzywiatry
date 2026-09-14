"use client";

import { useActionState } from "react";
import { submitContact } from "@/app/actions/contact";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";

const initial = { ok: false, message: "" };
const labelClass = "font-sans text-sm font-normal normal-case tracking-normal text-czarny/75";

export function ContactForm({ intro }: { intro?: string }) {
  const [state, action, pending] = useActionState(submitContact, initial);

  return (
    <form action={action} className="flex h-full flex-col" lang="pl">
      {intro ? (
        <p className="mb-6 text-sm leading-relaxed text-czarny/55" lang="en">
          {intro}
        </p>
      ) : null}
      <div className="grid flex-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name" className={labelClass}>
            Imię / Name <span className="text-czerwony">*</span>
          </Label>
          <Input id="name" name="name" required autoComplete="name" placeholder="Anna / John" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className={labelClass}>
            Telefon / Phone
          </Label>
          <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+48 123 456 789" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="email" className={labelClass}>
            E-mail <span className="text-czerwony">*</span>
          </Label>
          <Input id="email" name="email" type="email" required autoComplete="email" placeholder="you@email.com" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="message" className={labelClass}>
            Wiadomość / Message <span className="text-czerwony">*</span>
          </Label>
          <Textarea
            id="message"
            name="message"
            required
            className="min-h-40"
            placeholder="Write in English if you prefer."
          />
        </div>
      </div>
      <div className="mt-8 flex flex-col items-center gap-3 text-center">
        <Button type="submit" disabled={pending} className="min-w-[10rem]">
          {pending ? "Wysyłam… / Sending…" : "Wyślij / Send"}
        </Button>
        {state.message ? (
          <p className={`text-sm leading-relaxed ${state.ok ? "text-czarny/70" : "text-czerwony"}`}>
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
