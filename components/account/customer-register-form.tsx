"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerCustomerAction, type AccountFormState } from "@/app/actions/account";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

const initial: AccountFormState = { ok: false, message: "" };

export function CustomerRegisterForm() {
  const [state, action, pending] = useActionState(registerCustomerAction, initial);

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Imię i nazwisko</Label>
        <Input id="name" name="name" autoComplete="name" required minLength={2} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Hasło</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="passwordConfirm">Powtórz hasło</Label>
        <Input
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Zakładanie konta…" : "Załóż konto"}
      </Button>
      {state.message ? <p className="text-sm text-czerwony">{state.message}</p> : null}
      <p className="text-center text-sm text-czarny/55">
        Masz już konto?{" "}
        <Link href="/konto/logowanie" className="text-czerwony underline-offset-2 hover:underline">
          Zaloguj się
        </Link>
      </p>
    </form>
  );
}
