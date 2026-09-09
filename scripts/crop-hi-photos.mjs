import sharp from "sharp";
import fs from "fs";

const out = "public/brand/photos";
fs.mkdirSync(out, { recursive: true });

const scale = 2104 / 1683;

function s(n) {
  return Math.round(n * scale);
}

async function crop(src, name, region, ratio) {
  const dest = `${out}/${name}.jpg`;
  const extract = {
    left: s(region.left),
    top: s(region.top),
    width: s(region.width),
    height: s(region.height),
  };
  let pipeline = sharp(src).extract(extract);
  if (ratio) {
    pipeline = pipeline.resize({
      width: ratio.w,
      height: ratio.h,
      fit: "cover",
      position: ratio.pos ?? "centre",
    });
  }
  await pipeline.jpeg({ quality: 90, mozjpeg: true }).toFile(dest);
  const meta = await sharp(dest).metadata();
  console.log(name, meta.width, meta.height);
}

const p21 = "public/brand/pdf-hi/page-21.png";
const p30 = "public/brand/pdf-hi/page-30.png";
const p32 = "public/brand/pdf-hi/page-32.png";
const p33 = "public/brand/pdf-hi/page-33.png";
const p34 = "public/brand/pdf-hi/page-34.png";
const p31 = "public/brand/pdf-hi/page-31.png";

// Fine-tuned after visual inspection of brand layouts (base coords on 1683×1190)
await crop(p21, "hero-clay", { left: 880, top: 140, width: 640, height: 420 }, { w: 1600, h: 1000, pos: "centre" });
await crop(p21, "ceramic-mugs", { left: 880, top: 560, width: 640, height: 420 }, { w: 1200, h: 1200 });
await crop(p21, "wood-shavings", { left: 90, top: 140, width: 560, height: 440 }, { w: 1200, h: 900 });

await crop(p30, "wheel-hands", { left: 760, top: 170, width: 300, height: 300 }, { w: 1200, h: 1500, pos: "centre" });
await crop(p30, "wood-logs", { left: 1070, top: 170, width: 300, height: 300 }, { w: 1200, h: 1200 });
await crop(p30, "clay-detail", { left: 1380, top: 170, width: 230, height: 300 }, { w: 1000, h: 1250 });
await crop(p30, "cup-white", { left: 760, top: 480, width: 300, height: 300 }, { w: 1200, h: 1500 });
await crop(p30, "cups-pair", { left: 1070, top: 480, width: 300, height: 300 }, { w: 1200, h: 1200 });

await crop(p33, "wood-mannequin", { left: 400, top: 120, width: 300, height: 560 }, { w: 900, h: 1600, pos: "top" });
await crop(p33, "wood-ends", { left: 740, top: 120, width: 300, height: 560 }, { w: 900, h: 1600 });
await crop(p33, "wood-bark", { left: 1080, top: 120, width: 300, height: 560 }, { w: 900, h: 1600 });

await crop(p34, "workshop-brick", { left: 400, top: 120, width: 300, height: 560 }, { w: 900, h: 1600 });
await crop(p32, "ceramika-process", { left: 400, top: 120, width: 300, height: 560 }, { w: 900, h: 1600 });
await crop(p31, "sale-post", { left: 520, top: 160, width: 700, height: 700 }, { w: 1200, h: 1200 });

// Pattern tiles from hi pages if available — else keep previous
const patternSrc = fs.existsSync("public/brand/pdf-hi/page-26.png")
  ? "public/brand/pdf-hi/page-26.png"
  : "public/brand/pdf-pages/page-26.png";

await sharp(patternSrc)
  .extract({ left: s(380), top: s(240), width: s(920), height: s(600) })
  .png()
  .toFile("public/brand/patterns/pattern-a.png");

await sharp("public/brand/pdf-pages/page-27.png")
  .extract({ left: 380, top: 240, width: 920, height: 600 })
  .png()
  .toFile("public/brand/patterns/pattern-b.png");

// Create a small seamless-ish tile from pattern light upload
await sharp("public/brand/patterns/pattern-light.png")
  .extract({ left: 40, top: 40, width: 320, height: 320 })
  .png()
  .toFile("public/brand/patterns/tile-light.png");

await sharp("public/brand/patterns/pattern-split.png")
  .extract({ left: 40, top: 40, width: 320, height: 320 })
  .png()
  .toFile("public/brand/patterns/tile-split.png");

console.log("hi crops done");
