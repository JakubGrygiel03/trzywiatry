"use client";

import { useActionState, useState } from "react";
import { sendNewsletterBroadcast, type BroadcastState } from "@/app/actions/admin-newsletter";
import { AdminAlert } from "@/components/admin/ui/admin-alert";
import { AdminField, AdminInput, AdminTextarea } from "@/components/admin/ui/admin-field";
import { AdminFormSection } from "@/components/admin/ui/admin-form-section";

const initial: BroadcastState = { ok: false };

export function NewsletterBroadcastForm({
  consentingCount,
  skippedCount,
}: {
  consentingCount: number;
  skippedCount: number;
}) {
  const [state, action, pending] = useActionState(sendNewsletterBroadcast, initial);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  return (
    <AdminFormSection
      title="Wiadomość do listy"
      description="Temat i treść zostają w polach, gdy walidacja wywali błąd. Wysyłka idzie tylko do osób ze zgodą. Zwykły tekst — bez HTML."
    >
      {state.message ? (
        <AdminAlert variant={state.ok ? "success" : "error"}>{state.message}</AdminAlert>
      ) : null}
      {skippedCount > 0 ? (
        <p className="text-xs text-czarny/45">
          {skippedCount} {skippedCount === 1 ? "adres bez zgody — pominiemy go" : "adresów bez zgody — pominiemy je"} przy
          wysyłce.
        </p>
      ) : null}

      <form
        action={action}
        className="space-y-5"
        onSubmit={(event) => {
          const intent = (event.nativeEvent as SubmitEvent).submitter;
          const value = intent instanceof HTMLButtonElement ? intent.value : "";
          if (value === "preview") {
            if (!window.confirm("Wysłać próbkę na e-mail administratora?")) event.preventDefault();
            return;
          }
          if (!window.confirm(`Wysłać ten list do ${consentingCount} osób ze zgodą?`)) {
            event.preventDefault();
          }
        }}
      >
        <AdminField label="Temat" htmlFor="newsletter-subject" required>
          <AdminInput
            id="newsletter-subject"
            name="subject"
            required
            maxLength={120}
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="Nowy wypust z pieca"
          />
        </AdminField>
        <AdminField
          label="Treść"
          htmlFor="newsletter-body"
          required
          hint="Pusta linia = nowy akapit. Przy błędzie walidacji tekst zostaje."
        >
          <AdminTextarea
            id="newsletter-body"
            name="body"
            required
            rows={8}
            maxLength={4000}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder={"Cześć,\n\nW pracowni pojawiły się nowe czarki…"}
          />
        </AdminField>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            name="intent"
            value="send"
            disabled={pending || consentingCount < 1}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-czarny px-5 text-sm font-medium text-bialy transition hover:bg-czerwony disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Wysyłam…" : `Wyślij do ${consentingCount} ${consentingCount === 1 ? "osoby" : "osób"}`}
          </button>
          <button
            type="submit"
            name="intent"
            value="preview"
            disabled={pending}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-czarny/12 bg-bialy px-5 text-sm font-medium text-czarny/80 transition hover:border-czerwony hover:text-czerwony disabled:opacity-50"
          >
            Wyślij próbkę do mnie
          </button>
        </div>
      </form>
    </AdminFormSection>
  );
}
