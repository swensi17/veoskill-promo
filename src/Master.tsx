import React from "react";
import { AbsoluteFill, Easing, Img, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Directions, GameRing, Counters } from "./Bits";
import { LawsWall, LangCube, Minutes, MistakeLoop, SaveRemember, LeagueClimb, Profile } from "./Bits2";
import { PathBeat } from "./PathBeat";

// veoskill promo — one continuous film (storyboard v3). 60 fps, 1920×1080, silent.
const FONT = "NunitoC, Nunito, sans-serif";
const BLUE = "#1cb0f6";
const LIP = "#0f6fbf";
const GREEN = "#58cc02";
const GLIP = "#58a700";
const INK = "#1f2a37";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const IO = Easing.bezier(0.65, 0, 0.35, 1);
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const IN = Easing.bezier(0.55, 0, 0.9, 0.4);
const lin = (f: number, a: number, b: number, x: number, y: number, e = IO) => interpolate(f, [a, b], [x, y], { easing: e, ...clamp });
const lip = (c: string, d: number, s = 0.25) => [...Array.from({ length: d }, (_, i) => `0 ${i + 1}px 0 ${c}`), `0 ${d + 10}px 26px rgba(10,40,90,${s})`].join(",");
const HD = (n: string) => staticFile(`hack/hd/${n}.png`);

export const useFonts = () => {
  const [h] = React.useState(() => delayRender("fonts"));
  React.useEffect(() => {
    const faces: Promise<unknown>[] = [];
    for (const w of [600, 700, 800, 900]) for (const s of ["cyrillic", "latin"]) {
      const f = new FontFace("NunitoC", `url(${staticFile(`fonts/nunito-${s}-${w}-normal.woff2`)})`, { weight: String(w) });
      faces.push(f.load().then(() => document.fonts.add(f)));
    }
    Promise.all(faces).then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};

// ---------- shared pieces ----------
export const Words: React.FC<{ text: string; at: number; size: number; color?: string; lipC?: string; align?: "center" | "flex-start"; style?: React.CSSProperties }> = ({ text, at, size, color = INK, lipC, align = "center", style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: align, columnGap: size * 0.26, perspective: 900, fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.08, ...style }}>
      {text.split(" ").map((w, i) => {
        const s = spring({ frame: f - at - i * 4, fps, config: { damping: 14, stiffness: 170, mass: 0.7 } });
        return <span key={i} style={{ display: "inline-block", color, textShadow: lipC ? lip(lipC, Math.max(3, Math.round(size / 16)), 0.2) : undefined, transform: `translateY(${(1 - s) * size * 0.7}px) rotateX(${(1 - s) * -70}deg)`, opacity: Math.min(1, s * 1.6), filter: s < 0.9 ? `blur(${(1 - s) * 8}px)` : undefined, whiteSpace: "nowrap" }}>{w}</span>;
      })}
    </div>
  );
};
export const Sub: React.FC<{ text: string; at: number; size?: number; color?: string; style?: React.CSSProperties }> = ({ text, at, size = 34, color = "#5d6c7c", style }) => {
  const f = useCurrentFrame();
  const t = lin(f, at, at + 22, 0, 1, OUT);
  return <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: size, color, opacity: t, transform: `translateY(${(1 - t) * 24}px)`, textAlign: "center", ...style }}>{text}</div>;
};
export const Arrow: React.FC<{ down: number; scale?: number }> = ({ down, scale = 1 }) => (
  <svg width={44 * scale} height={54 * scale} viewBox="0 0 22 27" style={{ position: "absolute", left: -4 * scale, top: -4 * scale, transform: `scale(${1 - down * 0.15})`, transformOrigin: "4px 4px", filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.3))" }}>
    <path d="M2 2 L2 21 L7 16.5 L10.5 24.5 L14 23 L10.6 15.2 L17 15 Z" fill="#111" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);
