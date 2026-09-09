import sharp from "sharp";
import fs from "fs";

const out = "public/brand/photos";
fs.mkdirSync(out, { recursive: true });

async function save(name, pipeline) {
  const dest = `${out}/${name}.jpg`;
  await pipeline.jpeg({ quality: 92, mozjpeg: true }).toFile(dest);
  const m = await sharp(dest).metadata();
  console.log(name, m.width, m.height);
}

// --- Page 32 Ceramika stories: 4 phones on 2104×1488 ---
const p32 = "public/brand/pdf-hi/page-32.png";
// Approximate phone content frames (excluding IG chrome)
const phones32 = [
  { name: "ceramika-tile", left: 145, top: 195, width: 310, height: 620 },
  { name: "hero-wheel", left: 530, top: 195, width: 310, height: 620 },
  { name: "product-espresso", left: 915, top: 195, width: 310, height: 620 },
  { name: "product-mugs-story", left: 1300, top: 195, width: 310, height: 620 },
];
for (const p of phones32) {
  await save(
    p.name,
    sharp(p32)
      .extract(p)
      .resize({ width: 1080, height: 1600, fit: "cover", position: "centre" }),
  );
}

// Crop just the photo area of espresso story (below price pill, above CTA)
await save(
  "product-cup",
  sharp(p32)
    .extract({ left: 930, top: 320, width: 280, height: 360 })
    .resize({ width: 1200, height: 1500, fit: "cover" }),
);

// Wheel photo without huge text overlay — center clay area
await save(
  "hero-atelier",
  sharp(p32)
    .extract({ left: 545, top: 280, width: 280, height: 420 })
    .resize({ width: 1600, height: 2000, fit: "cover", position: "centre" }),
);

// --- Page 33 Drewno stories ---
const p33 = "public/brand/pdf-hi/page-33.png";
const phones33 = [
  { name: "drewno-tile", left: 145, top: 195, width: 310, height: 620 },
  { name: "wood-sculpture", left: 530, top: 195, width: 310, height: 620 },
  { name: "wood-logs-full", left: 915, top: 195, width: 310, height: 620 },
  { name: "wood-bark-full", left: 1300, top: 195, width: 310, height: 620 },
];
for (const p of phones33) {
  await save(
    p.name,
    sharp(p33)
      .extract(p)
      .resize({ width: 1080, height: 1600, fit: "cover" }),
  );
}

await save(
  "wood-ends-clean",
  sharp(p33)
    .extract({ left: 930, top: 280, width: 280, height: 480 })
    .resize({ width: 1200, height: 1600, fit: "cover" }),
);

// --- Page 34 Warsztaty ---
const p34 = "public/brand/pdf-hi/page-34.png";
await save(
  "workshop-place",
  sharp(p34)
    .extract({ left: 530, top: 250, width: 310, height: 520 })
    .resize({ width: 1080, height: 1600, fit: "cover", position: "top" }),
);

// --- Page 21 clean product photo ---
const p21 = "public/brand/pdf-hi/page-21.png";
await save(
  "mugs-studio",
  sharp(p21)
    .extract({ left: 1120, top: 760, width: 760, height: 520 })
    .resize({ width: 1600, height: 1100, fit: "cover" }),
);
await save(
  "wood-rings",
  sharp(p21)
    .extract({ left: 140, top: 760, width: 760, height: 520 })
    .resize({ width: 1400, height: 1000, fit: "cover" }),
);
await save(
  "shavings",
  sharp(p21)
    .extract({ left: 140, top: 180, width: 760, height: 500 })
    .resize({ width: 1400, height: 1000, fit: "cover" }),
);

// --- Page 30 grid cells on the right (3 cols) ---
const p30 = "public/brand/pdf-hi/page-30.png";
const grid = [
  { name: "grid-wheel", left: 1120, top: 220, width: 250, height: 250 },
  { name: "grid-logs", left: 1390, top: 220, width: 250, height: 250 },
  { name: "grid-clay", left: 1660, top: 220, width: 250, height: 250 },
  { name: "grid-cup", left: 1120, top: 490, width: 250, height: 250 },
  { name: "grid-mugs", left: 1390, top: 490, width: 250, height: 250 },
  { name: "grid-brick", left: 1660, top: 490, width: 250, height: 250 },
];
for (const g of grid) {
  await save(
    g.name,
    sharp(p30)
      .extract(g)
      .resize({ width: 1000, height: 1000, fit: "cover" }),
  );
}

console.log("precise crops done");
