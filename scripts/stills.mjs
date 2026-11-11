import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "path"; import fs from "fs";
const [comp, out, ...frames] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const c = await selectComposition({ serveUrl, id: comp });
fs.mkdirSync(out, { recursive: true });
for (const fr of frames) { await renderStill({ composition: c, serveUrl, output: `${out}/${String(fr).padStart(5,"0")}.png`, frame: Number(fr), scale: 0.5 }); process.stdout.write(fr+" "); }