export type Click = { at: number; x: number; y: number };
/** Cursor whose hotspot (arrow tip) is exactly at the click point; everything in the caller's coordinates. */
export const useCursor = (clicks: Click[], start: [number, number], exit: [number, number]) => {
  const f = useCurrentFrame();
  const ks: { f: number; x: number; y: number }[] = [];
  if (clicks.length) {
    ks.push({ f: clicks[0].at - 42, x: start[0], y: start[1] });
    clicks.forEach((c) => { ks.push({ f: c.at - 9, x: c.x, y: c.y }); ks.push({ f: c.at + 7, x: c.x, y: c.y }); });
    const l = clicks[clicks.length - 1];
    ks.push({ f: l.at + 46, x: exit[0], y: exit[1] });
  }
  let x = start[0], y = start[1];
  for (let i = 0; i < ks.length - 1; i++) {
    const a = ks[i], b = ks[i + 1];
    if (f >= a.f && f <= b.f) { const t = IO((f - a.f) / Math.max(1, b.f - a.f)); x = a.x + (b.x - a.x) * t; y = a.y + (b.y - a.y) * t; break; }
    if (f > b.f) { x = b.x; y = b.y; }
  }
  const down = clicks.reduce((m, c) => Math.max(m, lin(f, c.at, c.at + 4, 0, 1) * (1 - lin(f, c.at + 6, c.at + 10, 0, 1))), 0);
  const ripples = clicks.map((c) => ({ x: c.x, y: c.y, t: lin(f, c.at, c.at + 20, 0, 1, OUT) }));
  const visible = clicks.length > 0 && f > ks[0].f && f < ks[ks.length - 1].f;
  const op = clicks.length ? Math.min(lin(f, ks[0].f, ks[0].f + 10, 0, 1), 1 - lin(f, ks[ks.length - 1].f - 10, ks[ks.length - 1].f, 0, 1)) : 0;
  return { x, y, down, ripples, visible, op };
};
export const CursorLayer: React.FC<{ c: ReturnType<typeof useCursor>; scale?: number }> = ({ c, scale = 1 }) => (
  <>
    {c.ripples.map((r, i) => (r.t > 0 && r.t < 1 ? <div key={i} style={{ position: "absolute", left: r.x - 34 * r.t * scale, top: r.y - 34 * r.t * scale, width: 68 * r.t * scale, height: 68 * r.t * scale, borderRadius: "50%", border: `${3 * scale}px solid rgba(28,176,246,${1 - r.t})`, zIndex: 60 }} /> : null))}
    {c.visible ? <div style={{ position: "absolute", left: c.x, top: c.y, zIndex: 61, opacity: c.op ?? 1 }}><Arrow down={c.down} scale={scale} /></div> : null}
  </>
);
export const Confetti: React.FC<{ at: number; x: number; y: number; n?: number; spread?: number }> = ({ at, x, y, n = 40, spread = 9 }) => {
  const f = useCurrentFrame();
  const t = f - at;
  if (t < 0 || t > 80) return null;
  return (
    <>
      {Array.from({ length: n }, (_, k) => {
        const a = random(`a${k}${at}`) * Math.PI * 2;
        const v = (0.5 + random(`v${k}${at}`)) * spread;
        return <div key={k} style={{ position: "absolute", left: x + Math.cos(a) * v * t, top: y + Math.sin(a) * v * t * 0.8 + t * t * 0.06, width: 12, height: 20, borderRadius: 3, background: [BLUE, GREEN, "#ffc800", "#ff705d", "#ce82ff"][k % 5], transform: `rotate(${t * (6 + k)}deg)`, opacity: lin(f, at + 50, at + 80, 1, 0), zIndex: 70 }} />;
      })}
    </>
  );
};
export const Soft: React.FC<{ tint?: string }> = ({ tint = "#e3f4ff" }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#f6f9fc", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: -300 + Math.sin(f / 80) * 70, top: -420, width: 1300, height: 1300, borderRadius: "50%", background: `radial-gradient(circle, ${tint}, transparent 62%)` }} />
      <div style={{ position: "absolute", right: -380, bottom: -520, width: 1300, height: 1300, borderRadius: "50%", background: "radial-gradient(circle, rgba(88,204,2,0.08), transparent 62%)" }} />
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(20,60,110,0.07) 1.6px, transparent 1.7px)", backgroundSize: "38px 38px", transform: `translateY(${-f * 0.25}px)` }} />
    </AbsoluteFill>
  );
};

