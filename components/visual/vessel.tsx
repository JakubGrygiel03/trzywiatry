import type { VesselKind, VesselView } from "@/lib/visual";

type Palette = { clay: string; glaze: string; shine: string; ink: string };

export function Vessel({
  kind,
  palette,
  view = "profil",
}: {
  kind: VesselKind;
  palette: Palette;
  view?: VesselView;
}) {
  const glaze = view === "stopka" ? palette.clay : palette.glaze;
  const body = view === "szkliwo" ? palette.shine : glaze;
  const scale = view === "stopka" ? "translate(0 18) scale(1 0.92)" : undefined;

  return (
    <svg viewBox="0 0 200 240" className="h-full w-full" aria-hidden="true">
      <g transform={scale}>
        {kind === "espresso" ? <Espresso clay={palette.clay} glaze={body} shine={palette.shine} ink={palette.ink} /> : null}
        {kind === "cup" ? <Cup clay={palette.clay} glaze={body} shine={palette.shine} ink={palette.ink} /> : null}
        {kind === "tea" ? <Tea clay={palette.clay} glaze={body} shine={palette.shine} ink={palette.ink} /> : null}
        {kind === "bowl" ? <Bowl clay={palette.clay} glaze={body} shine={palette.shine} ink={palette.ink} /> : null}
        {kind === "plate" ? <Plate clay={palette.clay} glaze={body} shine={palette.shine} ink={palette.ink} /> : null}
        {kind === "platter" ? <Platter clay={palette.clay} glaze={body} shine={palette.shine} ink={palette.ink} /> : null}
        {kind === "board" ? <Board clay={palette.clay} glaze={body} shine={palette.shine} ink={palette.ink} /> : null}
        {kind === "sculpture" ? <Sculpture clay={palette.clay} glaze={body} shine={palette.shine} ink={palette.ink} /> : null}
        {kind === "mold" ? <Mold clay={palette.clay} glaze={body} shine={palette.shine} ink={palette.ink} /> : null}
        {kind === "set" ? <Set clay={palette.clay} glaze={body} shine={palette.shine} ink={palette.ink} /> : null}
        {kind === "card" ? <Card clay={palette.clay} glaze={body} shine={palette.shine} ink={palette.ink} /> : null}
        {kind === "wheel" ? <Wheel clay={palette.clay} glaze={body} shine={palette.shine} ink={palette.ink} /> : null}
      </g>
    </svg>
  );
}

function Cup({ clay, glaze, shine, ink }: Palette) {
  return (
    <g fill="none" stroke={ink} strokeWidth="1.6" strokeLinejoin="round">
      <path d="M128 92c18 6 28 22 26 40-2 16-14 28-32 32" />
      <path d="M62 78c2-18 74-18 76 2l8 86c-2 22-88 22-90 0z" fill={clay} />
      <path d="M68 82c6-10 64-10 68 2l6 78c-2 16-76 16-78 0z" fill={glaze} />
      <ellipse cx="102" cy="84" rx="32" ry="8" fill={shine} opacity="0.55" />
      <path d="M78 178h48" />
    </g>
  );
}

function Espresso({ clay, glaze, shine, ink }: Palette) {
  return (
    <g fill="none" stroke={ink} strokeWidth="1.6">
      <path d="M74 100c4-16 48-16 52 2l4 52c-2 16-56 16-58 0z" fill={clay} />
      <path d="M78 104c4-10 42-10 46 2l3 46c-2 12-48 12-50 0z" fill={glaze} />
      <ellipse cx="100" cy="106" rx="20" ry="6" fill={shine} opacity="0.5" />
      <path d="M86 168h28" />
    </g>
  );
}

function Tea({ clay, glaze, shine, ink }: Palette) {
  return (
    <g fill="none" stroke={ink} strokeWidth="1.6">
      <path d="M48 118c10-36 94-36 104 0 6 22-8 52-52 52s-58-30-52-52z" fill={clay} />
      <path d="M56 116c10-28 78-28 88 0 4 18-8 42-44 42s-48-24-44-42z" fill={glaze} />
      <ellipse cx="100" cy="112" rx="38" ry="10" fill={shine} opacity="0.45" />
    </g>
  );
}

