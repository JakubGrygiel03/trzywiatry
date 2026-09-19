"use client";

import Link from "next/link";
import { LoginFormShell } from "@/components/forms/login-form-shell";
import { EmailField } from "@/components/forms/email-field";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { cn } from "@/lib/utils";

const ERRORS: Record<string, string> = {
  dane: "Uzupełnij e-mail i hasło.",
  haslo:
    "Nieprawidłowy e-mail lub hasło. Jeśli konto było właśnie zakładane — użyj „Nie pamiętasz hasła?” albo zarejestruj się ponownie tym samym e-mailem.",
  gotowe: "Konto gotowe — możesz się zalogować.",
};

const creamField =
  "h-12 rounded-2xl border-czarny/8 bg-krem placeholder:text-czarny/35 focus:border-czerwony focus:bg-bialy";

export function CustomerLoginForm({ error, defaultEmail = "" }: { error?: string; defaultEmail?: string }) {
  return (
    <div className="space-y-5">
      <LoginFormShell
        action="/api/account/login"
        emptyMessage="Uzupełnij e-mail i hasło."
        className="space-y-5"
      >
        <EmailField
          name="email"
          label="E-mail"
          defaultValue={defaultEmail}
          placeholder="jan@example.pl"
          inputClassName={creamField}
          labelClassName="text-czerwony/80"
        />
        <div className="space-y-2">
          <Label htmlFor="password" className="text-czerwony/80">
            Hasło
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className={cn(creamField)}
          />
        </div>
        <Button type="submit" className="w-full">
          Zaloguj się
        </Button>
        {error && ERRORS[error] ? (
          <p className={`text-sm ${error === "gotowe" ? "text-czarny/70" : "text-czerwony"}`}>{ERRORS[error]}</p>
        ) : null}
      </LoginFormShell>
      <p className="text-center text-sm">
        <Link href="/konto/reset-hasla" className="text-czerwony underline-offset-2 hover:underline">
          Nie pamiętasz hasła?
        </Link>
      </p>
      <p className="text-center text-sm text-czarny">
        Nie masz konta?{" "}
        <Link href="/konto/rejestracja" className="text-czerwony underline-offset-2 hover:underline">
          Zarejestruj się
        </Link>
      </p>
      <p className="text-center text-xs text-szary">
        <Link href="/admin/logowanie" className="underline-offset-2 hover:text-czerwony hover:underline">
          Panel pracowni (CMS)
        </Link>
      </p>
    </div>
  );
}