// ---------- a real site screen with a camera and a cursor working inside it ----------
type Cam = { at: number; s: number; px: number; py: number };
const Shot: React.FC<{
  states: { at: number; src: string }[];
  clicks?: Click[];
  cam?: Cam[];
  title: string;
  sub: string;
  overlay?: (f: number) => React.ReactNode;
  start?: [number, number];
  exit?: [number, number];
  img?: [number, number];
}> = ({ states, clicks = [], cam = [], title, sub, overlay, start = [1250, 860], exit = [1300, 900], img = [1280, 800] }) => {
  const f = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const src = [...states].reverse().find((s) => f >= s.at)?.src ?? states[0].src;
  const ks = cam.length ? cam : [{ at: 0, s: 1, px: 640, py: 400 }];
  let s = ks[0].s, px = ks[0].px, py = ks[0].py;
  for (let i = 0; i < ks.length - 1; i++) {
    const a = ks[i], b = ks[i + 1];
    if (f >= a.at && f <= b.at) { const t = IO((f - a.at) / (b.at - a.at)); s = a.s + (b.s - a.s) * t; px = a.px + (b.px - a.px) * t; py = a.py + (b.py - a.py) * t; }
    if (f > b.at) { s = b.s; px = b.px; py = b.py; }
  }
  const cur = useCursor(clicks, start, exit);
  const rx = lin(f, 0, D, 7, 2, Easing.linear);
  const ry = lin(f, 0, D, -7, 5, Easing.linear);
  const lift = spring({ frame: f, fps: 60, config: { damping: 16, stiffness: 110 } });
  return (
    <AbsoluteFill>
      <Soft />
      <div style={{ position: "absolute", top: 30, width: "100%" }}>
        <Words text={title} at={4} size={64} color={INK} />
        <Sub text={sub} at={18} size={30} style={{ marginTop: 6 }} />
      </div>
      <div style={{ position: "absolute", left: 192, top: 196, width: 1280, height: 800, perspective: 2400, transform: "scale(1.2)", transformOrigin: "0 0" }}>
        <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `translateY(${(1 - lift) * 140}px) rotateX(${rx}deg) rotateY(${ry}deg)` }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 22, overflow: "hidden", background: "#fff", boxShadow: "0 40px 90px rgba(10,40,90,0.25), 0 0 0 1px rgba(10,40,90,0.06)" }}>
            <div style={{ position: "absolute", left: 0, top: 0, width: 1280, height: 800, transformOrigin: "0 0", transform: `translate(${640 - px * s}px, ${400 - py * s}px) scale(${s})` }}>
              <Img src={src} style={{ position: "absolute", left: 0, top: 0, width: img[0], height: img[1] }} />
              {overlay ? overlay(f) : null}
              <CursorLayer c={cur} scale={1 / s} />
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
const Pick: React.FC<{ x: number; y: number; w: number; h: number; at: number; color?: string; bg?: string }> = ({ x, y, w, h, at, color = BLUE, bg = "rgba(221,244,255,0.55)" }) => {
  const f = useCurrentFrame();
  const t = spring({ frame: f - at, fps: 60, config: { damping: 12, stiffness: 220 } });
  if (f < at) return null;
  return <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 16, border: `2px solid ${color}`, boxShadow: `0 4px 0 ${color}`, background: bg, transform: `scale(${0.96 + 0.04 * t})`, opacity: Math.min(1, t * 1.5) }} />;
};
const Btn: React.FC<{ x: number; y: number; w: number; h: number; at: number; text: string; press?: number }> = ({ x, y, w, h, at, text, press = 0 }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const pr = lin(f, press, press + 4, 0, 1) * (1 - lin(f, press + 6, press + 10, 0, 1));
  return <div style={{ position: "absolute", left: x, top: y + pr * 4, width: w, height: h, borderRadius: 14, background: GREEN, boxShadow: `0 ${4 - pr * 4}px 0 ${GLIP}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 800, fontSize: 17, letterSpacing: "0.06em", color: "#fff" }}>{text}</div>;
};
export const XpChip: React.FC<{ at: number; x: number; y: number; text?: string }> = ({ at, x, y, text = "+10 XP" }) => {
  const f = useCurrentFrame();
  const t = lin(f, at, at + 50, 0, 1, OUT);
  if (f < at || t >= 1) return null;
  const pop = spring({ frame: f - at, fps: 60, config: { damping: 9, stiffness: 200 } });
  return <div style={{ position: "absolute", left: x, top: y - t * 120, padding: "8px 18px", borderRadius: 24, background: "#ffc800", boxShadow: "0 5px 0 #d19a00", fontFamily: FONT, fontWeight: 900, fontSize: 26, color: "#fff", whiteSpace: "nowrap", transform: `scale(${pop})`, opacity: 1 - lin(f, at + 36, at + 50, 0, 1), zIndex: 65 }}>{text}</div>;
};

// ---------- 3D room stills with a slow camera ----------
const Still: React.FC<{ src: string; from: [number, number, number]; to: [number, number, number]; children?: React.ReactNode; dark?: number }> = ({ src, from, to, children, dark = 0 }) => {
  const f = useCurrentFrame();
  const { durationInFrames: D } = useVideoConfig();
  const t = Easing.bezier(0.33, 0, 0.2, 1)(Math.min(1, f / D));
  const s = from[0] + (to[0] - from[0]) * t;
  const x = from[1] + (to[1] - from[1]) * t;
  const y = from[2] + (to[2] - from[2]) * t;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transformOrigin: "0 0", transform: `translate(${960 - x * s}px, ${540 - y * s}px) scale(${s})` }}>
        <Img src={src} style={{ width: 1920, height: 1080 }} />
        {children}
      </div>
      <AbsoluteFill style={{ background: `radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(0,0,0,${0.35 + dark}) 100%)` }} />
    </AbsoluteFill>
  );
};

const RoomOpen: React.FC = () => (
  <Still src={staticFile("room/wide-messy.png")} from={[1.0, 960, 540]} to={[1.32, 900, 520]}>
    <div />
  </Still>
);
const PAINS = ["Тонны книг.", "Сухой язык.", "Ноль практики."];
const DeskMess: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Still src={staticFile("room/desk-messy.png")} from={[1.08, 900, 560]} to={[1.22, 1000, 560]} dark={0.1} />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(8,14,24,0.72) 0%, rgba(8,14,24,0.35) 45%, transparent 70%)" }} />
      <div style={{ position: "absolute", left: 120, top: 330 }}>
        {PAINS.map((p, i) => {
          const at = 14 + i * 44;
          const dim = f > at + 44 ? 0.4 : 1;
          return <div key={p} style={{ opacity: dim, marginBottom: 6 }}><Words text={p} at={at} size={96} color="#fff" align="flex-start" /></div>;
        })}
      </div>
    </AbsoluteFill>
  );
};
// laptop in the mess: cursor clicks «Начать учиться» on the rendered screen
const LapClick: React.FC = () => {
  const f = useCurrentFrame();
  const BX = 1335, BY = 380; // the green button on the laptop screen (1920-wide render)
  const cur = useCursor([{ at: 92, x: BX, y: BY }], [1700, 1150], [1300, 470]);
  const glow = lin(f, 96, 140, 0, 1, IN);
  return (
    <Still src={staticFile("room/lap-messy.png")} from={[1.0, 960, 540]} to={[1.4, 1250, 390]}>
      <CursorLayer c={cur} scale={0.9} />
      <div style={{ position: "absolute", left: BX - 100 - 900 * glow, top: BY - 100 - 700 * glow, width: 200 + 1800 * glow, height: 200 + 1400 * glow, borderRadius: "50%", background: `radial-gradient(circle, rgba(255,255,255,${glow}) 30%, rgba(200,236,255,${glow * 0.6}) 55%, transparent 70%)` }} />
    </Still>
  );
};
// the mess flies into the laptop screen; the clean desk is underneath (same camera)
const SCREEN: [number, number] = [952, 498];
const CELL = 48;
const Cleanup: React.FC = () => {
  const f = useCurrentFrame();
  const pull = lin(f, 0, 50, 2.1, 1.0, OUT);
  const push = lin(f, 60, 220, 0, 0.12, Easing.linear);
  const s = pull + push;
  const cells: React.ReactNode[] = [];
  for (let gy = 0; gy < 1080 / CELL; gy++) for (let gx = 0; gx < 1920 / CELL; gx++) {
    const x = gx * CELL, y = gy * CELL;
    const d = Math.hypot(x + CELL / 2 - SCREEN[0], y + CELL / 2 - SCREEN[1]);
    const start = 34 + (d / 1100) * 46 + random(`c${gx}-${gy}`) * 16;
    const t = lin(f, start, start + 30, 0, 1, IN);
    if (t >= 1) continue;
    const ang = (random(`r${gx}-${gy}`) - 0.5) * 220;
    const arc = Math.sin(t * Math.PI) * 90 * (random(`k${gx}-${gy}`) - 0.5) * 2;
    const nx = -(y + CELL / 2 - SCREEN[1]) / (d || 1), ny = (x + CELL / 2 - SCREEN[0]) / (d || 1);
    const cx = x + (SCREEN[0] - CELL / 2 - x) * t + nx * arc;
    const cy = y + (SCREEN[1] - CELL / 2 - y) * t + ny * arc;
    const lift = lin(f, start - 14, start, 0, 1, OUT) * (1 - t);
    cells.push(
      <div key={`${gx}-${gy}`} style={{ position: "absolute", left: cx, top: cy - lift * 10, width: CELL + 1, height: CELL + 1, backgroundImage: `url(${staticFile("room/clutter.png")})`, backgroundSize: "1920px 1080px", backgroundPosition: `${-x}px ${-y}px`, transform: `scale(${1 - t * 0.94}) rotate(${ang * t}deg)`, filter: t > 0.05 ? `blur(${t * 4}px) brightness(${1 + t * 2.4})` : undefined, borderRadius: t * CELL * 0.5 }} />,
    );
  }
  const glow = lin(f, 40, 70, 0, 1) * (1 - lin(f, 120, 170, 0, 1));
  const wave = lin(f, 96, 190, -260, 2300, Easing.bezier(0.5, 0, 0.6, 1));
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <div style={{ position: "absolute", width: 1920, height: 1080, transformOrigin: `${SCREEN[0]}px ${SCREEN[1] - 60}px`, transform: `scale(${s})` }}>
        <Img src={staticFile("room/desk-bg.png")} style={{ position: "absolute", width: 1920, height: 1080 }} />
        <Img src={staticFile("room/desk-clean.png")} style={{ position: "absolute", width: 1920, height: 1080, WebkitMaskImage: `radial-gradient(circle at ${SCREEN[0]}px ${SCREEN[1]}px, #000 ${wave}px, transparent ${wave + 260}px)`, maskImage: `radial-gradient(circle at ${SCREEN[0]}px ${SCREEN[1]}px, #000 ${wave}px, transparent ${wave + 260}px)` }} />
        <Img src={staticFile("room/clutter-shadow.png")} style={{ position: "absolute", width: 1920, height: 1080, opacity: 1 - lin(f, 40, 110, 0, 1) }} />
        {cells}
        <div style={{ position: "absolute", left: SCREEN[0] - 260, top: SCREEN[1] - 200, width: 520, height: 400, borderRadius: "50%", background: `radial-gradient(circle, rgba(255,255,255,${0.9 * glow}) 10%, rgba(160,220,255,${0.5 * glow}) 40%, transparent 70%)` }} />
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(0,0,0,0.3) 100%)" }} />
      <div style={{ position: "absolute", bottom: 90, width: "100%" }}>
        <Words text="Всё лишнее — в один экран" at={120} size={72} color="#fff" style={{ textShadow: "0 6px 30px rgba(0,0,0,0.45)" }} />
      </div>
    </AbsoluteFill>
  );
};
const Marker: React.FC = () => {
  const f = useCurrentFrame();
  const s = lin(f, 0, 260, 1.03, 1.09, Easing.linear);
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <div style={{ position: "absolute", width: 1920, height: 1080, transform: `scale(${s})`, transformOrigin: "96% 60%" }}>
        <OffthreadVideo src={staticFile("room/marker-write.mp4")} style={{ width: 1920, height: 1080 }} />
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(120% 90% at 50% 45%, transparent 60%, rgba(0,0,0,0.28) 100%)" }} />
      <div style={{ position: "absolute", top: 120, width: "100%" }}>
        <Words text="Учись играя" at={175} size={84} color={INK} />
      </div>
    </AbsoluteFill>
  );
};
const FlyIn: React.FC = () => <Still src={staticFile("room/lap-clean.png")} from={[1.0, 1040, 440]} to={[2.25, 1180, 330]} />;

