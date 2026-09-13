"use client";

import { useState, type FormEvent } from "react";
import { restoreEmailTemplate, saveEmailTemplate } from "@/app/actions/admin-emails";
import { CmsTokenField } from "@/components/admin/cms-token-field";
import { AdminAlert } from "@/components/admin/ui/admin-alert";
import { AdminField } from "@/components/admin/ui/admin-field";
import { AdminFormActions } from "@/components/admin/ui/admin-form-actions";
import { AdminFormSection } from "@/components/admin/ui/admin-form-section";
import { explainEmailDraft } from "@/lib/validations/email-template";

export function EmailTemplateForm({
  templateKey,
  subject,
  body,
  tokens,
}: {
  templateKey: string;
  subject: string;
  body: string;
  tokens: string[];
}) {
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    const issue = explainEmailDraft({
      key: templateKey,
      subject: String(data.get("subject") ?? ""),
      body: String(data.get("body") ?? ""),
    });
    if (issue) {
      event.preventDefault();
      setError(issue);
    }
  }

  return (
    <>
      {error ? <AdminAlert variant="error">{error}</AdminAlert> : null}
      <form action={saveEmailTemplate} onSubmit={handleSubmit} className="mt-6 space-y-6">
        <input type="hidden" name="key" value={templateKey} />
        <AdminFormSection
          title="Treść wychodząca"
          description="Kliknij pigułkę, żeby wstawić pole klienta. Klamry muszą zostać — inaczej każdy dostanie ten sam tekst."
        >
          <AdminField label="Temat" htmlFor="subject">
            <CmsTokenField id="subject" name="subject" defaultValue={subject} tokens={tokens} required />
          </AdminField>
          <AdminField
            label="Treść HTML"
            htmlFor="body"
            hint="Możesz używać <p>, <strong>, <h1>. Stopka z adresem pracowni dopisuje się sama."
          >
            <CmsTokenField id="body" name="body" defaultValue={body} tokens={tokens} multiline rows={14} required />
          </AdminField>
        </AdminFormSection>
        <AdminFormActions submitLabel="Zapisz szablon" cancelHref="/admin/emaile" cancelLabel="← Lista maili" />
      </form>
      <form action={restoreEmailTemplate} className="mt-3">
        <input type="hidden" name="key" value={templateKey} />
        <button type="submit" className="text-xs text-czarny/45 underline-offset-2 hover:text-czerwony hover:underline">
          Przywróć wzorzec
        </button>
      </form>
    </>
  );
}
