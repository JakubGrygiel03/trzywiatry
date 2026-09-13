"use client";

import { BLOG_COVER_BACKDROPS, type BlogCoverBackdrop } from "@/lib/blog-cover";
import { cn } from "@/lib/utils";

export function CoverBackdropField({
  value,
  onChange,
}: {
  value: BlogCoverBackdrop;
  onChange: (value: BlogCoverBackdrop) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-medium text-czarny">Tło za zdjęciem</legend>
      <input type="hidden" name="coverBackdrop" value={value} />
      <div className="flex flex-wrap gap-2">
        {(Object.keys(BLOG_COVER_BACKDROPS) as BlogCoverBackdrop[]).map((key) => {
          const option = BLOG_COVER_BACKDROPS[key];
          const active = value === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs",
                active ? "border-czerwony text-czerwony" : "border-czarny/12 text-czarny/70",
              )}
              aria-pressed={active}
            >
              <span className={cn("size-4 rounded-full border border-czarny/10", option.className)} />
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
