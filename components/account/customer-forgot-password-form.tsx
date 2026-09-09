"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestCustomerPasswordReset, type AccountFormState } from "@/app/actions/account";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

const initial: AccountFormState = { ok: false, message: "" };

export function CustomerForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestCustomerPasswordReset, initial);

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">E-mail konta</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
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
