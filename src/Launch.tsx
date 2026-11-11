import React from "react";
import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, OUT, useFonts, pop, CardIcon } from "./Intro";
import { Cursor, Shot, Ring, Callout } from "./Product";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const IO = Easing.bezier(0.65, 0, 0.35, 1);
const NIGHT = "#000437";

// ---------- общие куски ----------
const Scene: React.FC<{ dur: number; bg: string; children: React.ReactNode; punch?: boolean }> = ({ dur, bg, children, punch = true }) => {
  const frame = useCurrentFrame();
  const bIn = interpolate(frame, [0, 7], [16, 0], clamp);
  const bOut = interpolate(frame, [dur - 7, dur], [0, 16], clamp);
  const sc = punch ? interpolate(frame, [0, 10], [1.05, 1], { easing: OUT, ...clamp }) : 1;
  return (
    <AbsoluteFill style={{ background: bg, filter: `blur(${Math.max(bIn, bOut)}px)` }}>
      <AbsoluteFill style={{ transform: `scale(${sc})` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

const hash = (c: number, r: number) => Math.abs((Math.sin(c * 12.9898 + r * 78.233) * 43758.5453) % 1);
const PixelWipe: React.FC<{ at: number; color: string; dur?: number }> = ({ at, color, dur = 20 }) => {
  const frame = useCurrentFrame();
  if (frame < at - dur / 2 || frame > at + dur / 2) return null;
  const p = interpolate(frame, [at - dur / 2, at + dur / 2], [0, 2], clamp);
  const cols = 24, rows = 14, cw = 1920 / cols, ch = 1080 / rows;
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const th = hash(c, r);
    const vis = p <= 1 ? th < p : th > p - 1;
    if (vis) cells.push(<div key={`${c}-${r}`} style={{ position: "absolute", left: c * cw, top: r * ch, width: cw + 1, height: ch + 1, background: color, filter: `brightness(${0.88 + th * 0.24})` }} />);
  }
  return <AbsoluteFill>{cells}</AbsoluteFill>;
};

const Wallpaper: React.FC = () => {
  const f = useCurrentFrame();
  const blob = (x: number, y: number, c: string, s: number, ph: number) => (
    <div style={{ position: "absolute", left: x + Math.sin((f + ph) / 50) * 90, top: y + Math.cos((f + ph) / 60) * 70, width: s, height: s, borderRadius: "50%", background: c, filter: "blur(130px)", opacity: 0.75 }} />
  );
  return (
    <AbsoluteFill style={{ background: "#071344" }}>
      {blob(-200, -200, C.blue, 1100, 0)}{blob(900, 300, "#6d4dff", 1000, 40)}{blob(300, 600, C.green, 800, 80)}
    </AbsoluteFill>
  );
};

const Key: React.FC<{ label: string; sub: string; x: number; delay: number; pressAt: number }> = ({ label, sub, x, delay, pressAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, delay, 11);
  const press = interpolate(frame, [pressAt, pressAt + 4, pressAt + 12], [0, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: x, top: 380, width: 250, height: 250, borderRadius: 44, background: "linear-gradient(#303444,#171a24)", border: "2px solid #444a60",
      boxShadow: `0 ${16 - press * 11}px 0 #0a0c14, 0 40px 70px rgba(0,0,0,.55)`, transform: `translateY(${(1 - s) * -500 + press * 11}px) rotate(${(1 - s) * 14}deg)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 120, color: "#fff", lineHeight: 1 }}>{label}</div>
      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 32, color: "#9aa3c4", marginTop: 6 }}>{sub}</div>
    </div>
  );
};

const Caption: React.FC<{ text: string; at: number; dark?: boolean; y?: number; size?: number }> = ({ text, at, dark, y = 150, size = 76 }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [at, at + 14], [0, 1], { easing: OUT, ...clamp });
  return <div style={{ position: "absolute", top: y, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: size, color: dark ? "#fff" : C.ink, opacity: t, transform: `translateY(${(1 - t) * 40}px)` }}>{text}</div>;
};

// ---------- S1: клавиши и поиск ----------
const S1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const keysOut = interpolate(frame, [58, 76], [1, 0], { easing: IO, ...clamp });
  const pill = pop(frame, fps, 66, 12);
  const typed = "Конституция";
  const n = Math.max(0, Math.min(typed.length, Math.floor((frame - 92) / 2.2)));
  const rows = ["Конституция Республики Узбекистан", "Гражданский кодекс", "Трудовой кодекс"];
  return (
    <Scene dur={180} bg="#071344" punch={false}>
      <Wallpaper />
      <Caption text="Найди любой закон" at={70} dark y={190} />
      <div style={{ opacity: keysOut, transform: `scale(${0.6 + keysOut * 0.4})`, transformOrigin: "960px 505px" }}>
        <Key label="⌘" sub="command" x={660} delay={4} pressAt={34} />
        <Key label="K" sub="поиск" x={1010} delay={12} pressAt={42} />
      </div>
      <div style={{ position: "absolute", left: 360, top: 400, width: 1200, height: 150, borderRadius: 80, background: "rgba(255,255,255,.96)", boxShadow: "0 40px 90px rgba(0,0,0,.45)",
        display: "flex", alignItems: "center", gap: 28, padding: "0 56px", transform: `scale(${pill})`, opacity: Math.min(1, pill * 1.5) }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={C.blueDark} strokeWidth="2.6" strokeLinecap="round"><circle cx="10.5" cy="10.5" r="6.5" /><path d="M16 16l5 5" /></svg>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 64, color: n ? C.ink : "#afafaf" }}>{n ? typed.slice(0, n) : "Поиск по всей базе законов"}{n > 0 && n < typed.length + 3 && frame % 16 < 9 ? <span style={{ color: C.blue }}>|</span> : null}</div>
      </div>
      {rows.map((t, i) => {
        const s = pop(frame, fps, 116 + i * 8, 12);
        return (
          <div key={i} style={{ position: "absolute", left: 420, top: 590 + i * 112, width: 1080, height: 94, borderRadius: 30, background: i === 0 ? C.blue : "rgba(255,255,255,.14)", color: "#fff",
            fontFamily: FONT, fontWeight: 800, fontSize: 44, display: "flex", alignItems: "center", paddingLeft: 40, boxShadow: i === 0 ? `0 8px 0 ${C.blueDark}` : "none", transform: `translateY(${(1 - s) * 60}px) scale(${s})`, opacity: s }}>{t}</div>
        );
      })}
    </Scene>
  );
};

// ---------- S2: Читай. Понимай. Запоминай. ----------
const S2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = [{ t: "Читай.", c: C.blue, d: C.blueDark }, { t: "Понимай.", c: C.green, d: C.greenDark }, { t: "Запоминай.", c: C.orange, d: C.orangeDark }];
  const idx = Math.min(2, Math.floor(frame / 38));
  const lf = frame - idx * 38;
  const w = words[idx];
  const s = pop(lf, fps, 0, 9);
  const bar = interpolate(lf, [6, 24], [0, 100], { easing: OUT, ...clamp });
  return (
    <Scene dur={120} bg={C.white}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative", transform: `scale(${0.7 + s * 0.3}) rotate(${(1 - s) * -3}deg)`, opacity: Math.min(1, s * 2) }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 280, color: w.c, lineHeight: 1 }}>{w.t}</div>
          <div style={{ position: "absolute", left: 0, bottom: -26, height: 26, width: `${bar}%`, background: w.d, borderRadius: 13 }} />
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- S3: библиотека ----------
const S3: React.FC = () => (
  <Scene dur={180} bg={C.mist}>
    <Shot img="shots/laws-desk.png" cam={[
      { f: 0, cx: 720, cy: 450, s: 1 }, { f: 22, cx: 700, cy: 125, s: 1.7 }, { f: 62, cx: 700, cy: 125, s: 1.7 }, { f: 90, cx: 420, cy: 330, s: 1.35 }, { f: 130, cx: 420, cy: 330, s: 1.35 }, { f: 160, cx: 300, cy: 300, s: 2 },
    ]}>
      {(inv) => (
        <>
          <Ring x={70} y={104} w={1340} h={42} at={26} until={64} inv={inv} />
          <Ring x={24} y={176} w={336} h={206} at={96} until={170} inv={inv} />
          <Cursor inv={inv} clicks={[128]} path={[{ f: 10, x: 100, y: 190 }, { f: 30, x: 200, y: 125 }, { f: 58, x: 900, y: 125 }, { f: 100, x: 300, y: 300 }, { f: 124, x: 190, y: 300 }, { f: 170, x: 190, y: 300 }]} />
        </>
      )}
    </Shot>
    <Callout x={960} y={985} text="Для любой профессии" sub="Медики, педагоги, программисты…" at={28} until={66} />
    <Callout x={960} y={985} text="Конституция, 21 кодекс, сотни законов" color={C.orange} dark={C.orangeDark} at={92} until={172} />
  </Scene>
);

const Arrow: React.FC<{ x1: number; y1: number; cx: number; cy: number; x2: number; y2: number; at: number }> = ({ x1, y1, cx, cy, x2, y2, at }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 16], [0, 1], { easing: OUT, ...clamp });
  const ang = Math.atan2(y2 - cy, x2 - cx);
  const h = (a: number) => `${x2 - Math.cos(ang + a) * 70},${y2 - Math.sin(ang + a) * 70}`;
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <path d={`M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`} fill="none" stroke={C.coral} strokeWidth="26" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - p} />
      {p > 0.85 && <polyline points={`${h(0.5)} ${x2},${y2} ${h(-0.5)}`} fill="none" stroke={C.coral} strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
};

// ---------- S4: статья «Простыми словами» ----------
const S4: React.FC = () => (
  <Scene dur={150} bg={C.mist}>
    <Shot img="shots/article-desk.png" cam={[
      { f: 0, cx: 720, cy: 450, s: 1 }, { f: 14, cx: 720, cy: 470, s: 1.3 }, { f: 84, cx: 720, cy: 470, s: 1.3 }, { f: 104, cx: 600, cy: 720, s: 1.55 }, { f: 150, cx: 600, cy: 720, s: 1.55 },
    ]}>
      {(inv) => (
        <>
          <Ring x={346} y={278} w={750} h={402} at={14} until={84} inv={inv} />
          <Ring x={344} y={703} w={202} h={50} at={106} until={150} inv={inv} />
          <Cursor inv={inv} clicks={[128]} path={[{ f: 70, x: 760, y: 560 }, { f: 112, x: 470, y: 727 }, { f: 126, x: 455, y: 727 }, { f: 150, x: 455, y: 727 }]} />
        </>
      )}
    </Shot>
    <Arrow x1={1500} y1={160} cx={1780} cy={330} x2={1430} y2={470} at={20} />
    <Callout x={960} y={985} text="«Простыми словами»" sub="Каждая статья — понятным языком" at={18} until={86} />
    <Callout x={960} y={985} text="Открыть в читалке" color={C.blue} dark={C.blueDark} at={110} until={152} />
  </Scene>
);

// ---------- S5: читалка: цвет и заметки ----------
const S5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hl1 = interpolate(frame, [26, 44], [0, 100], { easing: OUT, ...clamp });
  const hl2 = interpolate(frame, [58, 78], [0, 100], { easing: OUT, ...clamp });
  const bar = pop(frame, fps, 12, 12);
  const note = pop(frame, fps, 84, 10);
  const span = (txt: string, p: number, col: string) => <span style={{ background: `linear-gradient(${col},${col}) no-repeat left center / ${p}% 88%`, padding: "0 4px", borderRadius: 8 }}>{txt}</span>;
  return (
    <Scene dur={150} bg={C.white}>
      <Caption text="Выделяй цветом. Пиши заметки." at={2} y={70} size={72} />
      <div style={{ position: "absolute", left: 300, top: 220, width: 1320, padding: "60px 80px", borderRadius: 48, background: "#fff", boxShadow: "0 30px 80px rgba(24,153,214,.25)", border: `5px solid ${C.mist}` }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 76, color: C.ink }}>Статья 1.</div>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 56, lineHeight: 1.55, color: C.ink, marginTop: 26 }}>
          Узбекистан — {span("суверенное, демократическое,", hl1, "#ffe27a")} {span("правовое, социальное", hl2, "#b6f08a")} и светское государство с республиканской формой правления.
        </div>
      </div>
      <div style={{ position: "absolute", left: 520, top: 190, display: "flex", gap: 22, alignItems: "center", background: NIGHT, padding: "18px 34px", borderRadius: 60, boxShadow: "0 18px 40px rgba(0,0,0,.3)", transform: `scale(${bar})`, opacity: Math.min(1, bar * 1.5) }}>
        {["#ffe27a", "#b6f08a", "#84d8ff", "#ff9bb0"].map((c, i) => <div key={i} style={{ width: 46, height: 46, borderRadius: "50%", background: c, border: i === 0 ? "4px solid #fff" : "none" }} />)}
        <div style={{ width: 3, height: 40, background: "#556" }} />
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M4 20h4l11-11-4-4L4 16z" /></svg>
      </div>
      <div style={{ position: "absolute", left: 1180, top: 770, width: 440, padding: "26px 34px", background: "#fff8c8", borderRadius: 26, transform: `rotate(${(1 - note) * 14 - 3}deg) scale(${note})`, boxShadow: "0 20px 50px rgba(0,0,0,.2)" }}>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 28, color: "#a07a00" }}>МОЯ ЗАМЕТКА</div>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 40, color: C.ink, marginTop: 6 }}>Сверить со статьёй 2</div>
      </div>
      <Cursor inv={1} clicks={[26, 58]} path={[{ f: 14, x: 700, y: 480 }, { f: 26, x: 760, y: 440 }, { f: 46, x: 1100, y: 440 }, { f: 58, x: 960, y: 520 }, { f: 80, x: 1240, y: 530 }, { f: 100, x: 1230, y: 700 }]} />
    </Scene>
  );
};

// ---------- S6: тест ----------
const S6: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = pop(frame, fps, 0, 13);
  const opts = ["Суверенное, демократическое, правовое, социальное и светское", "Конфедерация", "Теократическое государство"];
  const ok = interpolate(frame, [80, 90], [0, 1], clamp);
  const burst = interpolate(frame, [82, 108], [0, 1], { easing: OUT, ...clamp });
  const cols = [C.yellow, C.orange, C.coral, C.violet, C.blue, C.green];
  return (
    <Scene dur={150} bg={C.mist}>
      <div style={{ position: "absolute", left: 270, top: 90, width: 1380, padding: "56px 70px 70px", borderRadius: 56, background: "#fff", boxShadow: "0 30px 80px rgba(24,153,214,.28)", transform: `scale(${0.9 + card * 0.1}) translateY(${(1 - card) * 120}px)`, opacity: Math.min(1, card * 2) }}>
        <div style={{ display: "inline-block", fontFamily: FONT, fontWeight: 900, fontSize: 34, color: "#fff", background: C.violet, borderRadius: 30, padding: "8px 28px", boxShadow: `0 6px 0 ${C.violetDark}` }}>ТЕСТ · СТАТЬЯ 1</div>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 64, color: C.ink, margin: "30px 0 40px", lineHeight: 1.15 }}>Каким государством называет себя Узбекистан?</div>
        {opts.map((t, i) => {
          const s = pop(frame, fps, 14 + i * 7, 12);
          const right = i === 0;
          const bg = right ? `rgb(${255 - ok * 167},${255 - ok * 51},${255 - ok * 253})` : "#fff";
          return (
            <div key={i} style={{ marginBottom: 22, padding: "24px 36px", borderRadius: 30, border: `5px solid ${right && ok > 0.5 ? C.green : "#e5e5e5"}`, background: right && ok > 0.5 ? "#d7ffb8" : bg === "" ? "#fff" : "#fff",
              fontFamily: FONT, fontWeight: 800, fontSize: 46, color: right && ok > 0.5 ? C.greenDark : C.ink, boxShadow: `0 8px 0 ${right && ok > 0.5 ? C.greenDark : "#e5e5e5"}`, transform: `translateX(${(1 - s) * 400}px)`, opacity: Math.min(1, s * 1.6), display: "flex", justifyContent: "space-between", alignItems: "center", opacity2: 1 } as React.CSSProperties}>
              <span>{t}</span>{right && ok > 0.5 ? <span style={{ fontSize: 60 }}>✓</span> : null}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 0, bottom: 0, width: "100%", height: 150, background: C.green, color: "#fff", fontFamily: FONT, fontWeight: 900, fontSize: 76, display: "flex", alignItems: "center", justifyContent: "center",
        transform: `translateY(${(1 - ok) * 150}px)` }}>Верно!</div>
      {Array.from({ length: 16 }).map((_, i) => {
        const a = (i / 16) * Math.PI * 2; const r = 120 + burst * 420;
        return <div key={i} style={{ position: "absolute", left: 960 + Math.cos(a) * r - 11, top: 560 + Math.sin(a) * r * 0.7 - 11, width: 22, height: 22, borderRadius: i % 2 ? 6 : "50%", background: cols[i % 6], opacity: burst === 0 ? 0 : 1 - burst, transform: `rotate(${burst * 200}deg)` }} />;
      })}
      <Cursor inv={1} clicks={[78]} path={[{ f: 40, x: 1500, y: 780 }, { f: 62, x: 1000, y: 700 }, { f: 76, x: 700, y: 475 }, { f: 100, x: 720, y: 480 }]} />
    </Scene>
  );
};

// ---------- S7: уроки ----------
const S7: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rows = [["1", "Конституция", C.blue, C.blueDark], ["2", "Гражданский кодекс", C.green, C.greenDark], ["3", "Трудовой кодекс", C.orange, C.orangeDark]] as const;
  return (
    <Scene dur={120} bg={C.white}>
      <Caption text="Уроки" at={0} y={80} size={110} />
      {rows.map(([n, t, c, d], i) => {
        const s = pop(frame, fps, 8 + i * 8, 12);
        const p = interpolate(frame, [30 + i * 18, 52 + i * 18], [0, 100], { easing: IO, ...clamp });
        const done = p >= 100;
        return (
          <div key={i} style={{ position: "absolute", left: 360, top: 280 + i * 220, width: 1200, height: 180, borderRadius: 48, background: "#fff", border: `5px solid ${c}`, boxShadow: `0 12px 0 ${d}`, transform: `translateX(${(1 - s) * -900}px)`, opacity: Math.min(1, s * 1.6), display: "flex", alignItems: "center", gap: 36, padding: "0 44px" }}>
            <div style={{ width: 100, height: 100, borderRadius: "50%", background: c, color: "#fff", fontFamily: FONT, fontWeight: 900, fontSize: 64, display: "flex", alignItems: "center", justifyContent: "center" }}>{done ? "✓" : n}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 52, color: C.ink }}>{t}</div>
              <div style={{ height: 22, borderRadius: 11, background: "#e5e5e5", marginTop: 14, overflow: "hidden" }}><div style={{ width: `${p}%`, height: "100%", background: c, borderRadius: 11 }} /></div>
            </div>
          </div>
        );
      })}
    </Scene>
  );
};

// ---------- S8: игры ----------
const S8: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tiles = [["Ст. 1", C.blue, C.blueDark, -420, 0], ["Ст. 15", C.green, C.greenDark, 0, 40], ["Ст. 42", C.orange, C.orangeDark, 420, 0]] as const;
  const g = pop(frame, fps, 0, 10);
  return (
    <Scene dur={120} bg={C.mist}>
      <Caption text="Игры" at={0} y={90} size={120} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        {tiles.map(([t, c, d, dx, dy], i) => {
          const s = pop(frame, fps, 14 + i * 9, 9);
          const bob = Math.sin((frame + i * 18) / 10) * 16;
          return <div key={i} style={{ position: "absolute", left: 960 + dx - 160, top: 470 + dy + bob, width: 320, height: 380, borderRadius: 48, background: c, boxShadow: `0 16px 0 ${d}`, color: "#fff", fontFamily: FONT, fontWeight: 900, fontSize: 90,
            display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${s}) rotate(${(i - 1) * 7 + (1 - s) * 20}deg)` }}>{t}</div>;
        })}
        <div style={{ position: "absolute", top: 280, transform: `scale(${g})` }}>
          <svg width="230" height="150" viewBox="0 0 230 150"><rect x="5" y="20" width="220" height="110" rx="55" fill={C.ink} /><rect x="45" y="58" width="52" height="16" rx="8" fill="#fff" /><rect x="63" y="40" width="16" height="52" rx="8" fill="#fff" /><circle cx="158" cy="60" r="14" fill={C.green} /><circle cx="185" cy="84" r="14" fill={C.coral} /></svg>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- S9: форум ----------
const S9: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const b = pop(frame, fps, 70, 10);
  return (
    <Scene dur={150} bg={C.mist}>
      <Shot img="shots/forum-desk.png" cam={[{ f: 0, cx: 720, cy: 450, s: 1 }, { f: 24, cx: 720, cy: 260, s: 1.4 }, { f: 110, cx: 720, cy: 260, s: 1.4 }, { f: 150, cx: 720, cy: 330, s: 1.3 }]}>
        {(inv) => (
          <>
            <Ring x={344} y={138} w={752} h={108} at={30} until={90} inv={inv} />
            <Cursor inv={inv} clicks={[64]} path={[{ f: 20, x: 1100, y: 100 }, { f: 56, x: 900, y: 190 }, { f: 66, x: 700, y: 195 }, { f: 120, x: 760, y: 330 }]} />
          </>
        )}
      </Shot>
      <Callout x={960} y={985} text="Форум" sub="Обсуждай право и учёбу — читать можно без регистрации" at={26} until={100} />
      <div style={{ position: "absolute", right: 130, top: 330, background: C.blue, color: "#fff", fontFamily: FONT, fontWeight: 900, fontSize: 46, padding: "26px 44px", borderRadius: 40, borderBottomRightRadius: 8, boxShadow: `0 10px 0 ${C.blueDark}, 0 30px 50px rgba(0,0,0,.2)`, transform: `scale(${b}) rotate(${(1 - b) * 8}deg)`, opacity: Math.min(1, b * 2), transformOrigin: "100% 100%" }}>Мой ответ · комментарий</div>
    </Scene>
  );
};

