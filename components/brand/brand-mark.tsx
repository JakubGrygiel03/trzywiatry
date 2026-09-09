import type { CSSProperties } from "react";

/**
 * Official Trzy Wiatry sygnet — three winds through an open house (Księga Znaku).
 */
export function BrandMark({
  className,
  color = "currentColor",
  style,
}: {
  className?: string;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <svg viewBox="0 0 120 100" fill="none" className={className} style={style} aria-hidden="true">
      {/* House: open left wall so winds pass through */}
      <path
        d="M38 48 L60 22 L82 48 V86 H38 V68"
        stroke={color}
        strokeWidth="5"
        strokeLinejoin="miter"
        strokeLinecap="square"
      />
      {/* Three winds — top & mid hook up, bottom hooks down */}
      <path
        d="M8 50 H70 Q82 50 82 38"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 62 H74 Q88 62 88 48"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 74 H66 Q78 74 78 86"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