function Bowl({ clay, glaze, shine, ink }: Palette) {
  return (
    <g fill="none" stroke={ink} strokeWidth="1.6">
      <path d="M42 108c8-28 108-28 116 0 8 28-10 62-58 62s-66-34-58-62z" fill={clay} />
      <path d="M52 110c8-22 88-22 96 0 6 22-10 50-48 50s-54-28-48-50z" fill={glaze} />
      <ellipse cx="100" cy="108" rx="42" ry="11" fill={shine} opacity="0.4" />
    </g>
  );
}

function Plate({ clay, glaze, shine, ink }: Palette) {
  return (
    <g fill="none" stroke={ink} strokeWidth="1.5">
      <ellipse cx="100" cy="128" rx="72" ry="28" fill={clay} />
      <ellipse cx="100" cy="126" rx="52" ry="18" fill={glaze} />
      <ellipse cx="88" cy="120" rx="18" ry="6" fill={shine} opacity="0.45" />
    </g>
  );
}

function Platter({ clay, glaze, shine, ink }: Palette) {
  return (
    <g fill="none" stroke={ink} strokeWidth="1.5">
      <ellipse cx="100" cy="130" rx="84" ry="32" fill={clay} />
      <ellipse cx="100" cy="128" rx="64" ry="22" fill={glaze} />
      <ellipse cx="78" cy="122" rx="20" ry="6" fill={shine} opacity="0.4" />
    </g>
  );
}

function Board({ clay, glaze, shine, ink }: Palette) {
  return (
    <g fill="none" stroke={ink} strokeWidth="1.5">
      <rect x="40" y="78" width="120" height="84" rx="18" fill={clay} />
      <rect x="48" y="86" width="104" height="68" rx="12" fill={glaze} />
      <circle cx="148" cy="120" r="6" fill={shine} />
      <path d="M60 100h80M60 118h70" opacity="0.35" />
    </g>
  );
}

function Sculpture({ clay, glaze, shine, ink }: Palette) {
  return (
    <g fill="none" stroke={ink} strokeWidth="1.8">
      <path d="M70 150h60v28H70z" fill={clay} />
      <path d="M64 150 L100 96 L136 150" fill={glaze} />
      <path d="M96 178 V150 h16 v28" />
      <path d="M48 108c18-10 30-8 42-2" stroke={clay} />
      <path d="M52 118c20-10 36-8 54-2" stroke={glaze} />
      <path d="M56 128c22-10 40-8 62-1" stroke={shine} />
    </g>
  );
}

function Mold({ clay, glaze, shine, ink }: Palette) {
  return (
    <g fill="none" stroke={ink} strokeWidth="1.5">
      <path d="M58 86h84v28H58z" fill={shine} />
      <path d="M70 114c4 48 56 48 60 0" fill={clay} />
      <path d="M78 118c4 36 44 36 48 0" fill={glaze} />
    </g>
  );
}

function Set({ clay, glaze, shine, ink }: Palette) {
  return (
    <g>
      <g transform="translate(-18 10) scale(0.86)">
        <Cup clay={clay} glaze={glaze} shine={shine} ink={ink} />
      </g>
      <g transform="translate(22 18) scale(0.8)">
        <Cup clay={clay} glaze={shine} shine={glaze} ink={ink} />
      </g>
    </g>
  );
}

function Card({ clay, glaze, shine, ink }: Palette) {
  return (
    <g fill="none" stroke={ink} strokeWidth="1.5">
      <rect x="50" y="70" width="100" height="100" rx="10" fill={glaze} />
      <rect x="62" y="84" width="76" height="48" rx="6" fill={clay} />
      <path d="M70 150h60" />
      <circle cx="100" cy="108" r="10" fill={shine} />
    </g>
  );
}

function Wheel({ clay, glaze, shine, ink }: Palette) {
  return (
    <g fill="none" stroke={ink} strokeWidth="1.5">
      <ellipse cx="100" cy="168" rx="54" ry="12" fill={clay} />
      <circle cx="100" cy="118" r="40" fill={glaze} />
      <circle cx="100" cy="118" r="12" fill={shine} />
      <path d="M100 78v80M60 118h80" opacity="0.4" />
    </g>
  );
}
