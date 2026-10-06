import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

const SYGNET = path.join(process.cwd(), "public/brand/sygnet.png");

/** OG / Twitter card from the official sygnet — no sharp in the lambda. */
export async function brandShareCard() {
  const buf = await readFile(SYGNET);
  const src = `data:image/png;base64,${buf.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FFFFFF",
        }}
      >
        <img alt="" src={src} width={420} height={420} />
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
