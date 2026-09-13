"use client";

import { useState, type FormEvent } from "react";
import { saveContentPage } from "@/app/actions/admin-content-pages";
import { AboutOverlayFields } from "@/components/admin/content-pages/about-overlay-fields";
import { B2BOverlayFields } from "@/components/admin/content-pages/b2b-overlay-fields";
import { ContactOverlayFields } from "@/components/admin/content-pages/contact-overlay-fields";
import { AdminAlert } from "@/components/admin/ui/admin-alert";
import { AdminFormActions } from "@/components/admin/ui/admin-form-actions";
import type { AboutOverlay, B2BOverlay, ContactOverlay, ContentOverlayMap, ContentPageKey } from "@/lib/cms/content-pages";
import { explainContentOverlayIssue } from "@/lib/validations/content-pages";

export function ContentPageEditor<K extends ContentPageKey>({
  pageKey,
  initial,
}: {
  pageKey: K;
  initial: ContentOverlayMap[K];
}) {
  const [overlay, setOverlay] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const issue = explainContentOverlayIssue(pageKey, overlay);
    if (issue) {
      event.preventDefault();
      setError(issue);
    }
  }

  return (
    <form action={saveContentPage} onSubmit={handleSubmit} className="space-y-5">
      {error ? <AdminAlert variant="error">{error}</AdminAlert> : null}
      <input type="hidden" name="pageKey" value={pageKey} />
      <input type="hidden" name="overlay" value={JSON.stringify(overlay)} />
      {pageKey === "b2b" ? (
        <B2BOverlayFields value={overlay as B2BOverlay} onChange={(next) => setOverlay(next as ContentOverlayMap[K])} />
      ) : null}
      {pageKey === "o-nas" ? (
        <AboutOverlayFields value={overlay as AboutOverlay} onChange={(next) => setOverlay(next as ContentOverlayMap[K])} />
      ) : null}
      {pageKey === "kontakt" ? (
        <ContactOverlayFields value={overlay as ContactOverlay} onChange={(next) => setOverlay(next as ContentOverlayMap[K])} />
      ) : null}
      <AdminFormActions submitLabel="Zapisz nakładkę" cancelHref="/admin/strony" cancelLabel="← Strony" />
    </form>
  );
}
