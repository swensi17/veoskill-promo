import React from "react";
import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, OUT, useFonts, pop, CardIcon } from "./Intro";
import { Cursor, Ring } from "./Product";

// Сетка: 120 ударов в минуту, 1 удар = 15 кадров = 0,5 с. Каждое слово — один удар.
const B = 15;
const NIGHT = "#000437";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const IO = Easing.bezier(0.65, 0, 0.35, 1);
const FAST = Easing.bezier(0.2, 0.9, 0.1, 1);
const hash = (a: number, b: number) => Math.abs((Math.sin(a * 12.9898 + b * 78.233) * 43758.5453) % 1);

// быстрый «всплеск»: пружина с высокой жёсткостью
const snap = (f: number, d = 0) => {
  const t = Math.max(0, f - d);
  const k = 1 - Math.exp(-t / 2.2) * Math.cos(t / 1.6);
  return Math.min(1.12, k);
};

// ---------- сцена: границы быстрые (4 кадра), размытие и удар ----------
const Sc: React.FC<{ dur: number; bg: string; children: React.ReactNode }> = ({ dur, bg, children }) => {
  const f = useCurrentFrame();
  const blur = Math.max(interpolate(f, [0, 5], [18, 0], clamp), interpolate(f, [dur - 4, dur], [0, 18], clamp));
  const sc = interpolate(f, [0, 8], [1.07, 1], { easing: FAST, ...clamp }) * interpolate(f, [dur - 4, dur], [1, 1.04], clamp);
  return <AbsoluteFill style={{ background: bg, filter: `blur(${blur}px)` }}><AbsoluteFill style={{ transform: `scale(${sc})` }}>{children}</AbsoluteFill></AbsoluteFill>;
};

// ---------- слово на весь экран (один удар) ----------
const WordBeat: React.FC<{ words: { t: string; bg: string; fg?: string }[]; per?: number }> = ({ words, per = B }) => {
  const f = useCurrentFrame();
  const i = Math.min(words.length - 1, Math.floor(f / per));
  const lf = f - i * per;
  const w = words[i];
  const s = snap(lf);
  const size = Math.min(330, 2300 / Math.max(5, w.t.length));
  return (
    <AbsoluteFill style={{ background: w.bg, alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: size, color: w.fg ?? "#fff", transform: `scale(${0.55 + s * 0.45}) rotate(${(i % 2 ? 1 : -1) * (1 - Math.min(1, s)) * 5}deg)`, opacity: Math.min(1, lf / 2 + 0.25), filter: `blur(${Math.max(0, 8 - lf * 2)}px)`, whiteSpace: "nowrap" }}>{w.t}</div>
    </AbsoluteFill>
  );
};

const Count: React.FC<{ to: number; at: number; dur: number; suffix?: string; size?: number; color?: string }> = ({ to, at, dur, suffix = "", size = 220, color = C.blue }) => {
  const f = useCurrentFrame();
  const v = Math.round(interpolate(f, [at, at + dur], [0, to], { easing: FAST, ...clamp }));
  return <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: size, color }}>{v}{suffix}</span>;
};

const Confetti: React.FC<{ at: number; x: number; y: number; n?: number }> = ({ at, x, y, n = 36 }) => {
  const f = useCurrentFrame();
  const t = (f - at) / 40;
  if (t < 0 || t > 1.4) return null;
  const cols = [C.blue, C.green, C.orange, C.violet, C.coral, C.yellow];
  return (
    <>{Array.from({ length: n }).map((_, i) => {
      const a = hash(i, 1) * Math.PI * 2; const v = 380 + hash(i, 2) * 700; const g = 900;
      const px = x + Math.cos(a) * v * t; const py = y + Math.sin(a) * v * t * 0.8 + g * t * t * 0.5;
      return <div key={i} style={{ position: "absolute", left: px, top: py, width: 18 + hash(i, 3) * 16, height: 12 + hash(i, 4) * 12, background: cols[i % 6], opacity: 1 - Math.max(0, t - 0.9) * 2.5, transform: `rotate(${t * 720 * (hash(i, 5) - 0.5)}deg)` }} />;
    })}</>
  );
};

// ---------- скриншот с камерой и 3D-наклоном ----------
type Cam = { f: number; cx: number; cy: number; s: number };
const Shot2: React.FC<{ img: string; cam: Cam[]; tilt?: { f: number; ry: number; rx: number }[]; children?: (inv: number) => React.ReactNode }> = ({ img, cam, tilt, children }) => {
  const f = useCurrentFrame();
  const g = (k: "cx" | "cy" | "s") => interpolate(f, cam.map((c) => c.f), cam.map((c) => c[k]), { easing: FAST, ...clamp });
  const s = g("s"), cx = g("cx"), cy = g("cy");
  const ry = tilt ? interpolate(f, tilt.map((t) => t.f), tilt.map((t) => t.ry), { easing: FAST, ...clamp }) : 0;
  const rx = tilt ? interpolate(f, tilt.map((t) => t.f), tilt.map((t) => t.rx), { easing: FAST, ...clamp }) : 0;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, perspective: 2400 }}>
      <div style={{ position: "absolute", left: 240, top: 30, width: 1440, height: 900, borderRadius: 30, overflow: "hidden", background: "#fff", boxShadow: `0 40px 90px rgba(24,153,214,.35), 0 0 0 6px ${C.blue}`, transform: `rotateY(${ry}deg) rotateX(${rx}deg)` }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1440, height: 900, transformOrigin: "0 0", transform: `translate(${720 - cx * s}px,${450 - cy * s}px) scale(${s})` }}>
          <Img src={staticFile(img)} style={{ width: 1440, height: 900, display: "block" }} />
          {children?.(1 / s)}
        </div>
      </div>
    </div>
  );
};

