"use client";

import { deleteNewsletterSubscriber } from "@/app/actions/admin-newsletter";

export function DeleteNewsletterButton({ email }: { email: string }) {
  return (
    <form
      action={deleteNewsletterSubscriber}
      onSubmit={(event) => {
        if (!window.confirm(`Usunąć ${email} z newslettera? Osoba nie dostanie kolejnych wysyłek.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="email" value={email} />
      <button
        type="submit"
        className="text-xs font-medium text-czerwony/80 underline-offset-2 hover:underline"
      >
        Usuń
      </button>
    </form>
  );
}
