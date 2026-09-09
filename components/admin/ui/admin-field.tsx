import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AdminFieldProps = {
  label: string;
  htmlFor?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
};

export function AdminField({ label, htmlFor, hint, required, children, className }: AdminFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-czarny/85"
      >
        {label}
        {required ? <span className="ml-0.5 text-czerwony">*</span> : null}
      </label>
      {children}
      {hint ? <p className="text-xs leading-relaxed text-czarny/45">{hint}</p> : null}
    </div>
  );
}

export function AdminSelect({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-lg border border-czarny/12 bg-bialy px-3 text-sm text-czarny outline-none transition focus:border-czerwony focus:ring-2 focus:ring-czerwony/15",
        className,
      )}
      {...props}
    />
  );
}

export function AdminInput({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-lg border border-czarny/12 bg-bialy px-3 text-sm text-czarny outline-none transition placeholder:text-czarny/35 focus:border-czerwony focus:ring-2 focus:ring-czerwony/15",
        className,
      )}
      {...props}
    />
  );
}

export function AdminTextarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-lg border border-czarny/12 bg-bialy px-3 py-2.5 text-sm text-czarny outline-none transition placeholder:text-czarny/35 focus:border-czerwony focus:ring-2 focus:ring-czerwony/15",
        className,
      )}
      {...props}
    />
  );
}
