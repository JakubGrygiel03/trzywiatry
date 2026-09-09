const https = require("https");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const DEST = path.join(__dirname, "..", "public", "brand", "photos", "products", "woo");

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "Mozilla/5.0 TrzyWiatrySync/1.0" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return fetchText(new URL(res.headers.location, url).href).then(resolve, reject);
        }
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve({ status: res.statusCode, data, url }));
      })
      .on("error", reject);
  });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          try {
            fs.unlinkSync(dest);
          } catch {}
          return download(new URL(res.headers.location, url).href, dest).then(resolve, reject);
        }
        if (res.statusCode !== 200) {
          file.close();
          try {
            fs.unlinkSync(dest);
          } catch {}
          return reject(new Error("HTTP " + res.statusCode + " " + url));
        }
        res.pipe(file);
        file.on("finish", () => file.close(() => resolve(dest)));
      })
      .on("error", (e) => {
        try {
          fs.unlinkSync(dest);
        } catch {}
        reject(e);
      });
  });
}

function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/Ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function extFromUrl(u) {
  const m = u.match(/\.(jpe?g|png|webp)(?:$|\?)/i);
  return m ? m[1].toLowerCase().replace("jpeg", "jpg") : "jpg";
}

function collectProductLinks(html) {
  const set = new Set();
  for (const m of html.matchAll(/https?:\/\/trzywiatry\.pl\/product\/[^"'>\s]+/g)) {
    set.add(m[0].replace(/\/$/, "") + "/");
  }
  for (const m of html.matchAll(/href="(\/product\/[^"]+)"/g)) {
    set.add("https://trzywiatry.pl" + m[1].replace(/\/$/, "") + "/");
  }
  return set;
}

function collectImages(html) {
  const imgs = new Set();
  const re =
    /(?:data-large_image|data-src|src)="(https:\/\/trzywiatry\.pl\/wp-content\/uploads\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/gi;
  let m;
  while ((m = re.exec(html))) {
    let u = m[1].split("?")[0];
    u = u.replace(/-\d+x\d+(?=\.(jpg|jpeg|png|webp)$)/i, "");
    if (/woocommerce|logo|favicon|avatar|sprite|cropped-Trzy/i.test(u)) continue;
    imgs.add(u);
  }
  // Also og:image
  const og = html.match(/property="og:image"\s+content="([^"]+)"/i);
  if (og) {
    let u = og[1].split("?")[0].replace(/-\d+x\d+(?=\.(jpg|jpeg|png|webp)$)/i, "");
    imgs.add(u);
  }
  return [...imgs];
}

(async () => {
  fs.mkdirSync(DEST, { recursive: true });
  const productLinks = new Set();
  for (const p of [1, 2, 3, 4]) {
    const url = p === 1 ? "https://trzywiatry.pl/sklep/" : `https://trzywiatry.pl/sklep/page/${p}/`;
    const { data } = await fetchText(url);
    for (const link of collectProductLinks(data)) productLinks.add(link);
    console.log("page", p, "links", productLinks.size);
  }

  const catalog = [];
  for (const link of productLinks) {
    const { data } = await fetchText(link);
    const titleMatch =
      data.match(/<h1[^>]*class="[^"]*product_title[^"]*"[^>]*>([^<]+)<\/h1>/i) ||
      data.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    const name = titleMatch
      ? titleMatch[1]
          .replace(/&amp;/g, "&")
          .replace(/&#8211;/g, "-")
          .replace(/&ndash;/g, "-")
          .trim()
      : link;
    const pathSlug = link.match(/\/product\/([^/]+)/)?.[1] ?? slugify(name);
    const slug = pathSlug;
    const imageList = collectImages(data);
    const localPaths = [];
    for (let i = 0; i < imageList.length; i++) {
      const remote = imageList[i];
      const file = `${slug}-${String(i + 1).padStart(2, "0")}.${extFromUrl(remote)}`;
      const dest = path.join(DEST, file);
      if (!fs.existsSync(dest) || fs.statSync(dest).size < 500) {
        try {
          await download(remote, dest);
          console.log("DL", file);
        } catch (e) {
          console.warn("FAIL", remote, e.message);
          continue;
        }
      } else {
        console.log("SKIP", file);
      }
      localPaths.push(`/brand/photos/products/woo/${file}`);
    }
    catalog.push({ link, name, slug, images: localPaths, remoteCount: imageList.length });
    console.log(name, "->", localPaths.length);
  }

  fs.writeFileSync(path.join(__dirname, "..", "tmp-woo-catalog.json"), JSON.stringify(catalog, null, 2));
  console.log("DONE products", catalog.length);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
