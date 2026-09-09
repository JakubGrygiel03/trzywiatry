import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";

const SYGNET = path.join(process.cwd(), "public/brand/sygnet.png");

/** Resize the official sygnet PNG — never redraw the mark. */
export async function brandAppIcon(size: number) {
  const png = await sharp(SYGNET)
    .resize(size, size, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toBuffer();

  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-cache, must-revalidate",
    },
  });
}

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
        {/* Official raster sygnet — same file as favicon / PWA */}
        <img alt="" src={src} width={420} height={420} />
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
