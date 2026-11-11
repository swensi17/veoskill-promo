import React from "react";
import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FONT, useFonts } from "./Intro";

// ===== Премиум «жидкое стекло» для NeoLex. 60 fps, время в секундах. Палитра: тёмный синий, фирменный голубой, белый. Зелёный только для «верно». =====
const FPS = 60;
const NAVY = "#071a4a", BLUE = "#1cb0f6", BLUE2 = "#1899d6", DEEP = "#0b49c4", INK = "#0b1b3f", MIST = "#f3f7ff", GREEN = "#58cc02";
const EASE = Easing.bezier(0.22, 1, 0.36, 1);
const IO = Easing.bezier(0.65, 0, 0.35, 1);
const P = (t: number, a: number, b: number, e: (x: number) => number = EASE) => interpolate(t, [a, b], [0, 1], { easing: e, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const useT = () => useCurrentFrame() / FPS;
const hash = (a: number, b: number) => Math.abs((Math.sin(a * 12.9898 + b * 78.233) * 43758.5453) % 1);
const mix = (a: number[], b: number[], k: number) => `rgb(${a.map((x, i) => Math.round(x + (b[i] - x) * k)).join(",")})`;

// ---------- фоны ----------
const BlueBG: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{ background: `linear-gradient(135deg, #1aa0f0 0%, ${DEEP} 62%, #0a2f8f 100%)` }}>
      <div style={{ position: "absolute", left: -300 + Math.sin(t / 1.4) * 320, top: -380 + Math.cos(t / 1.7) * 200, width: 1300, height: 1100, borderRadius: "50%", background: "radial-gradient(circle, rgba(140,225,255,.85), rgba(140,225,255,0) 68%)", filter: "blur(30px)" }} />
      <div style={{ position: "absolute", left: 900 + Math.cos(t / 1.3) * 300, top: 380 + Math.sin(t / 1.6) * 220, width: 1200, height: 1000, borderRadius: "50%", background: "radial-gradient(circle, rgba(10,40,140,.85), rgba(10,40,140,0) 66%)", filter: "blur(40px)" }} />
      <div style={{ position: "absolute", left: 500 + Math.sin(t / 1.8) * 420, top: 600 + Math.cos(t / 1.5) * 120, width: 900, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,.22), rgba(255,255,255,0) 70%)", filter: "blur(24px)" }} />
      <div style={{ position: "absolute", left: -400 + ((t * 260) % 3000), top: -200, width: 280, height: 1600, background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.16), rgba(255,255,255,0))", transform: "rotate(18deg)", filter: "blur(10px)" }} />
    </AbsoluteFill>
  );
};
const LightBG: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{ background: MIST }}>
      <div style={{ position: "absolute", left: 1100 + Math.sin(t / 3) * 120, top: -300, width: 1100, height: 900, borderRadius: "50%", background: "radial-gradient(circle, rgba(28,176,246,.16), rgba(28,176,246,0) 66%)", filter: "blur(30px)" }} />
      <div style={{ position: "absolute", left: -300, top: 600 + Math.cos(t / 3.3) * 80, width: 1000, height: 800, borderRadius: "50%", background: "radial-gradient(circle, rgba(11,73,196,.10), rgba(11,73,196,0) 66%)", filter: "blur(30px)" }} />
      {[[260, 220, 190, 0.55, 0], [1500, 700, 260, 0.35, 1.7], [900, 120, 120, 0.8, 3.1], [1700, 160, 150, 0.5, 4.4], [420, 760, 140, 0.65, 2.3]].map(([x, y, r, sp, ph], i) => (
        <div key={i} style={{ position: "absolute", left: (x as number) + Math.sin(t * (sp as number) + (ph as number)) * 120, top: (y as number) + Math.cos(t * (sp as number) * 0.8 + (ph as number)) * 90, width: (r as number) * 2, height: (r as number) * 2, borderRadius: "50%", background: "radial-gradient(circle at 32% 28%, rgba(255,255,255,.95), rgba(190,225,255,.35) 45%, rgba(28,150,246,.10) 100%)", border: "1.5px solid rgba(255,255,255,.9)", boxShadow: "0 30px 60px rgba(11,73,196,.14), inset 0 -20px 40px rgba(28,176,246,.12)", filter: `blur(${i % 2 ? 1.5 : 0}px)` }} />
      ))}
    </AbsoluteFill>
  );
};

