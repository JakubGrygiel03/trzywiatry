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
import { updateRuntimeSettings, updateOrderStatusInStore } from "@/lib/data/runtime-store";
import { ensureOrdersHydrated, saveOrdersToDisk } from "@/lib/data/order-persist";
import { defaultStudioSettings } from "@/lib/data/settings";
import type { BannerType, HeroSlot, OrderStatus, StudioSettings } from "@/lib/types";
import { adminForgotPasswordSchema, adminResetPasswordSchema } from "@/lib/validations/forms";
import { newsletterCmsSchema } from "@/lib/validations/settings";
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
      message: "Nie udało się wysłać maila. Sprawdź RESEND_API_KEY albo spróbuj później.",
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

  ensureOrdersHydrated();
  const updated = updateOrderStatusInStore(id, statusRaw as OrderStatus, tracking);
  if (updated) saveOrdersToDisk();
  if (!updated) {
    redirect("/admin/zamowienia?blad=1");
  }

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

function parseNewsletterCms(formData: FormData): Pick<
  StudioSettings,
  | "newsletterEnabled"
  | "newsletterEyebrow"
  | "newsletterTitle"
  | "newsletterBody"
  | "newsletterFormLabel"
  | "newsletterButtonLabel"
> {
  const parsed = newsletterCmsSchema.safeParse({
    newsletterEnabled: formData.get("newsletterEnabled") === "true",
    newsletterEyebrow: String(formData.get("newsletterEyebrow") ?? ""),
    newsletterTitle: String(formData.get("newsletterTitle") ?? ""),
    newsletterBody: String(formData.get("newsletterBody") ?? ""),
    newsletterFormLabel: String(formData.get("newsletterFormLabel") ?? ""),
    newsletterButtonLabel: String(formData.get("newsletterButtonLabel") ?? ""),
  });
  const seed = defaultStudioSettings;
  const data = parsed.success ? parsed.data : seed;

  return {
    newsletterEnabled: data.newsletterEnabled,
    newsletterEyebrow: data.newsletterEyebrow || seed.newsletterEyebrow,
    newsletterTitle: data.newsletterTitle || seed.newsletterTitle,
    newsletterBody: data.newsletterBody || seed.newsletterBody,
    newsletterFormLabel: data.newsletterFormLabel || seed.newsletterFormLabel,
    newsletterButtonLabel: data.newsletterButtonLabel || seed.newsletterButtonLabel,
  };
}

function parseHeroSlots(raw: string): HeroSlot[] {
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data
      .filter(
        (item): item is HeroSlot =>
          Boolean(item) &&
          typeof item === "object" &&
          typeof (item as HeroSlot).productId === "string" &&
          typeof (item as HeroSlot).image === "string" &&
          (item as HeroSlot).productId.length > 0 &&
          (item as HeroSlot).image.startsWith("/"),
      )
      .slice(0, 12);
  } catch {
    return [];
  }
}

export async function saveStudioSettings(formData: FormData) {
  const announcementType = String(formData.get("announcementType") ?? "promo") as BannerType;
  const announcementText = String(formData.get("announcementText") ?? "").trim();
  const promoCode = String(formData.get("promoCode") ?? "").trim() || undefined;
  const freeShipping = Number(formData.get("freeShipping"));
  const vacationStartDate = String(formData.get("vacationStart") ?? "").trim() || undefined;
  const vacationEndDate = String(formData.get("vacationEnd") ?? "").trim() || undefined;
  const vacationDispatchDate = String(formData.get("vacationDispatch") ?? "").trim() || undefined;

  const safeType: BannerType =
    announcementType === "vacation" || announcementType === "hidden" || announcementType === "promo"
      ? announcementType
      : "promo";

  updateRuntimeSettings({
    announcementType: safeType,
    announcementText:
      announcementText ||
      (safeType === "vacation"
        ? "Piec musiał ochłonąć"
        : "Darmowa dostawa od 300 zł  ·  Newsletter: −15% na hasło WIOSNA"),
    promoCode,
    vacationStartDate,
    vacationEndDate,
    vacationDispatchDate,
    freeShippingThresholdCents:
      Number.isFinite(freeShipping) && freeShipping > 0 ? freeShipping : 30000,
    workshopsEnabled: formData.get("workshopsEnabled") === "true",
    heroSlots: parseHeroSlots(String(formData.get("heroSlots") ?? "")),
    ...parseNewsletterCms(formData),
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/ustawienia-sklepu");
  revalidatePath("/zamowienie");
  revalidatePath("/warsztaty");
  redirect("/admin/ustawienia-sklepu?zapisano=1");
}
