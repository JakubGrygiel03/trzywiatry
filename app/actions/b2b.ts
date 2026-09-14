"use server";

import { b2bSchema } from "@/lib/validations/b2b";
import { saveAtelierSnapshot, ensureAtelierHydrated } from "@/lib/data/atelier-persist";
import { runtimeStore } from "@/lib/data/runtime-store";
import { notifyStudioB2B } from "@/lib/studio-notify";

export async function submitB2BInquiry(_: { ok: boolean; message: string }, formData: FormData) {
  await ensureAtelierHydrated();
  const parsed = b2bSchema.safeParse({
    companyName: formData.get("companyName"),
    nip: formData.get("nip"),
    contactPerson: formData.get("contactPerson"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    estimatedQuantity: formData.get("estimatedQuantity"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Uzupełnij formularz. / Please complete the form." };
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
