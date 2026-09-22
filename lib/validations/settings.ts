import { z } from "zod";
import { revealsPromoOnStorefront } from "@/lib/cms/tokens";
import { isoDateSchema, plainText, promoCodeSchema } from "@/lib/validations/safe-input";

export const newsletterCmsSchema = z.object({
  newsletterEnabled: z.boolean(),
  newsletterEyebrow: plainText("Etykieta newslettera", 40),
  newsletterTitle: plainText("Tytuł newslettera", 80, 1),
  newsletterBody: plainText("Tekst newslettera", 320, 1),
  newsletterFormLabel: plainText("Etykieta formularza", 40, 1),
  newsletterButtonLabel: plainText("Przycisk newslettera", 40, 1),
});

export const studioSettingsFormSchema = z
  .object({
    announcementType: z.enum(["promo", "vacation", "hidden"]),
    announcementText: plainText("Treść bannera", 220),
    promoCode: promoCodeSchema,
    vacationStart: isoDateSchema,
    vacationEnd: isoDateSchema,
    vacationDispatch: isoDateSchema,
    freeShipping: z.coerce
      .number()
      .int("Próg dostawy musi być liczbą całkowitą.")
      .min(0, "Próg dostawy nie może być ujemny.")
      .max(1_000_000, "Próg dostawy jest za wysoki."),
    workshopsEnabled: z.boolean(),
    giftWrapEnabled: z.boolean(),
    maintenanceMode: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (revealsPromoOnStorefront(data.announcementText, data.promoCode)) {
      ctx.addIssue({
        code: "custom",
        path: ["announcementText"],
        message: "Nie pokazuj kodu na pasku — klient dostaje go mailem. Zostaw −15% bez nazwy hasła.",
      });
    }
    if (data.vacationStart && data.vacationEnd && data.vacationEnd < data.vacationStart) {
      ctx.addIssue({
        code: "custom",
        path: ["vacationEnd"],
        message: "Data końca urlopu nie może być wcześniejsza niż początek.",
      });
    }
    const lastVacation = data.vacationEnd || data.vacationStart;
    if (data.vacationDispatch && lastVacation && data.vacationDispatch < lastVacation) {
      ctx.addIssue({
        code: "custom",
        path: ["vacationDispatch"],
        message: "Wysyłka po urlopie nie może być przed końcem przerwy.",
      });
    }
  });
