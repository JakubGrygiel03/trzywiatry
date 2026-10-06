/**
 * In-place shrink of catalog photos before `next build`.
 * Keeps file extensions (URLs stay valid). JPEG 88 / PNG level 9 / max 2400px.
 * Fail the build if anything is still over 3 MB — that would bloat Vercel again.
 */
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOTS = [
  "public/brand/photos",
  "public/brand/chmurki",
  "public/brand/wzory",
  "public/brand/patterns",
];
const MAX_EDGE = 2400;
const JPEG_QUALITY = 88;
const MAX_SHIP_BYTES = 3 * 1024 * 1024;
const SKIP_UNDER = 350 * 1024;

async function walk(dir, acc = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, acc);
    else if (/\.(jpe?g|png|webp)$/i.test(entry.name)) acc.push(full);
  }
  return acc;
}

async function optimizeFile(file) {
  const input = await readFile(file);
  if (input.length < SKIP_UNDER) return input.length;

  const ext = path.extname(file).toLowerCase();
  const image = sharp(input, { failOn: "none" }).rotate();
  const meta = await image.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  const sized =
    width > MAX_EDGE || height > MAX_EDGE
      ? image.resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
      : image;

  let out;
  if (ext === ".png") {
    out = await sized.png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer();
  } else if (ext === ".webp") {
    out = await sized.webp({ quality: JPEG_QUALITY }).toBuffer();
  } else {
    out = await sized.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
  }

  if (out.length < input.length * 0.92) {
    await writeFile(file, out);
    return out.length;
  }
  return input.length;
}

const files = [];
for (const root of ROOTS) {
  await walk(path.join(process.cwd(), root), files);
}

let rewritten = 0;
const oversized = [];
for (const file of files) {
  try {
    const before = (await stat(file)).size;
    const after = await optimizeFile(file);
    if (after < before) rewritten += 1;
    if (after > MAX_SHIP_BYTES) oversized.push({ file, after });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn("[photos] skip", path.relative(process.cwd(), file), message);
    try {
      const size = (await stat(file)).size;
      if (size > MAX_SHIP_BYTES) oversized.push({ file, after: size });
    } catch {
      oversized.push({ file, after: MAX_SHIP_BYTES + 1 });
    }
  }
}

console.log(`[photos] checked ${files.length} files, rewritten ${rewritten}`);

if (oversized.length) {
  console.error("[photos] files still over 3 MB after optimize — refuse deploy:");
  for (const item of oversized) {
    const mb = (item.after / (1024 * 1024)).toFixed(1);
    console.error(`  ${mb} MB  ${path.relative(process.cwd(), item.file)}`);
  }
  process.exit(1);
}
