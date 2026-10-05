import type { ReactNode } from "react";

export function PlainLegalBody({ body }: { body: string }) {
  return renderPlainLegalBody(body);
}

function renderPlainLegalBody(body: string): ReactNode {
  const chunks = body
    .split(/\n\n+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  return chunks.map((chunk, index) => {
    const lines = chunk
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length > 1 && lines.every((line) => line.startsWith("• ") || line.startsWith("- "))) {
      return (
        <ul key={index} className="list-disc space-y-1.5 pl-5 leading-relaxed text-czarny/75">
          {lines.map((line, lineIndex) => (
            <li key={lineIndex}>{line.replace(/^([•-]\s)/, "")}</li>
          ))}
        </ul>
      );
    }
    if (lines.length > 1 && lines.every((line) => /^\d+\.\s/.test(line))) {
      return (
        <ol key={index} className="list-decimal space-y-1.5 pl-5 leading-relaxed text-czarny/75">
          {lines.map((line, lineIndex) => (
            <li key={lineIndex}>{line.replace(/^\d+\.\s/, "")}</li>
          ))}
        </ol>
      );
    }
    return (
      <p key={index} className="leading-relaxed text-czarny/75">
        {chunk}
      </p>
    );
  });
}
