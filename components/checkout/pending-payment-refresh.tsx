"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const TICK_MS = 2000;
const MAX_TICKS = 15;

/**
 * After P24 return the webhook can lag a few seconds — poll P24 via RSC refresh.
 * Stops after ~30s so we never promise a refresh that already ended.
 */
export function PendingPaymentRefresh({ active }: { active: boolean }) {
  const router = useRouter();
  const ticks = useRef(0);
  const [stopped, setStopped] = useState(false);

  useEffect(() => {
    if (!active) return;
    ticks.current = 0;
    setStopped(false);
    const id = window.setInterval(() => {
      ticks.current += 1;
      if (ticks.current > MAX_TICKS) {
        window.clearInterval(id);
        setStopped(true);
        return;
      }
      router.refresh();
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [active, router]);

  if (!active) return null;

  return (
    <p className="rounded-[20px] border border-czerwony/15 bg-krem/80 px-4 py-3 text-sm text-czarny/70">
      {stopped
        ? "Minęło pół minuty, a płatność nadal nie jest potwierdzona. Odśwież stronę później albo wróć tu z maila. Przy zwykłym przelewie bankowym wpływ często przychodzi z opóźnieniem."
        : "Przez około 30 sekund sprawdzamy, czy płatność doszła. Przy BLIK-u i karcie status zmieni się sam. Przy przelewie bywa dłużej — wtedy wróć na tę stronę za chwilę."}
    </p>
  );
}
