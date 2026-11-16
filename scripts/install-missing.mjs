// Instala SOLO lo que falte. Uso: node scripts/install-missing.mjs
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { DEV, PROD } from "./required-deps.mjs";

const packageUrl = new URL("../package.json", import.meta.url);
if (!existsSync(packageUrl)) {
  console.log("No encuentro package.json. Ejecuta este script dentro de la carpeta del proyecto.");
  process.exit(1);
}

const pkg = JSON.parse(readFileSync(packageUrl, "utf8"));
const installed = { ...pkg.dependencies, ...pkg.devDependencies };
const missingProd = PROD.filter((name) => !installed[name]);
const missingDev = DEV.filter((name) => !installed[name]);

function run(command) {
  console.log(`> ${command}`);
  execSync(command, { stdio: "inherit" });
}

if (missingProd.length === 0 && missingDev.length === 0) {
  console.log("No falta ninguna dependencia.");
} else {
  if (missingProd.length > 0) run(`npm install ${missingProd.join(" ")}`);
  if (missingDev.length > 0) run(`npm install -D ${missingDev.join(" ")}`);
  console.log("\nListo. Ahora ejecuta: node scripts/pin-versions.mjs && npm install");
}
