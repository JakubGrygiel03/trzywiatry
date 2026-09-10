import Link from "next/link";
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
    <form action="/api/admin/login" method="post" className="space-y-5">
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
      <Button type="submit" className="w-full">
        Zaloguj do panelu
      </Button>
      {error && ERRORS[error] ? <p className="text-sm text-czerwony">{ERRORS[error]}</p> : null}
    </form>
  );
}
