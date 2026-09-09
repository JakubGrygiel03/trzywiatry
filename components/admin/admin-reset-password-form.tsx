"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetAdminPassword, type AuthFormState } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

const initial: AuthFormState = { ok: false, message: "" };

export function AdminResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetAdminPassword, initial);

  if (!token) {
    return (
      <div className="space-y-4 text-sm">
        <p className="text-czerwony">Brak tokenu w linku. Poproś o nowy reset hasła.</p>
        <Link href="/admin/reset-hasla" className="text-czerwony underline-offset-2 hover:underline">
          Wyślij link ponownie
        </Link>
      </div>
    );
  }

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
        {pending ? "Zapisuję…" : "Ustaw nowe hasło"}
      </Button>
      {state.message ? <p className="text-sm text-czerwony">{state.message}</p> : null}
      <p className="text-center text-xs text-czarny/40">
        <Link href="/admin/logowanie" className="underline-offset-2 hover:text-czerwony hover:underline">
          Wróć do logowania
        </Link>
      </p>
    </form>
  );
}
