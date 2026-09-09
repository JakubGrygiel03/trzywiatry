import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AdminFormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function AdminFormSection({ title, description, children, className }: AdminFormSectionProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-czarny/8 bg-bialy p-5 shadow-[0_1px_0_rgb(1_1_1/0.04)] md:p-6",
        className,
      )}
    >
      <header className="mb-5 border-b border-czarny/6 pb-4">
        <h2 className="text-base font-semibold text-czarny">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-relaxed text-czarny/50">{description}</p> : null}
      </header>
      <div className="space-y-5">{children}</div>
    </section>
  );
}