// ---------- site screens ----------
const Onboard: React.FC = () => (
  <Shot
    states={[{ at: 0, src: HD("on-5") }]}
    clicks={[{ at: 70, x: 870, y: 275 }, { at: 130, x: 1010, y: 755 }]}
    cam={[{ at: 0, s: 1.05, px: 640, py: 400 }, { at: 55, s: 1.6, px: 820, py: 300 }, { at: 100, s: 1.45, px: 880, py: 560 }, { at: 175, s: 1.15, px: 700, py: 450 }]}
    title="Выбери, что изучать"
    sub="10 направлений. Право уже доступно"
    overlay={() => (
      <>
        <Pick x={648} y={231} w={414} h={80} at={72} />
        <Btn x={865} y={724} w={222} h={54} at={74} text="ПРОДОЛЖИТЬ" press={130} />
      </>
    )}
  />
);
const MinutesAsk: React.FC = () => (
  <Shot
    states={[{ at: 0, src: HD("on-4") }]}
    clicks={[{ at: 64, x: 380, y: 455 }]}
    cam={[{ at: 0, s: 1.1, px: 640, py: 420 }, { at: 55, s: 1.75, px: 440, py: 440 }, { at: 140, s: 1.6, px: 470, py: 440 }]}
    title="Сколько у тебя времени?"
    sub="Хватит 15 минут в день"
    overlay={() => <Pick x={217} y={410} w={416} h={81} at={66} />}
  />
);
const ChoiceGame: React.FC = () => (
  <Shot
    states={[{ at: 0, src: HD("c0") }, { at: 72, src: HD("c1") }, { at: 136, src: HD("c2") }]}
    clicks={[{ at: 68, x: 700, y: 522 }, { at: 132, x: 760, y: 758 }]}
    cam={[{ at: 0, s: 1.25, px: 640, py: 370 }, { at: 55, s: 1.55, px: 640, py: 460 }, { at: 115, s: 1.5, px: 680, py: 610 }, { at: 150, s: 1.6, px: 560, py: 700 }, { at: 250, s: 1.35, px: 640, py: 560 }]}
    title="Уроки — это игры"
    sub="Ответил, проверил, получил XP"
    exit={[1100, 900]}
    overlay={() => (
      <>
        <Confetti at={140} x={430} y={760} />
        <XpChip at={146} x={470} y={700} />
      </>
    )}
  />
);
const PL = 467, PR = 761, R1 = 294, R2 = 376, R3 = 458;
const PairsGame: React.FC = () => (
  <Shot
    states={[{ at: 0, src: HD("m0") }, { at: 44, src: HD("m1") }, { at: 72, src: HD("m2") }, { at: 100, src: HD("m3") }, { at: 128, src: HD("m4") }, { at: 156, src: HD("m5") }, { at: 184, src: HD("m6") }, { at: 200, src: HD("m-ok") }]}
    clicks={[{ at: 40, x: PL + 30, y: R2 }, { at: 68, x: PR + 30, y: R1 }, { at: 96, x: PL + 30, y: R3 }, { at: 124, x: PR + 30, y: R3 }, { at: 152, x: PL + 30, y: R1 }, { at: 180, x: PR + 30, y: R2 }]}
    cam={[{ at: 0, s: 1.7, px: 615, py: 330 }, { at: 190, s: 1.75, px: 615, py: 375 }, { at: 215, s: 1.45, px: 600, py: 600 }, { at: 260, s: 1.35, px: 640, py: 560 }]}
    title="Соединяй пары"
    sub="11 видов игр закрепляют каждую тему"
    exit={[1150, 900]}
    overlay={() => (
      <>
        <Confetti at={204} x={520} y={740} />
        <XpChip at={208} x={560} y={690} />
      </>
    )}
  />
);
const LawsSearch: React.FC = () => {
  const Q = "штраф за парковку";
  return (
    <Shot
      states={[{ at: 0, src: HD("laws-focus") }, { at: 150, src: HD("laws-search") }]}
      clicks={[{ at: 46, x: 700, y: 51 }]}
      cam={[{ at: 0, s: 1.1, px: 640, py: 400 }, { at: 45, s: 2.1, px: 700, py: 190 }, { at: 140, s: 2.1, px: 700, py: 190 }, { at: 190, s: 1.7, px: 720, py: 260 }, { at: 260, s: 1.5, px: 700, py: 300 }]}
      title="Любой закон — за секунды"
      sub="Поиск по всей базе законов Узбекистана"
      start={[1000, 700]}
      exit={[1000, 600]}
      overlay={(f) => {
        if (f < 52 || f >= 150) return null;
        const n = Math.min(Q.length, Math.floor((f - 56) / 4));
        return (
          <div style={{ position: "absolute", left: 570, top: 39, width: 240, height: 24, background: "#fff", fontFamily: "Nunito, sans-serif", fontSize: 13.5, color: "#333", display: "flex", alignItems: "center" }}>
            {Q.slice(0, Math.max(0, n))}
            <span style={{ width: 1.5, height: 16, background: "#333", marginLeft: 1, opacity: Math.floor(f / 15) % 2 ? 1 : 0 }} />
          </div>
        );
      }}
    />
  );
};
const NOTE = "Повторить перед экзаменом";
const Reader: React.FC = () => (
  <Shot
    states={[{ at: 0, src: HD("l-reader") }, { at: 92, src: HD("l-select") }, { at: 138, src: HD("l-marked") }, { at: 176, src: HD("l-note") }, { at: 272, src: HD("l-note2") }]}
    clicks={[{ at: 132, x: 526, y: 274 }, { at: 172, x: 620, y: 360 }, { at: 268, x: 726, y: 532 }]}
    cam={[{ at: 0, s: 1.3, px: 640, py: 400 }, { at: 45, s: 2.0, px: 700, py: 330 }, { at: 170, s: 2.0, px: 680, py: 330 }, { at: 200, s: 1.75, px: 640, py: 450 }, { at: 300, s: 1.55, px: 640, py: 430 }]}
    title="Выделяй и пиши заметки"
    sub="Заметки видишь только ты"
    start={[380, 380]}
    exit={[900, 700]}
    overlay={(f) => {
      const sel = lin(f, 40, 88, 0, 1, Easing.linear);
      const n = Math.max(0, Math.min(NOTE.length, Math.floor((f - 196) / 2.6)));
      return (
        <>
          {f >= 38 && f < 92 ? (
            <>
              <div style={{ position: "absolute", left: 474 + 463 * sel, top: 352, zIndex: 50 }}><Arrow down={0} scale={1 / 1.45} /></div>
              <div style={{ position: "absolute", left: 474, top: 352, width: 463 * sel, height: 18, background: "rgba(28,176,246,0.25)" }} />
            </>
          ) : null}
          {f >= 190 && f < 268 ? (
            <div style={{ position: "absolute", left: 480, top: 345, width: 320, height: 60, background: "#fff", fontFamily: "Nunito, sans-serif", fontSize: 14, color: "#333", padding: "6px 6px" }}>
              {NOTE.slice(0, n)}<span style={{ display: "inline-block", width: 1.5, height: 15, background: "#333", verticalAlign: "middle", opacity: Math.floor(f / 15) % 2 ? 1 : 0 }} />
            </div>
          ) : null}
          {f >= 268 ? <XpChip at={272} x={640} y={470} text="Сохранено" /> : null}
        </>
      );
    }}
  />
);
const Forum: React.FC = () => (
  <Shot
    states={[{ at: 0, src: HD("forum") }]}
    clicks={[{ at: 140, x: 700, y: 552 }]}
    cam={[{ at: 0, s: 1.2, px: 640, py: 380 }, { at: 120, s: 1.7, px: 760, py: 470 }, { at: 220, s: 1.6, px: 760, py: 540 }]}
    title="Не знаешь, у кого спросить?"
    sub="Спроси на форуме — тебе ответят"
    start={[1100, 800]}
    exit={[1000, 900]}
  />
);
const Duels: React.FC = () => (
  <Shot
    states={[{ at: 0, src: HD("duels") }]}
    clicks={[{ at: 96, x: 800, y: 581 }]}
    cam={[{ at: 0, s: 1.2, px: 680, py: 400 }, { at: 80, s: 1.55, px: 790, py: 480 }, { at: 120, s: 2.0, px: 764, py: 330 }, { at: 230, s: 2.1, px: 764, py: 320 }]}
    title="Дуэли 1 на 1"
    sub="Один соперник, один таймер, семь вопросов"
    start={[1100, 800]}
    exit={[1100, 800]}
    overlay={(f) => {
      const t = spring({ frame: f - 108, fps: 60, config: { damping: 9, stiffness: 180 } });
      if (f < 108) return null;
      return (
        <>
          <div style={{ position: "absolute", left: 764 - 140, top: 256 - 120, width: 280, height: 240, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 900, fontSize: 150, color: "#ffc800", textShadow: lip("#d19a00", 7, 0.3), transform: `scale(${(2.2 - 1.2 * t) * Math.min(1, t * 3)}) rotate(${(1 - t) * -30}deg)`, opacity: 1 - lin(f, 170, 200, 0, 1), zIndex: 40 }}>VS</div>
          <Confetti at={112} x={764} y={256} n={34} spread={5} />
        </>
      );
    }}
  />
);

