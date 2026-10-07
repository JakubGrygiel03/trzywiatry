/** Pixel heights — percent of a flex child collapses to 0 and looks like an empty chart. */
const TRACK_PX = 128;

export function AdminDayBars({
  days,
}: {
  days: { key: string; label: string; value: number; title?: string }[];
}) {
  const max = Math.max(1, ...days.map((day) => day.value));

  return (
    <div className="flex items-end gap-1.5" style={{ height: TRACK_PX + 18 }}>
      {days.map((day) => {
        const bar = day.value > 0 ? Math.max(10, Math.round((day.value / max) * TRACK_PX)) : 3;
        return (
          <div key={day.key} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1 self-stretch">
            <div
              className={`w-full rounded-t ${day.value > 0 ? "bg-czerwony/80" : "bg-szary/40"}`}
              style={{ height: bar }}
              title={day.title ?? `${day.label}: ${day.value}`}
            />
            <span className="truncate text-[9px] text-czarny/40">{day.label}</span>
          </div>
        );
      })}
    </div>
  );
}