// ---------- стекло ----------
const Glass: React.FC<{ style?: React.CSSProperties; radius?: number; light?: boolean; sweep?: number; flat?: boolean; children?: React.ReactNode }> = ({ style, radius = 40, light, sweep, flat, children }) => (
  <div style={{ position: "relative", borderRadius: radius, overflow: "hidden",
    background: light ? "linear-gradient(135deg, rgba(255,255,255,.78), rgba(255,255,255,.46))" : "linear-gradient(135deg, rgba(255,255,255,.30), rgba(255,255,255,.08))",
    ...(flat ? {} : { backdropFilter: "blur(26px) saturate(170%)", WebkitBackdropFilter: "blur(26px) saturate(170%)" }),
    border: `1.5px solid ${light ? "rgba(255,255,255,.95)" : "rgba(255,255,255,.42)"}`,
    boxShadow: light ? "0 30px 70px rgba(11,73,196,.18), inset 0 1px 0 #fff" : "0 40px 90px rgba(4,20,90,.45), inset 0 1.5px 0 rgba(255,255,255,.65), inset 0 -24px 50px rgba(255,255,255,.07)", ...style }}>
    {sweep !== undefined && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(255,255,255,0) 38%, rgba(255,255,255,.34) 50%, rgba(255,255,255,0) 62%)", transform: `translateX(${(sweep - 0.5) * 240}%)`, pointerEvents: "none" }} />}
    {children}
  </div>
);

// ---------- сцена: мягкие границы ----------
const Sc: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const t = useT();
  const b = Math.max(interpolate(t, [0, 0.3], [18, 0], { extrapolateRight: "clamp" }), interpolate(t, [dur - 0.25, dur], [0, 18], { extrapolateLeft: "clamp" }));
  const s = interpolate(t, [0, 0.5], [0.9, 1], { easing: EASE, extrapolateRight: "clamp" }) * (1 + 0.04 * (t / dur)) * interpolate(t, [dur - 0.25, dur], [1, 1.12], { extrapolateLeft: "clamp" });
  return <AbsoluteFill style={{ filter: `blur(${b}px)` }}><AbsoluteFill style={{ transform: `scale(${s}) translateX(${Math.sin(t * 0.9) * 10}px) rotate(${Math.sin(t * 0.6) * 0.25}deg)` }}>{children}</AbsoluteFill></AbsoluteFill>;
};

// ---------- типографика: слова приходят синими и становятся тёмными ----------
const Words: React.FC<{ text: string; at: number; per?: number; size?: number; y?: number; white?: boolean; weight?: number; align?: "center" | "left"; x?: number }> = ({ text, at, per = 0.4, size = 104, y = 440, white, weight = 700, align = "center", x = 0 }) => {
  const t = useT();
  const ws = text.split(" ");
  return (
    <div style={{ position: "absolute", left: x, top: y, width: align === "center" ? "100%" : undefined, display: "flex", justifyContent: align === "center" ? "center" : "flex-start", flexWrap: "wrap", gap: `0 ${size * 0.26}px`, padding: align === "center" ? "0 120px" : 0, transform: `translateY(${-Math.max(0, t - at) * 9}px)` }}>
      {ws.map((w, i) => {
        const a = at + i * per;
        const k = P(t, a, a + 0.42);
        const c = P(t, a + 0.18, a + 0.9, IO);
        const col = white ? mix([140, 225, 255], [255, 255, 255], c) : mix([28, 140, 255], [11, 27, 63], c);
        return <span key={i} style={{ fontFamily: FONT, fontWeight: weight, fontSize: size, letterSpacing: -size * 0.02, color: col, opacity: k, filter: `blur(${(1 - k) * 14}px)`, transform: `translateY(${(1 - k) * 22}px)`, display: "inline-block" }}>{w}</span>;
      })}
    </div>
  );
};

const Type: React.FC<{ text: string; at: number; cps?: number; size?: number; y: number; white?: boolean; weight?: number }> = ({ text, at, cps = 26, size = 56, y, white, weight = 600 }) => {
  const t = useT();
  const n = Math.max(0, Math.min(text.length, Math.floor((t - at) * cps)));
  if (t < at) return null;
  return <div style={{ position: "absolute", top: y, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: weight, fontSize: size, color: white ? "#fff" : INK }}>{text.slice(0, n)}<span style={{ opacity: Math.floor(t * 2.2) % 2 === 0 || n < text.length ? 1 : 0, color: white ? "#bfeaff" : BLUE2 }}>|</span></div>;
};

const Count: React.FC<{ to: number; at: number; dur: number; suffix?: string; size?: number; color?: string }> = ({ to, at, dur, suffix = "", size = 200, color = "#fff" }) => {
  const t = useT();
  return <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: size, color, letterSpacing: -size * 0.03, fontVariantNumeric: "tabular-nums" }}>{Math.round(to * P(t, at, at + dur))}{suffix}</span>;
};

