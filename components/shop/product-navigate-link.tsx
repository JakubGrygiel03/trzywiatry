"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { onProductNavigateClick } from "@/lib/scroll-to-top";

/**
 * Catalog → PDP and PDP → PDP. Next.js default scroll={true} resets window Y.
 * onProductNavigateClick is a backup for same-segment /sklep/[slug] swaps.
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
    <Link href={href} prefetch onClick={onProductNavigateClick} className={className}>
      {children}
    </Link>
  );
}
