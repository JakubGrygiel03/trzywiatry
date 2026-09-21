"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { onProductNavigateClick } from "@/lib/scroll-to-top";

/**
 * Product → product soft nav: Next.js `scroll` often fails on same-segment
 * /sklep/[slug] → /sklep/[other]. We own scroll via onProductNavigateClick.
 */
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
    <Link href={href} prefetch scroll={false} onClick={onProductNavigateClick} className={className}>
      {children}
    </Link>
  );
}