// короткая подпись (живёт ~0,5 с)
const Tag: React.FC<{ text: string; at: number; dur?: number; x?: number; y?: number; color?: string; dark?: string; size?: number }> = ({ text, at, dur = 15, x = 960, y = 985, color = C.green, dark = C.greenDark, size = 56 }) => {
  const f = useCurrentFrame();
  if (f < at || f > at + dur) return null;
  const s = snap(f - at);
  const out = interpolate(f, [at + dur - 3, at + dur], [1, 0], clamp);
  return <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${0.6 + s * 0.4})`, opacity: out, background: color, color: "#fff", fontFamily: FONT, fontWeight: 900, fontSize: size, borderRadius: 40, padding: "18px 50px", boxShadow: `0 10px 0 ${dark}, 0 20px 40px rgba(0,0,0,.15)`, whiteSpace: "nowrap" }}>{text}</div>;
};

const Arrow: React.FC<{ x1: number; y1: number; cx: number; cy: number; x2: number; y2: number; at: number }> = ({ x1, y1, cx, cy, x2, y2, at }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + 8], [0, 1], { easing: FAST, ...clamp });
  const ang = Math.atan2(y2 - cy, x2 - cx);
  const h = (a: number) => `${x2 - Math.cos(ang + a) * 70},${y2 - Math.sin(ang + a) * 70}`;
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <path d={`M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`} fill="none" stroke={C.coral} strokeWidth="26" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - p} />
      {p > 0.85 && <polyline points={`${h(0.5)} ${x2},${y2} ${h(-0.5)}`} fill="none" stroke={C.coral} strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
};

// =====================  СЦЕНЫ  =====================

// HOOK (0–90): три слова по удару, затем логотип
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 45) return <WordBeat words={[{ t: "Читай.", bg: C.blue }, { t: "Понимай.", bg: C.green }, { t: "Учись.", bg: C.orange }]} />;
  const lf = f - 45;
  const s = snap(lf);
  const chips = [["Законы", C.blue, C.blueDark], ["Уроки", C.green, C.greenDark], ["Игры", C.orange, C.orangeDark]] as const;
  return (
    <AbsoluteFill style={{ background: C.white }}>
      {[[330, 260, 46, C.blue], [1560, 230, 34, C.green], [260, 800, 30, C.orange], [1650, 760, 54, C.violet], [520, 140, 22, C.coral], [1380, 900, 26, C.yellow]].map(([x, y, r, c], i) => {
        const p = snap(lf, 4 + i * 2);
        return <div key={i} style={{ position: "absolute", left: (x as number) - (r as number), top: (y as number) - (r as number), width: (r as number) * 2, height: (r as number) * 2, borderRadius: "50%", background: c as string, transform: `scale(${p})` }} />;
      })}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 50 }}>
        <Img src={staticFile("img/logo.png")} style={{ width: 1000, transform: `scale(${0.4 + s * 0.6})`, filter: `blur(${Math.max(0, 14 - lf * 3)}px)` }} />
        <div style={{ display: "flex", gap: 30 }}>
          {chips.map(([t, c, d], i) => {
            const p = snap(lf, 14 + i * 8);
            return <div key={i} style={{ fontFamily: FONT, fontWeight: 900, fontSize: 70, color: "#fff", background: c, borderRadius: 40, padding: "14px 54px", boxShadow: `0 10px 0 ${d}`, transform: `scale(${p}) translateY(${(1 - Math.min(1, p)) * 60}px)` }}>{t}</div>;
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ЗАКОНЫ (375): библиотека (0–70) -> кодексы вспышками (70–160) -> статья (160–260) -> читалка (260–375)
const Laws: React.FC = () => {
  const f = useCurrentFrame();
  if (f >= 260) return <Reader lf={f - 260} />;
  if (f >= 160) return <Article lf={f - 160} />;
  if (f >= 70) return <Codes lf={f - 70} />;
  return (
    <AbsoluteFill style={{ background: C.mist }}>
      <Shot2 img="shots/laws-desk.png"
        tilt={[{ f: 0, ry: -24, rx: 10 }, { f: 14, ry: 0, rx: 0 }]}
        cam={[{ f: 0, cx: 720, cy: 450, s: 0.9 }, { f: 12, cx: 720, cy: 450, s: 1 }, { f: 18, cx: 700, cy: 125, s: 1.7 }, { f: 30, cx: 380, cy: 125, s: 1.7 }, { f: 46, cx: 1040, cy: 125, s: 1.7 }, { f: 56, cx: 420, cy: 330, s: 1.3 }, { f: 62, cx: 190, cy: 290, s: 2.4 }, { f: 70, cx: 190, cy: 290, s: 8 }]}>
        {(inv) => (
          <>
            <Ring x={70} y={104} w={1340} h={42} at={20} until={52} inv={inv} />
            <Ring x={24} y={176} w={336} h={206} at={54} until={76} inv={inv} />
            <Cursor inv={inv} clicks={[64]} path={[{ f: 12, x: 100, y: 190 }, { f: 22, x: 200, y: 125 }, { f: 48, x: 1100, y: 125 }, { f: 58, x: 300, y: 300 }, { f: 64, x: 190, y: 300 }, { f: 70, x: 190, y: 300 }]} />
          </>
        )}
      </Shot2>
      <Tag text="Законы" at={0} dur={16} y={60} x={330} color={C.blue} dark={C.blueDark} />
      <Tag text="Для любой профессии" at={20} dur={30} />
    </AbsoluteFill>
  );
};

const Codes: React.FC<{ lf: number }> = ({ lf }) => {
  const names = ["Гражданский", "Уголовный", "Трудовой", "Налоговый", "Семейный", "Земельный", "Жилищный", "Таможенный"];
  const cols = [C.blue, C.green, C.orange, C.violet, C.coral, C.blueDark, C.greenDark, C.orangeDark];
  return (
    <AbsoluteFill style={{ background: C.white }}>
      <div style={{ position: "absolute", left: 120, top: 250, transform: `scale(${snap(lf)})`, transformOrigin: "0 50%" }}>
        <Count to={21} at={2} dur={16} size={420} color={C.blue} />
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 130, color: C.ink, marginTop: -30 }}>кодекс</div>
      </div>
      {names.map((n, i) => {
        const at = 8 + i * 8;
        const s = snap(lf, at);
        const col = i % 2, row = Math.floor(i / 2);
        return <div key={i} style={{ position: "absolute", left: 800 + col * 520, top: 150 + row * 190, width: 480, height: 150, borderRadius: 44, background: cols[i], color: "#fff", fontFamily: FONT, fontWeight: 900, fontSize: 60, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 0 rgba(0,0,0,.2)", transform: `scale(${s}) rotate(${(1 - Math.min(1, s)) * (i % 2 ? 10 : -10)}deg)`, opacity: lf < at ? 0 : 1 }}>{n}</div>;
      })}
      <Tag text="и сотни законов — до 2026 года" at={74} dur={16} y={960} color={C.orange} dark={C.orangeDark} size={60} />
    </AbsoluteFill>
  );
};

const Article: React.FC<{ lf: number }> = ({ lf }) => (
  <AbsoluteFill style={{ background: C.mist }}>
    <Shot2 img="shots/article-desk.png"
      cam={[{ f: 0, cx: 720, cy: 140, s: 2.6 }, { f: 10, cx: 720, cy: 450, s: 1 }, { f: 20, cx: 720, cy: 470, s: 1.3 }, { f: 62, cx: 720, cy: 470, s: 1.3 }, { f: 72, cx: 600, cy: 720, s: 1.55 }, { f: 100, cx: 600, cy: 720, s: 1.55 }]}>
      {(inv) => (
        <>
          <Ring x={346} y={278} w={750} h={402} at={22} until={66} inv={inv} />
          <Ring x={344} y={703} w={202} h={50} at={74} until={100} inv={inv} />
          <Cursor inv={inv} clicks={[90]} path={[{ f: 14, x: 1000, y: 200 }, { f: 36, x: 760, y: 500 }, { f: 76, x: 470, y: 727 }, { f: 88, x: 455, y: 727 }, { f: 100, x: 455, y: 727 }]} />
        </>
      )}
    </Shot2>
    <Tag text="«Простыми словами»" at={24} dur={38} />
    <Tag text="Открыть в читалке" at={72} dur={28} color={C.blue} dark={C.blueDark} />
    <Arrow x1={1500} y1={160} cx={1780} cy={330} x2={1430} y2={470} at={26} />
  </AbsoluteFill>
);

const Courses: React.FC = () => {
  const f = useCurrentFrame();
  const ds: [string, string][] = [["Право", "icon_legal.png"], ["Медицина", "icon_medical.png"], ["IT", "icon_it.png"], ["Экономика", "icon_economics.png"], ["Финансы", "icon_finance.png"], ["Психология", "icon_psychology.png"], ["Бизнес", "icon_business.png"], ["История", "icon_history.png"]];
  const hi = f >= 56 ? Math.min(7, Math.floor((f - 56) / 9)) : -1;
  const zoom = interpolate(f, [128, 146], [0, 1], { easing: IO, ...clamp });
  return (
    <AbsoluteFill style={{ background: C.white }}>
      <div style={{ position: "absolute", top: 60, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 110, color: C.ink, transform: `scale(${snap(f)})` }}>Курсы по любому направлению</div>
      {ds.map(([t, img], i) => {
        const col = i % 4, row = Math.floor(i / 4);
        const p = snap(f, 6 + i * 4);
        const on = hi === i;
        const c = [C.blue, C.green, C.orange, C.violet][col];
        return (
          <div key={i} style={{ position: "absolute", left: 130 + col * 410, top: 270 + row * 380, width: 370, height: 340, borderRadius: 56, background: "#fff", border: `6px solid ${c}`, boxShadow: `0 ${on ? 22 : 14}px 0 ${c}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, transform: `scale(${p * (on ? 1.08 : 1)}) rotate(${(1 - Math.min(1, p)) * (i % 2 ? 12 : -12)}deg)` }}>
            <Img src={staticFile(`img/${img}`)} style={{ width: 150, height: 150 }} />
            <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 52, color: C.ink }}>{t}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 130, top: 270, width: 370, height: 340, borderRadius: 56, background: C.mist, transform: `scale(${1 + zoom * 7})`, opacity: zoom > 0 ? 1 : 0, transformOrigin: "50% 50%" }} />
    </AbsoluteFill>
  );
};


