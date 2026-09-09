import { pdf } from "pdf-to-img";
import fs from "fs";
import path from "path";
import sharp from "sharp";

const hi = "public/brand/pdf-hi";
fs.mkdirSync(hi, { recursive: true });

// Full PDF for photo-rich pages (0-based? pdf-to-img uses 1-based page iteration)
const document = await pdf("brand/Trzy_Wiatry_Ksiega_Znaku_full.pdf", { scale: 2.5 });
const wanted = new Set([20, 21, 29, 30, 31, 32, 33, 34, 35, 36, 37]);
let i = 0;
for await (const image of document) {
  i += 1;
  if (!wanted.has(i)) continue;
  const file = path.join(hi, `page-${String(i).padStart(2, "0")}.png`);
  fs.writeFileSync(file, image);
  const meta = await sharp(file).metadata();
  console.log("hi", i, meta.width, meta.height, image.length);
}
console.log("done", i);
