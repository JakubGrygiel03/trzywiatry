"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { onProductNavigateClick } from "@/lib/scroll-to-top";
import { trackShopEvent } from "@/lib/track-client";

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
    <Link
      href={href}
      prefetch
      onClick={() => {
        onProductNavigateClick();
        const slug = href.match(/^\/sklep\/([a-z0-9-]+)/i)?.[1];
        if (slug) trackShopEvent("product_click", { slug, path: href });
      }}
      className={className}
    >
      {children}
    </Link>
  );
}
