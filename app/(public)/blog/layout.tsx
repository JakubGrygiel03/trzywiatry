import type { ReactNode } from "react";

/** Cream canvas vs white nav — footer stays white on the parent shell. */
export default function BlogLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-full bg-krem">{children}</div>;
}