const Reader: React.FC<{ lf: number }> = ({ lf }) => {
  const hl1 = interpolate(lf, [8, 18], [0, 100], { easing: FAST, ...clamp });
  const hl2 = interpolate(lf, [26, 36], [0, 100], { easing: FAST, ...clamp });
  const hl3 = interpolate(lf, [58, 68], [0, 100], { easing: FAST, ...clamp });
  const span = (txt: string, p: number, col: string) => <span style={{ background: `linear-gradient(${col},${col}) no-repeat left center / ${p}% 88%`, padding: "0 4px", borderRadius: 8 }}>{txt}</span>;
  const note = snap(lf, 44);
  const bar = snap(lf, 2);
  return (
    <AbsoluteFill style={{ background: C.white }}>
      <div style={{ position: "absolute", left: 300, top: 250, width: 1320, padding: "60px 80px", borderRadius: 48, background: "#fff", boxShadow: "0 30px 80px rgba(24,153,214,.25)", border: `5px solid ${C.mist}` }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 76, color: C.ink }}>Статья 1.</div>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 56, lineHeight: 1.55, color: C.ink, marginTop: 26 }}>
          Узбекистан — {span("суверенное, демократическое,", hl1, "#ffe27a")} {span("правовое, социальное", hl2, "#b6f08a")} и {span("светское", hl3, "#84d8ff")} государство с республиканской формой правления.
        </div>
      </div>
      <div style={{ position: "absolute", left: 540, top: 205, display: "flex", gap: 22, alignItems: "center", background: NIGHT, padding: "16px 32px", borderRadius: 60, transform: `scale(${bar})` }}>
        {["#ffe27a", "#b6f08a", "#84d8ff", "#ff9bb0"].map((c, i) => <div key={i} style={{ width: 44, height: 44, borderRadius: "50%", background: c }} />)}
      </div>
      <div style={{ position: "absolute", left: 1210, top: 790, width: 420, padding: "24px 32px", background: "#fff8c8", borderRadius: 26, transform: `rotate(${(1 - Math.min(1, note)) * 14 - 3}deg) scale(${note})`, boxShadow: "0 20px 50px rgba(0,0,0,.2)" }}>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 26, color: "#a07a00" }}>МОЯ ЗАМЕТКА</div>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 38, color: C.ink }}>Сверить со ст. 2</div>
      </div>
      <Tag text="Выделяй" at={4} dur={15} y={110} x={400} color={C.orange} dark={C.orangeDark} />
      <Tag text="Пиши заметки" at={40} dur={30} y={110} x={960} color={C.violet} dark={C.violetDark} />
      <Tag text="Ищи по тексту" at={74} dur={22} y={110} x={1480} color={C.blue} dark={C.blueDark} />
      <Cursor inv={1} clicks={[8, 26, 58]} path={[{ f: 0, x: 700, y: 480 }, { f: 8, x: 760, y: 440 }, { f: 22, x: 1100, y: 440 }, { f: 30, x: 960, y: 520 }, { f: 52, x: 1180, y: 530 }, { f: 60, x: 1300, y: 600 }, { f: 90, x: 1300, y: 700 }]} />
    </AbsoluteFill>
  );
};

