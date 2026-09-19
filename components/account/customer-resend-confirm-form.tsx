"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestCustomerEmailConfirm, type AccountFormState } from "@/app/actions/account";
import { EmailField } from "@/components/forms/email-field";
import { Button } from "@/components/ui/button";

const initial: AccountFormState = { ok: false, message: "" };

export function CustomerResendConfirmForm({
  defaultEmail = "",
  firstMailFailed = false,
}: {
  defaultEmail?: string;
  firstMailFailed?: boolean;
}) {
  const [state, action, pending] = useActionState(requestCustomerEmailConfirm, initial);

  return (
    <form action={action} className="space-y-5" noValidate>
      {firstMailFailed ? (
        <p className="rounded-xl bg-czerwony/10 px-4 py-3 text-sm text-czarny">
          Pierwszy mail nie wyszedł (Resend w trybie testowym). Wyślij link ponownie — lokalnie pokażemy go też na
          stronie.
        </p>
      ) : null}
      <EmailField
        name="email"
        label="E-mail z rejestracji"
        defaultValue={defaultEmail}
        placeholder="jan@example.pl"
      />
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Wysyłam…" : "Nie dostałem maila — wyślij ponownie"}
      </Button>
      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-czarny/70" : "text-czerwony"}`}>{state.message}</p>
      ) : null}
      {state.demoResetUrl ? (
        <p className="break-all rounded-xl bg-krem px-4 py-3 text-sm">
          Link potwierdzający:{" "}
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
