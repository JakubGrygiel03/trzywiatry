import Link from "next/link";
import { LoginFormShell } from "@/components/forms/login-form-shell";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

const ERRORS: Record<string, string> = {
  dane: "Uzupełnij e-mail i hasło.",
  haslo: "Nieprawidłowy e-mail lub hasło.",
};

export function CustomerLoginForm({ error }: { error?: string }) {
  return (
    <div className="space-y-5">
      <LoginFormShell
        action="/api/account/login"
        emptyMessage="Uzupełnij e-mail i hasło."
        className="space-y-5"
      >
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" autoComplete="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Hasło</Label>
          <Input id="password" name="password" type="password" autoComplete="current-password" />
        </div>
        <Button type="submit" className="w-full">
          Zaloguj się
        </Button>
        {error && ERRORS[error] ? <p className="text-sm text-czerwony">{ERRORS[error]}</p> : null}
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
