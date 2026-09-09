"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function CatalogPagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const params = useSearchParams();

  if (totalPages <= 1) return null;

  function hrefFor(nextPage: number) {
    const next = new URLSearchParams(params.toString());
    if (nextPage <= 1) next.delete("strona");
    else next.set("strona", String(nextPage));
    const query = next.toString();
    return query ? `/sklep?${query}` : "/sklep";
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Paginacja">
      <PageLink href={hrefFor(Math.max(1, page - 1))} disabled={page <= 1} label="Poprzednia">
        &lt;
      </PageLink>
      {pages.map((n) => (
        <PageLink key={n} href={hrefFor(n)} active={n === page} label={`Strona ${n}`}>
          {n}
        </PageLink>
      ))}
      <PageLink
        href={hrefFor(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        label="Następna"
      >
        &gt;
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  children,
  active,
  disabled,
  label,
}: {
  href: string;
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
  label: string;
}) {
  if (disabled) {
    return (
      <span
        className="flex h-9 w-9 items-center justify-center border border-czarny/10 text-sm text-szary"
        aria-disabled
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-9 w-9 items-center justify-center border text-sm transition-colors",
        active
          ? "border-ceglany/50 bg-ceglany/25 text-czarny"
          : "border-czarny/10 text-czarny hover:border-czerwony hover:text-czerwony",
      )}
    >
      {children}
    </Link>
  );
}
