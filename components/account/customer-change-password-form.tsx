"use client";

import { useActionState } from "react";
import { changeCustomerPasswordAction, type AccountFormState } from "@/app/actions/account";
import { AccountTile, AccountTileBody, AccountTileHeader } from "@/components/account/account-tile";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

const initial: AccountFormState = { ok: false, message: "" };

export function CustomerChangePasswordForm() {
  const [state, action, pending] = useActionState(changeCustomerPasswordAction, initial);

  return (
    <AccountTile>
      <AccountTileHeader
        eyebrow="Bezpieczeństwo"
        title="Zmiana hasła"
        description="Minimum 8 znaków. Po zapisaniu możesz od razu korzystać z nowego hasła."
      />
      <AccountTileBody>
        <form action={action} className="space-y-4">
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
          <div className="grid gap-4 sm:grid-cols-2">
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
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button type="submit" disabled={pending} variant="secondary">
              {pending ? "Zapisuję…" : "Zapisz nowe hasło"}
            </Button>
            {state.message ? (
              <p className={`text-sm ${state.ok ? "text-czarny/65" : "text-czerwony"}`}>{state.message}</p>
            ) : null}
          </div>
        </form>
      </AccountTileBody>
    </AccountTile>
  );
}
