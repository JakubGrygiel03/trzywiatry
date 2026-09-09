import { z } from "zod";

const nip = z
  .string()
  .transform((value) => value.replace(/\s|-/g, ""))
  .refine((value) => /^\d{10}$/.test(value), "NIP musi mieć 10 cyfr");

export const b2bSchema = z.object({
  companyName: z.string().min(2, "Podaj nazwę firmy"),
  nip,
  contactPerson: z.string().min(2, "Podaj osobę kontaktową"),
  email: z.string().email("Nieprawidłowy e-mail"),
  phone: z.string().min(9, "Podaj telefon"),
  estimatedQuantity: z.string().min(1, "Podaj szacowaną ilość"),
  message: z.string().min(10, "Opisz potrzeby pracowni lub lokalu"),
});

export type B2BInput = z.infer<typeof b2bSchema>;
