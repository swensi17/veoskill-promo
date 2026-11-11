#!/usr/bin/env node
// Сборка ролика veoskill одной командой.
//   node scripts/build.mjs            финал: 1920x1080, 60 fps, H.264 yuv420p, звук AAC  -> out/veoskill-promo.mp4
//   node scripts/build.mjs --draft    черновик: 960x540, быстрее в ~4 раза, со звуком   -> out/draft.mp4
//   node scripts/build.mjs --scene 6  одна сцена (номер из таблицы или имя, напр. LessonPath), 960x540, без звука -> out/scene-6.mp4
//   node scripts/build.mjs --list     таблица сцен: номер, имя, кадры, секунды
// Python берётся из переменной PYTHON (иначе python / python3). Нужны ffmpeg и ffprobe в PATH.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
process.chdir(ROOT);
const argv = process.argv.slice(2);
const has = (k) => argv.includes(k);
const val = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
const COMP = "VeoskillV11";
const FPS = 60;
const WIN = process.platform === "win32";
const PY = process.env.PYTHON || (WIN ? "python" : "python3");
const CONC = String(Math.max(2, os.cpus().length - 1));

// Таблица сцен читается прямо из src/V11.tsx (единый источник правды).
const src = fs.readFileSync("src/V11.tsx", "utf8");
const block = src.slice(src.indexOf("const SCENES"), src.indexOf("];", src.indexOf("const SCENES")));
const scenes = [...block.matchAll(/\{ C: (\w+), d: (\d+)([^}]*)\}/g)].map((m) => ({ name: m[1], d: Number(m[2]), k: Number((m[3].match(/k: ([\d.]+)/) || [0, 1])[1]) }));
let acc = 0;
for (const s of scenes) { s.from = acc; acc += s.d; s.to = acc - 1; }
const TOTAL = acc;
fs.mkdirSync("out/audio", { recursive: true });
fs.writeFileSync("out/scenes.json", JSON.stringify(scenes.map((s) => s.d)));
// time stretch per scene (k in SCENES): audio cue frames inside a slowed scene are multiplied by k
fs.writeFileSync("out/slow.json", JSON.stringify(scenes.map((s) => s.k)));

const run = (cmd, args, label) => {
  const t = Date.now();
  console.log(`\n> ${label}`);
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: WIN });
  if (r.status !== 0) { console.error(`ОШИБКА на шаге: ${label}`); process.exit(r.status ?? 1); }
  console.log(`  готово за ${((Date.now() - t) / 1000).toFixed(0)} с`);
};
const remotion = (out, extra) => run("npx", ["remotion", "render", "src/index.ts", COMP, out, "--codec=h264", "--pixel-format=yuv420p", `--concurrency=${CONC}`, "--log=error", ...extra], `рендер картинки -> ${out}`);
const sound = (video, out) => {
  run(PY, ["audio/mix.py"], "сведение звука");
  run(PY, ["tools/real-sound/master.py", "out/audio/premaster.wav", "out/audio/soundtrack.wav", "--lufs", "-14", "--fade", "1.2"], "мастеринг -14 LUFS");
  run("node", ["tools/real-sound/mux.mjs", "--video", video, "--audio", "out/audio/soundtrack.wav", "--out", out], `склейка звука -> ${out}`);
};

if (has("--list")) {
  for (const [i, s] of scenes.entries()) console.log(`${String(i + 1).padStart(2)}  ${s.name.padEnd(12)} кадры ${s.from}-${s.to}  ${(s.from / FPS).toFixed(2)}-${((s.to + 1) / FPS).toFixed(2)} с`);
  console.log(`итого ${TOTAL} кадров, ${(TOTAL / FPS).toFixed(2)} с`);
} else if (has("--scene")) {
  const k = val("--scene");
  const s = /^\d+$/.test(k) ? scenes[Number(k) - 1] : scenes.find((x) => x.name.toLowerCase() === String(k).toLowerCase());
  if (!s) { console.error("Нет такой сцены. Список: node scripts/build.mjs --list"); process.exit(1); }
  remotion(`out/scene-${k}.mp4`, [`--frames=${s.from}-${s.to}`, "--scale=0.5", "--crf=23", "--muted"]);
} else if (has("--draft")) {
  remotion("out/draft-silent.mp4", ["--scale=0.5", "--crf=23", "--muted"]);
  sound("out/draft-silent.mp4", "out/draft.mp4");
} else {
  remotion("out/silent.mp4", ["--crf=16", "--muted"]);
  sound("out/silent.mp4", "out/veoskill-promo.mp4");
}
