"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { forceDocumentTop } from "@/lib/scroll-to-top";

/** Client Link — pin top when opening a glaze from mid-page home section. */
export function GlazeNavigateLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      prefetch
      scroll
      onClick={() => {
        forceDocumentTop();
        window.requestAnimationFrame(forceDocumentTop);
      }}
      className={className}
    >
      {children}
    </Link>
  );
}
