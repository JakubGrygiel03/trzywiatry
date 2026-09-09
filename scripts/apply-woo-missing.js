const fs = require("fs");
const path = require("path");

const productsPath = path.join(__dirname, "..", "lib", "data", "products.ts");
let source = fs.readFileSync(productsPath, "utf8");
const missing = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "tmp-woo-missing.json"), "utf8"));
const bySlug = Object.fromEntries(missing.map((m) => [m.slug, m]));

function imagesLiteral(images) {
  return "[\n" + images.map((img) => `      "${img}",`).join("\n") + "\n    ]";
}

function replaceImagesForSlug(src, slug, images) {
  const slugToken = `slug: "${slug}"`;
  const idx = src.indexOf(slugToken);
  if (idx < 0) return { src, ok: false };
  const imagesIdx = src.indexOf("images:", idx);
  if (imagesIdx < 0 || imagesIdx - idx > 800) return { src, ok: false };
  const start = src.indexOf("[", imagesIdx);
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
  return { src: src.slice(0, start) + imagesLiteral(images) + src.slice(end + 1), ok: true };
}

const patches = [
  ["granatowa-micha-z-surowym-wykonczeniem", bySlug["micha-granatowa"].images],
  ["formy-nieokielznane", bySlug["formy-nieidealne"].images],
  ["forma-gipsowa-talerz", bySlug["forma-gipsowa-talerzyk-1"].images],
  ["forma-master-czarka", bySlug["forma-matka-czarka-1"].images],
];

for (const [slug, images] of patches) {
  const r = replaceImagesForSlug(source, slug, images);
  if (!r.ok) throw new Error("patch fail " + slug);
  source = r.src;
  console.log("patched", slug);
}

function moldProduct(id, name, slug, category, priceInCents, images, stock) {
  return [
    "  {",
    `    id: "${id}",`,
    `    name: "${name}",`,
    `    slug: "${slug}",`,
    `    description: "${name} — oferta ze sklepu Trzy Wiatry.",`,
    `    domain: "formy",`,
    `    category: "${category}",`,
    `    priceInCents: ${priceInCents},`,
    "    isPublished: true,",
    "    isBestseller: false,",
    `    images: ${imagesLiteral(images)},`,
    '    careInstructions: "Suszyć po odlewie. Nie narażać na uderzenia.",',
    "    lowStockThreshold: 1,",
    "    variants: [",
    "      {",
    `        id: "v-${id}",`,
    `        sku: "TW-${id.toUpperCase().replace(/-/g, "_")}",`,
    `        title: "${name}",`,
    `        stockQuantity: ${stock},`,
    "        isAvailable: true,",
    "      },",
    "    ],",
    "  },",
    "",
  ].join("\n");
}

const inserts = [
  moldProduct(
    "p-forma-czarka-3",
    "Forma gipsowa czarka 3",
    "forma-gipsowa-czarka-3",
    "formy_matki",
    9500,
    bySlug["forma-gipsowa-czarka-3"].images,
    3,
  ),
  moldProduct(
    "p-forma-czarka-4",
    "Forma gipsowa czarka 4",
    "forma-gipsowa-czarka-4",
    "formy_matki",
    9500,
    bySlug["forma-gipsowa-czarka-4"].images,
    3,
  ),
  moldProduct(
    "p-forma-matka-czarka-2",
    "Forma matka czarka 2",
    "forma-matka-czarka-2",
    "formy_master",
    28000,
    bySlug["forma-matka-czarka-2"].images,
    1,
  ),
  moldProduct(
    "p-forma-matka-czarka-3",
    "Forma matka czarka 3",
    "forma-matka-czarka-3",
    "formy_master",
    28000,
    bySlug["forma-matka-czarka-3"].images,
    1,
  ),
  moldProduct(
    "p-formy-nieidealne",
    "Formy nieidealne",
    "formy-nieidealne",
    "formy_matki",
    15000,
    bySlug["formy-nieidealne"].images,
    2,
  ),
  [
    "  {",
    '    id: "p-szesciokatna-czarka-smukla",',
    '    name: "Sześciokątna czarka smukła",',
    '    slug: "szesciokatna-czarka-smukla",',
    '    description: "Smuklejsza wersja czarki heksagonalnej — niebieskie szkliwo i kremowa glina.",',
    '    domain: "ceramika",',
    '    category: "czarki",',
    "    capacityMl: 100,",
    '    collectionId: "col-mist",',
    "    priceInCents: 8000,",
    "    isPublished: true,",
    "    isBestseller: false,",
    `    images: ${imagesLiteral(bySlug["szesciokatna-czarka-2"].images)},`,
    '    careInstructions: "Zmywarka: delikatny program.",',
    "    lowStockThreshold: 2,",
    '    relatedIds: ["p-szesciokatna-czareczka", "p-kanciasta-czareczka"],',
    "    variants: [",
    "      {",
    '        id: "v-scs-1",',
    '        sku: "TW-CUP-HEX-SLIM",',
    '        title: "Sześciokątna czarka smukła",',
    "        stockQuantity: 4,",
    "        isAvailable: true,",
    "      },",
    "    ],",
    "  },",
    "",
  ].join("\n"),
].join("\n");

const marker = '  {\n    id: "p-dessert-plate",';
if (!source.includes(marker)) throw new Error("marker missing");
if (!source.includes('id: "p-forma-czarka-3"')) {
  source = source.replace(marker, inserts + "\n" + marker);
}

source = source.replace(
  'name: "Forma master czarka",\n    slug: "forma-master-czarka",',
  'name: "Forma matka czarka 1",\n    slug: "forma-matka-czarka-1",',
);

fs.writeFileSync(productsPath, source);
console.log("done");
