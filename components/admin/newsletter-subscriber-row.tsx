"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { saveNewsletterSubscriber, type SubscriberSaveState } from "@/app/actions/admin-newsletter";
import { DeleteNewsletterButton } from "@/components/admin/delete-newsletter-button";
import { AdminInput } from "@/components/admin/ui/admin-field";
import type { NewsletterSubscriber } from "@/lib/types";

const initial: SubscriberSaveState = { ok: false };

export function NewsletterSubscriberRow({ row, stamp }: { row: NewsletterSubscriber; stamp: string }) {
  const router = useRouter();
  const [email, setEmail] = useState(row.email);
  const [consent, setConsent] = useState(row.consentMarketing);
  const [state, action, pending] = useActionState(saveNewsletterSubscriber, initial);

  useEffect(() => {
    setEmail(row.email);
    setConsent(row.consentMarketing);
  }, [row.email, row.consentMarketing]);

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [router, state.ok, state.message]);

  return (
    <tr className="border-t border-czarny/6">
      <td className="px-4 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <form action={action} className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <input type="hidden" name="currentEmail" value={row.email} />
            <AdminInput
              name="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="lg:max-w-xs"
              aria-label={`E-mail ${row.email}`}
            />
            <p className="text-xs text-czarny/45 lg:w-36">{stamp}</p>
            <p className="text-xs text-czarny/45 lg:w-32">{row.source}</p>
            <label className="flex items-center gap-2 text-sm text-czarny/80">
              <input type="hidden" name="consentMarketing" value="false" />
              <input
                type="checkbox"
                name="consentMarketing"
                value="true"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                className="accent-czerwony"
              />
              Zgoda
            </label>
            <button
              type="submit"
              disabled={pending}
              className="text-xs font-medium text-czarny/70 underline-offset-2 hover:text-czerwony hover:underline disabled:opacity-50"
            >
              {pending ? "Zapisuję…" : "Zapisz"}
            </button>
          </form>
          <DeleteNewsletterButton email={row.email} />
        </div>
        {state.message ? (
          <p className={`mt-1 text-xs ${state.ok ? "text-czarny/50" : "text-czerwony"}`}>{state.message}</p>
        ) : null}
      </td>
    </tr>
  );
}
