"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestCustomerPasswordReset, type AccountFormState } from "@/app/actions/account";
import { EmailField } from "@/components/forms/email-field";
import { Button } from "@/components/ui/button";

const initial: AccountFormState = { ok: false, message: "" };

export function CustomerForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestCustomerPasswordReset, initial);

  return (
    <form action={action} className="space-y-5" noValidate>
      <EmailField name="email" label="E-mail konta" placeholder="jan@example.pl" />
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Wysyłam…" : "Wyślij link resetu"}
      </Button>
      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-czarny/70" : "text-czerwony"}`}>{state.message}</p>
      ) : null}
      {state.demoResetUrl ? (
        <p className="break-all rounded-xl bg-krem p-3 text-xs text-czarny/70">
          Demo link:{" "}
          <Link href={state.demoResetUrl} className="text-czerwony underline">
            {state.demoResetUrl}
          </Link>
        </p>
      ) : null}
      <p className="text-center text-sm text-czarny/55">
        <Link href="/konto/logowanie" className="text-czerwony underline-offset-2 hover:underline">
          Wróć do logowania
        </Link>
      </p>
    </form>
  );
}
