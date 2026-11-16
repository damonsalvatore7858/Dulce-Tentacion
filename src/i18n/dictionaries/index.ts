import type { Locale } from "../config";
import { en } from "./en";
import { es, type Dictionary } from "./es";

export type { Dictionary };

export function getDictionary(lang: Locale): Dictionary {
  return lang === "en" ? en : es;
}
