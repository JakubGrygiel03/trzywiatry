import { z } from "zod";
import { bi } from "@/lib/i18n/public";
import { emailSchema, phoneSchema, plainText } from "@/lib/validations/safe-input";

export const newsletterSchema = z.object({
  email: emailSchema,
});

export const contactSchema = z.object({
  name: plainText(bi("Imię", "Name"), 80, 2),
  phone: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    phoneSchema.optional(),
  ),
  email: emailSchema,
  message: plainText(bi("Wiadomość", "Message"), 2000, 5),
});

export const workshopBookingSchema = z.object({
  workshopId: z.string().min(1, bi("Wybierz warsztat.", "Choose a workshop.")),
  attendeeName: plainText(bi("Imię i nazwisko", "Full name"), 80, 2),
  attendeeEmail: emailSchema,
  attendeePhone: phoneSchema,
  seatsCount: z.coerce.number().int().min(1, bi("Minimum 1 miejsce.", "At least 1 seat.")).max(6, bi("Maksimum 6 miejsc.", "Maximum 6 seats.")),
});

export const adminLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(4, "Podaj hasło (min. 4 znaki).").max(120, "Hasło jest za długie."),
});

export const adminForgotPasswordSchema = z.object({
  email: emailSchema,
});

export const adminResetPasswordSchema = z
  .object({
    token: z.string().min(20, "Nieprawidłowy link resetu"),
    password: z.string().min(8, "Nowe hasło: minimum 8 znaków").max(120),
    passwordConfirm: z.string().min(8, "Powtórz hasło").max(120),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Hasła muszą być takie same",
    path: ["passwordConfirm"],
  });

export const customerRegisterSchema = z
  .object({
    name: plainText("Imię i nazwisko / Full name", 80, 2),
    email: emailSchema,
    password: z.string().min(8, "Hasło: minimum 8 znaków").max(120),
    passwordConfirm: z.string().min(8, "Powtórz hasło").max(120),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Hasła muszą być takie same",
    path: ["passwordConfirm"],
  });

export const customerLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(4, "Podaj hasło").max(120),
});

export const customerForgotPasswordSchema = z.object({
  email: emailSchema,
});

export const customerResetPasswordSchema = z
  .object({
    token: z.string().min(20, "Nieprawidłowy link resetu"),
    password: z.string().min(8, "Nowe hasło: minimum 8 znaków").max(120),
    passwordConfirm: z.string().min(8, "Powtórz hasło").max(120),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Hasła muszą być takie same",
    path: ["passwordConfirm"],
  });

export const customerChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(4, "Podaj obecne hasło").max(120),
    password: z.string().min(8, "Nowe hasło: minimum 8 znaków").max(120),
    passwordConfirm: z.string().min(8, "Powtórz hasło").max(120),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Hasła muszą być takie same",
    path: ["passwordConfirm"],
  });
