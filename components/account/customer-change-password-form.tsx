"use client";

import { useActionState } from "react";
import { changeCustomerPasswordAction, type AccountFormState } from "@/app/actions/account";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

const initial: AccountFormState = { ok: false, message: "" };

export function CustomerChangePasswordForm() {
  const [state, action, pending] = useActionState(changeCustomerPasswordAction, initial);

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-czarny/8 bg-bialy p-5">
      <h2 className="font-heading text-sm uppercase tracking-[0.14em]">Zmiana hasła</h2>
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Obecne hasło</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Nowe hasło</Label>
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
        <Label htmlFor="passwordConfirm">Powtórz nowe hasło</Label>
        <Input
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </div>
      <Button type="submit" disabled={pending} variant="outline">
        {pending ? "Zapisuję…" : "Zmień hasło"}
      </Button>
      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-czarny/70" : "text-czerwony"}`}>{state.message}</p>
      ) : null}
    </form>
  );
}
