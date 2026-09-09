import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type AdminFormActionsProps = {
  submitLabel: string;
  cancelHref?: string;
  cancelLabel?: string;
  extra?: ReactNode;
};

export function AdminFormActions({
  submitLabel,
  cancelHref,
  cancelLabel = "Anuluj",
  extra,
}: AdminFormActionsProps) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-6 border-t border-czarny/8 bg-bialy/95 px-4 py-4 backdrop-blur md:-mx-6 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" size="md">
            {submitLabel}
          </Button>
          {cancelHref ? (
            <Link
              href={cancelHref}
              className="rounded-full px-4 py-2 text-sm text-czarny/55 transition hover:text-czerwony"
            >
              {cancelLabel}
            </Link>
          ) : null}
        </div>
        {extra}
      </div>
    </div>
  );
}
