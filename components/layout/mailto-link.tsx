"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/** mailto + clipboard — many devices have no mail app, so a bare mailto looks “dead”. */
export function MailtoLink({
  email,
  className,
  children,
}: {
  email: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  async function onClick() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      /* clipboard blocked — mailto still runs */
    }
  }

  return (
    <a
      href={`mailto:${email}`}
      onClick={onClick}
      className={cn("relative z-[1] transition-colors hover:text-czerwony", className)}
      title={copied ? "Adres skopiowany" : `Napisz na ${email} (klik też kopiuje adres)`}
      aria-label={copied ? "Adres e-mail skopiowany" : `Wyślij e-mail na ${email}`}
    >
      {copied ? "Skopiowano adres" : (children ?? email)}
    </a>
  );
}