// ---------- text-only beats ----------
const TypeQ: React.FC = () => {
  const f = useCurrentFrame();
  const Q = "Не знаешь, где найти закон?";
  const n = Math.max(0, Math.min(Q.length, Math.floor((f - 10) / 2.2)));
  const bar = spring({ frame: f, fps: 60, config: { damping: 14, stiffness: 140 } });
  return (
    <AbsoluteFill>
      <Soft />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 1500, height: 170, borderRadius: 85, background: "#fff", boxShadow: `0 10px 0 #d7e4ee, 0 40px 80px rgba(10,40,90,0.18)`, display: "flex", alignItems: "center", gap: 36, padding: "0 60px", transform: `scale(${0.8 + 0.2 * bar})`, opacity: bar }}>
          <svg width="74" height="74" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.6" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 72, color: INK, whiteSpace: "nowrap" }}>
            {Q.slice(0, n)}
            <span style={{ display: "inline-block", width: 6, height: 72, background: BLUE, marginLeft: 6, verticalAlign: "middle", opacity: Math.floor(f / 16) % 2 ? 1 : 0 }} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
const Loader: React.FC = () => {
  const f = useCurrentFrame();
  const p = lin(f, 6, 64, 0, 1, Easing.bezier(0.4, 0, 0.2, 1));
  return (
    <AbsoluteFill style={{ background: "#fff", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 40 }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 120, color: BLUE, textShadow: lip(LIP, 7), transform: `scale(${1 + Math.sin(f / 6) * 0.02})` }}>veoskill</div>
      <div style={{ width: 620, height: 22, borderRadius: 11, background: "#e5e5e5", overflow: "hidden" }}>
        <div style={{ width: `${p * 100}%`, height: "100%", borderRadius: 11, background: GREEN, boxShadow: "inset 0 -5px 0 rgba(0,0,0,0.12)" }} />
      </div>
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 32, color: "#8a98a6" }}>Загружаем урок…</div>
    </AbsoluteFill>
  );
};
const WALL = ["cabinet", "laws", "article", "forum", "duels", "stats", "c2", "m-ok", "l-note2", "laws-search", "on-5", "materials"];
const Wall: React.FC = () => {
  const f = useCurrentFrame();
  const s = lin(f, 0, 200, 1.5, 0.82, Easing.bezier(0.3, 0, 0.2, 1));
  return (
    <AbsoluteFill style={{ background: "#eaf4fb", overflow: "hidden", perspective: 2200 }}>
      <div style={{ position: "absolute", left: 960, top: 540, transform: `translate(-50%,-50%) rotateX(${lin(f, 0, 200, 30, 14)}deg) rotateZ(${lin(f, 0, 200, -8, -4)}deg) scale(${s})`, display: "grid", gridTemplateColumns: "repeat(4, 560px)", gap: 34 }}>
        {WALL.map((n, i) => {
          const pop = spring({ frame: f - (i % 4) * 3 - Math.floor(i / 4) * 5, fps: 60, config: { damping: 13, stiffness: 150 } });
          return <Img key={n} src={HD(n)} style={{ width: 560, height: 350, borderRadius: 16, boxShadow: "0 20px 40px rgba(10,40,90,0.22)", transform: `translateZ(${(1 - pop) * -400}px)`, opacity: pop }} />;
        })}
      </div>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: `rgba(255,255,255,${lin(f, 70, 110, 0, 0.55)})` }}>
        <Words text="Всё — в одном месте" at={80} size={110} color={BLUE} lipC={LIP} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