// ---------- курсор ----------
type KF = [number, number, number];
const Cur: React.FC<{ path: KF[]; clicks?: number[] }> = ({ path, clicks = [] }) => {
  const t = useT();
  const ts = path.map((p) => p[0]);
  const x = interpolate(t, ts, path.map((p) => p[1]), { easing: IO, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(t, ts, path.map((p) => p[2]), { easing: IO, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const vis = P(t, ts[0] - 0.15, ts[0]) * (1 - P(t, ts[ts.length - 1] + 0.3, ts[ts.length - 1] + 0.6));
  const press = Math.max(0, ...clicks.map((c) => 1 - Math.min(1, Math.abs(t - c - 0.04) / 0.09)));
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: vis, pointerEvents: "none" }}>
      {clicks.map((c, i) => { const k = P(t, c, c + 0.4, Easing.out(Easing.quad)); return k > 0 && k < 1 ? <div key={i} style={{ position: "absolute", left: -34, top: -34, width: 68, height: 68, borderRadius: "50%", border: "3px solid rgba(255,255,255,.95)", opacity: 1 - k, transform: `scale(${0.3 + k * 1.1})` }} /> : null; })}
      <svg width="46" height="46" viewBox="0 0 44 44" style={{ transform: `scale(${1 - press * 0.14})`, transformOrigin: "4px 4px", filter: "drop-shadow(0 6px 10px rgba(0,0,0,.35))" }}><path d="M4 3 L4 33 L12 26 L18 40 L24 37 L18 24 L29 24 Z" fill="#fff" stroke="#0b1b3f" strokeWidth="2.4" strokeLinejoin="round" /></svg>
    </div>
  );
};

// ---------- скриншот в стеклянной раме с глубиной ----------
type Cam = { t: number; cx: number; cy: number; s: number };
const Panel: React.FC<{ img: string; cam: Cam[]; tilt?: { t: number; ry: number; rx: number }[]; depth?: boolean; children?: (inv: number) => React.ReactNode; enter?: number }> = ({ img, cam, tilt, depth = true, children, enter = 0 }) => {
  const t = useT();
  const g = (k: "cx" | "cy" | "s") => interpolate(t, cam.map((c) => c.t), cam.map((c) => c[k]), { easing: EASE, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const s = g("s"), cx = g("cx"), cy = g("cy");
  const ry = tilt ? interpolate(t, tilt.map((x) => x.t), tilt.map((x) => x.ry), { easing: EASE, extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const rx = tilt ? interpolate(t, tilt.map((x) => x.t), tilt.map((x) => x.rx), { easing: EASE, extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const e = P(t, enter, enter + 0.9);
  const W = 1380, H = 862;
  const frame = (extra: React.CSSProperties, inner: boolean) => (
    <Glass flat={!inner} radius={46} style={{ position: "absolute", left: 270, top: 70, width: W + 32, height: H + 32, padding: 16, ...extra }} sweep={inner ? (t * 0.35) % 1 : undefined}>
      <div style={{ position: "relative", width: W, height: H, borderRadius: 32, overflow: "hidden", background: "#fff" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1440, height: 900, transformOrigin: "0 0", transform: `translate(${W / 2 - cx * s * (W / 1440)}px,${H / 2 - cy * s * (H / 900)}px) scale(${s * (W / 1440)})` }}>
          <Img src={staticFile(img)} style={{ width: 1440, height: 900, display: "block" }} />
          {inner && children?.(1 / (s * (W / 1440)))}
        </div>
      </div>
    </Glass>
  );
  return (
    <div style={{ position: "absolute", inset: 0, perspective: 2600, opacity: e, transform: `translateY(${(1 - e) * 120}px)` }}>
      {depth && <div style={{ position: "absolute", inset: 0, transform: `translate(${-240 + Math.sin(t * 0.8) * 50}px,${60 + Math.cos(t * 0.9) * 24}px) scale(.78) rotateY(${ry * 0.6 + 14}deg)`, filter: "blur(9px)", opacity: 0.5 }}>{frame({}, false)}</div>}
      {depth && <div style={{ position: "absolute", inset: 0, transform: `translate(${250 - Math.sin(t * 0.7) * 60}px,${-50 + Math.cos(t * 0.8) * 30}px) scale(.7) rotateY(${ry * 0.6 - 16}deg)`, filter: "blur(15px)", opacity: 0.42 }}>{frame({}, false)}</div>}
      <div style={{ position: "absolute", inset: 0, transform: `rotateY(${ry + Math.sin(t * 0.9) * 2.6}deg) rotateX(${rx + Math.cos(t * 0.7) * 1.6}deg) translateY(${Math.sin(t * 1.1) * 10}px) scale(${1 + 0.012 * t})` }}>{frame({}, true)}</div>
    </div>
  );
};
const Ring: React.FC<{ x: number; y: number; w: number; h: number; a: number; b: number; inv: number }> = ({ x, y, w, h, a, b, inv }) => {
  const t = useT();
  const o = P(t, a, a + 0.25) * (1 - P(t, b - 0.25, b));
  if (o <= 0) return null;
  return <div style={{ position: "absolute", left: x - 8, top: y - 8, width: w + 16, height: h + 16, borderRadius: 24, border: `${4 * inv}px solid ${BLUE}`, boxShadow: `0 0 ${30 * inv}px rgba(28,176,246,.55)`, opacity: o }} />;
};
const Pill: React.FC<{ text: string; a: number; b: number; x?: number; y?: number; size?: number; sub?: string }> = ({ text, a, b, x = 960, y = 985, size = 46, sub }) => {
  const t = useT();
  const o = P(t, a, a + 0.35) * (1 - P(t, b - 0.3, b));
  if (o <= 0) return null;
  return <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) translateY(${(1 - o) * 26}px) scale(${0.94 + 0.06 * o})`, opacity: o }}>
    <Glass radius={999} style={{ padding: "16px 48px", textAlign: "center", whiteSpace: "nowrap" }} sweep={P(t, a, b)}><div style={{ fontFamily: FONT, fontWeight: 700, fontSize: size, color: "#fff", textShadow: "0 2px 12px rgba(4,20,90,.35)" }}>{text}</div>{sub && <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: size * 0.56, color: "rgba(255,255,255,.85)", marginTop: 2 }}>{sub}</div>}</Glass>
  </div>;
};

// =====================  СЦЕНЫ  =====================
const A_Hook: React.FC = () => (
  <Sc dur={5}>
    <LightBG />
    <Words text="Законы — это сложно?" at={0.25} per={0.5} size={118} y={330} />
    <Words text="Объясняем простыми словами" at={2.5} per={0.5} size={86} y={560} weight={600} />
  </Sc>
);

const B_Platform: React.FC = () => {
  const t = useT();
  const lg = P(t, 0.1, 0.8);
  return (
    <Sc dur={4.5}>
      <BlueBG />
      <Panel img="shots/laws-desk.png" enter={0.35}
        tilt={[{ t: 0.3, ry: -22, rx: 9 }, { t: 1.4, ry: -6, rx: 3 }, { t: 4.4, ry: 4, rx: -2 }]}
        cam={[{ t: 0.3, cx: 720, cy: 450, s: 0.95 }, { t: 1.6, cx: 720, cy: 450, s: 1 }, { t: 2.2, cx: 700, cy: 125, s: 1.6 }, { t: 3.0, cx: 1000, cy: 125, s: 1.6 }, { t: 3.5, cx: 420, cy: 330, s: 1.25 }, { t: 4.4, cx: 420, cy: 330, s: 1.32 }]}>
        {(inv) => (<><Ring x={70} y={104} w={1340} h={42} a={2.3} b={3.4} inv={inv} /><Ring x={24} y={176} w={336} h={206} a={3.6} b={4.5} inv={inv} /></>)}
      </Panel>
      <div style={{ position: "absolute", left: 120, top: 12, opacity: lg, transform: `translateY(${(1 - lg) * -20}px)`, filter: "brightness(0) invert(1)", zIndex: 5 }}><Img src={staticFile("img/logo.png")} style={{ width: 210 }} /></div>
      <Pill text="Конституция, кодексы, законы" a={1.0} b={2.2} y={1000} />
      <Pill text="Для любой профессии" a={2.35} b={3.5} y={1000} />
      <Pill text="21 кодекс · сотни законов" a={3.55} b={4.5} y={1000} />
    </Sc>
  );
};

const C_Type: React.FC = () => (
  <Sc dur={2.5}><LightBG /><Words text="Каждая статья" at={0.1} per={0.4} size={110} y={340} /><Words text="простыми словами" at={0.95} per={0.45} size={110} y={500} /></Sc>
);

const D_Article: React.FC = () => {
  return (
    <Sc dur={3.4}>
      <BlueBG />
      <Panel img="shots/article-desk.png" enter={0.1}
        tilt={[{ t: 0.1, ry: 20, rx: -6 }, { t: 1.3, ry: 3, rx: 0 }, { t: 3.3, ry: -3, rx: 1 }]}
        cam={[{ t: 0.1, cx: 720, cy: 150, s: 1.6 }, { t: 1.2, cx: 720, cy: 450, s: 1 }, { t: 1.8, cx: 720, cy: 470, s: 1.28 }, { t: 2.6, cx: 720, cy: 470, s: 1.28 }, { t: 3.2, cx: 600, cy: 720, s: 1.5 }]}>
        {(inv) => (<><Ring x={346} y={278} w={750} h={402} a={1.8} b={2.9} inv={inv} /><Ring x={344} y={703} w={202} h={50} a={3.2} b={3.8} inv={inv} /><Cur path={[[1.2, 1000 * 1, 200], [2.0, 760, 500], [3.0, 470, 727], [3.35, 455, 727]]} clicks={[3.3]} /></>)}
      </Panel>
      <Pill text="«Простыми словами»" a={1.7} b={3.0} sub="пояснение к каждой статье" />
      <Pill text="Открыть в читалке" a={3.1} b={3.6} />
    </Sc>
  );
};

const ReaderGlass: React.FC<{ lt: number }> = ({ lt }) => {
  const t = lt;
  const h1 = P(t, 0.25, 0.65), h2 = P(t, 0.8, 1.2), h3 = P(t, 1.6, 1.95), note = P(t, 1.3, 1.8), bar = P(t, 0.05, 0.5);
  const hl = (txt: string, p: number, col: string) => <span style={{ background: `linear-gradient(${col},${col}) no-repeat left center / ${p * 100}% 90%`, borderRadius: 10, padding: "0 6px" }}>{txt}</span>;
  return (
    <Sc dur={2.6}>
      <BlueBG />
      <Glass radius={54} style={{ position: "absolute", left: 300, top: 250, width: 1320, padding: "56px 76px" }} sweep={P(t, 0, 2.6)}>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 70, color: "#fff" }}>Статья 1.</div>
        <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 54, lineHeight: 1.6, color: "#fff", marginTop: 22 }}>
          Узбекистан — {hl("суверенное, демократическое,", h1, "rgba(255,226,122,.5)")} {hl("правовое, социальное", h2, "rgba(182,240,138,.5)")} и {hl("светское", h3, "rgba(132,216,255,.55)")} государство с республиканской формой правления.
        </div>
      </Glass>
      <div style={{ position: "absolute", left: 560, top: 175, opacity: bar, transform: `translateY(${(1 - bar) * 20}px)` }}>
        <Glass radius={999} style={{ padding: "14px 30px", display: "flex", gap: 20 }}>{["#ffe27a", "#b6f08a", "#84d8ff", "#ffb3c4"].map((c, i) => <div key={i} style={{ width: 40, height: 40, borderRadius: "50%", background: c }} />)}</Glass>
      </div>
      <div style={{ position: "absolute", left: 1180, top: 770, opacity: note, transform: `translateY(${(1 - note) * 30}px) rotate(-2deg)` }}>
        <Glass radius={30} light style={{ padding: "22px 34px", width: 430 }}><div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 24, color: BLUE2, letterSpacing: 2 }}>МОЯ ЗАМЕТКА</div><div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 38, color: INK }}>Сверить со статьёй 2</div></Glass>
      </div>
      <Pill text="Цвет · заметки · поиск" a={0.2} b={2.5} y={140} />
      <Cur path={[[0.1, 700, 480], [0.3, 760, 440], [1.2, 1180, 440], [1.6, 1250, 560]]} clicks={[0.3, 0.8, 1.6]} />
    </Sc>
  );
};

const D2: React.FC = () => <ReaderGlass lt={useT()} />;
const F2: React.FC = () => <LessonCard lt={useT()} />;
const F3: React.FC = () => <Quiz lt={useT()} />;
const F4: React.FC = () => <Done lt={useT()} />;
const LessonPath: React.FC = () => {
  const t = useT();
  const nodes = Array.from({ length: 6 }).map((_, i) => ({ x: 960 + Math.sin(i * 1.25) * 250, y: 380 + i * 210 }));
  const sc = P(t, 0, 2.3, IO) * 330;
  const grow = P(t, 2.35, 3, IO);
  return (
    <Sc dur={3}>
      <BlueBG />
      <svg width="1920" height="1080" style={{ position: "absolute", transform: `translateY(${-sc}px)` }}>
        <path d={`M${nodes.map((n) => `${n.x} ${n.y}`).join(" L")}`} stroke="rgba(255,255,255,.55)" strokeWidth="14" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 28" pathLength={1} />
      </svg>
      {nodes.map((n, i) => {
        const k = P(t, 0.1 + i * 0.12, 0.6 + i * 0.12);
        const active = i === 1;
        return <div key={i} style={{ position: "absolute", left: n.x - 74, top: n.y - 74 - sc, width: 148, height: 148, opacity: k, transform: `scale(${0.6 + 0.4 * k})` }}>
          <Glass radius={999} style={{ width: 148, height: 148, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: active ? "0 0 70px rgba(140,225,255,.9), inset 0 1.5px 0 rgba(255,255,255,.7)" : undefined, background: active ? "linear-gradient(135deg, rgba(255,255,255,.7), rgba(180,235,255,.35))" : undefined }}>
            <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 64, color: i === 0 ? "#fff" : active ? DEEP : "rgba(255,255,255,.7)" }}>{i === 0 ? "✓" : i + 1}</span>
          </Glass>
        </div>;
      })}
      <div style={{ position: "absolute", left: 120, top: 80 }}><Words text="Уроки" at={0.1} per={0.3} size={130} y={0} white align="left" /></div>
      <div style={{ position: "absolute", left: nodes[1].x - 74, top: nodes[1].y - 74 - sc, width: 148, height: 148, borderRadius: "50%", background: "rgba(255,255,255,.22)", border: "1.5px solid rgba(255,255,255,.6)", transform: `scale(${1 + grow * 14})`, opacity: grow > 0 ? 1 : 0 }} />
      <Cur path={[[0.9, 1500, 900], [2.2, nodes[1].x + 12, nodes[1].y - sc + 10], [2.6, nodes[1].x + 12, nodes[1].y - sc + 10]]} clicks={[2.3]} />
    </Sc>
  );
};
const LessonCard: React.FC<{ lt: number }> = ({ lt: t }) => {
  const e = P(t, 0, 0.6);
  const txt = "Узбекистан — суверенное, демократическое, правовое, социальное и светское государство";
  const n = Math.floor(P(t, 0.5, 2.4, Easing.linear) * txt.length);
  return (
    <Sc dur={3}>
      <BlueBG />
      <div style={{ position: "absolute", top: 90, left: 330, right: 330, display: "flex", gap: 14 }}>{[0, 1, 2, 3].map((i) => <div key={i} style={{ flex: 1, height: 10, borderRadius: 5, background: "rgba(255,255,255,.28)", overflow: "hidden" }}><div style={{ width: `${i === 0 ? P(t, 0.3, 2.6) * 100 : 0}%`, height: "100%", background: "#fff" }} /></div>)}</div>
      <div style={{ position: "absolute", left: 330, top: 190, width: 1260, opacity: e, transform: `translateY(${(1 - e) * 60}px) scale(${0.96 + 0.04 * e})` }}>
        <Glass radius={60} style={{ padding: "64px 80px", minHeight: 560 }} sweep={P(t, 0, 3)}>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 36, color: "rgba(255,255,255,.8)", letterSpacing: 3 }}>УРОК 1 · СТАТЬЯ 1</div>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 92, lineHeight: 1.16, color: "#fff", marginTop: 34, letterSpacing: -2 }}>{txt.slice(0, n)}<span style={{ opacity: n < txt.length ? 1 : 0 }}>|</span></div>
        </Glass>
      </div>
    </Sc>
  );
};
const Quiz: React.FC<{ lt: number }> = ({ lt: t }) => {
  const qs = [
    { q: "Узбекистан — государство…", o: ["Суверенное", "Зависимое", "Временное"], a: 0 },
    { q: "Форма правления?", o: ["Монархическая", "Республиканская", "Племенная"], a: 1 },
    { q: "Государство…", o: ["Религиозное", "Военное", "Светское"], a: 2 },
  ];
  const per = 1.5; const i = Math.min(2, Math.floor(t / per)); const q = qs[i]; const lt = t - i * per;
  const ok = P(t - i * per, 0.85, 1.0, Easing.linear) >= 1;
  const good = P(lt, 0.85, 1.1);
  return (
    <Sc dur={4.5}>
      <BlueBG />
      <div style={{ position: "absolute", top: 80, left: 330, right: 330, display: "flex", gap: 14 }}>{[0, 1, 2].map((k) => <div key={k} style={{ flex: 1, height: 10, borderRadius: 5, background: "rgba(255,255,255,.28)", overflow: "hidden" }}><div style={{ width: `${(k < i || (k === i && ok) ? 1 : 0) * 100}%`, height: "100%", background: "#fff" }} /></div>)}</div>
      <div style={{ position: "absolute", top: 150, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 92, color: "#fff", letterSpacing: -2, opacity: P(lt, 0, 0.3), filter: `blur(${(1 - P(lt, 0, 0.3)) * 12}px)` }}>{q.q}</div>
      {q.o.map((txt, k) => {
        const e = P(lt, 0.15 + k * 0.1, 0.5 + k * 0.1);
        const right = k === q.a;
        return <div key={k} style={{ position: "absolute", left: 360, top: 410 + k * 170, width: 1200, opacity: e * (ok && !right ? 0.45 : 1), transform: `translateX(${(1 - e) * 120}px) scale(${right ? 1 + good * 0.025 : 1})` }}>
          <Glass radius={46} style={{ padding: "0 56px", height: 134, display: "flex", alignItems: "center", justifyContent: "space-between",
            background: right ? `linear-gradient(135deg, rgba(255,255,255,${0.3 + good * 0.4}), rgba(88,204,2,${0.08 + good * 0.4}))` : undefined,
            boxShadow: right && good > 0 ? `0 0 ${60 * good}px rgba(88,204,2,${0.55 * good}), inset 0 1.5px 0 rgba(255,255,255,.7)` : undefined }}>
            <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 60, color: "#fff" }}>{txt}</span>
            {right && good > 0.4 && <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 64, color: "#fff" }}>✓</span>}
          </Glass>
        </div>;
      })}
      <Cur path={[[0.2, 1500, 820], [0.85, 760, 478 + q.a * 170], [1.4, 760, 478 + q.a * 170]]} clicks={[0.9]} key={i} />
    </Sc>
  );
};
const Done: React.FC<{ lt: number }> = ({ lt: t }) => {
  const morph = P(t, 0, 0.5, IO);
  const fill = P(t, 0.4, 1.5);
  const done = P(t, 1.5, 2.0);
  return (
    <Sc dur={2.5}>
      <BlueBG />
      <div style={{ position: "absolute", left: 360, top: 540 - 24 - (1 - morph) * 230, width: 1200, height: 48 + (1 - morph) * 460, opacity: 1 }}>
        <Glass radius={999} style={{ width: "100%", height: "100%" }}><div style={{ width: `${morph > 0.6 ? fill * 100 : 0}%`, height: "100%", background: "linear-gradient(90deg, rgba(255,255,255,.55), #fff)", borderRadius: 999 }} /></Glass>
      </div>
      <div style={{ position: "absolute", top: 210, width: "100%", textAlign: "center", opacity: morph > 0.5 ? 1 : 0 }}><Count to={100} at={0.4} dur={1.1} suffix="%" size={230} /></div>
      <div style={{ position: "absolute", top: 660, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 104, color: "#fff", letterSpacing: -2, opacity: done, transform: `translateY(${(1 - done) * 30}px)` }}>Урок пройден</div>
      <div style={{ position: "absolute", left: 870, top: 810, opacity: done, transform: `scale(${0.6 + done * 0.4})` }}><Glass radius={999} style={{ width: 180, height: 180, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 80px rgba(255,255,255,.6), inset 0 1.5px 0 rgba(255,255,255,.7)" }}><span style={{ fontSize: 100, color: "#fff", fontFamily: FONT, fontWeight: 800 }}>✓</span></Glass></div>
      {Array.from({ length: 34 }).map((_, i) => { const k = (t - 1.5) / 1.4; if (k < 0 || k > 1) return null; const a = hash(i, 1) * Math.PI * 2, v = 260 + hash(i, 2) * 620; return <div key={i} style={{ position: "absolute", left: 960 + Math.cos(a) * v * k, top: 800 + Math.sin(a) * v * k * 0.7 + 480 * k * k, width: 12 + hash(i, 3) * 12, height: 12 + hash(i, 3) * 12, borderRadius: i % 3 ? 20 : 4, background: i % 2 ? "#fff" : "#9fe1ff", opacity: 1 - k, transform: `rotate(${k * 540}deg)` }} />; })}
    </Sc>
  );
};

const G_Courses: React.FC = () => {
  const t = useT();
  const ds: [string, string][] = [["Право", "icon_legal.png"], ["Медицина", "icon_medical.png"], ["IT", "icon_it.png"], ["Экономика", "icon_economics.png"], ["Финансы", "icon_finance.png"], ["Психология", "icon_psychology.png"], ["Бизнес", "icon_business.png"], ["История", "icon_history.png"]];
  const focus = P(t, 2.3, 2.9);
  return (
    <Sc dur={4}>
      <BlueBG />
      <Words text="Курсы по любому направлению" at={0.1} per={0.35} size={84} y={70} white />
      {ds.map(([n, img], i) => {
        const col = i % 4, row = Math.floor(i / 4);
        const k = P(t, 0.5 + i * 0.1, 1.1 + i * 0.1);
        const f = i === 0 ? 1 : 0;
        return <div key={i} style={{ position: "absolute", left: 200 + col * 410, top: 330 + row * 330, width: 360, opacity: k * (1 - focus * (f ? 0 : 0.55)), transform: `translateY(${(1 - k) * 50}px) scale(${(0.9 + 0.1 * k) * (1 + focus * f * 0.1)})`, filter: `blur(${(1 - k) * 10 + focus * (f ? 0 : 4)}px)` }}>
          <Glass radius={54} style={{ height: 290, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, boxShadow: f && focus > 0 ? `0 0 ${70 * focus}px rgba(160,230,255,${0.7 * focus}), inset 0 1.5px 0 rgba(255,255,255,.7)` : undefined }} sweep={(t * 0.2 + i * 0.1) % 1}>
            <Img src={staticFile(`img/${img}`)} style={{ width: 130, height: 130 }} />
            <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 46, color: "#fff" }}>{n}</div>
          </Glass>
        </div>;
      })}
    </Sc>
  );
};

const H_Outro: React.FC = () => {
  const t = useT();
  const logo = P(t, 0.1, 0.9);
  const btn = P(t, 1.5, 2.2);
  const press = P(t, 3.0, 3.1, Easing.linear) * (1 - P(t, 3.1, 3.3, Easing.linear));
  return (
    <Sc dur={5}>
      <LightBG />
      <div style={{ position: "absolute", top: 190, width: "100%", display: "flex", justifyContent: "center", opacity: logo, transform: `translateY(${(1 - logo) * 30}px) scale(${0.96 + 0.04 * logo})`, filter: `blur(${(1 - logo) * 12}px)` }}><Img src={staticFile("img/logo.png")} style={{ width: 760 }} /></div>
      <Words text="Законы Узбекистана — понятно, бесплатно, живо" at={0.8} per={0.28} size={60} y={470} weight={600} />
      <div style={{ position: "absolute", top: 640, width: "100%", display: "flex", justifyContent: "center", opacity: btn, transform: `translateY(${(1 - btn) * 40 + press * 4}px) scale(${(0.94 + 0.06 * btn) * (1 - press * 0.03)})` }}>
        <Glass radius={999} sweep={P(t, 2.2, 3.6)} style={{ padding: "34px 120px", background: "linear-gradient(135deg, rgba(28,176,246,.95), rgba(11,73,196,.95))", border: "1.5px solid rgba(255,255,255,.55)", boxShadow: "0 30px 60px rgba(11,73,196,.4), inset 0 1.5px 0 rgba(255,255,255,.7)" }}>
          <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 64, color: "#fff", letterSpacing: 1 }}>Начать учиться</span>
        </Glass>
      </div>
      <Type text="neolex.uz" at={3.2} size={72} y={850} weight={700} />
      <div style={{ position: "absolute", top: 985, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 600, fontSize: 26, color: "rgba(11,27,63,.5)", opacity: P(t, 3.8, 4.3) }}>Тексты — из базы lex.uz · образовательный и справочный проект</div>
    </Sc>
  );
};

export const GT = { a: 0, b: 5, c: 9.5, d: 12, d2: 15.4, f: 18, f2: 21, f3: 24, f4: 28.5, g: 31, h: 35, end: 40 };
export const Glass40: React.FC = () => {
  useFonts();
  const sec = (s: number) => Math.round(s * FPS);
  const seq: [number, number, React.FC][] = [[GT.a, GT.b, A_Hook], [GT.b, GT.c, B_Platform], [GT.c, GT.d, C_Type], [GT.d, GT.d2, D_Article], [GT.d2, GT.f, D2], [GT.f, GT.f2, LessonPath], [GT.f2, GT.f3, F2], [GT.f3, GT.f4, F3], [GT.f4, GT.g, F4], [GT.g, GT.h, G_Courses], [GT.h, GT.end, H_Outro]];
  return (
    <AbsoluteFill style={{ background: MIST }}>
      {seq.map(([a, b, C], i) => <Sequence key={i} from={sec(a)} durationInFrames={sec(b - a)}><C /></Sequence>)}
      <Audio src={staticFile("audio/glass-mix.wav")} />
    </AbsoluteFill>
  );
};
