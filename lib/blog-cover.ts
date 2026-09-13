export const BLOG_COVER_BACKDROPS = {
  bialy: { label: "Biały", className: "bg-bialy" },
  krem: { label: "Krem", className: "bg-krem" },
  "krem-ciemny": { label: "Krem ciemny", className: "bg-krem-ciemny" },
} as const;

export type BlogCoverBackdrop = keyof typeof BLOG_COVER_BACKDROPS;

export const DEFAULT_BLOG_COVER_BACKDROP: BlogCoverBackdrop = "krem";

export function isBlogCoverBackdrop(value: string | undefined): value is BlogCoverBackdrop {
  return Boolean(value && value in BLOG_COVER_BACKDROPS);
}

export function coverBackdropClass(value: string | undefined) {
  return BLOG_COVER_BACKDROPS[isBlogCoverBackdrop(value) ? value : DEFAULT_BLOG_COVER_BACKDROP].className;
}
