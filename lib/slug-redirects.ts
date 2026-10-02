import "server-only";

import { runtimeStore } from "@/lib/data/runtime-store";
import type { SlugRedirect } from "@/lib/types";

function list() {
  if (!Array.isArray(runtimeStore.slugRedirects)) runtimeStore.slugRedirects = [];
  return runtimeStore.slugRedirects;
}

export function recordSlugRedirect(kind: SlugRedirect["kind"], from: string, to: string) {
  if (!from || !to || from === to) return;
  const rows = list().filter((row) => !(row.kind === kind && row.from === from));
  rows.push({ kind, from, to });
  for (const row of rows) {
    if (row.kind === kind && row.to === from) row.to = to;
  }
  runtimeStore.slugRedirects = rows;
}

export function resolveSlugRedirect(kind: SlugRedirect["kind"], from: string) {
  return list().find((row) => row.kind === kind && row.from === from)?.to;
}
