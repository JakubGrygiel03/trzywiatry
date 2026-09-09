"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginCustomerAction, type AccountFormState } from "@/app/actions/account";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

const initial: AccountFormState = { ok: false, message: "" };

export function CustomerLoginForm() {
  const [state, action, pending] = useActionState(loginCustomerAction, initial);

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="password">Hasło</Label>
          <Link
            href="/konto/reset-hasla"
            className="text-[11px] text-czerwony underline-offset-2 hover:underline"
          >
            Nie pamiętasz hasła?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={4}
        />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Logowanie…" : "Zaloguj się"}
      </Button>
      {state.message ? <p className="text-sm text-czerwony">{state.message}</p> : null}
      <p className="text-center text-sm text-czarny">
        Nie masz konta?{" "}
        <Link href="/konto/rejestracja" className="text-czerwony underline-offset-2 hover:underline">
          Zarejestruj się
        </Link>
      </p>
      <p className="text-center text-xs text-szary">
        <Link href="/admin/logowanie" className="underline-offset-2 hover:text-czerwony hover:underline">
          Panel pracowni
        </Link>
      </p>
    </form>
  );
}
