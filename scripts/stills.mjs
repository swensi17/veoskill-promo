import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "path"; import fs from "fs";
const [comp, out, ...frames] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browserExecutable = process.env.REMOTION_BROWSER || null; // local browser override (see remotion.config.ts)
const inputProps = process.env.VLANG ? { lang: process.env.VLANG } : {}; // VLANG=uz for the Uzbek cut
const c = await selectComposition({ serveUrl, id: comp, browserExecutable, inputProps });
fs.mkdirSync(out, { recursive: true });
for (const fr of frames) { await renderStill({ composition: c, serveUrl, output: `${out}/${String(fr).padStart(5,"0")}.png`, frame: Number(fr), scale: 0.5, browserExecutable, inputProps }); process.stdout.write(fr+" "); }
