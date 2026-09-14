"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createPasswordResetToken,
  getAdminEmail,
  getSiteBaseUrl,
  setPasswordWithResetToken,
} from "@/lib/admin-auth";
import { ADMIN_COOKIE } from "@/lib/admin-session";
import { assertAdminSession } from "@/lib/admin-guard";
import { updateRuntimeSettings, updateOrderStatusInStore } from "@/lib/data/runtime-store";
import { ensureOrdersHydrated, flushOrdersSave } from "@/lib/data/order-persist";
import { flushAtelierSave } from "@/lib/data/atelier-persist";
import { defaultStudioSettings } from "@/lib/data/settings";
import type { OrderStatus } from "@/lib/types";
import { adminForgotPasswordSchema, adminResetPasswordSchema } from "@/lib/validations/forms";
import { firstZodMessage } from "@/lib/validations/safe-input";
import { studioSettingsFormSchema } from "@/lib/validations/settings";
import { notifyCustomerOrderStatus, sendAdminPasswordResetEmail } from "@/lib/resend";
import { ORDER_STATUS_LABELS } from "@/lib/constants";

export type AuthFormState = { ok: boolean; message: string; demoResetUrl?: string };

export async function logoutAdmin() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/admin/logowanie");
}

/**
 * Always returns a neutral success copy (no email enumeration).
 * Sends reset mail only when the address matches ADMIN_EMAIL.
 */
export async function requestAdminPasswordReset(
  _: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = adminForgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Podaj e-mail." };
  }

  const neutral =
    "Jeśli ten adres należy do panelu, wysłaliśmy link do resetu hasła. Sprawdź skrzynkę (i spam).";

  const email = parsed.data.email.trim().toLowerCase();
  if (email !== getAdminEmail()) {
    return { ok: true, message: neutral };
  }

  const { token } = createPasswordResetToken();
  const resetUrl = `${getSiteBaseUrl()}/admin/nowe-haslo?token=${token}`;
  const mailed = await sendAdminPasswordResetEmail(email, resetUrl);

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
      message: "Nie udało się wysłać maila. Sprawdź domenę nadawcy w Resend albo spróbuj później.",
    };
  }

  return { ok: true, message: neutral };
}

export async function resetAdminPassword(
  _: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = adminResetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Sprawdź pola formularza." };
  }

  const result = setPasswordWithResetToken(parsed.data.token, parsed.data.password);
  if (!result.ok) {
    return {
      ok: false,
      message:
        result.reason === "expired"
          ? "Link wygasł. Poproś o nowy reset hasła."
          : "Link jest nieprawidłowy lub został już użyty.",
    };
  }

  redirect("/admin/logowanie?zresetowano=1");
}

export async function updateOrderStatus(formData: FormData) {
  await assertAdminSession();
  const id = String(formData.get("id") ?? "");
  const statusRaw = String(formData.get("status") ?? "");
  const tracking = String(formData.get("tracking") ?? "").trim();
  const notify = formData.get("notifyCustomer") === "true";

  const allowed: OrderStatus[] = [
    "pending",
    "paid",
    "processing",
    "shipped",
    "completed",
    "cancelled",
  ];
  if (!id || !allowed.includes(statusRaw as OrderStatus)) {
    redirect("/admin/zamowienia?blad=1");
  }

  await ensureOrdersHydrated();
  const updated = updateOrderStatusInStore(id, statusRaw as OrderStatus, tracking);
  if (!updated) {
    redirect("/admin/zamowienia?blad=1");
  }
  await flushOrdersSave();
  await flushAtelierSave();

  let mailed = false;
  if (notify) {
    const result = await notifyCustomerOrderStatus(updated);
    mailed = Boolean(result.ok);
  }

  revalidatePath("/admin/zamowienia");
  revalidatePath(`/admin/zamowienia/${id}`);
  revalidatePath("/konto");
  revalidatePath(`/konto/zamowienia/${id}`);
  const mailFlag = notify ? (mailed ? "1" : "0") : "off";
  redirect(
    `/admin/zamowienia/${id}?zapisano=1&mail=${mailFlag}&label=${encodeURIComponent(ORDER_STATUS_LABELS[statusRaw as OrderStatus])}`,
  );
}

function parseShopHubImage(raw: unknown, fallback: string) {
  const value = String(raw ?? "").trim();
  if (value.startsWith("/") && !value.includes("..") && value.length < 300) return value;
  return fallback;
}

export async function saveStudioSettings(formData: FormData) {
  await assertAdminSession();
  const parsed = studioSettingsFormSchema.safeParse({
    announcementType: String(formData.get("announcementType") ?? "promo"),
    announcementText: String(formData.get("announcementText") ?? ""),
    promoCode: String(formData.get("promoCode") ?? ""),
    vacationStart: String(formData.get("vacationStart") ?? ""),
    vacationEnd: String(formData.get("vacationEnd") ?? ""),
    vacationDispatch: String(formData.get("vacationDispatch") ?? ""),
    freeShipping: formData.get("freeShipping"),
    workshopsEnabled: formData.get("workshopsEnabled") === "true",
  });
  if (!parsed.success) {
    redirect(`/admin/ustawienia-sklepu?blad=${encodeURIComponent(firstZodMessage(parsed.error))}`);
  }

  const data = parsed.data;
  updateRuntimeSettings({
    announcementType: data.announcementType,
    announcementText:
      data.announcementText ||
      (data.announcementType === "vacation"
        ? "Piec musiał ochłonąć"
        : "Darmowa dostawa od {freeShipping}  ·  Newsletter: −15%"),
    promoCode: data.promoCode || undefined,
    vacationStartDate: data.vacationStart || undefined,
    vacationEndDate: data.vacationEnd || undefined,
    vacationDispatchDate: data.vacationDispatch || undefined,
    freeShippingThresholdCents: data.freeShipping > 0 ? data.freeShipping : 30000,
    workshopsEnabled: data.workshopsEnabled,
    shopHubUzytkowaImage: parseShopHubImage(
      formData.get("shopHubUzytkowaImage"),
      defaultStudioSettings.shopHubUzytkowaImage,
    ),
    shopHubPracowniaImage: parseShopHubImage(
      formData.get("shopHubPracowniaImage"),
      defaultStudioSettings.shopHubPracowniaImage,
    ),
  });

  await flushAtelierSave();
  revalidatePath("/", "layout");
  revalidatePath("/sklep");
  revalidatePath("/admin/ustawienia-sklepu");
  revalidatePath("/zamowienie");
  revalidatePath("/warsztaty");
  redirect("/admin/ustawienia-sklepu?zapisano=1");
}
