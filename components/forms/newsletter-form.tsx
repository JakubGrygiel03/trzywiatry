"use client";

import { useActionState } from "react";
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

  return (
    <form action={action} className="flex w-full flex-col gap-2" noValidate>
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
          disabled={pending}
          className="shrink-0 sm:mt-0 sm:px-5"
        >
          {pending ? "Zapisuję…" : buttonLabel}
        </Button>
      </div>
      {state.message ? (
        <p className={cn("text-xs", tone === "dark" ? "text-ceglany" : "text-czerwony")}>{state.message}</p>
      ) : null}
    </form>
  );
}
