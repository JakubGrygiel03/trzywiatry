"use server";

import { b2bSchema } from "@/lib/validations/b2b";
import { saveAtelierSnapshot, ensureAtelierHydrated } from "@/lib/data/atelier-persist";
import { runtimeStore } from "@/lib/data/runtime-store";
import { notifyStudioB2B } from "@/lib/studio-notify";

export type B2BFormValues = {
  companyName: string;
  nip: string;
  contactPerson: string;
  email: string;
  phone: string;
  estimatedQuantity: string;
  message: string;
};

export type B2BFormState = {
  ok: boolean;
  message: string;
  /** Keep inputs after validation errors / RSC remount. */
  values?: B2BFormValues;
};

function readB2BForm(formData: FormData): B2BFormValues {
  return {
    companyName: String(formData.get("companyName") ?? ""),
    nip: String(formData.get("nip") ?? ""),
    contactPerson: String(formData.get("contactPerson") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    estimatedQuantity: String(formData.get("estimatedQuantity") ?? ""),
    message: String(formData.get("message") ?? ""),
  };
}

export async function submitB2BInquiry(_prev: B2BFormState, formData: FormData): Promise<B2BFormState> {
  await ensureAtelierHydrated();
  const raw = readB2BForm(formData);
  const parsed = b2bSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Uzupełnij formularz. / Please complete the form.",
      values: raw,
    };
  }

  runtimeStore.b2b.push({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    payload: parsed.data,
  });
  await saveAtelierSnapshot();

  await notifyStudioB2B(parsed.data);

  return {
    ok: true,
    message:
      "Dziękujemy. Oddzwonimy z wyceną HoReCa w ciągu dwóch dni roboczych. / Thank you — we will reply with a quote within two working days.",
  };
}
