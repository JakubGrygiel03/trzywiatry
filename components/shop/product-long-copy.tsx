import { parseProductLongCopy } from "@/lib/product-copy";

export function ProductLongCopy({ text }: { text: string }) {
  const blocks = parseProductLongCopy(text);
  if (blocks.length === 0) return null;

  return (
    <div className="max-w-3xl space-y-4 text-base leading-relaxed text-czarny/70 md:text-lg">
      {blocks.map((block, index) => {
        if (block.type === "h") {
          return (
            <h2
              key={`h-${index}`}
              className="pt-2 font-heading text-[12px] uppercase tracking-[0.16em] text-czerwony"
            >
              {block.text}
            </h2>
          );
        }
        if (block.type === "ul") {
          return (
            <ul key={`ul-${index}`} className="list-disc space-y-1.5 pl-5 text-[15px] md:text-base">
              {block.items.map((item, itemIndex) => (
                <li key={`${index}-${itemIndex}`}>{item}</li>
              ))}
            </ul>
          );
        }
        return <p key={`p-${index}`}>{block.text}</p>;
      })}
    </div>
  );
}
