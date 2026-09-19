"use client";

import { useEffect, useRef, useState } from "react";

export function PriceFilter({
  floorZl,
  ceilZl,
  initialMin,
  initialMax,
  onCommit,
}: {
  floorZl: number;
  ceilZl: number;
  initialMin: number;
  initialMax: number;
  onCommit: (minZl: number, maxZl: number) => void;
}) {
  const [minZl, setMinZl] = useState(initialMin);
  const [maxZl, setMaxZl] = useState(initialMax);
  const minRef = useRef(initialMin);
  const maxRef = useRef(initialMax);

  useEffect(() => {
    minRef.current = initialMin;
    maxRef.current = initialMax;
    setMinZl(initialMin);
    setMaxZl(initialMax);
  }, [initialMin, initialMax]);

  const span = Math.max(ceilZl - floorZl, 1);
  const leftPct = ((minZl - floorZl) / span) * 100;
  const rightPct = ((maxZl - floorZl) / span) * 100;

  function clampPair(nextMin: number, nextMax: number) {
    const lo = Math.min(Math.max(nextMin, floorZl), ceilZl);
    const hi = Math.min(Math.max(nextMax, floorZl), ceilZl);
    if (lo <= hi) return { min: lo, max: hi };
    return { min: hi, max: lo };
  }

  function commit(nextMin: number, nextMax: number) {
    const pair = clampPair(nextMin, nextMax);
    minRef.current = pair.min;
    maxRef.current = pair.max;
    setMinZl(pair.min);
    setMaxZl(pair.max);
    onCommit(pair.min, pair.max);
  }

  function setMinLive(next: number) {
    const value = Math.min(next, maxRef.current);
    minRef.current = value;
    setMinZl(value);
  }

  function setMaxLive(next: number) {
    const value = Math.max(next, minRef.current);
    maxRef.current = value;
    setMaxZl(value);
  }

  return (
    <div className="space-y-3">
      <div className="relative h-5">
        <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-krem-ciemny" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-czerwony"
          style={{ left: `${leftPct}%`, width: `${Math.max(rightPct - leftPct, 0)}%` }}
        />
        <input
          type="range"
          min={floorZl}
          max={ceilZl}
          value={minZl}
          aria-label="Minimalna cena"
          onChange={(event) => setMinLive(Number(event.target.value))}
          onPointerUp={() => commit(minRef.current, maxRef.current)}
          onKeyUp={() => commit(minRef.current, maxRef.current)}
          className={`price-range absolute inset-0 w-full appearance-none bg-transparent ${
            minZl > maxZl - (span > 40 ? 8 : 2) ? "z-10" : "z-20"
          }`}
        />
        <input
          type="range"
          min={floorZl}
          max={ceilZl}
          value={maxZl}
          aria-label="Maksymalna cena"
          onChange={(event) => setMaxLive(Number(event.target.value))}
          onPointerUp={() => commit(minRef.current, maxRef.current)}
          onKeyUp={() => commit(minRef.current, maxRef.current)}
          className={`price-range absolute inset-0 w-full appearance-none bg-transparent ${
            minZl > maxZl - (span > 40 ? 8 : 2) ? "z-30" : "z-10"
          }`}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <PriceField
          id="cena-od"
          label="Od"
          value={minZl}
          fallback={floorZl}
          onCommit={(value) => commit(value, maxRef.current)}
        />
        <PriceField
          id="cena-do"
          label="Do"
          value={maxZl}
          fallback={ceilZl}
          onCommit={(value) => commit(minRef.current, value)}
        />
      </div>
    </div>
  );
}

/** Draft text while typing — empty field is allowed until blur/Enter. */
function PriceField({
  id,
  label,
  value,
  fallback,
  onCommit,
}: {
  id: string;
  label: string;
  value: number;
  fallback: number;
  onCommit: (value: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setDraft(String(value));
  }, [value]);

  function finish() {
    focused.current = false;
    const parsed = draft.trim() === "" ? fallback : Number(draft);
    const next = Number.isFinite(parsed) ? Math.floor(parsed) : fallback;
    setDraft(String(next));
    onCommit(next);
  }

  return (
    <label htmlFor={id} className="flex h-10 items-center gap-1.5 rounded-full border border-szary bg-krem px-3">
      <span className="font-heading text-[9px] uppercase tracking-[0.14em] text-czerwony">{label}</span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={draft}
        aria-label={`${label} cena`}
        onFocus={() => {
          focused.current = true;
        }}
        onChange={(event) => {
          // Allow wipe + retype (e.g. 60 → "" → 100). Digits only.
          setDraft(event.target.value.replace(/\D/g, ""));
        }}
        onBlur={finish}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }
        }}
        className="w-full bg-transparent text-sm text-czarny outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <span className="text-xs text-czarny/45">zł</span>
    </label>
  );
}
