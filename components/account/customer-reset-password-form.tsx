"use client";

import { useActionState } from "react";
import { resetCustomerPasswordAction, type AccountFormState } from "@/app/actions/account";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

const initial: AccountFormState = { ok: false, message: "" };

export function CustomerResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetCustomerPasswordAction, initial);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="token" value={token} />
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
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Zapisuję…" : "Ustaw nowe hasło"}
      </Button>
      {state.message ? <p className="text-sm text-czerwony">{state.message}</p> : null}
    </form>
  );
}