// УРОКИ (480): карта -> карточки -> квиз -> прогресс-морф
const Lessons: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 60) return <LessonPath lf={f} />;
  if (f < 180) return <LessonCards lf={f - 60} />;
  if (f < 324) return <Quiz lf={f - 180} />;
  return <LessonDone lf={f - 324} />;
};

const LessonPath: React.FC<{ lf: number }> = ({ lf }) => {
  const nodes = Array.from({ length: 7 }).map((_, i) => ({ x: 960 + Math.sin(i * 1.3) * 230, y: 330 + i * 200 }));
  const scroll = interpolate(lf, [0, 50], [0, 300], { easing: Easing.out(Easing.quad), ...clamp });
  const grow = interpolate(lf, [44, 58], [0, 1], { easing: IO, ...clamp });
  return (
    <AbsoluteFill style={{ background: C.mist }}>
      <svg width="1920" height="1080" style={{ position: "absolute", transform: `translateY(${-scroll}px)` }}>
        <path d={`M${nodes.map((n) => `${n.x} ${n.y}`).join(" L")}`} stroke="#fff" strokeWidth="26" fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - Math.min(1, lf / 34)} />
      </svg>
      {nodes.map((n, i) => {
        const p = snap(lf, 2 + i * 4);
        const done = i === 0;
        return <div key={i} style={{ position: "absolute", left: n.x - 70, top: n.y - 70 - scroll, width: 140, height: 140, borderRadius: "50%", background: done ? C.green : i === 1 ? C.blue : "#fff", boxShadow: `0 12px 0 ${done ? C.greenDark : i === 1 ? C.blueDark : "#d5d5d4"}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 900, fontSize: 70, color: i < 2 ? "#fff" : "#afafaf", transform: `scale(${p})` }}>{done ? "✓" : i + 1}</div>;
      })}
      <div style={{ position: "absolute", left: 960, top: 90, transform: `translateX(-50%) scale(${snap(lf, 0)})`, fontFamily: FONT, fontWeight: 900, fontSize: 150, color: C.ink }}>Уроки</div>
      <div style={{ position: "absolute", left: nodes[1].x - 70 - 0, top: nodes[1].y - 70 - scroll, width: 140, height: 140, borderRadius: "50%", background: C.blue, transform: `scale(${1 + grow * 30})`, opacity: grow > 0 ? 1 : 0 }} />
      <Cursor inv={1} clicks={[40]} path={[{ f: 16, x: 1500, y: 900 }, { f: 40, x: nodes[1].x + 10, y: nodes[1].y - scroll + 10 }, { f: 60, x: nodes[1].x + 10, y: nodes[1].y - scroll + 10 }]} />
    </AbsoluteFill>
  );
};

const LessonCards: React.FC<{ lf: number }> = ({ lf }) => {
  const cards = [["Статья 1", "Узбекистан — суверенное государство"], ["Статья 1", "демократическое и правовое"], ["Статья 1", "социальное и светское"]];
  const idx = Math.min(2, Math.floor(lf / 40));
  const cf = lf - idx * 40;
  const enter = snap(cf);
  const exit = interpolate(cf, [30, 40], [0, 1], { easing: IO, ...clamp });
  return (
    <AbsoluteFill style={{ background: C.blue }}>
      <div style={{ position: "absolute", top: 80, left: 260, right: 260, display: "flex", gap: 18 }}>
        {[0, 1, 2].map((i) => <div key={i} style={{ flex: 1, height: 26, borderRadius: 13, background: "rgba(255,255,255,.3)", overflow: "hidden" }}><div style={{ width: `${i < idx ? 100 : i === idx ? Math.min(100, (cf / 30) * 100) : 0}%`, height: "100%", background: "#fff" }} /></div>)}
      </div>
      <div style={{ position: "absolute", left: 360, top: 220, width: 1200, height: 640, borderRadius: 60, background: "#fff", boxShadow: "0 30px 0 rgba(0,0,0,.12)", padding: "70px 80px", transform: `translateX(${(1 - Math.min(1, enter)) * 1400 - exit * 1500}px) rotate(${-exit * 14 + (1 - Math.min(1, enter)) * 8}deg)` }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 44, color: C.blueDark, letterSpacing: 2 }}>{cards[idx][0].toUpperCase()}</div>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 112, lineHeight: 1.1, color: C.ink, marginTop: 30 }}>
          {cards[idx][1].split(" ").map((w, i) => <span key={i} style={{ display: "inline-block", marginRight: 26, opacity: interpolate(cf, [6 + i * 3, 9 + i * 3], [0, 1], clamp), transform: `translateY(${interpolate(cf, [6 + i * 3, 12 + i * 3], [30, 0], clamp)}px)` }}>{w}</span>)}
        </div>
      </div>
      <Tag text={`Урок · ${idx + 1} из 3`} at={0} dur={120} y={960} color="#fff" dark="rgba(0,0,0,.18)" size={50} />
    </AbsoluteFill>
  );
};

const Quiz: React.FC<{ lf: number }> = ({ lf }) => {
  const qs = [
    { q: "Узбекистан — государство…", o: ["Суверенное", "Зависимое", "Временное"], a: 0, wrong: 1 },
    { q: "Форма правления?", o: ["Монархическая", "Республиканская", "Племенная"], a: 1, wrong: -1 },
    { q: "Государство…", o: ["Религиозное", "Военное", "Светское"], a: 2, wrong: -1 },
    { q: "«Республика Узбекистан» и «Узбекистан» —", o: ["Разные", "Противоположны", "Равнозначны"], a: 2, wrong: -1 },
  ];
  const per = 36;
  const i = Math.min(3, Math.floor(lf / per));
  const q = qs[i];
  const cf = lf - i * per;
  const clickAt = q.wrong >= 0 ? 20 : 13;
  const ok = cf >= clickAt;
  const shake = q.wrong >= 0 && cf >= 8 && cf < 16 ? Math.sin(cf * 2.6) * 18 : 0;
  const flash = interpolate(cf, [clickAt, clickAt + 3, clickAt + 10], [0, 0.35, 0], clamp);
  return (
    <AbsoluteFill style={{ background: C.mist }}>
      <AbsoluteFill style={{ background: C.green, opacity: flash }} />
      <div style={{ position: "absolute", top: 70, left: 260, right: 260, display: "flex", gap: 18 }}>
        {[0, 1, 2, 3].map((k) => <div key={k} style={{ flex: 1, height: 26, borderRadius: 13, background: "#fff", overflow: "hidden" }}><div style={{ width: `${k < i || (k === i && ok) ? 100 : 0}%`, height: "100%", background: C.green }} /></div>)}
      </div>
      <div style={{ position: "absolute", top: 150, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 90, color: C.ink, transform: `scale(${0.8 + 0.2 * snap(cf)})`, filter: `blur(${Math.max(0, 8 - cf * 2)}px)` }}>{q.q}</div>
      {q.o.map((t, k) => {
        const p = snap(cf, 4 + k * 3);
        const right = k === q.a;
        const isWrong = k === q.wrong && cf >= 8;
        const show = right && ok;
        return (
          <div key={k} style={{ position: "absolute", left: 360, top: 400 + k * 160, width: 1200, height: 130, borderRadius: 40, border: `6px solid ${show ? C.green : isWrong ? C.coral : "#e5e5e5"}`, background: show ? "#d7ffb8" : isWrong ? "#ffd9d4" : "#fff",
            boxShadow: `0 10px 0 ${show ? C.greenDark : isWrong ? "#d9493a" : "#e5e5e5"}`, fontFamily: FONT, fontWeight: 900, fontSize: 64, color: show ? C.greenDark : C.ink, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 50px",
            transform: `translateX(${(1 - Math.min(1, p)) * 500 + (isWrong ? shake : 0)}px) scale(${show ? 1.03 : 1})`, opacity: Math.min(1, p * 2) }}>
            <span>{t}</span><span>{show ? "✓" : isWrong ? "✕" : ""}</span>
          </div>
        );
      })}
      <Cursor inv={1} clicks={[clickAt - 1, q.wrong >= 0 ? 6 : -99]} path={q.wrong >= 0
        ? [{ f: 0, x: 1500, y: 800 }, { f: 6, x: 900, y: 500 + q.wrong * 160 }, { f: 14, x: 900, y: 500 + q.wrong * 160 }, { f: 19, x: 700, y: 465 + q.a * 160 }, { f: 36, x: 700, y: 465 + q.a * 160 }]
        : [{ f: 0, x: 1500, y: 800 }, { f: 12, x: 700, y: 465 + q.a * 160 }, { f: 36, x: 700, y: 465 + q.a * 160 }]} />
      <Tag text="Верно!" at={clickAt} dur={14} y={960} x={960} />
    </AbsoluteFill>
  );
};

const LessonDone: React.FC<{ lf: number }> = ({ lf }) => {
  const morph = interpolate(lf, [0, 10], [0, 1], { easing: IO, ...clamp });
  const fill = interpolate(lf, [10, 34], [0, 100], { easing: FAST, ...clamp });
  const done = lf >= 36;
  return (
    <AbsoluteFill style={{ background: C.white }}>
      <div style={{ position: "absolute", left: 360, top: 540 - 30 - (1 - morph) * 260, width: 1200, height: 60 + (1 - morph) * 520, borderRadius: 40 + (1 - morph) * 20, background: morph > 0.5 ? "#e5e5e5" : C.mist, boxShadow: morph > 0.5 ? "none" : "0 30px 80px rgba(24,153,214,.25)", overflow: "hidden" }}>
        <div style={{ width: `${fill}%`, height: "100%", background: `linear-gradient(90deg,${C.blueDark},${C.blue})`, borderRadius: 40 }} />
      </div>
      <div style={{ position: "absolute", top: 250, width: "100%", textAlign: "center", opacity: morph > 0.5 ? 1 : 0 }}><Count to={100} at={10} dur={24} suffix="%" size={250} color={C.blue} /></div>
      {done && <div style={{ position: "absolute", top: 640, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 130, color: C.green, transform: `scale(${snap(lf, 36)})` }}>Урок пройден!</div>}
      {done && <div style={{ position: "absolute", left: 830, top: 800, width: 260, height: 260, borderRadius: "50%", background: C.green, boxShadow: `0 14px 0 ${C.greenDark}`, color: "#fff", fontSize: 170, fontFamily: FONT, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${snap(lf, 42)})` }}>✓</div>}
      <Confetti at={36} x={960} y={600} n={44} />
    </AbsoluteFill>
  );
};

// ИГРЫ (150): парные карточки
const Games: React.FC = () => {
  const f = useCurrentFrame();
  const types = [0, 1, 2, 0, 2, 1];
  const open: Record<number, [number, number]> = { 0: [18, 999], 3: [30, 999], 1: [56, 999], 5: [68, 999], 2: [94, 999], 4: [106, 999] };
  const matchAt = [38, 76, 114];
  const colors = [[C.blue, C.blueDark], [C.green, C.greenDark], [C.orange, C.orangeDark]];
  const score = Math.round(interpolate(f, [38, 42, 76, 80, 114, 118], [0, 100, 100, 200, 200, 300], clamp));
  return (
    <AbsoluteFill style={{ background: C.mist }}>
      <div style={{ position: "absolute", left: 130, top: 80, fontFamily: FONT, fontWeight: 900, fontSize: 130, color: C.ink, transform: `scale(${snap(f)})`, transformOrigin: "0 50%" }}>Игры</div>
      <div style={{ position: "absolute", right: 130, top: 100, fontFamily: FONT, fontWeight: 900, fontSize: 90, color: C.orange }}>{score}<span style={{ fontSize: 44, color: C.ink }}> очков</span></div>
      {types.map((t, i) => {
        const col = i % 3, row = Math.floor(i / 3);
        const o = open[i][0];
        const isOpen = f >= o;
        const flip = interpolate(f, [o, o + 6], [0, 180], clamp);
        const matched = isOpen && matchAt.some((m, k) => f >= m && ([[0, 3], [1, 5], [2, 4]][k].includes(i)));
        const p = snap(f, 4 + i * 3);
        const front = flip > 90;
        return (
          <div key={i} style={{ position: "absolute", left: 220 + col * 520, top: 300 + row * 360, width: 440, height: 320, perspective: 1200, transform: `scale(${p})` }}>
            <div style={{ width: "100%", height: "100%", borderRadius: 48, background: front ? "#fff" : C.blue, boxShadow: `0 14px 0 ${matched ? C.greenDark : front ? "#d5d5d4" : C.blueDark}`, border: matched ? `8px solid ${C.green}` : "none", transform: `rotateY(${front ? flip - 180 : flip}deg) scale(${matched ? 1.05 : 1})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {front ? <div style={{ background: colors[t][0], borderRadius: 40, width: 220, height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ transform: "scale(.9)" }}><CardIcon kind={t} /></div></div> : <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 130, color: "rgba(255,255,255,.5)" }}>?</div>}
            </div>
          </div>
        );
      })}
      <Tag text="Пара!" at={38} dur={14} y={950} /><Tag text="Ещё!" at={76} dur={14} y={950} color={C.orange} dark={C.orangeDark} /><Tag text="Все пары!" at={114} dur={26} y={950} color={C.violet} dark={C.violetDark} />
      <Confetti at={114} x={960} y={560} n={30} />
    </AbsoluteFill>
  );
};

// ФОРУМ (150)
const Forum: React.FC = () => (
  <AbsoluteFill style={{ background: C.mist }}>
    <Shot2 img="shots/forum-desk.png" tilt={[{ f: 0, ry: 22, rx: -8 }, { f: 14, ry: 0, rx: 0 }]}
      cam={[{ f: 0, cx: 720, cy: 450, s: 0.92 }, { f: 12, cx: 720, cy: 450, s: 1 }, { f: 24, cx: 720, cy: 250, s: 1.45 }, { f: 90, cx: 720, cy: 250, s: 1.45 }, { f: 96, cx: 720, cy: 560, s: 1.3 }, { f: 120, cx: 720, cy: 560, s: 1.3 }]}>
      {(inv) => (
        <>
          <Ring x={344} y={138} w={752} h={108} at={26} until={70} inv={inv} />
          <Cursor inv={inv} clicks={[48]} path={[{ f: 16, x: 1200, y: 100 }, { f: 40, x: 900, y: 190 }, { f: 50, x: 700, y: 195 }, { f: 110, x: 760, y: 330 }]} />
        </>
      )}
    </Shot2>
    <Tag text="Форум" at={4} dur={22} y={60} x={330} color={C.blue} dark={C.blueDark} />
    <Tag text="Спроси" at={26} dur={15} y={960} color={C.orange} dark={C.orangeDark} /><Tag text="Ответь" at={52} dur={15} y={960} color={C.green} dark={C.greenDark} /><Tag text="Обсуди" at={78} dur={40} y={960} color={C.violet} dark={C.violetDark} />
  </AbsoluteFill>
);

// МАТЕРИАЛЫ (210): плитки + языки
const Materials: React.FC = () => {
  const f = useCurrentFrame();
  if (f >= 108) return <Langs lf={f - 108} />;
  const items: [string, string, string, React.ReactNode][] = [
    ["Избранное", C.coral, "#c9473a", <path key="a" d="M50 82C20 62 12 44 12 32a20 20 0 0 1 38-8 20 20 0 0 1 38 8c0 12-8 30-38 50z" fill="#fff" />],
    ["Термины", C.violet, C.violetDark, <g key="b"><rect x="18" y="14" width="64" height="72" rx="10" fill="#fff" /><path d="M32 36h36M32 52h36M32 68h22" stroke={C.violetDark} strokeWidth="7" strokeLinecap="round" /></g>],
    ["Ссылка на статью", C.blue, C.blueDark, <path key="c" d="M40 60l20-20M30 50l-10 10a14 14 0 0 0 20 20l10-10M70 50l10-10a14 14 0 0 0-20-20L50 30" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" />],
    ["Открытый API", C.green, C.greenDark, <path key="d" d="M36 22c-12 0-12 8-12 16s-6 12-12 12c6 0 12 4 12 12s0 16 12 16M64 22c12 0 12 8 12 16s6 12 12 12c-6 0-12 4-12 12s0 16-12 16" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" />],
    ["Заметки", C.orange, C.orangeDark, <path key="e" d="M20 78l8-24 36-36 16 16-36 36z" fill="#fff" />],
    ["Поиск", C.blueDark, "#0f6fa0", <g key="f"><circle cx="42" cy="42" r="24" fill="none" stroke="#fff" strokeWidth="9" /><path d="M60 60l22 22" stroke="#fff" strokeWidth="10" strokeLinecap="round" /></g>],
  ];
  const act = Math.min(5, Math.floor(Math.max(0, f - 24) / 12));
  return (
    <AbsoluteFill style={{ background: C.white }}>
      <div style={{ position: "absolute", top: 60, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 120, color: C.ink, transform: `scale(${snap(f)})` }}>Материалы</div>
      {items.map(([t, c, d, svg], i) => {
        const col = i % 3, row = Math.floor(i / 3);
        const p = snap(f, 4 + i * 3);
        const on = f >= 24 && act === i;
        return (
          <div key={i} style={{ position: "absolute", left: 240 + col * 500, top: 260 + row * 380, width: 440, textAlign: "center", transform: `scale(${p * (on ? 1.1 : 1)})` }}>
            <div style={{ width: 280, height: 280, margin: "0 auto", borderRadius: 70, background: c, boxShadow: `0 ${on ? 22 : 14}px 0 ${d}`, display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="170" height="170" viewBox="0 0 100 100">{svg}</svg></div>
            <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 46, color: on ? c : C.ink, marginTop: 24 }}>{t}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Langs: React.FC<{ lf: number }> = ({ lf }) => {
  const ws = [["Закон", "RU", C.blue], ["Law", "EN", C.green], ["Qonun", "UZ", C.orange]] as const;
  const i = Math.floor(lf / 12) % 3;
  const cf = lf % 12;
  return (
    <AbsoluteFill style={{ background: ws[i][2] }}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 380, color: "#fff", transform: `scale(${0.6 + snap(cf) * 0.4})`, filter: `blur(${Math.max(0, 6 - cf * 2)}px)` }}>{ws[i][0]}</div>
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 90, width: "100%", display: "flex", justifyContent: "center", gap: 28 }}>
        {ws.map(([, code], k) => <div key={k} style={{ fontFamily: FONT, fontWeight: 900, fontSize: 56, color: k === i ? ws[i][2] : "#fff", background: k === i ? "#fff" : "rgba(255,255,255,.25)", padding: "10px 44px", borderRadius: 40 }}>{code}</div>)}
      </div>
    </AbsoluteFill>
  );
};

// ИТОГ (210): 14 слов по удару
const Recap: React.FC = () => {
  const bgs = [C.blue, C.green, C.orange, C.violet, C.coral, C.blueDark, C.greenDark];
  const w = ["Законы", "Кодексы", "Статьи", "Термины", "Заметки", "Поиск", "Уроки", "Тесты", "Игры", "Форум", "RU · EN · UZ", "Избранное", "Бесплатно", "Без регистрации"];
  return <WordBeat words={w.map((t, i) => ({ t, bg: bgs[i % bgs.length] }))} />;
};

// ФИНАЛ (210)
const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const logo = snap(f, 0);
  const tag = snap(f, 14);
  const btn = snap(f, 30);
  const press = interpolate(f, [70, 74, 80], [0, 1, 0], clamp);
  const url = snap(f, 84);
  return (
    <AbsoluteFill style={{ background: NIGHT }}>
      <AbsoluteFill>
        {Array.from({ length: 24 * 14 }).map((_, i) => {
          const c = i % 24, r = Math.floor(i / 24); const h = hash(c, r);
          return <div key={i} style={{ position: "absolute", left: c * 80, top: r * (1080 / 14), width: 80, height: 1080 / 14, background: "#fff", opacity: 0.015 + 0.05 * Math.max(0, Math.sin(f / 14 + h * 9)) }} />;
        })}
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 120 }}>
        <div style={{ background: "#fff", borderRadius: 60, padding: "30px 70px", transform: `scale(${0.3 + logo * 0.7})`, filter: `blur(${Math.max(0, 10 - f * 2)}px)` }}><Img src={staticFile("img/logo.png")} style={{ width: 760 }} /></div>
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 410, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 64, color: "#fff", opacity: Math.min(1, tag), transform: `translateY(${(1 - Math.min(1, tag)) * 40}px)` }}>Законы Узбекистана — понятно, бесплатно, живо</div>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: 440 }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 72, letterSpacing: 3, color: "#fff", background: C.green, borderRadius: 42, padding: "44px 120px", boxShadow: `0 ${14 - press * 10}px 0 ${C.greenDark}`, transform: `scale(${btn * (1 - press * 0.03)}) translateY(${press * 10}px)` }}>НАЧАТЬ УЧИТЬСЯ</div>
        <div style={{ marginTop: 50, fontFamily: FONT, fontWeight: 900, fontSize: 76, color: C.blue, transform: `scale(${url})`, opacity: Math.min(1, url) }}>neolex.uz</div>
        <div style={{ marginTop: 30, fontFamily: FONT, fontWeight: 700, fontSize: 28, color: "#8fa0d8", opacity: interpolate(f, [100, 115], [0, 1], clamp) }}>Тексты — из базы lex.uz · образовательный и справочный проект</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- переходы: резкая плашка (10 кадров, склейка на середине) ----------
const Slab: React.FC<{ at: number; color: string; dir?: 1 | -1 }> = ({ at, color, dir = 1 }) => {
  const f = useCurrentFrame();
  if (f < at - 5 || f > at + 5) return null;
  const x = interpolate(f, [at - 5, at, at + 5], [100 * dir, 0, -100 * dir], { easing: Easing.bezier(0.7, 0, 0.3, 1), ...clamp });
  return <AbsoluteFill style={{ background: color, transform: `translateX(${x}%)` }} />;
};
const FlashCut: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [at - 2, at, at + 4], [0, 0.85, 0], clamp);
  return o > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: o }} /> : null;
};

export const L2 = { hook: 0, laws: 90, courses: 465, lessons: 615, games: 1005, forum: 1155, materials: 1275, recap: 1455, outro: 1665, end: 1800 };

export const Launch2: React.FC = () => {
  useFonts();
  const seq: [number, number, React.FC, string][] = [
    [L2.hook, L2.laws - L2.hook, Hook, C.white], [L2.laws, L2.courses - L2.laws, Laws, C.mist], [L2.courses, L2.lessons - L2.courses, Courses, C.white], [L2.lessons, L2.games - L2.lessons, Lessons, C.mist],
    [L2.games, L2.forum - L2.games, Games, C.mist], [L2.forum, L2.materials - L2.forum, Forum, C.mist], [L2.materials, L2.recap - L2.materials, Materials, C.white],
    [L2.recap, L2.outro - L2.recap, Recap, C.blue], [L2.outro, L2.end - L2.outro, Outro, NIGHT],
  ];
  return (
    <AbsoluteFill style={{ background: C.white }}>
      {seq.map(([from, dur, Comp, bg], i) => <Sequence key={i} from={from} durationInFrames={dur}><Sc dur={dur} bg={bg}><Comp /></Sc></Sequence>)}
      <Audio src={staticFile("audio/launch2-mix.wav")} />
      <Slab at={L2.laws} color={C.blue} /><Slab at={L2.courses} color={C.violet} dir={-1} /><Slab at={L2.lessons} color={C.green} dir={-1} /><Slab at={L2.games} color={C.violet} /><Slab at={L2.forum} color={C.orange} dir={-1} />
      <Slab at={L2.materials} color={C.blue} /><Slab at={L2.recap} color={C.green} dir={-1} /><Slab at={L2.outro} color={NIGHT} />
      <FlashCut at={45} />
    </AbsoluteFill>
  );
};
