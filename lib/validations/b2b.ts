import { z } from "zod";
import { bi } from "@/lib/i18n/public";
import { emailSchema, phoneSchema, plainText, taxIdSchema } from "@/lib/validations/safe-input";

export const b2bSchema = z.object({
  companyName: plainText(bi("Nazwa firmy", "Company"), 120, 2),
  nip: taxIdSchema,
  contactPerson: plainText(bi("Osoba kontaktowa", "Contact person"), 80, 2),
  email: emailSchema,
  phone: phoneSchema,
  estimatedQuantity: plainText(bi("Szacowana ilość", "Estimated quantity"), 80, 1),
  message: plainText(bi("Wiadomość", "Message"), 2000, 10),
});

export type B2BInput = z.infer<typeof b2bSchema>;
