import sharp from "sharp";
import fs from "fs";

const out = "public/brand/photos";
fs.mkdirSync(out, { recursive: true });

async function crop(src, name, region) {
  const dest = `${out}/${name}.jpg`;
  await sharp(src)
    .extract(region)
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(dest);
  const meta = await sharp(dest).metadata();
  console.log(name, meta.width, meta.height);
}

const p21 = "public/brand/pdf-pages/page-21.png";
const p30 = "public/brand/pdf-pages/page-30.png";
const p33 = "public/brand/pdf-pages/page-33.png";
const p34 = "public/brand/pdf-pages/page-34.png";
const p32 = "public/brand/pdf-pages/page-32.png";
const p31 = "public/brand/pdf-pages/page-31.png";
const patternA = "public/brand/pdf-pages/page-26.png";
const patternB = "public/brand/pdf-pages/page-27.png";
const logoV = "public/brand/pdf-pages/page-04.png";
const logoH = "public/brand/pdf-pages/page-08.png";
const sygnet = "public/brand/pdf-pages/page-12.png";

// Page 21: logo on photos — 2x2-ish content area roughly
await crop(p21, "wood-shavings", { left: 120, top: 160, width: 520, height: 420 });
await crop(p21, "clay-spiral", { left: 900, top: 160, width: 560, height: 360 });
await crop(p21, "ceramic-mugs", { left: 900, top: 560, width: 560, height: 420 });

// Page 30 Instagram layout — phone mockup left + grid right
await crop(p30, "wheel-hands", { left: 780, top: 180, width: 280, height: 280 });
await crop(p30, "wood-logs", { left: 1080, top: 180, width: 280, height: 280 });
await crop(p30, "clay-detail", { left: 1380, top: 180, width: 220, height: 280 });
await crop(p30, "cup-white", { left: 780, top: 480, width: 280, height: 280 });
await crop(p30, "cups-pair", { left: 1080, top: 480, width: 280, height: 280 });

await crop(p33, "wood-mannequin", { left: 420, top: 140, width: 280, height: 520 });
await crop(p33, "wood-ends", { left: 760, top: 140, width: 280, height: 520 });
await crop(p33, "wood-bark", { left: 1100, top: 140, width: 280, height: 520 });

await crop(p34, "workshop-brick", { left: 420, top: 140, width: 280, height: 520 });

await crop(p32, "ceramika-story-1", { left: 120, top: 140, width: 280, height: 520 });
await crop(p32, "ceramika-story-2", { left: 460, top: 140, width: 280, height: 520 });
await crop(p31, "sale-post", { left: 500, top: 160, width: 680, height: 680 });

// Patterns — central rectangles
await crop(patternA, "pattern-a-tile", { left: 360, top: 220, width: 960, height: 640 });
await crop(patternB, "pattern-b-tile", { left: 360, top: 220, width: 960, height: 640 });

// Logos — center extractions
await sharp(logoV)
  .extract({ left: 620, top: 220, width: 440, height: 620 })
  .png()
  .toFile("public/brand/logo-vertical-extracted.png");
await sharp(logoH)
  .extract({ left: 420, top: 360, width: 840, height: 360 })
  .png()
  .toFile("public/brand/logo-horizontal-extracted.png");
await sharp(sygnet)
  .extract({ left: 640, top: 280, width: 400, height: 400 })
  .png()
  .toFile("public/brand/sygnet-extracted.png");

console.log("crops done");
