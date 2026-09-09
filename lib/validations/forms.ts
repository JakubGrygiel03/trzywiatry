import { z } from "zod";

export const newsletterSchema = z.object({
  email: z.string().email("Nieprawidłowy e-mail"),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Podaj imię"),
  phone: z.string().optional(),
  email: z.string().email("Nieprawidłowy e-mail"),
  message: z.string().min(5, "Napisz wiadomość"),
});

export const workshopBookingSchema = z.object({
  workshopId: z.string().min(1),
  attendeeName: z.string().min(2, "Podaj imię i nazwisko"),
  attendeeEmail: z.string().email("Nieprawidłowy e-mail"),
  attendeePhone: z.string().min(9, "Podaj telefon"),
  seatsCount: z.coerce.number().int().min(1).max(6),
});

export const adminLoginSchema = z.object({
  email: z.string().email("Podaj prawidłowy e-mail"),
  password: z.string().min(4, "Podaj hasło (min. 4 znaki)"),
});

export const adminForgotPasswordSchema = z.object({
  email: z.string().email("Podaj prawidłowy e-mail"),
});

export const adminResetPasswordSchema = z
  .object({
    token: z.string().min(20, "Nieprawidłowy link resetu"),
    password: z.string().min(8, "Nowe hasło: minimum 8 znaków"),
    passwordConfirm: z.string().min(8, "Powtórz hasło"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Hasła muszą być takie same",
    path: ["passwordConfirm"],
  });

export const customerRegisterSchema = z
  .object({
    name: z.string().min(2, "Podaj imię i nazwisko"),
    email: z.string().email("Podaj prawidłowy e-mail"),
    password: z.string().min(8, "Hasło: minimum 8 znaków"),
    passwordConfirm: z.string().min(8, "Powtórz hasło"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Hasła muszą być takie same",
    path: ["passwordConfirm"],
  });

export const customerLoginSchema = z.object({
  email: z.string().email("Podaj prawidłowy e-mail"),
  password: z.string().min(4, "Podaj hasło"),
});

export const customerForgotPasswordSchema = z.object({
  email: z.string().email("Podaj prawidłowy e-mail"),
});

export const customerResetPasswordSchema = z
  .object({
    token: z.string().min(20, "Nieprawidłowy link resetu"),
    password: z.string().min(8, "Nowe hasło: minimum 8 znaków"),
    passwordConfirm: z.string().min(8, "Powtórz hasło"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Hasła muszą być takie same",
    path: ["passwordConfirm"],
  });

export const customerChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(4, "Podaj obecne hasło"),
    password: z.string().min(8, "Nowe hasło: minimum 8 znaków"),
    passwordConfirm: z.string().min(8, "Powtórz hasło"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Hasła muszą być takie same",
    path: ["passwordConfirm"],
  });
