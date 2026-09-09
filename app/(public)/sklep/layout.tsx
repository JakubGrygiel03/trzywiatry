import type { ReactNode } from "react";

/** Cream canvas vs white nav — shop reads as the atelier floor, not the header. */
export default function ShopLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-full bg-krem">{children}</div>;
}
