"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAdmin, type AuthFormState } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

const initial: AuthFormState = { ok: false, message: "" };

export function AdminLoginForm({ defaultEmail }: { defaultEmail: string }) {
  const [state, action, pending] = useActionState(loginAdmin, initial);

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">E-mail admina</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue={defaultEmail}
          placeholder="pracownia@trzywiatry.pl"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="password">Hasło</Label>
          <Link
            href="/admin/reset-hasla"
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
        {pending ? "Sprawdzam…" : "Zaloguj do panelu"}
      </Button>
      {state.message ? <p className="text-sm text-czerwony">{state.message}</p> : null}
    </form>
  );
}
