/**
 * Import WooCommerce product CSV → lib/data/products.ts
 * - Published catalog only (Published=1); draft/unpublished skipped unless --include-unpublished
 * - Variable products → one Product with variation rows as variants
 * - Images: download remote URLs into public/brand/photos/products/woo/ and map carefully per product/variant
 * - Removes seed products that are not in the CSV
 *
 * Usage:
 *   node scripts/import-woo-csv.mjs "C:/Users/.../wc-product-export-....csv"
 *   node scripts/import-woo-csv.mjs ....csv --dry-run
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";
import http from "http";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const WOO_DIR = path.join(ROOT, "public", "brand", "photos", "products", "woo");
const PRODUCTS_TS = path.join(ROOT, "lib", "data", "products.ts");

const csvPath = process.argv[2];
const dryRun = process.argv.includes("--dry-run");
const includeUnpublished = process.argv.includes("--include-unpublished");

if (!csvPath || !fs.existsSync(csvPath)) {
  console.error("Usage: node scripts/import-woo-csv.mjs <csv> [--dry-run] [--include-unpublished]");
  process.exit(1);
}

function parseCsv(t) {
  const rows = [];
  let row = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    const n = t[i + 1];
    if (q) {
      if (c === '"' && n === '"') {
        cur += '"';
        i++;
      } else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ",") {
      row.push(cur);
      cur = "";
    } else if (c === "\r") {
      /* skip */
    } else if (c === "\n") {
      row.push(cur);
      rows.push(row);
      row = [];
      cur = "";
    } else cur += c;
  }
  if (cur.length || row.length) {
    row.push(cur);
    rows.push(row);
  }
  return rows;
}

