"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { EmailField } from "@/components/forms/email-field";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { emailLiveError, nameLiveError } from "@/lib/validations/live-fields";

const SERVER_ERRORS: Record<string, string> = {
  dane: "Uzupełnij formularz.",
  exists: "Konto z tym e-mailem już istnieje. Zaloguj się.",
  zapis:
    "Nie udało się zapisać konta. Spróbuj jeszcze raz za chwilę — bez tego logowanie później nie zadziała.",
};

export function CustomerRegisterForm({ error }: { error?: string }) {
  const [emptyError, setEmptyError] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const passwordConfirm = String(data.get("passwordConfirm") ?? "");

    const nameErr = nameLiveError(name, { required: true, touched: true, label: "Imię i nazwisko" });
    const emailErr = emailLiveError(email, { required: true, touched: true });
    if (nameErr || emailErr) {
      event.preventDefault();
      setEmptyError(nameErr || emailErr || "Uzupełnij formularz.");
      return;
    }
    if (!password || !passwordConfirm) {
      event.preventDefault();
      setEmptyError("Uzupełnij wszystkie pola.");
      return;
    }
    if (password !== passwordConfirm) {
      event.preventDefault();
      setEmptyError("Hasła muszą być takie same.");
      return;
    }
    if (password.length < 8) {
      event.preventDefault();
      setEmptyError("Hasło: minimum 8 znaków.");
      return;
    }
    setEmptyError("");
  }

  const serverMessage = error ? (SERVER_ERRORS[error] ?? (error.length > 20 ? error : SERVER_ERRORS.dane)) : "";

  return (
    <form action="/api/account/register" method="post" noValidate className="space-y-5" onSubmit={onSubmit}>
      <TextField name="name" label="Imię i nazwisko / Full name" />
      <EmailField name="email" label="E-mail" placeholder="jan@example.pl" />
      <div className="space-y-2">
        <Label htmlFor="password">Hasło</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="passwordConfirm">Powtórz hasło</Label>
        <Input id="passwordConfirm" name="passwordConfirm" type="password" autoComplete="new-password" />
      </div>
      <Button type="submit" className="w-full">
        Załóż konto
      </Button>
      {emptyError || serverMessage ? (
        <p className="text-sm text-czerwony">{emptyError || serverMessage}</p>
      ) : null}
      <p className="text-center text-sm text-czarny/55">
        Masz już konto?{" "}
        <Link href="/konto/logowanie" className="text-czerwony underline-offset-2 hover:underline">
          Zaloguj się
        </Link>
      </p>
    </form>
  );
}
