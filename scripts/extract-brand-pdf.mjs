import { pdf } from "pdf-to-img";
import fs from "fs";
import path from "path";

const out = "public/brand/pdf-pages";
fs.mkdirSync(out, { recursive: true });

let i = 0;
const document = await pdf("brand/Trzy_Wiatry_Ksiega_Znaku.pdf", { scale: 2 });

for await (const image of document) {
  i += 1;
  const file = path.join(out, `page-${String(i).padStart(2, "0")}.png`);
  fs.writeFileSync(file, image);
  console.log("wrote", file, image.length);
}

console.log("pages", i);
