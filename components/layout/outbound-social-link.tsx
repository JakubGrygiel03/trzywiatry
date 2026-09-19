"use client";

import type { ReactNode, MouseEvent } from "react";
import { cn } from "@/lib/utils";

function isFacebookHost(href: string) {
  try {
    const host = new URL(href).hostname.replace(/^www\./, "");
    return host === "facebook.com" || host === "m.facebook.com" || host === "fb.com";
  } catch {
    return false;
  }
}

/**
 * Social outbound link. Messenger / Facebook in-app browsers often block
 * target=_blank for facebook.com — those open in the same WebView instead.
 */
export function OutboundSocialLink({
  href,
  className,
  children,
  "aria-label": ariaLabel,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
}) {
  const facebook = isFacebookHost(href);

  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!facebook) return;
    event.preventDefault();
    window.location.assign(href);
  }

  return (
    <a
      href={href}
      target={facebook ? undefined : "_blank"}
      rel="noopener noreferrer"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(className)}
    >
      {children}
    </a>
  );
}
