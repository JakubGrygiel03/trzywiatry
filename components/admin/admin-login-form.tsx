import Link from "next/link";
import { LoginFormShell } from "@/components/forms/login-form-shell";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

const ERRORS: Record<string, string> = {
  dane: "Uzupełnij poprawny e-mail i hasło.",
  haslo: "Nieprawidłowy e-mail lub hasło.",
};

export function AdminLoginForm({
  defaultEmail,
  error,
}: {
  defaultEmail: string;
  error?: string;
}) {
  return (
    <div className="space-y-5">
      <LoginFormShell
        action="/api/admin/login"
        emptyMessage="Uzupełnij e-mail i hasło."
        className="space-y-5"
      >
        <div className="space-y-2">
          <Label htmlFor="email">E-mail admina</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            defaultValue={defaultEmail}
            placeholder="pracownia@trzywiatry.pl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Hasło</Label>
          <Input id="password" name="password" type="password" autoComplete="current-password" />
        </div>
        <Button type="submit" className="w-full">
          Zaloguj do panelu
        </Button>
        {error && ERRORS[error] ? <p className="text-sm text-czerwony">{ERRORS[error]}</p> : null}
      </LoginFormShell>
      <p className="text-center text-sm">
        <Link href="/admin/reset-hasla" className="text-czerwony underline-offset-2 hover:underline">
          Nie pamiętasz hasła?
        </Link>
      </p>
    </div>
  );
}