const RoomEnd: React.FC = () => (
  <AbsoluteFill>
    <Still src={staticFile("room/wide-clean.png")} from={[1.25, 900, 520]} to={[1.0, 960, 540]} />
    <div style={{ position: "absolute", top: 110, width: "100%" }}>
      <Words text="Учись каждый день." at={20} size={86} color="#fff" style={{ textShadow: "0 6px 30px rgba(0,0,0,0.4)" }} />
      <Words text="По чуть-чуть." at={44} size={86} color="#fff" style={{ textShadow: "0 6px 30px rgba(0,0,0,0.4)", marginTop: 6 }} />
    </div>
  </AbsoluteFill>
);
export const End: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const btn = spring({ frame: f - 70, fps, config: { damping: 12, stiffness: 160 } });
  const cur = useCursor([{ at: 140, x: 1010, y: 742 }], [1500, 1000], [1200, 1000]);
  const pr = lin(f, 140, 144, 0, 1) * (1 - lin(f, 146, 150, 0, 1));
  return (
    <AbsoluteFill>
      <Soft />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div style={{ display: "flex", fontFamily: FONT, fontWeight: 900, fontSize: 230, color: BLUE, lineHeight: 1, marginTop: -60 }}>
          {"veoskill".split("").map((ch, i) => {
            const s = spring({ frame: f - 6 - i * 4, fps, config: { damping: 10, stiffness: 180 } });
            return <span key={i} style={{ display: "inline-block", textShadow: lip(LIP, 12), transform: `translateY(${(1 - s) * -300}px) rotate(${(1 - s) * (i % 2 ? 20 : -20)}deg)`, opacity: Math.min(1, s * 2) }}>{ch}</span>;
          })}
        </div>
        <div style={{ marginTop: 20 }}><Words text="Учись играя. Каждый день." at={46} size={58} color={INK} /></div>
        <div style={{ marginTop: 56, padding: "26px 80px", borderRadius: 26, background: GREEN, boxShadow: `0 ${10 - pr * 8}px 0 ${GLIP}`, fontFamily: FONT, fontWeight: 900, fontSize: 56, color: "#fff", letterSpacing: "0.02em", transform: `scale(${btn}) translateY(${pr * 8}px)` }}>veoskill.uz</div>
      </AbsoluteFill>
      <Confetti at={146} x={960} y={740} n={70} spread={12} />
      <CursorLayer c={cur} />
    </AbsoluteFill>
  );
};

