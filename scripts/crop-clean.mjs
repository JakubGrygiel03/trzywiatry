import sharp from "sharp";

const out = "public/brand/photos";

async function cut(name, src, region, size) {
  await sharp(src)
    .extract(region)
    .resize({ ...size, fit: "cover" })
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(`${out}/${name}.jpg`);
  console.log(name);
}

const p32 = "public/brand/pdf-hi/page-32.png";
const p33 = "public/brand/pdf-hi/page-33.png";
const p34 = "public/brand/pdf-hi/page-34.png";
const p21 = "public/brand/pdf-hi/page-21.png";

// Story photo wells only (no IG chrome) — second phone on ceramika page
await cut("hero", p32, { left: 555, top: 300, width: 260, height: 430 }, { width: 1400, height: 1800 });
await cut("cup-product", p32, { left: 940, top: 340, width: 260, height: 340 }, { width: 1200, height: 1500 });
await cut("mugs-product", p32, { left: 1325, top: 340, width: 260, height: 400 }, { width: 1200, height: 1500 });

await cut("wood-hero", p33, { left: 940, top: 300, width: 260, height: 480 }, { width: 1200, height: 1800 });
await cut("wood-texture", p33, { left: 1325, top: 300, width: 260, height: 480 }, { width: 1200, height: 1800 });
await cut("workshop-hero", p34, { left: 555, top: 300, width: 260, height: 450 }, { width: 1200, height: 1800 });

await cut("mugs-clean", p21, { left: 1180, top: 820, width: 640, height: 420 }, { width: 1600, height: 1100 });
await cut("rings-clean", p21, { left: 200, top: 820, width: 640, height: 420 }, { width: 1400, height: 1000 });
await cut("shavings-clean", p21, { left: 200, top: 220, width: 640, height: 420 }, { width: 1400, height: 1000 });

console.log("clean cuts ready");
