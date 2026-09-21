"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * After P24 return the webhook can lag a few seconds — soft-refresh while still pending.
 */
export function PendingPaymentRefresh({ pending }: { pending: boolean }) {
  const router = useRouter();
  const ticks = useRef(0);

  useEffect(() => {
    if (!pending) return;
    const id = window.setInterval(() => {
      ticks.current += 1;
      if (ticks.current > 15) {
        window.clearInterval(id);
        return;
      }
      router.refresh();
    }, 2000);
    return () => window.clearInterval(id);
  }, [pending, router]);

  if (!pending) return null;

  return (
    <p className="rounded-[20px] border border-czerwony/15 bg-krem/80 px-4 py-3 text-sm text-czarny/70">
      Sprawdzamy płatność w Przelewy24… Status odświeży się automatycznie, gdy przelew / BLIK zostanie
      potwierdzony.
    </p>
  );
}
