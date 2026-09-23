"use client";

import { P24HandoffNotice } from "@/components/checkout/p24-handoff-notice";
import { useP24Handoff } from "@/lib/p24-handoff";

/** Covers checkout / cart chrome so “koszyk pusty” cannot paint during P24 assign. */
export function P24HandoffOverlay() {
  const handingOff = useP24Handoff();
  if (!handingOff) return null;

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center bg-bialy px-6"
      role="status"
      aria-live="assertive"
    >
      <div className="w-full max-w-lg">
        <P24HandoffNotice />
      </div>
    </div>
  );
}
