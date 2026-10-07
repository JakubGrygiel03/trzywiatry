/** Pixel heights — percent of a flex child collapses to 0 and looks like an empty chart. */
const TRACK_PX = 128;

export function AdminDayBars({
  days,
}: {
  days: { key: string; label: string; value: number; title?: string; caption?: string }[];
}) {
  const max = Math.max(1, ...days.map((day) => day.value));
  const peak = days.reduce((best, day) => (day.value > best.value ? day : best), days[0]);
  const hasData = Boolean(peak && peak.value > 0);

  return (
    <div className="space-y-3">
      {hasData && peak ? (
        <p className="text-[11px] text-czarny/50">
          Szczyt: <span className="font-medium text-czarny/80">{peak.caption ?? peak.value}</span>
          <span className="text-czarny/40"> · {peak.label}</span>
        </p>
      ) : null}
      <div className="flex items-end gap-1.5" style={{ height: TRACK_PX + 36 }}>
        {days.map((day) => {
          const bar = day.value > 0 ? Math.max(12, Math.round((day.value / max) * TRACK_PX)) : 3;
          const caption = day.caption ?? String(day.value);
          return (
            <div
              key={day.key}
              className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1 self-stretch"
              title={day.title ?? `${day.label}: ${caption}`}
            >
              <span
                className={`max-w-full truncate text-center font-mono text-[10px] leading-none tabular-nums ${
                  day.value > 0 ? "text-czarny/80" : "text-czarny/30"
                }`}
              >
                {caption}
              </span>
              <div
                className={`w-full rounded-t ${day.value > 0 ? "bg-czerwony/80" : "bg-szary/40"}`}
                style={{ height: bar }}
              />
              <span className="truncate text-[9px] text-czarny/40">{day.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