// ---------- timeline ----------
type Tr = "up" | "zoom" | "screen" | "cut" | "left";
const SCENES: { C: React.FC; d: number; tr: Tr; pre?: number }[] = [
  { C: RoomOpen, d: 150, tr: "cut" },
  { C: DeskMess, d: 190, tr: "zoom" },
  { C: LapClick, d: 150, tr: "zoom" },
  { C: Cleanup, d: 230, tr: "cut" },
  { C: Marker, d: 270, tr: "zoom" },
  { C: FlyIn, d: 120, tr: "zoom" },
  { C: Onboard, d: 180, tr: "screen" },
  { C: Directions, d: 300, tr: "up", pre: 14 },
  { C: MinutesAsk, d: 140, tr: "up" },
  { C: Minutes, d: 260, tr: "left", pre: 14 },
  { C: PathBeat, d: 300, tr: "up" },
  { C: Loader, d: 80, tr: "zoom" },
  { C: ChoiceGame, d: 250, tr: "zoom" },
  { C: PairsGame, d: 260, tr: "left" },
  { C: GameRing, d: 250, tr: "up", pre: 14 },
  { C: Counters, d: 200, tr: "up", pre: 14 },
  { C: TypeQ, d: 120, tr: "up" },
  { C: LawsSearch, d: 260, tr: "zoom" },
  { C: LawsWall, d: 230, tr: "up", pre: 14 },
  { C: LangCube, d: 190, tr: "up", pre: 14 },
  { C: Reader, d: 310, tr: "left" },
  { C: SaveRemember, d: 160, tr: "up", pre: 14 },
  { C: MistakeLoop, d: 240, tr: "up", pre: 14 },
  { C: Forum, d: 220, tr: "up" },
  { C: Duels, d: 230, tr: "left" },
  { C: LeagueClimb, d: 280, tr: "up", pre: 14 },
  { C: Profile, d: 250, tr: "up", pre: 14 },
  { C: Wall, d: 200, tr: "up" },
  { C: RoomEnd, d: 170, tr: "zoom" },
  { C: End, d: 260, tr: "up" },
];
const T = 18;
const starts: number[] = [];
let acc = 0;
SCENES.forEach((s, i) => { starts.push(acc); acc += s.d - (i < SCENES.length - 1 ? T : 0); });
export const MASTER_FRAMES = acc;

