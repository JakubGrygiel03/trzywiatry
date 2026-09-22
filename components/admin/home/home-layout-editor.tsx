"use client";

import { ChevronDown, ChevronUp, Eye, EyeOff, GripVertical } from "lucide-react";
import { useState, type FormEvent } from "react";
import { saveHomeLayout } from "@/app/actions/admin-home";
import { HomeSectionFields } from "@/components/admin/home/home-section-fields";
import { AdminAlert } from "@/components/admin/ui/admin-alert";
import { AdminFormActions } from "@/components/admin/ui/admin-form-actions";
import { HOME_SECTION_LABELS, type HomeSection } from "@/lib/cms/home-layout";
import type { HeroPhotoOption } from "@/lib/data/queries";
import { explainHomeLayoutIssues } from "@/lib/validations/home-layout";
import { cn } from "@/lib/utils";

export function HomeLayoutEditor({
  initialSections,
  heroPhotos,
  promoCode,
}: {
  initialSections: HomeSection[];
  heroPhotos: HeroPhotoOption[];
  promoCode?: string;
}) {
  const [sections, setSections] = useState(initialSections);
  const [openId, setOpenId] = useState<string | null>(initialSections[0]?.id ?? null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const issue = explainHomeLayoutIssues(sections, promoCode);
    if (issue) {
      event.preventDefault();
      setError(issue);
    }
  }

  function move(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= sections.length) return;
    const copy = [...sections];
    const [item] = copy.splice(index, 1);
    copy.splice(next, 0, item!);
    setSections(copy);
  }

  function dropOn(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const from = sections.findIndex((s) => s.id === dragId);
    const to = sections.findIndex((s) => s.id === targetId);
    if (from < 0 || to < 0) return;
    const copy = [...sections];
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item!);
    setSections(copy);
    setDragId(null);
  }

  return (
    <form action={saveHomeLayout} onSubmit={handleSubmit} className="space-y-4 pb-28">
      {error ? <AdminAlert variant="error">{error}</AdminAlert> : null}
      <input type="hidden" name="sections" value={JSON.stringify(sections)} />
      <ul className="space-y-3">
        {sections.map((section, index) => {
          const open = openId === section.id;
          return (
            <li
              key={section.id}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => dropOn(section.id)}
              className={cn(
                "rounded-xl border bg-bialy",
                section.enabled ? "border-czarny/10" : "border-dashed border-czarny/20 opacity-70",
                dragId === section.id && "ring-2 ring-czerwony/30",
              )}
            >
              <div className="flex items-center gap-2 px-3 py-2.5">
                <button
                  type="button"
                  draggable
                  onDragStart={() => setDragId(section.id)}
                  onDragEnd={() => setDragId(null)}
                  className="cursor-grab text-czarny/30 hover:text-czarny"
                  aria-label="Przeciągnij sekcję"
                >
                  <GripVertical className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left text-sm font-medium text-czarny"
                  onClick={() => setOpenId(open ? null : section.id)}
                >
                  {HOME_SECTION_LABELS[section.type]}
                </button>
                <button type="button" onClick={() => move(index, -1)} aria-label="Wyżej" className="text-czarny/35 hover:text-czarny">
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => move(index, 1)} aria-label="Niżej" className="text-czarny/35 hover:text-czarny">
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSections((prev) =>
                      prev.map((item) => (item.id === section.id ? { ...item, enabled: !item.enabled } : item)),
                    )
                  }
                  aria-label={section.enabled ? "Ukryj" : "Pokaż"}
                  className={section.enabled ? "text-czerwony" : "text-czarny/30"}
                >
                  {section.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
              {open ? (
                <div className="border-t border-czarny/8 px-4 py-4">
                  <HomeSectionFields
                    section={section}
                    heroPhotos={heroPhotos}
                    onChange={(next) =>
                      setSections((prev) => prev.map((item) => (item.id === next.id ? next : item)))
                    }
                  />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      <AdminFormActions submitLabel="Zapisz układ" cancelHref="/admin" cancelLabel="← Pulpit" />
    </form>
  );
}
