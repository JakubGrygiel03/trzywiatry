import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-2xl border border-czarny/10 bg-bialy px-4 text-sm outline-none transition-colors placeholder:text-szary focus:border-czerwony",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full rounded-2xl border border-czarny/10 bg-bialy px-4 py-3 text-sm outline-none transition-colors placeholder:text-szary focus:border-czerwony",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn("font-heading text-[11px] uppercase tracking-[0.16em] text-szary", className)}
      {...props}
    />
  );
}
