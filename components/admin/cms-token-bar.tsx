"use client";

import { wrapToken, type CmsToken } from "@/lib/cms/tokens";

export function CmsTokenBar({
  tokens,
  onInsert,
}: {
  tokens: CmsToken[];
  onInsert: (token: string) => void;
}) {
  if (tokens.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <p className="text-xs leading-relaxed text-czarny/50">
        Kliknij pigułkę, żeby wstawić pole. Zostaw klamry — inaczej każdy klient dostanie ten sam tekst.
      </p>
      <div className="flex flex-wrap gap-1.5">
        {tokens.map((token) => (
          <button
            key={token.key}
            type="button"
            onClick={() => onInsert(wrapToken(token.key))}
            className="inline-flex items-center gap-1.5 rounded-full border border-czerwony/25 bg-krem px-2.5 py-1 font-heading text-[10px] uppercase tracking-[0.12em] text-czerwony transition hover:border-czerwony hover:bg-czerwony hover:text-bialy"
          >
            {wrapToken(token.key)}
            <span className="normal-case tracking-normal text-czarny/45 hover:text-inherit">{token.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function insertAtCursor(
  value: string,
  token: string,
  start: number,
  end: number,
) {
  return `${value.slice(0, start)}${token}${value.slice(end)}`;
}
