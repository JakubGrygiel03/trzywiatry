const fs = require("fs");
const path = require("path");

const catalog = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "tmp-woo-catalog.json"), "utf8"));
const productsPath = path.join(__dirname, "..", "lib", "data", "products.ts");
let source = fs.readFileSync(productsPath, "utf8");

/** Map Woo slug -> our product id / local slug where names differ. */
const ALIAS = {
  "micha-biala": "biala-micha-z-surowym-wykonczeniem",
  "micha-czerwona": "czerwona-micha-z-surowym-wykonczeniem",
  "micha-zielona": "zielona-micha-z-surowym-wykonczeniem",
  "czajniczek-w-kropki-zestaw": "czajniczek-w-kropki",
  "czarka-z-logo-trzy-wiatry": "czarka-z-logo",
  "czarki-kremowe": "czarka-kremowa",
  "czarki-zawijasy-blekitny": "czarka-niebieska",
  "czarki-zawijasy-pastelowe": "czarka-rozowa",
  "czarki-zawijasy-zielone": "czarka-zielona",
  "filizanka-latte-kremowa": "filizanka-latte-jasna",
  "forma-gipsowa-c1": "forma-gipsowa-czarka-1",
  "forma-gipsowa-raczka-1": "forma-gipsowa-ucho-1",
  "forma-gipsowa-raczka-2": "forma-gipsowa-ucho-2",
  "forma-gipsowa-raczka-3": "forma-gipsowa-ucho-3",
  "forma-gipsowa-miska-1": "forma-gipsowa-miska",
  "forma-gipsowa-miska-2": "forma-gipsowa-miska-niska",
  "miska-z-surowym-wykonczeniem": "miska-z-surowym-wykonczeniem",
  "sloik-do-przekasek": "sloik-do-przekasek",
  "szesciokatna-czarka": "szesciokatna-czareczka",
  "wygodny-kubas-niebieski": "wygodny-kubas-granatowy",
  "wygodny-kubas-miodowy": "wygodny-kubas-miodowy",
  "wygodny-wiegas-miodowy": "wygodny-kubas-zolty",
  "wygodny-wielgas-niebieiski": "wygodny-kubas-lawendowy",
  "granatowa-micha-z-surowym-wykonczeniem": "granatowa-micha-z-surowym-wykonczeniem",
  "kanciasta-czareczka": "kanciasta-czareczka",
  "maselnica-francuska": "maselnica-francuska",
  "czajniczek-szesciokatny": "czajniczek-szesciokatny",
  "filizanka-latte": "filizanka-latte",
  "forma-gipsowa-czarka-2": "forma-gipsowa-czarka-2",
  "formy-nieokielznane": "formy-nieokielznane",
};

function imagesLiteral(images) {
  if (images.length === 0) return "[]";
  return "[\n" + images.map((img) => `      "${img}",`).join("\n") + "\n    ]";
}

function replaceImagesForSlug(src, slug, images) {
  // Find product block by slug: "slug-xxx"
  const slugToken = `slug: "${slug}"`;
  const idx = src.indexOf(slugToken);
  if (idx < 0) return { src, ok: false };
  const imagesIdx = src.indexOf("images:", idx);
  if (imagesIdx < 0 || imagesIdx - idx > 800) return { src, ok: false };
  const start = src.indexOf("[", imagesIdx);
  if (start < 0) return { src, ok: false };
  let depth = 0;
  let end = -1;
  for (let i = start; i < src.length; i++) {
    if (src[i] === "[") depth++;
    if (src[i] === "]") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end < 0) return { src, ok: false };
  const next = src.slice(0, start) + imagesLiteral(images).replace(/^\s*\[/, "[").replace(/\n    \]$/, "\n    ]") + src.slice(end + 1);
  // Fix: imagesLiteral already includes brackets with formatting
  const formatted = imagesLiteral(images);
  const replaced = src.slice(0, start) + formatted + src.slice(end + 1);
  return { src: replaced, ok: true };
}

let updated = 0;
const missing = [];
for (const item of catalog) {
  const ourSlug = ALIAS[item.slug] ?? item.slug;
  const result = replaceImagesForSlug(source, ourSlug, item.images);
  if (result.ok) {
    source = result.src;
    updated++;
    console.log("OK", item.slug, "->", ourSlug, item.images.length);
  } else {
    missing.push(item);
    console.log("MISS", item.slug, item.name);
  }
}

fs.writeFileSync(productsPath, source);
fs.writeFileSync(
  path.join(__dirname, "..", "tmp-woo-missing.json"),
  JSON.stringify(missing, null, 2),
);
console.log("updated", updated, "missing", missing.length);
