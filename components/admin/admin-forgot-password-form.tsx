"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestAdminPasswordReset, type AuthFormState } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

const initial: AuthFormState = { ok: false, message: "" };

export function AdminForgotPasswordForm({ defaultEmail }: { defaultEmail: string }) {
  const [state, action, pending] = useActionState(requestAdminPasswordReset, initial);

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">E-mail admina</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={defaultEmail}
        />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Wysyłam…" : "Wyślij link resetu"}
      </Button>
      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-czarny/70" : "text-czerwony"}`}>{state.message}</p>
      ) : null}
      {state.demoResetUrl ? (
        <p className="break-all rounded-xl bg-krem px-3 py-2 text-xs text-czarny/70">
          Demo link:{" "}
          <Link href={state.demoResetUrl} className="text-czerwony underline-offset-2 hover:underline">
            {state.demoResetUrl}
          </Link>
        </p>
      ) : null}
      <p className="text-center text-xs text-czarny/40">
        <Link href="/admin/logowanie" className="underline-offset-2 hover:text-czerwony hover:underline">
          Wróć do logowania
        </Link>
      </p>
    </form>
  );
}
