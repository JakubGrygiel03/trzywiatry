"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  changeLoggedInAdminPassword,
  type AuthFormState,
} from "@/app/actions/admin";
import { AdminField, AdminInput } from "@/components/admin/ui/admin-field";
import { AdminFormSection } from "@/components/admin/ui/admin-form-section";

const initial: AuthFormState = { ok: false, message: "" };

/** Change password while logged in — sits on Ustawienia sklepu. */
export function AdminChangePasswordForm({ adminEmail }: { adminEmail: string }) {
  const [state, action, pending] = useActionState(changeLoggedInAdminPassword, initial);

  return (
    <AdminFormSection
      title="Hasło do panelu"
      description={`Konto: ${adminEmail}. Zmiana od razu albo link resetu na skrzynkę.`}
    >
      <form action={action} className="space-y-4">
        <AdminField label="Obecne hasło" htmlFor="currentPassword" required>
          <AdminInput
            id="currentPassword"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
          />
        </AdminField>
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField label="Nowe hasło" htmlFor="password" required hint="Minimum 8 znaków.">
            <AdminInput
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </AdminField>
          <AdminField label="Powtórz nowe hasło" htmlFor="passwordConfirm" required>
            <AdminInput
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </AdminField>
        </div>

        {state.message ? (
          <p className={`text-sm ${state.ok ? "text-czarny/70" : "text-czerwony"}`}>{state.message}</p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-czarny px-4 py-2.5 text-xs font-medium text-bialy transition hover:bg-czerwony disabled:opacity-50"
          >
            {pending ? "Zapisywanie…" : "Zmień hasło"}
          </button>
          <Link
            href="/admin/reset-hasla"
            className="text-xs text-czerwony underline-offset-2 hover:underline"
          >
            Nie pamiętam hasła — wyślij link na e-mail
          </Link>
        </div>
      </form>
    </AdminFormSection>
  );
}
