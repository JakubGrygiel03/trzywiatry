import { z } from "zod";
import { emailSchema, phoneSchema, plainText } from "@/lib/validations/safe-input";

export const checkoutSchema = z
  .object({
    customerName: plainText("Imię i nazwisko / Full name", 80, 2),
    customerEmail: emailSchema,
    customerPhone: phoneSchema,
    street: plainText("Ulica", 120, 3),
    postalCode: z.string().trim().regex(/^\d{2}-\d{3}$/, "Kod pocztowy: 00-000"),
    city: plainText("Miasto", 60, 2),
    shippingMethod: z.enum(["inpost", "kurier"]),
    inpostLocker: z.string().trim().max(180).optional(),
    giftMessage: plainText("Dedykacja", 280).optional(),
    discountCode: z
      .string()
      .trim()
      .max(24)
      .refine((value) => value === "" || /^[A-Za-z0-9-]+$/.test(value), "Kod rabatowy: litery, cyfry i myślnik.")
      .optional(),
    notes: plainText("Uwagi", 500).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.shippingMethod === "inpost" && !data.inpostLocker?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["inpostLocker"],
        message: "Wybierz paczkomat InPost na mapie.",
      });
    }
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;
