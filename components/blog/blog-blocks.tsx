import Image from "next/image";
import type { BlogBlock } from "@/lib/types";

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

export function BlogBlocks({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="space-y-5 text-[15px] leading-relaxed text-czarny/75 md:text-base md:leading-[1.75]">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            return (
              <h2
                key={index}
                className="pt-4 font-heading text-lg uppercase tracking-[0.1em] text-czarny md:text-xl"
              >
                {block.text}
              </h2>
            );
          case "paragraph":
            return (
              <p key={index}>
                <RichText text={block.text} />
              </p>
            );
          case "list":
            return (
              <ul key={index} className="list-disc space-y-1 pl-5">
                {block.items.map((item) => (
                  <li key={item}>
                    <RichText text={item} />
                  </li>
                ))}
              </ul>
            );
          case "formula":
            return (
              <p
                key={index}
                className="overflow-x-auto rounded-2xl bg-krem px-4 py-3 font-mono text-sm text-czarny"
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
                  className="text-ceglany underline-offset-4 hover:underline"
                >
                  {block.label}
                </a>
              </p>
            );
          case "image":
            return (
              <figure key={index} className="space-y-2 py-2">
                <div className="relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden bg-krem">
                  <Image
                    src={block.src}
                    alt={block.alt}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 640px"
                  />
                </div>
                {block.caption ? (
                  <figcaption className="text-center text-sm italic text-ceglany/90">
                    {block.caption}
                  </figcaption>
                ) : null}
              </figure>
            );
          case "image-row":
            return (
              <div
                key={index}
                className="grid gap-3 py-2 sm:grid-cols-2"
              >
                {block.images.map((image) => (
                  <figure key={image.src} className="space-y-2">
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-krem">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        className="object-contain"
                        sizes="(max-width: 640px) 100vw, 320px"
                      />
                    </div>
                    {image.caption ? (
                      <figcaption className="text-center text-xs italic text-ceglany/90">
                        {image.caption}
                      </figcaption>
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
