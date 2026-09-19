"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { emailLiveError } from "@/lib/validations/live-fields";

export function LoginFormShell({
  action,
  emptyMessage,
  className,
  children,
}: {
  action: string;
  emptyMessage: string;
  className?: string;
  children: ReactNode;
}) {
  const [formError, setFormError] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const emailErr = emailLiveError(email, { required: true, touched: true });
    if (emailErr) {
      event.preventDefault();
      setFormError(emailErr);
      return;
    }
    if (!password) {
      event.preventDefault();
      setFormError(emptyMessage);
      return;
    }
    setFormError("");
  }

  return (
    <form action={action} method="post" noValidate className={className} onSubmit={onSubmit}>
      {children}
      {formError ? <p className="text-sm text-czerwony">{formError}</p> : null}
    </form>
  );
}
