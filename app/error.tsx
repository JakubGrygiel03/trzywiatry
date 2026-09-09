"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-heading text-2xl uppercase tracking-[0.1em]">Coś pękło w piecu</h1>
      <p className="text-sm text-szary">Spróbuj ponownie — to lokalny błąd renderowania, nie Twoje zamówienie.</p>
      <Button type="button" onClick={reset}>
        Spróbuj jeszcze raz
      </Button>
    </div>
  );
}