const Scene: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const sc = SCENES[i];
  const next = SCENES[i + 1];
  const C = sc.C;
  // entering (this scene's own transition)
  const e = sc.tr === "cut" || i === 0 ? 1 : lin(f, 0, T, 0, 1, OUT);
  let enter: React.CSSProperties = {};
  if (e < 1) {
    if (sc.tr === "up") enter = { transform: `translateY(${(1 - e) * 1080}px) scale(${0.9 + 0.1 * e})`, borderRadius: (1 - e) * 60, overflow: "hidden" };
    if (sc.tr === "left") enter = { transform: `translateX(${(1 - e) * 1920}px) rotate(${(1 - e) * 4}deg)`, borderRadius: (1 - e) * 60, overflow: "hidden" };
    if (sc.tr === "zoom") enter = { transform: `scale(${1 + (1 - e) * 0.6})`, filter: `blur(${(1 - e) * 18}px)`, opacity: Math.min(1, e * 3) };
    if (sc.tr === "screen") enter = { transform: `translate(${(1 - e) * 120}px, ${(1 - e) * -180}px) scale(${0.45 + 0.55 * e})`, borderRadius: (1 - e) * 40, overflow: "hidden" };
  }
  // leaving (driven by the next scene's transition)
  const lt = next ? lin(f, sc.d - T, sc.d, 0, 1, IN) : 0;
  let leave: React.CSSProperties = {};
  if (lt > 0 && next) {
    if (next.tr === "up") leave = { transform: `translateY(${-lt * 220}px) scale(${1 - lt * 0.08})`, filter: `blur(${lt * 8}px) brightness(${1 - lt * 0.25})` };
    if (next.tr === "left") leave = { transform: `translateX(${-lt * 500}px) scale(${1 - lt * 0.06})`, filter: `blur(${lt * 8}px) brightness(${1 - lt * 0.25})` };
    if (next.tr === "zoom" || next.tr === "screen") leave = { transform: `scale(${1 + lt * 0.5})`, filter: `blur(${lt * 14}px)` };
  }
  return (
    <AbsoluteFill style={{ ...leave }}>
      <AbsoluteFill style={{ ...enter }}>
        <Sequence from={-(sc.pre ?? 0)}>
          <C />
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Master: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: "#0b1220" }}>
      {SCENES.map((s, i) => (
        <Sequence key={i} from={starts[i]} durationInFrames={s.d}>
          <Scene i={i} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
