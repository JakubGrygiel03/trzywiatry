"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { onProductNavigateClick } from "@/lib/scroll-to-top";

/** Client Link wrapper — scroll-to-top on product→product soft navigations. */
export function ProductNavigateLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} prefetch scroll onClick={onProductNavigateClick} className={className}>
      {children}
    </Link>
  );
}
