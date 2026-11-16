import { pathToFileURL } from "node:url";
import path from "node:path";
import fs from "node:fs";

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const rel = specifier.slice(2);
    const candidates = [
      path.resolve("src", rel),
      path.resolve("src", rel + ".ts"),
      path.resolve("src", rel + ".tsx"),
      path.resolve("src", rel + ".js"),
      path.resolve("src", rel, "index.ts"),
    ];
    for (const cand of candidates) {
      if (fs.existsSync(cand)) {
        return {
          shortCircuit: true,
          url: pathToFileURL(cand).href,
        };
      }
    }
  }
  return nextResolve(specifier, context);
}
