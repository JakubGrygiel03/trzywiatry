import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type AdminPanelProps = {
  title: string;
  description?: string;
  action?: { href: string; label: string };
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
};

/** Card panel used on dashboard / list screens (Woo widget pattern). */
export function AdminPanel({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: AdminPanelProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-czarny/8 bg-bialy shadow-[0_1px_0_rgb(1_1_1/0.04)]",
        className,
      )}
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-czarny/6 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-czarny">{title}</h2>
          {description ? <p className="mt-0.5 text-xs text-czarny/45">{description}</p> : null}
        </div>
        {action ? (
          <Link
            href={action.href}
            className="text-xs font-medium text-czerwony underline-offset-2 hover:underline"
          >
            {action.label}
          </Link>
        ) : null}
      </header>
      <div className={cn("p-4", bodyClassName)}>{children}</div>
    </section>
  );
}
