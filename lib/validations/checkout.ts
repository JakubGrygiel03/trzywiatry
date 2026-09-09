import { z } from "zod";

export const checkoutSchema = z.object({
  customerName: z.string().min(2, "Podaj imię i nazwisko"),
  customerEmail: z.string().email("Nieprawidłowy e-mail"),
  customerPhone: z.string().min(9, "Podaj numer telefonu"),
  street: z.string().min(3, "Podaj ulicę"),
  postalCode: z.string().regex(/^\d{2}-\d{3}$/, "Format: 00-000"),
  city: z.string().min(2, "Podaj miasto"),
  shippingMethod: z.enum(["inpost", "kurier", "odbior"]),
  inpostLocker: z.string().optional(),
  giftMessage: z.string().max(280).optional(),
  discountCode: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
