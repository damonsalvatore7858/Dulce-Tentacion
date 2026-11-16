// Diagnóstico rápido del proyecto. Uso: node scripts/check-setup.mjs
import { existsSync, readFileSync } from "node:fs";
import { DEV, PROD } from "./required-deps.mjs";

const root = new URL("../", import.meta.url);
const has = (p) => existsSync(new URL(p, root));
const problems = [];

if (has("src/app/layout.tsx")) {
  problems.push("BORRA src/app/layout.tsx (es el de create-next-app y causa el error de hidratación).");
}
if (has("src/app/page.tsx")) {
  problems.push("BORRA src/app/page.tsx (la portada ahora vive en src/app/[lang]/page.tsx).");
}
if (!has("src/app/[lang]/layout.tsx")) {
  problems.push("Falta src/app/[lang]/layout.tsx: copia el contenido del zip encima del proyecto.");
}
if (!has("src/proxy.ts")) {
  problems.push("Falta src/proxy.ts (enrutado de idiomas).");
}
if (!["postcss.config.mjs", "postcss.config.js", "postcss.config.cjs"].some(has)) {
  problems.push("Falta postcss.config.mjs: sin él Tailwind no genera estilos.");
}
if (has("src/app/globals.css")) {
  const css = readFileSync(new URL("src/app/globals.css", root), "utf8");
  if (!css.includes("--color-brand-pink")) {
    problems.push("src/app/globals.css no es el del proyecto: vuelve a copiarlo desde el zip.");
  }
} else {
  problems.push("Falta src/app/globals.css.");
}

if (has("package.json")) {
  const pkg = JSON.parse(readFileSync(new URL("package.json", root), "utf8"));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const required = ["next", "react", ...PROD, ...DEV];
  for (const name of required) {
    if (!deps[name]) problems.push(`Falta instalar: ${name}  (arréglalo con: node scripts/install-missing.mjs)`);
  }
} else {
  problems.push("No encuentras package.json: ejecuta este script dentro de la carpeta del proyecto.");
}

if (problems.length === 0) {
  console.log("Todo en orden. Ejecuta: npm run dev");
} else {
  console.log("Hay que corregir esto:\n");
  problems.forEach((p, i) => console.log(`${i + 1}. ${p}`));
  process.exitCode = 1;
}
