"use server";

import { redirect } from "next/navigation";
import {
  createCustomerPasswordResetToken,
  getSiteBaseUrl,
  registerCustomer,
  setCustomerPasswordWithResetToken,
  updateCustomerPassword,
  verifyCustomerCredentials,
} from "@/lib/customer-auth";
import { clearCustomerSession, getCustomerSession, setCustomerSession } from "@/lib/customer-session";
import { sendCustomerPasswordResetEmail } from "@/lib/resend";
import {
  customerChangePasswordSchema,
  customerForgotPasswordSchema,
  customerLoginSchema,
  customerRegisterSchema,
  customerResetPasswordSchema,
} from "@/lib/validations/forms";

export type AccountFormState = {
  ok: boolean;
  message: string;
  demoResetUrl?: string;
};

export async function registerCustomerAction(
  _: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const parsed = customerRegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Uzupełnij formularz." };
  }

  const result = registerCustomer(parsed.data);
  if (!result.ok) {
    return { ok: false, message: "Konto z tym e-mailem już istnieje. Zaloguj się lub zresetuj hasło." };
  }

  await setCustomerSession(result.user);
  redirect("/konto");
}

export async function loginCustomerAction(
  _: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const parsed = customerLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Uzupełnij dane logowania." };
  }

  const user = verifyCustomerCredentials(parsed.data.email, parsed.data.password);
  if (!user) {
    return { ok: false, message: "Nieprawidłowy e-mail lub hasło." };
  }

  await setCustomerSession(user);
  redirect("/konto");
}

export async function logoutCustomerAction() {
  await clearCustomerSession();
  redirect("/konto/logowanie");
}

export async function requestCustomerPasswordReset(
  _: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const parsed = customerForgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Podaj e-mail." };
  }

  const neutral =
    "Jeśli konto z tym adresem istnieje, wysłaliśmy link do resetu hasła. Sprawdź skrzynkę (i spam).";

  const created = createCustomerPasswordResetToken(parsed.data.email);
  if (!created) {
    return { ok: true, message: neutral };
  }

  const resetUrl = `${getSiteBaseUrl()}/konto/nowe-haslo?token=${created.token}`;
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
  return { ok: true, message: "Hasło zostało zmienione." };
}
