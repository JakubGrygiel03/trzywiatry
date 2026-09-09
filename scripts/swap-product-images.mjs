import fs from "fs";

const path = "lib/data/products.ts";
let source = fs.readFileSync(path, "utf8");

source = source.replace(
  /const img = [\s\S]*?;\n\n/,
  "const brand = (file) => `/brand/photos/${file}`;\n\n".replace("(file)", "(file: string)"),
);

const map = {
  "p-espresso-dust": '[brand("espresso-clean.jpg"), brand("mugs-clean.jpg")]',
  "p-flatwhite-mist": '[brand("mugs-clean.jpg"), brand("cup-white.jpg")]',
  "p-cup-250-sand": '[brand("ceramic-mugs.jpg"), brand("mugs-clean.jpg")]',
  "p-cup-300-raw": '[brand("mugs-product.jpg"), brand("ceramic-mugs.jpg")]',
  "p-tea-350": '[brand("mugs-clean.jpg"), brand("rings-clean.jpg")]',
  "p-bowl-breakfast": '[brand("ceramic-mugs.jpg"), brand("shavings-clean.jpg")]',
  "p-dessert-plate": '[brand("rings-clean.jpg"), brand("mugs-clean.jpg")]',
  "p-dinner-plate": '[brand("mugs-clean.jpg"), brand("rings-clean.jpg")]',
  "p-platter": '[brand("shavings-clean.jpg"), brand("rings-clean.jpg")]',
  "p-board": '[brand("logs-clean.jpg"), brand("wood-texture.jpg")]',
  "p-sculpture": '[brand("wood-sculpture.jpg"), brand("logs-clean.jpg")]',
  "p-mold-cup": '[brand("rings-clean.jpg"), brand("shavings-clean.jpg")]',
  "p-gift-set": '[brand("mugs-clean.jpg"), brand("ceramic-mugs.jpg")]',
  "p-gift-card": '[brand("ceramika-tile.jpg"), brand("drewno-tile.jpg")]',
};

for (const [id, imgs] of Object.entries(map)) {
  const re = new RegExp(`(id: "${id}"[\\s\\S]*?images: )\\[[^\\]]*\\]`);
  if (!re.test(source)) {
    console.log("miss", id);
    continue;
  }
  source = source.replace(re, `$1${imgs}`);
  console.log("ok", id);
}

fs.writeFileSync(path, source);