function stripHtml(html) {
  return (html || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/\r\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#8211;/g, "–")
    .replace(/&#8211;/g, "–")
    .replace(/&#8222;|&#8221;|&bdquo;|&rdquo;/g, '"')
    .trim();
}

function slugify(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function plnToCents(price) {
  if (!price) return 0;
  const n = Number(String(price).replace(",", ".").replace(/[^\d.]/g, ""));
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

function domainFromCats(cats) {
  const c = (cats || "").toLowerCase();
  if (c.includes("formy") || c.includes("forma")) return "formy";
  if (c.includes("drewno")) return "drewno";
  if (c.includes("warsztat")) return "warsztaty";
  return "ceramika";
}

function categoryFromCats(cats) {
  const c = (cats || "").toLowerCase();
  if (c.includes("kubk")) return "kubki";
  if (c.includes("czark")) return "czarki";
  if (c.includes("misk") || c.includes("mich")) return "miski";
  if (c.includes("czajnicz")) return "czajniczki";
  if (c.includes("forma master") || c.includes("forma matka")) return "formy_matki";
  if (c.includes("forma")) return "formy_gipsowe";
  if (c.includes("talerz")) return "talerze";
  return "ceramika";
}

function parseCapacityMl(text) {
  const m = String(text).match(/(\d{2,4})\s*(?:–|-|—)?\s*\d*\s*ml/i);
  if (m) return Number(m[1]);
  const m2 = String(text).match(/pojemność[^0-9]*(\d{2,4})/i);
  if (m2) return Number(m2[1]);
  return undefined;
}

function colorHex(label) {
  const t = label.toLowerCase();
  if (t.includes("granat") || t.includes("niebies")) return "#1e3a5f";
  if (t.includes("miod") || t.includes("złot") || t.includes("zlot")) return "#c4a35a";
  if (t.includes("czerwon") || t.includes("cegl")) return "#9C644E";
  if (t.includes("zielon")) return "#5a6b4a";
  if (t.includes("biał") || t.includes("bial")) return "#f5f2eb";
  if (t.includes("róż") || t.includes("roz")) return "#d4a5a5";
  if (t.includes("krem")) return "#e8dcc8";
  if (t.includes("transparent") || t.includes("surow")) return "#cfc8bc";
  return undefined;
}

function extractColor(variantName, parentName) {
  const rest = variantName.replace(parentName, "").replace(/^[\s\-–—|]+/, "").trim();
  // "Biały" | "1, Granatowy" | "Mała | 180–220 ml" | "Czarka 1"
  const parts = rest.split(",").map((p) => p.trim()).filter(Boolean);
  let colorPart = parts.length > 1 ? parts[parts.length - 1] : parts[0] || rest;
  colorPart = colorPart.split("|")[0]?.trim() || colorPart;
  if (!colorPart) return undefined;
  if (/^\d+$/.test(colorPart)) return undefined;
  if (/^(mała|średnia|duża|bardzo|wielka)\b/i.test(colorPart)) return undefined;
  if (/^(czarka|raczka|talerzyk|miska)\b/i.test(colorPart)) return undefined;
  return colorPart;
}

function splitImageField(field) {
  // WC export: comma-separated absolute URLs (often ", https://...")
  if (!field) return [];
  return field
    .split(/,\s*(?=https?:\/\/)/i)
    .map((s) => s.trim())
    .filter((s) => /^https?:\/\//i.test(s));
}

function filenameFromUrl(url) {
  try {
    const u = new URL(url);
    let base = path.basename(u.pathname);
    base = decodeURIComponent(base).replace(/\s+/g, "-");
    // drop size suffixes like -scaled, -1024x1024 but keep unique names
    return base;
  } catch {
    return `img-${Date.now()}.jpg`;
  }
}

function localPathForUrl(url, productSlug, index) {
  const raw = filenameFromUrl(url);
  const ext = path.extname(raw) || ".jpg";
  const stem = path.basename(raw, ext).toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
  // Prefer unique per product: {slug}-{nn}-{stem}{ext} to avoid collisions
  const nn = String(index + 1).padStart(2, "0");
  return `${productSlug}-${nn}-${stem}${ext.toLowerCase()}`;
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 500) {
      resolve("exists");
      return;
    }
    const mod = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(dest);
    const req = mod.get(url, { headers: { "User-Agent": "TrzyWiatryImport/1.0" } }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.unlinkSync(dest);
        download(res.headers.location, dest).then(resolve, reject);
        return;
      }
      if (res.statusCode !== 200) {
        file.close();
        try {
          fs.unlinkSync(dest);
        } catch {}
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      res.pipe(file);
      file.on("finish", () => file.close(() => resolve("ok")));
    });
    req.on("error", (err) => {
      try {
        fs.unlinkSync(dest);
      } catch {}
      reject(err);
    });
  });
}

async function mapImages(urls, productSlug) {
  if (!fs.existsSync(WOO_DIR)) fs.mkdirSync(WOO_DIR, { recursive: true });
  const out = [];
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const fileName = localPathForUrl(url, productSlug, i);
    const dest = path.join(WOO_DIR, fileName);
    try {
      if (!dryRun) await download(url, dest);
      const publicPath = `/brand/photos/products/woo/${fileName}`;
      // Skip tiny / logo-like first PNG often used as sygnet — keep if jpeg/webp; filter later in media.ts for -01.png pattern
      out.push(publicPath);
    } catch (err) {
      console.warn("IMG FAIL", productSlug, url, err.message);
    }
  }
  // Prefer photos over png logos: put jpgs first
  out.sort((a, b) => {
    const aj = /\.jpe?g$/i.test(a) ? 0 : 1;
    const bj = /\.jpe?g$/i.test(b) ? 0 : 1;
    return aj - bj;
  });
  return out;
}

function tsString(s) {
  return JSON.stringify(s ?? "");
}

function emitProduct(p) {
  const lines = [];
  lines.push("  {");
  lines.push(`    id: ${tsString(p.id)},`);
  lines.push(`    name: ${tsString(p.name)},`);
  lines.push(`    slug: ${tsString(p.slug)},`);
  lines.push(`    description: ${tsString(p.description)},`);
  lines.push(`    domain: ${tsString(p.domain)},`);
  lines.push(`    category: ${tsString(p.category)},`);
  if (p.subCategory) lines.push(`    subCategory: ${tsString(p.subCategory)},`);
  if (p.capacityMl) lines.push(`    capacityMl: ${p.capacityMl},`);
  if (p.collectionId) lines.push(`    collectionId: ${tsString(p.collectionId)},`);
  lines.push(`    priceInCents: ${p.priceInCents},`);
  lines.push(`    isPublished: ${p.isPublished},`);
  lines.push(`    isBestseller: ${p.isBestseller},`);
  lines.push("    images: [");
  for (const img of p.images) lines.push(`      ${tsString(img)},`);
  lines.push("    ],");
  if (p.careInstructions) lines.push(`    careInstructions: ${tsString(p.careInstructions)},`);
  lines.push(`    lowStockThreshold: ${p.lowStockThreshold},`);
  lines.push("    variants: [");
  for (const v of p.variants) {
    lines.push("      {");
    lines.push(`        id: ${tsString(v.id)},`);
    lines.push(`        sku: ${tsString(v.sku)},`);
    lines.push(`        title: ${tsString(v.title)},`);
    if (v.priceInCents != null) lines.push(`        priceInCents: ${v.priceInCents},`);
    lines.push(`        stockQuantity: ${v.stockQuantity},`);
    lines.push(`        isAvailable: ${v.isAvailable},`);
    if (v.color) lines.push(`        color: ${tsString(v.color)},`);
    if (v.colorHex) lines.push(`        colorHex: ${tsString(v.colorHex)},`);
    if (v.capacityMl) lines.push(`        capacityMl: ${v.capacityMl},`);
    if (v.image) lines.push(`        image: ${tsString(v.image)},`);
    lines.push("      },");
  }
  lines.push("    ],");
  lines.push("  },");
  return lines.join("\n");
}

// --- parse ---
const rows = parseCsv(fs.readFileSync(csvPath, "utf8"));
const headers = rows[0].map((h) => h.replace(/^\uFEFF/, "").trim());
const idx = Object.fromEntries(headers.map((h, i) => [h, i]));
const get = (r, key) => (r[idx[key]] ?? "").trim();

const all = [];
for (const r of rows.slice(1)) {
  if (!r.length || r.every((c) => !String(c).trim())) continue;
  all.push({
    id: get(r, "ID"),
    type: get(r, "Type"),
    name: get(r, "Name"),
    sku: get(r, "SKU"),
    published: get(r, "Published"),
    featured: get(r, "Is featured?"),
    stockStatus: get(r, "In stock?"),
    stock: get(r, "Stock"),
    lowStock: get(r, "Low stock amount"),
    price: get(r, "Regular price"),
    cats: get(r, "Categories"),
    parent: get(r, "Parent"),
    short: get(r, "Short description"),
    desc: get(r, "Description"),
    images: splitImageField(get(r, "Images")),
  });
}

const simples = all.filter((r) => r.type === "simple");
const variables = all.filter((r) => r.type === "variable");
const variations = all.filter((r) => r.type === "variation");

function variationsFor(parentId) {
  return variations.filter((v) => v.parent === `id:${parentId}` || v.parent === parentId);
}

function stockQty(row) {
  if (row.stock !== "" && row.stock != null) return Math.max(0, Number(row.stock) || 0);
  // in stock without qty → treat as 1 available unit for molds etc.
  if (row.stockStatus === "1") return 1;
  return 0;
}

const products = [];
const usedSlugs = new Set();

function uniqueSlug(base) {
  let s = base || "produkt";
  if (!usedSlugs.has(s)) {
    usedSlugs.add(s);
    return s;
  }
  let i = 2;
  while (usedSlugs.has(`${s}-${i}`)) i++;
  const out = `${s}-${i}`;
  usedSlugs.add(out);
  return out;
}

async function buildSimple(row) {
  if (!includeUnpublished && row.published !== "1") return null;
  const slug = uniqueSlug(slugify(row.name));
  const images = await mapImages(row.images, slug);
  const priceInCents = plnToCents(row.price);
  const qty = stockQty(row);
  const desc = stripHtml(row.desc) || stripHtml(row.short) || row.name;
  return {
    id: `woo-${row.id}`,
    name: row.name,
    slug,
    description: desc,
    domain: domainFromCats(row.cats),
    category: categoryFromCats(row.cats),
    capacityMl: parseCapacityMl(`${row.name} ${row.short} ${row.desc}`),
    priceInCents,
    isPublished: row.published === "1",
    isBestseller: row.featured === "1",
    images,
    lowStockThreshold: Number(row.lowStock) || 2,
    variants: [
      {
        id: `woo-${row.id}-v1`,
        sku: row.sku || `TW-${row.id}`,
        title: "Standard",
        stockQuantity: qty,
        isAvailable: qty > 0 || row.stockStatus === "1",
        image: images[0],
      },
    ],
  };
}

async function buildVariable(row) {
  if (!includeUnpublished && row.published !== "1") return null;
  const kids = variationsFor(row.id);
  const slug = uniqueSlug(slugify(row.name));
  const parentImages = await mapImages(row.images, slug);
  const variants = [];
  for (const kid of kids) {
    const vSlug = `${slug}-v${kid.id}`;
    const vImages = await mapImages(kid.images, vSlug);
    const title = kid.name.replace(row.name, "").replace(/^[\s\-–—|]+/, "").trim() || kid.name;
    const color = extractColor(kid.name, row.name);
    const capacityMl = parseCapacityMl(kid.name) || parseCapacityMl(title);
    const priceInCents = plnToCents(kid.price) || plnToCents(row.price);
    const qty = stockQty(kid);
    const image = vImages[0] || parentImages[0];
    variants.push({
      id: `woo-${kid.id}`,
      sku: kid.sku || `TW-${kid.id}`,
      title,
      priceInCents: priceInCents || undefined,
      stockQuantity: qty,
      isAvailable: qty > 0 || kid.stockStatus === "1",
      color,
      colorHex: color ? colorHex(color) : undefined,
      capacityMl,
      image,
    });
  }
  if (variants.length === 0) return null;
  const prices = variants.map((v) => v.priceInCents).filter(Boolean);
  const priceInCents = prices.length ? Math.min(...prices) : plnToCents(row.price);
  // Gallery: parent images + unique variant images (careful: keep parent gallery first)
  const gallery = [...parentImages];
  for (const v of variants) {
    if (v.image && !gallery.includes(v.image)) gallery.push(v.image);
  }
  const desc = stripHtml(row.desc) || stripHtml(row.short) || row.name;
  return {
    id: `woo-${row.id}`,
    name: row.name,
    slug,
    description: desc,
    domain: domainFromCats(row.cats),
    category: categoryFromCats(row.cats),
    capacityMl: parseCapacityMl(`${row.name} ${row.short} ${row.desc}`),
    priceInCents,
    isPublished: row.published === "1",
    isBestseller: row.featured === "1",
    images: gallery,
    lowStockThreshold: Number(row.lowStock) || 2,
    variants,
  };
}

console.log(
  `CSV rows: simple=${simples.length} variable=${variables.length} variation=${variations.length}`,
);

for (const row of [...simples, ...variables].sort((a, b) => Number(a.id) - Number(b.id))) {
  const built = row.type === "simple" ? await buildSimple(row) : await buildVariable(row);
  if (built) {
    products.push(built);
    console.log(
      "OK",
      built.slug,
      `€${(built.priceInCents / 100).toFixed(0)}`,
      `imgs=${built.images.length}`,
      `vars=${built.variants.length}`,
      built.isPublished ? "pub" : "draft",
    );
  } else {
    console.log("SKIP", row.id, row.name, `pub=${row.published}`);
  }
}

console.log(`\nCatalog: ${products.length} products`);

const fileBody = `import type { Product } from "@/lib/types";

/** Catalog imported from WooCommerce CSV (${path.basename(csvPath)}). */
export const products: Product[] = [
${products.map(emitProduct).join("\n")}
];
`;

if (dryRun) {
  fs.writeFileSync(path.join(ROOT, "tmp-woo-import-preview.json"), JSON.stringify(products, null, 2));
  console.log("Dry run — wrote tmp-woo-import-preview.json");
} else {
  fs.writeFileSync(PRODUCTS_TS, fileBody);
  fs.writeFileSync(path.join(ROOT, "tmp-woo-catalog-import.json"), JSON.stringify(products, null, 2));
  console.log("Wrote", PRODUCTS_TS);
}

// Summary: names for human check
console.log("\n=== FINAL CATALOG ===");
for (const p of products) {
  console.log(
    `- ${p.name} [${p.slug}] ${p.priceInCents / 100} zł | ${p.variants.length} var | ${p.images.length} img | ${p.domain}/${p.category}`,
  );
  for (const v of p.variants) {
    console.log(
      `    · ${v.title} stock=${v.stockQuantity} avail=${v.isAvailable} img=${v.image ? "yes" : "no"} color=${v.color || "-"} cap=${v.capacityMl || "-"}`,
    );
  }
}
