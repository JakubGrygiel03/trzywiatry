export function WindMark({ className, light = false }: { className?: string; light?: boolean }) {
  const ink = light ? "#F6F3EE" : "#010101";
  return (
    <svg viewBox="0 0 640 420" className={className} fill="none" aria-hidden="true">
      <g className="wind-drift" strokeLinecap="round" strokeWidth="1.6">
        <path d="M40 120 C160 60, 260 80, 420 110" stroke="#9C644E" />
        <path d="M20 170 C150 110, 300 130, 520 168" stroke="#D39058" />
        <path d="M60 220 C180 160, 340 180, 580 210" stroke="#AAA9A5" />
      </g>
      <g stroke={ink} strokeWidth="2" strokeLinejoin="round">
        <path d="M250 250 L320 170 L390 250" />
        <rect x="262" y="250" width="116" height="92" />
        <path d="M310 342 V286 h40 v56" />
      </g>
    </svg>
  );
}
