// Quita ^ y ~ de package.json para dejar versiones exactas (reproducibles).
// Uso: node scripts/pin-versions.mjs && npm install
import { readFileSync, writeFileSync } from "node:fs";

const path = new URL("../package.json", import.meta.url);
const pkg = JSON.parse(readFileSync(path, "utf8"));

for (const key of ["dependencies", "devDependencies"]) {
  for (const [name, range] of Object.entries(pkg[key] ?? {})) {
    pkg[key][name] = String(range).replace(/^[\^~]/, "");
  }
}

writeFileSync(path, JSON.stringify(pkg, null, 2) + "\n");
console.log("Versiones fijadas (sin ^ ni ~).");
