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
          onChange={(event) => {
            const next = Math.min(Number(event.target.value), maxRef.current);
            minRef.current = next;
            setMinZl(next);
          }}
          onPointerUp={(event) => commit(Number(event.currentTarget.value), maxRef.current)}
          onKeyUp={(event) => commit(Number(event.currentTarget.value), maxRef.current)}
          className="price-range absolute inset-0 z-20 w-full appearance-none bg-transparent"
        />
        <input
          type="range"
          min={floorZl}
          max={ceilZl}
          value={maxZl}
          aria-label="Maksymalna cena"
          onChange={(event) => {
            const next = Math.max(Number(event.target.value), minRef.current);
            maxRef.current = next;
            setMaxZl(next);
          }}
          onPointerUp={(event) => commit(minRef.current, Number(event.currentTarget.value))}
          onKeyUp={(event) => commit(minRef.current, Number(event.currentTarget.value))}
          className="price-range absolute inset-0 z-10 w-full appearance-none bg-transparent"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <PriceField
          id="cena-od"
          label="Od"
          value={minZl}
          min={floorZl}
          max={ceilZl}
          onChange={(value) => {
            const next = Math.min(value, maxRef.current);
            minRef.current = next;
            setMinZl(next);
          }}
          onCommit={(value) => commit(value, maxRef.current)}
        />
        <PriceField
          id="cena-do"
          label="Do"
          value={maxZl}
          min={floorZl}
          max={ceilZl}
          onChange={(value) => {
            const next = Math.max(value, minRef.current);
            maxRef.current = next;
            setMaxZl(next);
          }}
          onCommit={(value) => commit(minRef.current, value)}
        />
      </div>
    </div>
  );
}

function PriceField({
  id,
  label,
  value,
  min,
  max,
  onChange,
  onCommit,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  onCommit: (value: number) => void;
}) {
  return (
    <label htmlFor={id} className="flex h-10 items-center gap-1.5 rounded-full border border-szary bg-krem px-3">
      <span className="font-heading text-[9px] uppercase tracking-[0.14em] text-czerwony">{label}</span>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        aria-label={`${label} cena`}
        onChange={(event) => onChange(Number(event.target.value) || min)}
        onBlur={(event) => onCommit(Number(event.target.value) || min)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }
        }}
        className="w-full bg-transparent text-sm text-czarny outline-none"
      />
      <span className="text-xs text-czarny/45">zł</span>
    </label>
  );
}
