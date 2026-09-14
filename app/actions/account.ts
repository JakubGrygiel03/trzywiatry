"use server";

import { redirect } from "next/navigation";
import {
  createCustomerPasswordResetToken,
  issueEmailConfirmToken,
  setCustomerPasswordWithResetToken,
  updateCustomerPassword,
  verifyCustomerCredentials,
  ensureCustomersHydrated,
  flushCustomersSave,
} from "@/lib/customer-auth";
import { clearCustomerSession, getCustomerSession, setCustomerSession } from "@/lib/customer-session";
import { sendCustomerConfirmEmail, sendCustomerPasswordResetEmail } from "@/lib/resend";
import { getRequestOrigin } from "@/lib/request-origin";
import {
  customerChangePasswordSchema,
  customerForgotPasswordSchema,
  customerResetPasswordSchema,
} from "@/lib/validations/forms";

export type AccountFormState = {
  ok: boolean;
  message: string;
  demoResetUrl?: string;
};

export async function logoutCustomerAction() {
  await clearCustomerSession();
  redirect("/konto/logowanie");
}

export async function requestCustomerEmailConfirm(
  _: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const parsed = customerForgotPasswordSchema.safeParse({
    email: String(formData.get("email") ?? ""),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Podaj e-mail." };
  }

  try {
    await ensureCustomersHydrated();
    const issued = issueEmailConfirmToken(parsed.data.email);
    if (!issued.ok) {
      return {
        ok: issued.reason === "already",
        message:
          issued.reason === "already"
            ? "To konto jest już aktywne. Zaloguj się."
            : "Nie znaleźliśmy konta oczekującego na potwierdzenie. Sprawdź adres albo zarejestruj się.",
      };
    }
    await flushCustomersSave();

    const origin = await getRequestOrigin();
    const confirmUrl = `${origin}/konto/potwierdz-email?token=${issued.token}`;
    const mailed = await sendCustomerConfirmEmail(issued.user.email, issued.user.name, confirmUrl);

    if (!mailed.ok) {
      return {
        ok: false,
        message: "Nie udało się wysłać maila. Sprawdź spam albo spróbuj za chwilę — napisz do pracowni, jeśli cisza.",
      };
    }

    return { ok: true, message: `Nowy link poszedł na ${issued.user.email}. Sprawdź skrzynkę i spam.` };
  } catch (error) {
    console.error("[account] confirm resend", error);
    return {
      ok: false,
      message: "Nie udało się wysłać maila. Spróbuj później albo napisz do pracowni.",
    };
  }
}

export async function requestCustomerPasswordReset(
  _: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const parsed = customerForgotPasswordSchema.safeParse({
    email: String(formData.get("email") ?? ""),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Podaj e-mail." };
  }

  const neutral =
    "Jeśli konto z tym adresem istnieje, wysłaliśmy link do resetu hasła. Sprawdź skrzynkę (i spam).";

  try {
    await ensureCustomersHydrated();
    const created = createCustomerPasswordResetToken(parsed.data.email);
    if (!created) {
      return { ok: true, message: neutral };
    }
    await flushCustomersSave();

    const resetUrl = `${await getRequestOrigin()}/konto/nowe-haslo?token=${created.token}`;
    const mailed = await sendCustomerPasswordResetEmail(created.user.email, resetUrl);

    if (mailed.demo && process.env.NODE_ENV === "development") {
      return {
        ok: true,
        message: `${neutral} (tryb demo: link poniżej — brak RESEND_API_KEY)`,
        demoResetUrl: resetUrl,
      };
    }

    if (!mailed.ok) {
      return {
        ok: false,
        message: "Nie udało się wysłać maila. Spróbuj później albo napisz do pracowni.",
      };
    }

    return { ok: true, message: neutral };
  } catch (error) {
    console.error("[account] password reset", error);
    return { ok: false, message: "Nie udało się wysłać maila. Spróbuj później albo napisz do pracowni." };
  }
}

export async function resetCustomerPasswordAction(
  _: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const parsed = customerResetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Sprawdź formularz." };
  }

  await ensureCustomersHydrated();
  const result = setCustomerPasswordWithResetToken(parsed.data.token, parsed.data.password);
  if (!result.ok) {
    return {
      ok: false,
      message:
        result.reason === "expired"
          ? "Link wygasł. Poproś o nowy reset hasła."
          : "Nieprawidłowy link resetu. Poproś o nowy.",
    };
  }

  await flushCustomersSave();
  await setCustomerSession(result.user);
  redirect("/konto?haslo=1");
}

export async function changeCustomerPasswordAction(
  _: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const user = await getCustomerSession();
  if (!user) {
    return { ok: false, message: "Sesja wygasła. Zaloguj się ponownie." };
  }

  const parsed = customerChangePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Sprawdź formularz." };
  }

  const valid = verifyCustomerCredentials(user.email, parsed.data.currentPassword);
  if (!valid) {
    return { ok: false, message: "Obecne hasło jest nieprawidłowe." };
  }

  updateCustomerPassword(user.id, parsed.data.password);
  await flushCustomersSave();
  return { ok: true, message: "Hasło zostało zmienione." };
}
