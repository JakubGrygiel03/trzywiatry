import Image from "next/image";
import { AtelierFrame } from "@/components/visual/atelier-frame";

export function B2BAsideVisual({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption: string;
}) {
  if (!src) {
    return (
      <AtelierFrame
        kind="set"
        glaze="dust"
        className="aspect-[4/3] min-h-[16rem] rounded-2xl border-0"
        caption={caption || "B2B"}
      />
    );
  }

  return (
    <div className="relative aspect-[4/3] min-h-[16rem] overflow-hidden rounded-2xl bg-krem">
      <Image src={src} alt={alt || caption || "B2B"} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 42vw" />
      {caption ? (
        <span className="absolute right-3 top-3 rounded-full bg-bialy/90 px-2.5 py-1 font-heading text-[10px] uppercase tracking-[0.16em] text-czarny/70">
          {caption}
        </span>
      ) : null}
    </div>
  );
}
