const https = require("https");
const fs = require("fs");

https
  .get("https://trzywiatry.pl/sklep/", { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
    let d = "";
    res.on("data", (c) => (d += c));
    res.on("end", () => {
      fs.writeFileSync("tmp-sklep.html", d);
      console.log("status", res.statusCode, "len", d.length);
      const hrefs = [...d.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
      console.log(
        "interesting",
        hrefs.filter((h) => /produkt|product|sklep|wp-content\/uploads/i.test(h)).slice(0, 60),
      );
      console.log("produkt count", (d.match(/produkt/gi) || []).length);
      console.log("uploads count", (d.match(/wp-content\/uploads/gi) || []).length);
    });
  })
  .on("error", console.error);
