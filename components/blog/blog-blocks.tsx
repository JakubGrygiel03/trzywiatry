import Image from "next/image";
import type { BlogBlock } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Renders **bold** segments inside plain blog text. */
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

function alignClass(align?: "left" | "center") {
  return align === "center" ? "text-center" : "text-left";
}

export function BlogBlocks({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="mx-auto max-w-[42rem] space-y-6 text-[1.05rem] leading-[1.85] text-czarny/80 md:space-y-7 md:text-[1.1rem] md:leading-[1.9]">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            return (
              <h2
                key={index}
                className={cn(
                  "pt-2 font-heading text-2xl uppercase tracking-[0.06em] text-czarny md:text-[1.75rem]",
                  alignClass(block.align),
                )}
              >
                {block.text}
              </h2>
            );
          case "paragraph":
            return (
              <p key={index} className={alignClass(block.align)}>
                <RichText text={block.text} />
              </p>
            );
          case "list": {
            const ListTag = block.ordered ? "ol" : "ul";
            return (
              <ListTag
                key={index}
                className={cn(
                  "space-y-2 pl-6 marker:text-czerwony",
                  block.ordered ? "list-decimal" : "list-disc",
                )}
              >
                {block.items.map((item, itemIndex) => (
                  <li key={`${index}-${itemIndex}`} className="pl-1">
                    <RichText text={item} />
                  </li>
                ))}
              </ListTag>
            );
          }
          case "formula":
            return (
              <p
                key={index}
                className="overflow-x-auto rounded-2xl border border-czarny/8 bg-krem/70 px-4 py-3 font-mono text-[0.92rem] leading-relaxed text-czarny"
              >
                {block.text}
              </p>
            );
          case "link":
            return (
              <p key={index}>
                {block.prefix ? `${block.prefix} ` : null}
                <a
                  href={block.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-czerwony underline decoration-czerwony/30 underline-offset-4 hover:decoration-czerwony"
                >
                  {block.label}
                </a>
              </p>
            );
          case "image":
            return (
              <figure key={index} className="space-y-2 py-1">
                <div className="relative mx-auto aspect-[4/3] w-full overflow-hidden rounded-2xl bg-krem">
                  <Image
                    src={block.src}
                    alt={block.alt}
                    fill
                    quality={75}
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 672px"
                  />
                </div>
                {block.caption ? (
                  <figcaption className="text-center text-sm italic text-czarny/50">{block.caption}</figcaption>
                ) : null}
              </figure>
            );
          case "image-row":
            return (
              <div key={index} className="grid gap-3 py-1 sm:grid-cols-2">
                {block.images.map((image) => (
                  <figure key={image.src} className="space-y-2">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-krem">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        quality={75}
                        className="object-contain"
                        sizes="(max-width: 640px) 100vw, 320px"
                      />
                    </div>
                    {image.caption ? (
                      <figcaption className="text-center text-xs italic text-czarny/50">{image.caption}</figcaption>
                    ) : null}
                  </figure>
                ))}
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
