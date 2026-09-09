import type { ReactNode } from "react";

/** Cream canvas vs white nav — same split as /sklep. */
export default function AboutLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-full bg-krem">{children}</div>;
}
