// Video language. Russian by default; the Uzbek cut is rendered with --props='{"lang":"uz"}'.
// Strings stay Russian in the code and are looked up in src/i18n/uz.json (built from tools/i18n/uz.tsv).
import { getInputProps } from "remotion";
import UZ from "./i18n/uz.json";

export const LANG: "ru" | "uz" = (getInputProps() as { lang?: string }).lang === "uz" ? "uz" : "ru";
const DICT = UZ as Record<string, string>;
export const tr = (s: string): string => (LANG === "uz" ? DICT[s] ?? s : s);

/** Classic Uzbek Latin (oʻ, gʻ, sh, ch) to the new 2026 alphabet (ö, ğ, ş, ç). */
export const nu = (s: string): string =>
  s
    .replace(/([OoGg])[ʻ‘'’`]/g, (_, c: string) => ({ O: "Ö", o: "ö", G: "Ğ", g: "ğ" })[c]!)
    .replace(/S[Hh]/g, "Ş").replace(/sh/g, "ş")
    .replace(/C[Hh]/g, "Ç").replace(/ch/g, "ç")
    .replace(/(\p{L})['’‘ʻ](?=\p{L})/gu, "$1ʼ");
/** Uzbek text already in the code (Latin, classic alphabet), shown in the new alphabet in the Uzbek cut. */
export const uzt = (s: string): string => (LANG === "uz" ? nu(s) : s);
