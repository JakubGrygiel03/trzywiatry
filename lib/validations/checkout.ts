import { z } from "zod";
import { normalizeCouponCode } from "@/lib/coupon-code";
import { emailSchema, phoneSchema, plainText, taxIdSchema } from "@/lib/validations/safe-input";

const postalCode = z.string().trim().regex(/^\d{2}-\d{3}$/, "Kod pocztowy: 00-000");

export const checkoutSchema = z
  .object({
    customerName: plainText("Imię i nazwisko / Full name", 80, 2),
    customerEmail: emailSchema,
    customerPhone: phoneSchema,
    street: plainText("Ulica", 120, 3),
    postalCode,
    city: plainText("Miasto", 60, 2),
    isCompany: z.boolean(),
    companyName: z.string().optional(),
    nip: taxIdSchema,
    shipToDifferent: z.boolean(),
    shippingStreet: z.string().optional(),
    shippingPostalCode: z.string().optional(),
    shippingCity: z.string().optional(),
    shippingMethod: z.enum(["inpost", "kurier", "odbior"]),
    inpostLocker: z.string().trim().max(180).optional(),
    giftMessage: plainText("Dedykacja", 280).optional(),
    discountCode: z.preprocess(
      (value) => (typeof value === "string" ? normalizeCouponCode(value) : value),
      z
        .string()
        .max(24)
        .refine((value) => value === "" || /^[A-Z0-9-]+$/.test(value), "Kod rabatowy: litery, cyfry i myślnik.")
        .optional(),
    ),
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
    if (data.isCompany) {
      const company = data.companyName?.trim() ?? "";
      if (company.length < 2) {
        ctx.addIssue({ code: "custom", path: ["companyName"], message: "Podaj nazwę firmy." });
      }
      if (!data.nip) {
        ctx.addIssue({ code: "custom", path: ["nip"], message: "Podaj NIP (10 cyfr) albo numer VAT." });
      }
    }
    if (data.shipToDifferent && data.shippingMethod === "kurier") {
      const street = data.shippingStreet?.trim() ?? "";
      const city = data.shippingCity?.trim() ?? "";
      if (street.length < 3) {
        ctx.addIssue({ code: "custom", path: ["shippingStreet"], message: "Podaj ulicę dostawy." });
      }
      if (!/^\d{2}-\d{3}$/.test(data.shippingPostalCode?.trim() ?? "")) {
        ctx.addIssue({
          code: "custom",
          path: ["shippingPostalCode"],
          message: "Kod pocztowy dostawy: 00-000",
        });
      }
      if (city.length < 2) {
        ctx.addIssue({ code: "custom", path: ["shippingCity"], message: "Podaj miasto dostawy." });
      }
    }
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;
