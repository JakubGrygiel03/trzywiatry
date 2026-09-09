import { z } from "zod";

export const newsletterCmsSchema = z.object({
  newsletterEnabled: z.boolean(),
  newsletterEyebrow: z.string().trim().max(40),
  newsletterTitle: z.string().trim().max(80),
  newsletterBody: z.string().trim().max(320),
  newsletterFormLabel: z.string().trim().max(40),
  newsletterButtonLabel: z.string().trim().max(40),
});
