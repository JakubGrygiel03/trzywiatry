const fs = require("fs");
const s = fs.readFileSync("lib/data/products.ts", "utf8");
console.log("woo refs", (s.match(/\/woo\//g) || []).length);
console.log("p-forma-czarka-3", s.includes("p-forma-czarka-3"));
console.log("p-szesciokatna-czarka-smukla", s.includes("p-szesciokatna-czarka-smukla"));
console.log("product ids", (s.match(/id: "p-/g) || []).length);
console.log("granatowa woo", s.includes("micha-granatowa-01.png"));
console.log("open", (s.match(/\{/g) || []).length, "close", (s.match(/\}/g) || []).length);
