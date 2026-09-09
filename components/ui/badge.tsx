import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "stone",
  className,
}: {
  children: ReactNode;
  tone?: "stone" | "clay" | "sold" | "low";
  className?: string;
}) {
  const tones = {
    stone: "bg-krem/90 text-czarny",
    clay: "bg-czerwony text-bialy",
    sold: "bg-czarny text-bialy",
    low: "bg-ceglany text-bialy",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 font-heading text-[10px] uppercase tracking-[0.16em] shadow-sm",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function PriceBubble({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded-full bg-czerwony px-3.5 py-1.5 font-heading text-[11px] uppercase tracking-[0.12em] text-bialy shadow-sm">
      {children}
    </span>
  );
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-5 md:px-8", className)}>{children}</div>;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl space-y-2">
      {eyebrow ? (
        <p className="font-heading text-[11px] uppercase tracking-[0.2em] text-czerwony">{eyebrow}</p>
      ) : null}
      <h2 className="font-heading text-2xl uppercase leading-[1.2] tracking-[0.06em] text-czarny md:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="max-w-xl text-base leading-relaxed text-czarny">{description}</p>
      ) : null}
    </div>
  );
}
