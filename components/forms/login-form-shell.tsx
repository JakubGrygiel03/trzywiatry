"use client";

import { useState, type FormEvent, type ReactNode } from "react";

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
  const [emptyError, setEmptyError] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    if (!email || !password) {
      event.preventDefault();
      setEmptyError(emptyMessage);
      return;
    }
    setEmptyError("");
  }

  return (
    <form action={action} method="post" noValidate className={className} onSubmit={onSubmit}>
      {children}
      {emptyError ? <p className="text-sm text-czerwony">{emptyError}</p> : null}
    </form>
  );
}
