"use client";

import { useRef } from "react";
import { CmsTokenBar, insertAtCursor } from "@/components/admin/cms-token-bar";
import { AdminInput, AdminTextarea } from "@/components/admin/ui/admin-field";
import { tokenChip } from "@/lib/cms/tokens";

type CmsTokenFieldProps = {
  id: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  tokens: string[];
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  onChange?: (value: string) => void;
};

export function CmsTokenField({
  id,
  name,
  value,
  defaultValue,
  tokens,
  multiline,
  rows = 4,
  required,
  onChange,
}: CmsTokenFieldProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const chips = tokens.map(tokenChip);

  function insert(token: string) {
    const el = inputRef.current;
    if (!el) return;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? start;
    const next = insertAtCursor(el.value, token, start, end);
    if (onChange) {
      onChange(next);
    } else {
      el.value = next;
    }
    requestAnimationFrame(() => {
      const cursor = start + token.length;
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  }

  return (
    <div className="space-y-2">
      <CmsTokenBar tokens={chips} onInsert={insert} />
      {multiline ? (
        <AdminTextarea
          id={id}
          name={name}
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={value}
          defaultValue={value === undefined ? defaultValue : undefined}
          rows={rows}
          required={required}
          onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        />
      ) : (
        <AdminInput
          id={id}
          name={name}
          ref={inputRef as React.RefObject<HTMLInputElement>}
          value={value}
          defaultValue={value === undefined ? defaultValue : undefined}
          required={required}
          onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        />
      )}
    </div>
  );
}
