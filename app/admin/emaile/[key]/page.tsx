import { notFound } from "next/navigation";
import { EmailTemplateForm } from "@/components/admin/email-template-form";
import { AdminAlert } from "@/components/admin/ui/admin-alert";
import { AdminFormSection } from "@/components/admin/ui/admin-form-section";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { getEmailTemplate } from "@/lib/data/email-templates";
import { isEmailTemplateKey, EMAIL_TEMPLATES } from "@/lib/email/catalog";
import { EMAIL_PREVIEW_VARS } from "@/lib/email/preview";
import { interpolateEmailCopy, wrapEmail } from "@/lib/email/render";

export default async function AdminEmailEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ key: string }>;
  searchParams: Promise<{ zapisano?: string; przywrocono?: string; blad?: string; token?: string; powod?: string }>;
}) {
  const { key } = await params;
  const { zapisano, przywrocono, blad, token, powod } = await searchParams;
  if (!isEmailTemplateKey(key)) notFound();

  const meta = EMAIL_TEMPLATES[key];
  const draft = getEmailTemplate(key);
  const previewHtml = wrapEmail(interpolateEmailCopy(draft.body, EMAIL_PREVIEW_VARS));
  const previewSubject = interpolateEmailCopy(draft.subject, EMAIL_PREVIEW_VARS);

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader title={meta.label} description={meta.trigger} />

      {zapisano ? <AdminAlert variant="success">Zapisano. Kolejny mail do klienta użyje tej treści.</AdminAlert> : null}
      {przywrocono ? <AdminAlert variant="success">Przywrócono wzorzec z pracowni.</AdminAlert> : null}
      {powod || blad === "token" ? (
        <AdminAlert variant="error">
          {powod ??
            `Brakuje ${token ? `{${token}}` : "wymaganego pola"}. Bez klamer każdy klient dostanie pusty albo ten sam tekst.`}
        </AdminAlert>
      ) : null}

      <EmailTemplateForm templateKey={key} subject={draft.subject} body={draft.body} tokens={meta.tokens} />

      <AdminFormSection title="Podgląd z przykładowymi danymi">
        <p className="text-xs leading-relaxed text-czarny/50">
          To przykład (np. TW-0042). Na żywo wstawi się numer i dane tego klienta.
        </p>
        <p className="mt-3 font-heading text-[11px] uppercase tracking-[0.12em] text-czarny/40">{previewSubject}</p>
        <div
          className="mt-3 overflow-hidden rounded-xl border border-czarny/8 bg-krem/40 p-5 text-sm"
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      </AdminFormSection>
    </div>
  );
}
