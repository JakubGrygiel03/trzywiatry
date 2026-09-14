import type { ReactNode } from "react";

/** Cream canvas vs white nav — same split as /sklep and /o-nas. */
export default function B2BLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-full bg-krem">{children}</div>;
}
