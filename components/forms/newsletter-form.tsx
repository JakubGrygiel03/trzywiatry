"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { subscribeNewsletter } from "@/app/actions/newsletter";
import { EmailField } from "@/components/forms/email-field";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const initial = { ok: false, message: "" };

export function NewsletterForm({
  tone = "light",
  buttonLabel = "Odbierz −15%",
}: {
  tone?: "light" | "dark";
  buttonLabel?: string;
}) {
  const [state, action, pending] = useActionState(subscribeNewsletter, initial);
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const muted = tone === "dark" ? "text-bialy/70" : "text-czarny/55";

  return (
    <form
      action={action}
      className="flex w-full flex-col gap-3"
      noValidate
      onSubmit={(event) => {
        if (pending) {
          event.preventDefault();
          return;
        }
        if (!consent) {
          event.preventDefault();
          setConsentError(true);
        }
      }}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <EmailField
          name="email"
          label="E-mail newslettera"
          hideLabel
          placeholder="jan@example.pl"
          className="min-w-0 flex-1 space-y-1"
          inputClassName={cn(
            "bg-bialy",
            tone === "dark" &&
              "border-bialy/35 bg-bialy text-czarny placeholder:text-czarny/40 focus:border-ceglany",
          )}
        />
        <Button
          type="submit"
          variant="secondary"
          size="md"
          disabled={pending || !consent}
          className="shrink-0 sm:mt-0 sm:px-5"
        >
          {pending ? "Zapisuję…" : buttonLabel}
        </Button>
      </div>
      <label className={cn("flex items-start gap-2 text-left text-[11px] leading-relaxed", muted)}>
        <input
          type="checkbox"
          name="consent"
          value="on"
          required
          checked={consent}
          onChange={(event) => {
            setConsent(event.target.checked);
            if (event.target.checked) setConsentError(false);
          }}
          className="mt-0.5 accent-czerwony"
        />
        <span>
          Chcę dostawać newsletter Trzy Wiatry (nowości i promocje) na podany adres i jednorazowy kod −15%. Zgodę mogę
          wycofać w każdej chwili.
        </span>
      </label>
      {consentError || !consent ? (
        <p className={cn("text-[11px] leading-relaxed", consentError ? "text-czerwony" : muted)}>
          Zaznacz zgodę, żeby zapisać adres i dostać kod rabatowy. Bez zgody nic nie zapisujemy i nic nie wysyłamy.
        </p>
      ) : null}
      <p className={cn("text-[11px] leading-relaxed", muted)}>
        Szczegóły:{" "}
        <Link href="/polityka-prywatnosci" className="underline underline-offset-2 hover:text-czerwony">
          Polityka prywatności
        </Link>
        .
      </p>
      {state.message ? (
        <p className={cn("text-xs", state.ok ? "text-czarny/70" : tone === "dark" ? "text-ceglany" : "text-czerwony")}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
