import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type AdminStatCardProps = {
  label: string;
  value: string;
  hint?: string;
  href?: string;
  icon?: LucideIcon;
  tone?: "default" | "warn" | "ok";
};

export function AdminStatCard({
  label,
  value,
  hint,
  href,
  icon: Icon,
  tone = "default",
}: AdminStatCardProps) {
  const body = (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-bialy p-4 shadow-[0_1px_0_rgb(1_1_1/0.04)] transition",
        href && "hover:border-czerwony/35 hover:shadow-sm",
        tone === "warn" && "border-ceglany/40",
        tone === "ok" && "border-czarny/8",
        tone === "default" && "border-czarny/8",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-czarny/45">{label}</p>
          <p className="mt-2 font-heading text-2xl tracking-tight text-czarny">{value}</p>
          {hint ? <p className="mt-1 text-xs text-czarny/45">{hint}</p> : null}
        </div>
        {Icon ? (
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg",
              tone === "warn" ? "bg-ceglany/15 text-czerwony" : "bg-krem text-czarny/55",
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={1.75} />
          </span>
        ) : null}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block outline-none focus-visible:ring-2 focus-visible:ring-czerwony/40">
        {body}
      </Link>
    );
  }

  return body;
}