// ---------- S10: языки ----------
const S10: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ws = [["Закон", "RU", C.blue], ["Law", "EN", C.green], ["Qonun", "UZ", C.orange]] as const;
  const idx = Math.min(2, Math.floor(frame / 28));
  const lf = frame - idx * 28;
  const s = pop(lf, fps, 0, 10);
  return (
    <Scene dur={90} bg={C.white}>
      <div style={{ position: "absolute", top: 120, width: "100%", display: "flex", justifyContent: "center", gap: 30 }}>
        {ws.map(([, code, c], i) => <div key={i} style={{ fontFamily: FONT, fontWeight: 900, fontSize: 54, color: i === idx ? "#fff" : "#afafaf", background: i === idx ? c : "#f0f0f0", padding: "12px 44px", borderRadius: 40, boxShadow: i === idx ? "0 8px 0 rgba(0,0,0,.2)" : "none" }}>{code}</div>)}
      </div>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 300, color: ws[idx][2], transform: `scale(${0.6 + s * 0.4}) rotateX(${(1 - s) * 50}deg)`, opacity: Math.min(1, s * 2) }}>{ws[idx][0]}</div>
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- S11: ещё функции ----------
const S11: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items: [string, string, string, React.ReactNode][] = [
    ["Избранное", C.coral, "#c9473a", <path key="a" d="M50 82C20 62 12 44 12 32a20 20 0 0 1 38-8 20 20 0 0 1 38 8c0 12-8 30-38 50z" fill="#fff" />],
    ["Термины", C.violet, C.violetDark, <g key="b"><rect x="18" y="14" width="64" height="72" rx="10" fill="#fff" /><path d="M32 36h36M32 52h36M32 68h22" stroke={C.violetDark} strokeWidth="7" strokeLinecap="round" /></g>],
    ["Ссылка на статью", C.blue, C.blueDark, <path key="c" d="M40 60l20-20M30 50l-10 10a14 14 0 0 0 20 20l10-10M70 50l10-10a14 14 0 0 0-20-20L50 30" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" />],
    ["Открытый API", C.green, C.greenDark, <path key="d" d="M36 22c-12 0-12 8-12 16s-6 12-12 12c6 0 12 4 12 12s0 16 12 16M64 22c12 0 12 8 12 16s6 12 12 12c-6 0-12 4-12 12s0 16-12 16" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" />],
  ];
  return (
    <Scene dur={150} bg={C.mist}>
      <Caption text="И ещё" at={0} y={90} size={100} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 50, paddingTop: 80 }}>
        {items.map(([t, c, d, svg], i) => {
          const s = pop(frame, fps, 10 + i * 10, 9);
          const bob = Math.sin((frame + i * 16) / 16) * 9;
          return (
            <div key={i} style={{ width: 400, textAlign: "center", transform: `translateY(${bob + (1 - s) * 200}px) scale(${s}) rotate(${(1 - s) * (i - 1.5) * 12}deg)`, opacity: Math.min(1, s * 2) }}>
              <div style={{ width: 340, height: 340, margin: "0 auto", borderRadius: 80, background: c, boxShadow: `0 16px 0 ${d}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="200" height="200" viewBox="0 0 100 100">{svg}</svg>
              </div>
              <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 48, color: C.ink, marginTop: 40, lineHeight: 1.1 }}>{t}</div>
            </div>
          );
        })}
      </AbsoluteFill>
    </Scene>
  );
};

// ---------- S12: финал ----------
const S12: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = pop(frame, fps, 6, 10);
  const tag = interpolate(frame, [34, 54], [0, 1], { easing: OUT, ...clamp });
  const btn = pop(frame, fps, 70, 9);
  const press = interpolate(frame, [130, 134, 140], [0, 1, 0], clamp);
  const url = interpolate(frame, [150, 170], [0, 1], { easing: OUT, ...clamp });
  const note = interpolate(frame, [180, 200], [0, 1], clamp);
  return (
    <Scene dur={240} bg={NIGHT} punch={false}>
      <AbsoluteFill>
        {Array.from({ length: 24 * 14 }).map((_, i) => {
          const c = i % 24, r = Math.floor(i / 24); const h = hash(c, r);
          return <div key={i} style={{ position: "absolute", left: c * 80, top: r * (1080 / 14), width: 80, height: 1080 / 14, background: "#fff", opacity: 0.015 + 0.05 * Math.max(0, Math.sin(frame / 20 + h * 9)) }} />;
        })}
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 130 }}>
        <div style={{ background: "#fff", borderRadius: 60, padding: "30px 70px", transform: `scale(${logo})` }}><Img src={staticFile("img/logo.png")} style={{ width: 760 }} /></div>
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 420, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 60, color: "#fff", opacity: tag, transform: `translateY(${(1 - tag) * 30}px)` }}>Законы Узбекистана — понятно, бесплатно, живо</div>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: 440 }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 72, letterSpacing: 3, color: "#fff", background: C.green, borderRadius: 42, padding: "44px 120px", boxShadow: `0 ${14 - press * 10}px 0 ${C.greenDark}`, transform: `scale(${btn * (1 - press * 0.03)}) translateY(${press * 10}px)` }}>НАЧАТЬ УЧИТЬСЯ</div>
        <div style={{ marginTop: 50, fontFamily: FONT, fontWeight: 900, fontSize: 76, color: C.blue, opacity: url, transform: `translateY(${(1 - url) * 30}px)` }}>neolex.uz</div>
        <div style={{ marginTop: 30, fontFamily: FONT, fontWeight: 700, fontSize: 28, color: "#8fa0d8", opacity: note }}>Тексты — из базы lex.uz · образовательный и справочный проект</div>
      </AbsoluteFill>
    </Scene>
  );
};

export const LT = { s1: 0, s2: 180, s3: 300, s4: 480, s5: 630, s6: 780, s7: 930, s8: 1050, s9: 1170, s10: 1320, s11: 1410, s12: 1560, end: 1800 };

export const Launch: React.FC = () => {
  useFonts();
  const seq: [number, number, React.FC][] = [
    [LT.s1, LT.s2 - LT.s1, S1], [LT.s2, LT.s3 - LT.s2, S2], [LT.s3, LT.s4 - LT.s3, S3], [LT.s4, LT.s5 - LT.s4, S4], [LT.s5, LT.s6 - LT.s5, S5], [LT.s6, LT.s7 - LT.s6, S6],
    [LT.s7, LT.s8 - LT.s7, S7], [LT.s8, LT.s9 - LT.s8, S8], [LT.s9, LT.s10 - LT.s9, S9], [LT.s10, LT.s11 - LT.s10, S10], [LT.s11, LT.s12 - LT.s11, S11], [LT.s12, LT.end - LT.s12, S12],
  ];
  return (
    <AbsoluteFill style={{ background: C.white }}>
      {seq.map(([from, dur, Comp], i) => <Sequence key={i} from={from} durationInFrames={dur}><Comp /></Sequence>)}
      <Audio src={staticFile("audio/launch-mix.wav")} />
      <PixelWipe at={LT.s2} color={C.blue} />
      <PixelWipe at={LT.s4} color={C.green} />
      <PixelWipe at={LT.s6} color={C.violet} />
      <PixelWipe at={LT.s9} color={C.orange} />
      <PixelWipe at={LT.s12} color={NIGHT} />
    </AbsoluteFill>
  );
};
