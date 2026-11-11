import React from "react";
import { AbsoluteFill, Easing, Freeze, Img, Sequence, interpolate, interpolateColors, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Directions, GameRing, Counters } from "./Bits";
import { LawsWall, Minutes, MistakeLoop, SaveRemember, LeagueClimb } from "./Bits2";
import { PathBeat, Stone } from "./PathBeat";
import { Arrow, useCursor, CursorLayer, Confetti, Soft, useFonts, Click } from "./Master";
import { RichBg, Roll } from "./Bg";

// veoskill promo v4 — the camera lives inside the interface (Candy-Crush style). 60 fps, 1920×1080, silent.
const FONT = "NunitoC, Nunito, sans-serif";
const BLUE = "#1cb0f6";
const LIP = "#0f6fbf";
const GREEN = "#58cc02";
const GLIP = "#58a700";
const INK = "#1f2a37";
const CHAR = "#4b4b4b";
const SWAN = "#e5e5e5";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const IO = Easing.bezier(0.65, 0, 0.35, 1);
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const lin = (f: number, a: number, b: number, x: number, y: number, e = IO) => interpolate(f, [a, b], [x, y], { easing: e, ...clamp });
const lip = (c: string, d: number, s = 0.25) => [...Array.from({ length: d }, (_, i) => `0 ${i + 1}px 0 ${c}`), `0 ${d + 10}px 26px rgba(10,40,90,${s})`].join(",");

// ---------- camera inside a 1920×1080 UI plane ----------
type Key = { at: number; fx: number; fy: number; rx?: number; ry?: number; rz?: number; z?: number };
const camAt = (f: number, keys: Key[]) => {
  const k = (i: number) => ({ rx: 0, ry: 0, rz: 0, z: 0, ...keys[i] });
  let c = k(0);
  for (let i = 0; i < keys.length - 1; i++) {
    const a = k(i), b = k(i + 1);
    if (f >= a.at && f <= b.at) {
      const t = IO((f - a.at) / Math.max(1, b.at - a.at));
      c = { at: f, fx: a.fx + (b.fx - a.fx) * t, fy: a.fy + (b.fy - a.fy) * t, rx: a.rx + (b.rx - a.rx) * t, ry: a.ry + (b.ry - a.ry) * t, rz: a.rz + (b.rz - a.rz) * t, z: a.z + (b.z - a.z) * t };
    }
    if (f > b.at) c = b;
  }
  return c;
};
const World: React.FC<{ keys: Key[]; children: React.ReactNode; bg?: React.ReactNode; dof?: number; follow?: { x: number; y: number; k: number }; zb?: number }> = ({ keys, children, bg, dof = 7, follow, zb = 260 }) => {
  const f = useCurrentFrame();
  const c = camAt(f, keys);
  const dofPx = Math.min(dof, Math.abs(c.rx) * 0.3);
  const fx = follow ? c.fx + (follow.x - c.fx) * follow.k : c.fx;
  const fy = follow ? c.fy + (follow.y - c.fy) * follow.k : c.fy;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {bg ?? <Soft />}
      <AbsoluteFill style={{ perspective: 1500 }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transformStyle: "preserve-3d", transformOrigin: `${fx}px ${fy}px`, transform: `translate(${960 - fx}px, ${540 - fy}px) translateZ(${c.z + zb}px) rotateX(${c.rx}deg) rotateY(${c.ry}deg) rotateZ(${c.rz}deg)` }}>
          {children}
        </div>
      </AbsoluteFill>
      {dofPx > 0.5 ? (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 360, backdropFilter: `blur(${dofPx}px)`, WebkitMaskImage: "linear-gradient(#000, transparent)", maskImage: "linear-gradient(#000, transparent)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 320, backdropFilter: `blur(${dofPx}px)`, WebkitMaskImage: "linear-gradient(transparent, #000)", maskImage: "linear-gradient(transparent, #000)" }} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};
/** Big screen-space caption over the action (one thought per shot). */
const Caption: React.FC<{ text: string; at: number; out?: number; top?: number; size?: number; color?: string; accent?: string; accentWord?: string; dark?: boolean }> = ({ text, at, out, top = 64, size = 76, color = INK, accent, accentWord, dark }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < at) return null;
  const o = out ? 1 - lin(f, out, out + 12, 0, 1) : 1;
  const lift = out ? lin(f, out, out + 12, 0, -40) : 0;
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center", flexWrap: "wrap", columnGap: size * 0.26, perspective: 900, fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.1, opacity: o, transform: `translateY(${lift}px)`, zIndex: 80, padding: "0 120px" }}>
      {text.split(" ").map((w, i) => {
        const s = spring({ frame: f - at - i * 4, fps, config: { damping: 14, stiffness: 170, mass: 0.7 } });
        const isA = accentWord && w.replace(/[.,?!—]/g, "") === accentWord;
        return <span key={i} style={{ display: "inline-block", color: isA ? accent : color, textShadow: dark ? "0 6px 30px rgba(0,0,0,0.5)" : "0 0 30px rgba(255,255,255,0.95), 0 0 12px rgba(255,255,255,0.9)", transform: `translateY(${(1 - s) * size * 0.7}px) rotateX(${(1 - s) * -70}deg)`, opacity: Math.min(1, s * 1.6), filter: s < 0.9 ? `blur(${(1 - s) * 8}px)` : undefined, whiteSpace: "nowrap" }}>{w}</span>;
      })}
    </div>
  );
};
/** Real typing: characters arrive one by one with a key-press pop and uneven rhythm; caret blinks when idle. */
const Typer: React.FC<{ text: string; at: number; speed?: number; size: number; color?: string; weight?: number; caretColor?: string; style?: React.CSSProperties }> = ({ text, at, speed = 3.2, size, color = CHAR, weight = 600, caretColor = BLUE, style }) => {
  const f = useCurrentFrame();
  const times: number[] = [];
  let t = at;
  for (let i = 0; i < text.length; i++) { times.push(t); t += speed * (0.55 + random(`k${text}${i}`) * 0.9) + (text[i] === " " ? speed * 0.8 : 0); }
  const typing = f >= at && f < t + 4;
  const caretOn = typing || Math.floor(f / 16) % 2 === 0;
  return (
    <span style={{ fontFamily: FONT, fontSize: size, fontWeight: weight, color, whiteSpace: "pre-wrap", ...style }}>
      {text.split("").map((ch, i) => {
        if (f < times[i]) return null;
        const p = Math.min(1, (f - times[i]) / 5);
        return <span key={i} style={{ display: "inline-block", whiteSpace: "pre", transform: `translateY(${(1 - p) * size * 0.18}px) scale(${0.7 + 0.3 * OUT(p)})`, opacity: Math.min(1, p * 2) }}>{ch}</span>;
      })}
      {f >= at - 20 ? <span style={{ display: "inline-block", width: Math.max(3, size * 0.07), height: size * 1.05, background: caretColor, marginLeft: 2, verticalAlign: "text-bottom", opacity: caretOn ? 1 : 0 }} /> : null}
    </span>
  );
};
const typedEnd = (text: string, at: number, speed = 3.2) => {
  let t = at;
  for (let i = 0; i < text.length; i++) t += speed * (0.55 + random(`k${text}${i}`) * 0.9) + (text[i] === " " ? speed * 0.8 : 0);
  return t;
};
const press = (f: number, at: number) => lin(f, at, at + 4, 0, 1) * (1 - lin(f, at + 6, at + 12, 0, 1));
const Light: React.FC = () => <Soft />;

// ================= 1. HOOK — our real screens fly at the viewer in 3D, with the pain points, then the logo =================
const FLYS = ["cabinet", "laws", "c2", "article", "m-ok", "stats", "on-5", "laws-search", "l-note2", "forum", "c1", "materials", "on-4", "m3", "l-marked", "home"];
const Hook: React.FC<{ lines?: [string, string, string]; tag?: string }> = ({ lines = ["Устал зубрить кодексы?", "Сухие лекции без практики?", "Есть способ проще"], tag = "Учись играя" }) => {
  const f = useCurrentFrame();
  const LOGO = 270;
  // the stream speeds up into the logo, then the screens drift away
  const dist = f * 26 + (f > LOGO - 30 ? (f - (LOGO - 30)) ** 2 * 1.6 : 0);
  const after = lin(f, LOGO, LOGO + 24, 1, 0.1);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <RichBg />
      <AbsoluteFill style={{ perspective: 1100 }}>
        {FLYS.map((src, i) => {
          const lane = i % 4;
          const side = (lane - 1.5) * 2;
          const x = side * 470 + ((i * 137) % 160) - 80;
          const y = ((i * 211) % 3 - 1) * 330 + (lane % 2 ? 60 : -60);
          const zz = ((((i * 400 + dist) % 6400) + 6400) % 6400) - 6000;
          const fade = interpolate(zz, [-6000, -4600, 300, 800], [0, 1, 1, 0], clamp);
          return (
            <div key={src + i} style={{ position: "absolute", left: 960 - 330 + x, top: 540 - 206 + y, width: 660, height: 412, borderRadius: 18, overflow: "hidden", transform: `translateZ(${zz}px) rotateY(${-side * 7}deg) rotateZ(${(i % 3 - 1) * 3}deg)`, opacity: fade * after, boxShadow: "0 30px 70px rgba(10,40,90,0.25)", filter: zz > 200 ? `blur(${Math.min(10, (zz - 200) / 50)}px)` : undefined }}>
              <Img src={staticFile(`hack/hd/${src}.png`)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
            </div>
          );
        })}
      </AbsoluteFill>
      {/* a soft light pool keeps the words readable over the stream */}
      <AbsoluteFill style={{ background: "radial-gradient(46% 32% at 50% 50%, rgba(246,250,254,0.94), rgba(246,250,254,0) 100%)" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", width: "100%", top: 480 }}><Roll f={f} text={lines[0]} at={14} out={92} size={104} color={INK} /></div>
        <div style={{ position: "absolute", width: "100%", top: 480 }}><Roll f={f} text={lines[1]} at={102} out={176} size={104} color={INK} /></div>
        <div style={{ position: "absolute", width: "100%", top: 480 }}><Roll f={f} text={lines[2]} at={186} out={LOGO - 16} size={104} color={INK} /></div>
        {f >= LOGO - 8 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: -20 }}>
            <Roll f={f} text="veoskill" at={LOGO - 8} size={250} color={BLUE} lipC={LIP} stagger={0} />
            <div style={{ marginTop: 6 }}><Roll f={f} text={tag} at={LOGO + 14} size={60} color={GREEN} /></div>
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Problem → solution card shown before each feature. The first line rolls away like a counter, the answer rolls in. */
const TitleCard: React.FC<{ q: string; a: string; color?: string; lipC?: string }> = ({ q, a, color = BLUE, lipC = LIP }) => {
  const f = useCurrentFrame();
  const drift = lin(f, 0, 150, 1.0, 1.04, Easing.linear);
  return (
    <AbsoluteFill>
      <RichBg seed={q.length} />
      <AbsoluteFill style={{ transform: `scale(${drift})` }}>
        <div style={{ position: "absolute", width: "100%", top: 470 }}>
          <Roll f={f} text={q} at={6} out={62} size={96} color={INK} />
        </div>
        <div style={{ position: "absolute", width: "100%", top: 470 }}>
          <Roll f={f} text={a} at={70} size={104} color={color} lipC={lipC} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ================= 2. PICK A DIRECTION (inside the onboarding) =================
const DIRS: [string, string][] = [["ai", "Искусственный интеллект"], ["legal", "Юриспруденция"], ["economics", "Экономика"], ["medical", "Медицина"], ["dtm", "Подготовка к ДТМ"], ["it", "Программирование"], ["english", "Английский язык"], ["math", "Математика"], ["history", "История Узбекистана"], ["biology", "Биология"]];
const CW = 340, CH = 150, GAP = 24, X0 = 62, Y0 = 360;
const cardPos = (i: number) => ({ x: X0 + (i % 5) * (CW + GAP), y: Y0 + Math.floor(i / 5) * (CH + GAP) });
const PickDirection: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = cardPos(1);
  const CLICK = 150;
  const cur = useCursor([{ at: CLICK, x: L.x + 270, y: L.y + 100 }], [1250, 760], [900, 900]);
  const keys: Key[] = [
    { at: 0, fx: 1450, fy: 470, rx: 50, ry: -12, rz: 6, z: 120 },
    { at: 130, fx: 600, fy: 450, rx: 38, ry: 6, rz: 2, z: 300 },
    { at: 205, fx: 600, fy: 450, rx: 18, ry: 0, rz: 0, z: 200 },
    { at: 300, fx: 960, fy: 470, rx: 0, ry: 0, rz: 0, z: -180 },
  ];
  const on = f >= CLICK + 2;
  const pr = press(f, CLICK);
  const glow = spring({ frame: f - CLICK - 2, fps, config: { damping: 12, stiffness: 160 } });
  return (
    <AbsoluteFill>
      <World keys={keys} bg={<RichBg />}>
        <div style={{ position: "absolute", left: 230, top: 200, display: "flex", alignItems: "center", gap: 18 }}>
          <Img src={staticFile("v4/owl-read.png")} style={{ width: 110 }} />
          <div style={{ padding: "16px 26px", borderRadius: 18, border: `2px solid ${SWAN}`, borderBottomWidth: 4, background: "#fff", fontFamily: FONT, fontWeight: 800, fontSize: 30, color: CHAR }}>Что хотите изучать?</div>
        </div>
        {DIRS.map(([id, name], i) => {
          const p = cardPos(i);
          const legal = i === 1;
          const pop = spring({ frame: f - 4 - i * 3, fps, config: { damping: 15, stiffness: 140 } });
          const sel = legal && on;
          return (
            <div key={id} style={{ position: "absolute", left: p.x, top: p.y, width: CW, height: CH, borderRadius: 20, background: sel ? interpolateColors(glow, [0, 1], ["#ffffff", "#ddf4ff"]) : "#fff", border: `2px solid ${sel ? BLUE : SWAN}`, boxShadow: `0 ${legal ? 6 - pr * 5 : 6}px 0 ${sel ? "#84d8ff" : SWAN}, 0 20px 30px rgba(10,40,90,${sel ? 0.2 : 0.1})`, display: "flex", alignItems: "center", gap: 18, padding: "0 22px", boxSizing: "border-box", transform: `translateY(${(1 - pop) * 60 + pr * 5}px) scale(${sel ? 1 + glow * 0.03 : 1})`, opacity: pop }}>
              <Img src={staticFile(`dom/${id}.webp`)} style={{ width: 68, height: 68, objectFit: "contain" }} />
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 25, color: CHAR, lineHeight: 1.15 }}>{name}</div>
            </div>
          );
        })}
        <CursorLayer c={cur} />
      </World>
    </AbsoluteFill>
  );
};

// ================= 3. LESSON LOADING — the clicked path stone grows into the loader (no XP) =================
const LessonLoad: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  // match the stone where it was clicked on the path (screen 895,705 at ×1.7), then grow to the centre
  const g = lin(f, 0, 42, 0, 1, Easing.bezier(0.45, 0, 0.2, 1));
  const S = 1.7 + (4.0 - 1.7) * g;
  const CX = 895 + (960 - 895) * g, CY = 705 + (500 - 705) * g;
  const open = spring({ frame: f - 46, fps, config: { damping: 11, stiffness: 120 } });
  const prog = interpolate(f, [52, 90, 118, 156, 182], [0, 0.32, 0.45, 0.86, 1], { ...clamp, easing: Easing.bezier(0.4, 0, 0.3, 1) });
  const dots = ".".repeat(Math.floor(f / 12) % 4);
  const zoom = lin(f, 186, 214, 0, 1, Easing.bezier(0.6, 0, 0.9, 0.5));
  const ui = lin(f, 30, 50, 0, 1) * (1 - zoom);
  return (
    <AbsoluteFill style={{ background: "#fff", overflow: "hidden" }}>
      {/* the path we came from, frozen and falling out of focus */}
      <AbsoluteFill style={{ filter: `blur(${lin(f, 0, 34, 0, 18)}px)`, opacity: 1 - lin(f, 8, 40, 0, 1) }}>
        <Freeze frame={171}><PathBeat /></Freeze>
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: lin(f, 8, 40, 0, 1) }}><RichBg /></AbsoluteFill>
      <AbsoluteFill style={{ perspective: 1400, transform: `scale(${1 + zoom * 3})`, transformOrigin: "960px 260px", filter: zoom > 0.05 ? `blur(${zoom * 10}px)` : undefined }}>
        {[0, 1, 2, 3, 4].map((k) => {
          const s = spring({ frame: f - 60 - k * 9, fps, config: { damping: 13, stiffness: 100 } });
          const ang = (k - 2) * 16;
          const x = CX + Math.sin((ang * Math.PI) / 180) * 420 * s;
          const y = CY - 60 - Math.cos((ang * Math.PI) / 180) * 300 * s;
          const ic = ["M6 4h9l3 3v13H6zM9 10h6M9 14h6", "M12 3l9 4-9 4-9-4zM3 12l9 4 9-4", "M4 6h16M4 12h10M4 18h13", "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 3", "M5 12l5 5L20 7"][k];
          return (
            <div key={k} style={{ position: "absolute", left: x - 110, top: y - 75, width: 220, height: 150, borderRadius: 20, background: "#fff", border: `2px solid ${SWAN}`, boxShadow: `0 6px 0 ${SWAN}, 0 24px 40px rgba(10,40,90,0.15)`, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${ang * s}deg) scale(${0.3 + 0.7 * s})`, opacity: s > 0.02 ? 1 : 0 }}>
              <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke={k === 2 ? GREEN : BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={ic} /></svg>
            </div>
          );
        })}
        <div style={{ position: "absolute", left: CX - 48 * S, top: CY - 50 * S, width: 96, height: 101, transform: `scale(${S})`, transformOrigin: "0 0" }}>
          <div style={{ position: "relative", width: 96, height: 101 }}>
            <Stone live={1} crowns={0} ring={false} icon="star" press={0} pop={1} />
            <div style={{ position: "absolute", left: 13, top: 34, width: 70, height: 49, borderRadius: 9.1, background: `linear-gradient(180deg, color-mix(in srgb, #fff 20%, ${GREEN}) 0%, ${GREEN} 35%)`, transformOrigin: "50% 100%", transform: `perspective(300px) rotateX(${-open * 62}deg)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", opacity: open > 0.01 ? 1 : 0 }}>
              <svg viewBox="0 0 24 24" width={34} height={34} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg>
            </div>
          </div>
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 960 - 330, top: 900, width: 660, opacity: ui }}>
        <div style={{ height: 22, borderRadius: 11, background: SWAN, overflow: "hidden" }}>
          <div style={{ width: `${prog * 100}%`, height: "100%", borderRadius: 11, background: GREEN, boxShadow: "inset 0 -5px 0 rgba(0,0,0,0.12)" }} />
        </div>
        <div style={{ marginTop: 18, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 34, color: "#8a98a6" }}>Загружаем урок<span style={{ display: "inline-block", width: 40, textAlign: "left" }}>{dots}</span></div>
      </div>
    </AbsoluteFill>
  );
};

// ================= 4. THEORY (a real lesson card, read with the camera) =================
const Theory: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const keys: Key[] = [
    { at: 0, fx: 900, fy: 340, rx: 28, ry: -10, rz: -2, z: 380 },
    { at: 110, fx: 920, fy: 460, rx: 22, ry: -4, rz: 0, z: 340 },
    { at: 180, fx: 940, fy: 620, rx: 12, ry: 2, rz: 0, z: 160 },
    { at: 250, fx: 960, fy: 545, rx: 0, ry: 0, rz: 0, z: -300 },
  ];
  const line = (i: number) => spring({ frame: f - 12 - i * 10, fps, config: { damping: 18, stiffness: 120 } });
  const done = spring({ frame: f - 236, fps, config: { damping: 16, stiffness: 130 } });
  const sty = (i: number): React.CSSProperties => ({ opacity: line(i), transform: `translateY(${(1 - line(i)) * 40}px)` });
  return (
    <AbsoluteFill>
      <World keys={keys} bg={<RichBg />}>
        <div style={{ position: "absolute", left: 480, top: 70, width: 960, height: 1000, borderRadius: 34, background: "#fff", boxShadow: "0 40px 90px rgba(10,40,90,0.14)" }} />
        <div style={{ position: "absolute", left: 560, top: 110, width: 800, fontFamily: FONT, color: CHAR }}>
          <div style={{ display: "flex", justifyContent: "center", ...sty(0) }}>
            <svg width="112" height="132" viewBox="0 0 170 200" fill="none" stroke="#111" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10h100l30 30v140H20z" /><path d="M120 10v30h30" /><rect x="40" y="30" width="56" height="16" rx="3" /><path d="M42 70h2M60 70h2M42 92h2M70 92h2M42 114h2M60 114h2" /><rect x="96" y="100" width="70" height="32" rx="6" /><path d="M131 132v58" /></svg>
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 34, ...sty(1) }}>
            <div style={{ width: 4, borderRadius: 2, background: "#bfe3f7" }} />
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "0.06em", color: "#6b7785" }}>ЧТО ТАКОЕ ПРАВО</div>
              <div style={{ fontSize: 33, lineHeight: 1.5, marginTop: 14 }}>
                <span style={{ color: "#a560e8", borderBottom: "3px dotted #a560e8" }}>Право</span> — это правила, которые для всех одинаковые и которые защищает государство.
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 30 }}>
            <div style={{ width: 4, borderRadius: 2, background: "#bfe3f7", ...sty(2) }} />
            <div style={{ fontSize: 31, lineHeight: 1.45 }}>
              {["Правила записаны в законах, их можно прочитать.", "Они одинаковые для всех, и для богатых, и для бедных.", "Если правило нарушили, государство может наказать."].map((b, i) => (
                <div key={b} style={{ display: "flex", gap: 14, marginBottom: 12, ...sty(3 + i * 3) }}><span style={{ color: BLUE, fontWeight: 900 }}>—</span>{b}</div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 22, ...sty(13) }}>
            <div style={{ width: 4, borderRadius: 2, background: "#bfe3f7" }} />
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "0.06em", color: "#6b7785" }}>ПРИМЕР</div>
              <div style={{ fontSize: 31, lineHeight: 1.5, marginTop: 10 }}>Покупатель в Ташкенте может вернуть сломанную вещь по закону, и на базаре, и в интернет-магазине.</div>
            </div>
          </div>
        </div>
        {/* the result arrives as a neat card inside the lesson, fully visible */}
        <div style={{ position: "absolute", left: 520, top: 952, width: 880, height: 110, borderRadius: 28, background: "#d7ffb8", boxShadow: `0 8px 0 #b5ec8c, 0 30px 60px rgba(40,90,0,0.18)`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px", boxSizing: "border-box", transform: `translateY(${(1 - done) * 80}px) scale(${0.9 + 0.1 * done})`, opacity: done }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: FONT, fontWeight: 900, fontSize: 32, color: GLIP }}>
            <div style={{ width: 62, height: 62, borderRadius: 31, background: GREEN, display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="34" height="34" viewBox="0 0 48 48" fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round"><path d="M12 25.2 20.2 33.6 36.5 15.2" /></svg></div>
            Ура, выучили новое понятие!
          </div>
          <div style={{ padding: "16px 30px", borderRadius: 16, background: GREEN, boxShadow: `0 5px 0 ${GLIP}`, fontFamily: FONT, fontWeight: 900, fontSize: 22, color: "#fff", letterSpacing: "0.05em" }}>ПРОДОЛЖИТЬ</div>
        </div>
      </World>
    </AbsoluteFill>
  );
};

// ================= 5. CHOOSE THE ANSWER (inside the game) =================
const OPTS = ["Право это привычка ларька на базаре без опоры в акте", "Право это голосование жителей махалли «Янгихаёт» в Telegram", "Право это совет продавца на Чорсу, если он громче всех", "Право это общие правила поведения, которые признаёт государство"];
const OY = [300, 410, 520, 630];
const EXPL = "Норму ищут в акте. Государство её признаёт и при необходимости защищает.";
const Choice: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const PICK = 96, CHECK = 160;
  const clicks: Click[] = [{ at: PICK, x: 1240, y: OY[3] + 52 }, { at: CHECK, x: 1180, y: 802 }];
  const cur = useCursor(clicks, [1500, 1000], [1450, 1060]);
  const picked = f >= PICK + 2;
  const res = spring({ frame: f - CHECK - 4, fps, config: { damping: 16, stiffness: 130 } });
  const keys: Key[] = [
    { at: 0, fx: 900, fy: 360, rx: 32, ry: -14, rz: -3, z: 260 },
    { at: 80, fx: 1040, fy: 620, rx: 28, ry: 8, rz: 1, z: 320 },
    { at: 140, fx: 1000, fy: 740, rx: 24, ry: 4, rz: 0, z: 260 },
    { at: 205, fx: 960, fy: 760, rx: 10, ry: -2, rz: 0, z: 120 },
    { at: 300, fx: 960, fy: 570, rx: 0, ry: 0, rz: 0, z: -200 },
  ];
  return (
    <AbsoluteFill>
      <World keys={keys} bg={<RichBg />}>
        <div style={{ position: "absolute", left: 500, top: 120, width: 920, height: 900, borderRadius: 34, background: "#fff", boxShadow: "0 40px 90px rgba(10,40,90,0.14)" }} />
        <div style={{ position: "absolute", left: 560, top: 150, display: "flex", alignItems: "center", gap: 16 }}>
          <Img src={staticFile("v4/owl-q.png")} style={{ width: 120 }} />
          <div style={{ padding: "16px 26px", borderRadius: 18, border: `2px solid ${SWAN}`, borderBottomWidth: 4, background: "#fff", fontFamily: FONT, fontWeight: 800, fontSize: 32, color: CHAR }}>Что такое право?</div>
        </div>
        {OPTS.map((o, i) => {
          const pop = spring({ frame: f - 6 - i * 5, fps, config: { damping: 16, stiffness: 150 } });
          const sel = i === 3 && picked;
          const hov = i === 3 ? lin(f, PICK - 16, PICK - 6, 0, 1) * (1 - lin(f, PICK, PICK + 8, 0, 1)) : 0;
          const pr = i === 3 ? press(f, PICK) : 0;
          return (
            <div key={i} style={{ position: "absolute", left: 560, top: OY[i], width: 800, minHeight: 88, borderRadius: 18, background: sel ? "#d7ffb8" : "#fff", border: `2px solid ${sel ? GREEN : hov > 0.3 ? "#cfd5db" : SWAN}`, boxShadow: `0 ${6 - pr * 5}px 0 ${sel ? GLIP : SWAN}`, display: "flex", alignItems: "center", gap: 20, padding: "16px 26px", boxSizing: "border-box", fontFamily: FONT, fontSize: 28, fontWeight: 600, color: CHAR, transform: `translateY(${(1 - pop) * 60 + pr * 5 - hov * 3}px)`, opacity: pop }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, border: `2px solid ${sel ? GREEN : "#cfd5db"}`, background: sel ? GREEN : "#fff", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {sel ? <svg width="20" height="20" viewBox="0 0 48 48" fill="none" stroke="#fff" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round"><path d="M12 25.2 20.2 33.6 36.5 15.2" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - lin(f, PICK + 2, PICK + 12, 0, 1)} /></svg> : null}
              </div>
              {o}
            </div>
          );
        })}
        {/* the check button turns into the result card in place */}
        <div style={{ position: "absolute", left: 560, top: 760, width: 800, height: 84 + res * 150, borderRadius: 22, background: res > 0.02 ? interpolateColors(res, [0, 1], [GREEN, "#d7ffb8"]) : picked ? GREEN : SWAN, boxShadow: `0 ${6 - press(f, CHECK) * 5}px 0 ${res > 0.02 ? interpolateColors(res, [0, 1], [GLIP, "#b5ec8c"]) : picked ? GLIP : "#cfcfcf"}`, transform: `translateY(${press(f, CHECK) * 5}px)`, overflow: "hidden", fontFamily: FONT }}>
          <div style={{ position: "absolute", inset: 0, height: 84, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 28, letterSpacing: "0.06em", color: picked ? "#fff" : "#afafaf", opacity: 1 - res * 3 }}>ПРОВЕРИТЬ</div>
          <div style={{ position: "absolute", left: 30, top: 28, right: 30, display: "flex", gap: 22, opacity: lin(f, CHECK + 10, CHECK + 22, 0, 1) }}>
            <div style={{ width: 72, height: 72, borderRadius: 36, background: GREEN, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${spring({ frame: f - CHECK - 12, fps, config: { damping: 9, stiffness: 200 } })})` }}><svg width="40" height="40" viewBox="0 0 48 48" fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round"><path d="M12 25.2 20.2 33.6 36.5 15.2" /></svg></div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 46, color: GLIP, lineHeight: 1 }}>Круто!</div>
              <div style={{ marginTop: 12, lineHeight: 1.35 }}><Typer text={EXPL} at={CHECK + 28} speed={1.6} size={27} color={GLIP} weight={700} caretColor={GLIP} /></div>
            </div>
          </div>
        </div>
        <Confetti at={CHECK + 10} x={640} y={800} n={36} spread={7} />
        <CursorLayer c={cur} />
      </World>
    </AbsoluteFill>
  );
};

// ================= 6. MATCH THE PAIRS (threads of light) =================
const LEFT = ["Ответственность", "Право", "Общее правило"];
const RIGHT = ["Нормы поведения, которые государство устанавливает и отстаивает", "Последствие нарушения, которое государство применяет по процедуре", "Правило поведения для всех людей в одинаковой ситуации"];
const PY = [330, 480, 630];
const PAIRS: [number, number, number][] = [[1, 0, 44], [2, 2, 104], [0, 1, 164]]; // left, right, frame of the left click
const Pairs: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const LX = 420, RX = 1000, TW = 500, TH = 120;
  const clicks: Click[] = PAIRS.flatMap(([l, r, a]) => [{ at: a, x: LX + TW - 70, y: PY[l] + 70 }, { at: a + 28, x: RX + TW - 70, y: PY[r] + 74 }]);
  const cur = useCursor(clicks, [1500, 1000], [1500, 1000]);
  const done = spring({ frame: f - 210, fps, config: { damping: 14, stiffness: 140 } });
  const keys: Key[] = [
    { at: 0, fx: 760, fy: 420, rx: 24, ry: -14, rz: -2, z: 240 },
    { at: 110, fx: 900, fy: 500, rx: 16, ry: -4, rz: 0, z: 160 },
    { at: 200, fx: 960, fy: 540, rx: 4, ry: 0, rz: 0, z: -120 },
    { at: 300, fx: 960, fy: 560, rx: 0, ry: 0, rz: 0, z: -200 },
  ];
  const stateL = (i: number) => { const p = PAIRS.find(([l]) => l === i)!; return f >= p[2] + 30 ? "done" : f >= p[2] + 2 ? "sel" : "idle"; };
  const stateR = (i: number) => { const p = PAIRS.find(([, r]) => r === i)!; return f >= p[2] + 30 ? "done" : "idle"; };
  const tile = (st: string, pr: number): React.CSSProperties => ({
    background: st === "done" ? "#e7ffd6" : st === "sel" ? "#d7ffb8" : "#fff",
    border: `2px solid ${st === "idle" ? SWAN : GREEN}`,
    boxShadow: `0 ${6 - pr * 5}px 0 ${st === "idle" ? SWAN : GLIP}, 0 18px 30px rgba(10,40,90,0.08)`,
    transform: `translateY(${pr * 5}px) scale(${st === "sel" ? 1.03 : 1})`,
  });
  return (
    <AbsoluteFill>
      <World keys={keys} bg={<RichBg />}>
        <div style={{ position: "absolute", left: 340, top: 120, width: 1240, height: 940, borderRadius: 34, background: "#fff", boxShadow: "0 40px 90px rgba(10,40,90,0.14)" }} />
        <div style={{ position: "absolute", left: LX, top: 170, fontFamily: FONT }}>
          <div style={{ fontWeight: 900, fontSize: 44, color: CHAR }}>Соедини пары</div>
          <div style={{ fontWeight: 600, fontSize: 24, color: "#8a98a6", marginTop: 8 }}>Слева понятие, справа его смысл</div>
        </div>
        <svg width="1920" height="1080" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <defs><filter id="glow"><feGaussianBlur stdDeviation="6" /></filter></defs>
          {PAIRS.map(([l, r, a]) => {
            const t = lin(f, a + 28, a + 44, 0, 1, OUT);
            if (t <= 0) return null;
            const x1 = LX + TW, y1 = PY[l] + TH / 2, x2 = RX, y2 = PY[r] + TH / 2;
            const d = `M${x1} ${y1} C ${x1 + 50} ${y1}, ${x2 - 50} ${y2}, ${x2} ${y2}`;
            return (
              <g key={l}>
                <path d={d} stroke={GREEN} strokeWidth={14} fill="none" filter="url(#glow)" opacity={0.6} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - t} />
                <path d={d} stroke={GREEN} strokeWidth={5} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - t} />
              </g>
            );
          })}
        </svg>
        {LEFT.map((w, i) => {
          const p = PAIRS.find(([l]) => l === i)!;
          return <div key={w} style={{ position: "absolute", left: LX, top: PY[i], width: TW, height: TH, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 800, fontSize: 30, color: CHAR, ...tile(stateL(i), press(f, p[2])) }}>{w}</div>;
        })}
        {RIGHT.map((w, i) => {
          const p = PAIRS.find(([, r]) => r === i)!;
          return <div key={w} style={{ position: "absolute", left: RX, top: PY[i], width: TW, height: TH, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 22px", boxSizing: "border-box", fontFamily: FONT, fontWeight: 600, fontSize: 23, lineHeight: 1.3, color: CHAR, ...tile(stateR(i), press(f, p[2] + 28)) }}>{w}</div>;
        })}
        <div style={{ position: "absolute", left: LX, top: 820, width: RX + TW - LX, height: 150, borderRadius: 28, background: "#d7ffb8", boxShadow: "0 8px 0 #b5ec8c", transform: `translateY(${(1 - done) * 60}px) scale(${0.92 + 0.08 * done})`, opacity: done, display: "flex", alignItems: "center", gap: 24, padding: "0 40px", boxSizing: "border-box", fontFamily: FONT, fontWeight: 900, fontSize: 48, color: GLIP }}>
          <div style={{ width: 80, height: 80, borderRadius: 40, background: GREEN, display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="44" height="44" viewBox="0 0 48 48" fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round"><path d="M12 25.2 20.2 33.6 36.5 15.2" /></svg></div>
          Молодец!
        </div>
        <CursorLayer c={cur} />
      </World>
      
    </AbsoluteFill>
  );
};

// ================= 7. SEARCH A LAW (typed, results rise as cards) =================
const RESULTS = [
  "О мерах по дальнейшему совершенствованию системы обеспечения дорожной безопасности в Республике Узбекистан",
  "Кодекс Республики Узбекистан об административной ответственности, статья 128³",
  "Об организационных мерах по совершенствованию системы городского пассажирского транспорта",
];
const Search: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const Q = "штраф за парковку";
  const T0 = 70;
  const end = typedEnd(Q, T0, 3.4);
  const GO = Math.round(end + 14);
  const keys: Key[] = [
    { at: 0, fx: 960, fy: 300, rx: 22, ry: -8, rz: -2, z: 260 },
    { at: GO, fx: 980, fy: 330, rx: 30, ry: 4, rz: 0, z: 320 },
    { at: GO + 70, fx: 960, fy: 520, rx: 10, ry: -2, rz: 0, z: 40 },
    { at: 330, fx: 960, fy: 540, rx: 0, ry: 0, rz: 0, z: -200 },
  ];
  const bar = spring({ frame: f, fps, config: { damping: 14, stiffness: 140 } });
  return (
    <AbsoluteFill>
      <World keys={keys} bg={<RichBg />}>
        <div style={{ position: "absolute", left: 260, top: 230, width: 1400, height: 130, borderRadius: 65, background: "#fff", border: `3px solid ${f > T0 - 10 ? BLUE : SWAN}`, boxShadow: `0 8px 0 ${f > T0 - 10 ? "#84d8ff" : SWAN}, 0 30px 60px rgba(10,40,90,0.15)`, display: "flex", alignItems: "center", gap: 28, padding: "0 50px", boxSizing: "border-box", transform: `scale(${0.85 + 0.15 * bar}) translateY(${press(f, GO) * 6}px)`, opacity: bar }}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.6" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
          {f < T0 - 6 ? <span style={{ fontFamily: FONT, fontSize: 52, fontWeight: 600, color: "#b8bec5" }}>Поиск по всей базе законов</span> : <Typer text={Q} at={T0} speed={3.4} size={56} color={INK} weight={700} />}
        </div>
        {RESULTS.map((r, i) => {
          const s = spring({ frame: f - GO - 8 - i * 10, fps, config: { damping: 13, stiffness: 120 } });
          return (
            <div key={i} style={{ position: "absolute", left: 360, top: 420 + i * 170, width: 1200, height: 140, borderRadius: 22, background: "#fff", border: `2px solid ${SWAN}`, boxShadow: `0 6px 0 ${SWAN}, 0 26px 50px rgba(10,40,90,0.14)`, display: "flex", alignItems: "center", gap: 26, padding: "0 34px", boxSizing: "border-box", transform: `translateZ(${(1 - s) * -500}px) rotateX(${(1 - s) * 50}deg)`, opacity: Math.min(1, s * 2) }}>
              <div style={{ width: 70, height: 84, borderRadius: 10, background: "#e8f6ff", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round"><path d="M6 3h9l3 3v15H6zM9 9h6M9 13h6M9 17h4" /></svg></div>
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 27, color: "#1d2a6b", lineHeight: 1.3 }}>{r}</div>
            </div>
          );
        })}
        <CursorLayer c={useCursor([{ at: GO, x: 1560, y: 300 }], [1700, 600], [1700, 700])} />
      </World>
    </AbsoluteFill>
  );
};

// ================= 8. LANGUAGES: a real triangular prism with weight =================
const FACES: [string, string, string][] = [["Право", "Русский", "v4/flag-ru.svg"], ["Huquq", "O‘zbekcha", "v4/flag-uz.svg"], ["Law", "English", "v4/flag-en.svg"]];
const Prism: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const W = 980, H = 300;
  const R = W / (2 * Math.tan(Math.PI / 3)); // apothem of the triangle
  const cfg = { damping: 9, stiffness: 70, mass: 1.4 };
  const steps = [70, 160].map((a) => spring({ frame: f - a, fps, config: cfg }));
  const rot = -(steps[0] + steps[1]) * 120;
  const vel = [70, 160].reduce((v, a) => v + (spring({ frame: f - a + 1, fps, config: cfg }) - spring({ frame: f - a, fps, config: cfg })), 0);
  const intro = spring({ frame: f, fps, config: { damping: 12, stiffness: 100 } });
  const lift = Math.abs(vel) * 260;
  return (
    <AbsoluteFill>
      <RichBg />
      <div style={{ position: "absolute", top: 90, width: "100%" }}><Roll f={f} text="3 языка — одна база законов" at={8} size={76} color={INK} /></div>
      {/* floor shadow reacts to the spin */}
      <div style={{ position: "absolute", left: 960 - 420 - lift * 0.5, top: 840, width: 840 + lift, height: 70, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(10,40,90,0.28), transparent)", opacity: intro * (1 - Math.min(0.4, lift / 200)) }} />
      <AbsoluteFill style={{ perspective: 2200, perspectiveOrigin: "50% 40%" }}>
        <div style={{ position: "absolute", left: 960, top: 560 - lift * 0.4, transformStyle: "preserve-3d", transform: `scale(${intro}) rotateX(${-3.5 + vel * 24}deg) rotateY(${rot}deg)` }}>
          {FACES.map(([w, lang, flag], i) => (
            <div key={w} style={{ position: "absolute", left: -W / 2, top: -H / 2, width: W, height: H, borderRadius: 30, background: "linear-gradient(170deg,#fff,#eef8ff)", boxShadow: "inset 0 -14px 0 #cfe9fa", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 80px", boxSizing: "border-box", transform: `rotateY(${i * 120}deg) translateZ(${R}px)`, backfaceVisibility: "hidden" }}>
              <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 150, color: BLUE, textShadow: lip(LIP, 8, 0.1) }}>{w}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <Img src={staticFile(flag)} style={{ width: 70, height: 70, borderRadius: 35, objectFit: "cover" }} />
                <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 44, color: INK }}>{lang}</div>
              </div>
            </div>
          ))}
          {/* triangle caps so the prism reads as a solid */}
          {[-1, 1].map((sgn) => (
            <svg key={sgn} width={W} height={W} viewBox={`${-W / 2} ${-W / 2} ${W} ${W}`} style={{ position: "absolute", left: -W / 2, top: -W / 2, transform: `translateY(${sgn * H / 2}px) rotateX(${sgn < 0 ? 90 : -90}deg)`, overflow: "visible", backfaceVisibility: "hidden" }}>
              <polygon points={[0, 1, 2].map((k) => { const a = (k * 120 - 90) * Math.PI / 180; const rr = R * 2; return `${Math.cos(a) * rr},${Math.sin(a) * rr}`; }).join(" ")} fill={sgn < 0 ? "#cfe9fa" : "#9fd0ef"} stroke="#b5dcf4" strokeWidth={4} />
            </svg>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ================= 9. NOTES — the camera follows the mouse, then pulls back to the whole page =================
const ART = [
  "Мы, единый народ Узбекистана,",
  "торжественно провозглашая свою приверженность",
  "правам и свободам человека, национальным и общечеловеческим",
  "ценностям, принципам государственного суверенитета,",
  "подтверждая свою верность идеалам демократии, свободы",
  "и равенства, социальной справедливости и солидарности,",
];
const NOTE = "Повторить перед экзаменом";
const COLORS = ["#ffd43b", "#ff922b", "#ff6b6b", "#f783ac", "#cc5de8", "#4dabf7", "#3bc9db", "#51cf66", "#a9e34b", "#adb5bd"];
let measureCtx: CanvasRenderingContext2D | null = null;
const measure = (text: string, font: string) => {
  if (!measureCtx) measureCtx = document.createElement("canvas").getContext("2d");
  measureCtx!.font = font;
  return measureCtx!.measureText(text).width;
};
const Notes: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const PX = 360, LT = 300, LH = 70, FS = 38;
  const SW = measure(ART[1], `600 ${FS}px NunitoC`);
  const lineTop = LT + LH;
  const tipY = lineTop + LH * 0.62;
  const DRAG0 = 60, DRAG1 = 140;
  const YEL = 186, NOTEC = 226, T0 = 290;
  const SAVE = Math.round(typedEnd(NOTE, T0, 2.6) + 24);
  const sel = lin(f, DRAG0, DRAG1, 0, 1, Easing.bezier(0.45, 0, 0.55, 1));
  const palette = spring({ frame: f - DRAG1 - 6, fps, config: { damping: 14, stiffness: 170 } }) * (1 - lin(f, NOTEC + 2, NOTEC + 14, 0, 1));
  const yellow = lin(f, YEL + 2, YEL + 22, 0, 1, OUT);
  const dlg = spring({ frame: f - NOTEC - 6, fps, config: { damping: 16, stiffness: 130 } });
  const fold = lin(f, SAVE + 6, SAVE + 38, 0, 1, Easing.bezier(0.5, 0, 0.4, 1));
  const pin = spring({ frame: f - SAVE - 36, fps, config: { damping: 9, stiffness: 220 } });
  const PALX = PX + SW * 0.3, PALY = lineTop - 196;
  const DX0 = 560, DY0 = 330, DW = 800; // dialog
  const NOTEX = PX + SW + 46, NOTEY = lineTop + LH / 2;
  const clicks: Click[] = [{ at: YEL, x: PALX + 42, y: PALY + 74 }, { at: NOTEC, x: PALX + 40, y: PALY + 146 }, { at: SAVE, x: DX0 + DW - 120, y: DY0 + 345 }];
  const curBase = useCursor(clicks, [PX + SW, tipY], [1500, 980]);
  const dragging = f >= DRAG0 - 30 && f < DRAG1 + 10;
  const cx = dragging ? (f < DRAG0 ? interpolate(f, [DRAG0 - 30, DRAG0], [PX - 160, PX], { ...clamp, easing: IO }) : PX + SW * sel) : curBase.x;
  const cy = dragging ? tipY : curBase.y;
  const cur = { ...curBase, x: cx, y: cy, visible: !dragging && curBase.visible };
  const hl = interpolateColors(yellow, [0, 1], ["rgba(28,176,246,0.22)", "rgba(255,212,59,0.85)"]);
  const preDrag = f < DRAG0 ? interpolate(f, [DRAG0 - 30, DRAG0], [-160, 0], { ...clamp, easing: IO }) : 0;
  const keys: Key[] = [
    { at: 0, fx: PX + 200, fy: lineTop, rx: 22, ry: -12, rz: -2, z: 280 },
    { at: 150, fx: PX + SW - 100, fy: lineTop, rx: 20, ry: 8, rz: 1, z: 280 },
    { at: 230, fx: PALX + 200, fy: lineTop - 80, rx: 12, ry: 0, rz: 0, z: 160 },
    { at: 300, fx: 960, fy: 540, rx: 0, ry: 0, rz: 0, z: -180 },
    { at: 520, fx: 960, fy: 540, rx: 0, ry: 0, rz: 0, z: -200 },
  ];
  const follow = dragging ? { x: cx, y: cy, k: 0.5 } : undefined;
  return (
    <AbsoluteFill>
      <World keys={keys} follow={follow} bg={<RichBg />}>
        <div style={{ position: "absolute", left: PX - 80, top: 90, width: 1360, height: 900, borderRadius: 30, background: "#fff", boxShadow: "0 40px 90px rgba(10,40,90,0.14)" }} />
        <div style={{ position: "absolute", left: PX, top: 130, fontFamily: FONT, fontWeight: 900, fontSize: 30, color: "#1d2a6b" }}>КОНСТИТУЦИЯ РЕСПУБЛИКИ УЗБЕКИСТАН</div>
        <div style={{ position: "absolute", left: PX, width: 1200, top: 210, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 26, color: "#1d2a6b" }}>ПРЕАМБУЛА</div>
        {ART.map((l, i) => (
          <div key={i} style={{ position: "absolute", left: PX, top: LT + i * LH, height: LH, display: "flex", alignItems: "center", fontFamily: FONT, fontWeight: 600, fontSize: FS, color: CHAR, whiteSpace: "nowrap" }}>
            {i === 1 ? (
              <>
                <span style={{ position: "relative", padding: "4px 6px", margin: "0 -6px", borderRadius: 8, backgroundImage: `linear-gradient(${hl}, ${hl})`, backgroundRepeat: "no-repeat", backgroundSize: `${sel * 100}% 100%` }}>
                  {l}
                  {/* during the drag the mouse rides exactly on the edge of the selection */}
                  {dragging ? <span style={{ position: "absolute", left: `calc(${sel * 100}% + ${preDrag}px)`, top: LH * 0.55, zIndex: 5 }}><Arrow down={0} /></span> : null}
                </span>
                {/* the saved note pins itself right after the highlighted words */}
                {f > SAVE + 30 ? (
                  <span style={{ display: "inline-flex", marginLeft: 22, width: 56, height: 56, borderRadius: 16, background: "#fff4c2", border: "2px solid #ffd43b", boxShadow: "0 4px 0 #f2c200", alignItems: "center", justifyContent: "center", transform: `scale(${pin})` }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#b58900" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h11l3 3v13H5zM8 10h8M8 14h6" /></svg>
                  </span>
                ) : null}
              </>
            ) : l}
          </div>
        ))}
        {palette > 0.01 ? (
          <div style={{ position: "absolute", left: PALX, top: PALY, width: 600, borderRadius: 20, background: "#fff", border: `2px solid ${BLUE}`, boxShadow: "0 30px 60px rgba(10,40,90,0.2)", padding: "18px 22px", boxSizing: "border-box", transformOrigin: "20% 100%", transform: `scale(${palette})`, fontFamily: FONT }}>
            <div style={{ fontWeight: 800, fontSize: 17, color: BLUE, letterSpacing: "0.06em" }}>ВЫДЕЛЕНИЕ ЦВЕТОМ</div>
            <div style={{ display: "flex", gap: 14, marginTop: 14 }}>
              {COLORS.map((c, i) => <div key={c} style={{ width: 40, height: 40, borderRadius: 20, background: c, boxShadow: i === 0 && f >= YEL ? `0 0 0 4px #fff, 0 0 0 7px ${c}` : undefined, transform: `scale(${i === 0 ? 1 - press(f, YEL) * 0.15 : 1})` }} />)}
            </div>
            <div style={{ display: "flex", gap: 40, marginTop: 18, paddingTop: 14, borderTop: `2px solid ${SWAN}` }}>
              {["M5 4h11l3 3v13H5zM8 10h8M8 14h6", "M8 8h11v11H8zM5 16V5h11", "M7 7h4v4H7zM13 7h4v4h-4zM7 11c0 3-1 5-3 6M13 11c0 3-1 5-3 6", "M10 14l4-4M8 12l-2 2a3 3 0 0 0 4 4l2-2M16 12l2-2a3 3 0 0 0-4-4l-2 2", "M5 9v6h4l5 4V5L9 9z"].map((d, i) => (
                <svg key={i} width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: `scale(${i === 0 ? 1 - press(f, NOTEC) * 0.15 : 1})` }}><path d={d} /></svg>
              ))}
            </div>
          </div>
        ) : null}
        {dlg > 0.01 && fold < 1 ? (
          <div style={{ position: "absolute", left: DX0, top: DY0, width: DW, borderRadius: 26, background: "#fff", boxShadow: "0 50px 100px rgba(10,40,90,0.28)", padding: "30px 36px", boxSizing: "border-box", transformOrigin: `${NOTEX - DX0}px ${NOTEY - DY0}px`, transform: `scale(${(0.7 + 0.3 * dlg) * (1 - fold * 0.95)})`, opacity: Math.min(1, dlg * 2) * (1 - lin(f, SAVE + 26, SAVE + 38, 0, 1)), fontFamily: FONT }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 900, fontSize: 34, color: INK }}>Заметка к выделенному</div>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: BLUE, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 900 }}>×</div>
            </div>
            <div style={{ marginTop: 18, padding: "10px 16px", borderRadius: 12, background: "#fff8d6", borderLeft: "5px solid #ffd43b", fontSize: 21, color: "#6b7785" }}>{ART[1]}</div>
            <div style={{ marginTop: 18, height: 130, borderRadius: 16, border: `2px solid ${BLUE}`, padding: "16px 20px", boxSizing: "border-box" }}>
              {f < T0 - 4 ? <span style={{ fontFamily: FONT, fontSize: 30, color: "#b8bec5", fontWeight: 600 }}>Что вы думаете об этом?</span> : <Typer text={NOTE} at={T0} speed={2.6} size={34} color={INK} weight={700} />}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 18, marginTop: 22 }}>
              <div style={{ padding: "18px 34px", borderRadius: 16, border: `2px solid ${SWAN}`, boxShadow: `0 4px 0 ${SWAN}`, fontWeight: 900, fontSize: 22, color: "#8a98a6", letterSpacing: "0.05em" }}>ОТМЕНА</div>
              <div style={{ padding: "18px 34px", borderRadius: 16, background: GREEN, boxShadow: `0 ${4 - press(f, SAVE) * 4}px 0 ${GLIP}`, transform: `translateY(${press(f, SAVE) * 4}px)`, fontWeight: 900, fontSize: 22, color: "#fff", letterSpacing: "0.05em" }}>СОХРАНИТЬ</div>
            </div>
          </div>
        ) : null}
        <CursorLayer c={cur as ReturnType<typeof useCursor>} />
      </World>
    </AbsoluteFill>
  );
};

// ================= 10. FINALE: pull back out of the interface into the device =================
const Finale: React.FC = () => {
  const f = useCurrentFrame();
  const s = lin(f, 0, 150, 3.0, 1, Easing.bezier(0.5, 0, 0.2, 1));
  const tilt = lin(f, 40, 200, 0, 1);
  return (
    <AbsoluteFill>
      <RichBg />
      <AbsoluteFill style={{ perspective: 2200 }}>
        <div style={{ position: "absolute", left: 960, top: 600, transformStyle: "preserve-3d", transform: `translate(-50%,-50%) scale(${s * 0.92}) rotateX(${tilt * 12}deg) rotateY(${tilt * -14}deg)` }}>
          <div style={{ width: 1160, height: 725, borderRadius: 34, background: "#111", padding: 22, boxSizing: "border-box", boxShadow: "0 60px 120px rgba(10,40,90,0.35)" }}>
            <Img src={staticFile("hack/hd/cabinet.png")} style={{ width: "100%", height: "100%", borderRadius: 14, objectFit: "cover" }} />
          </div>
          <div style={{ width: 1400, height: 34, marginLeft: -120, borderRadius: "0 0 40px 40px", background: "linear-gradient(#d9dde2, #9aa1a9)", boxShadow: "0 30px 50px rgba(10,40,90,0.25)" }} />
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 40, width: "100%", zIndex: 5 }}><Roll f={f} text="Всё это — в одном месте" at={110} size={72} color={INK} /></div>
    </AbsoluteFill>
  );
};

// ================= 11. END — the logo arrives whole and holds =================
const End4: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const btn = spring({ frame: f - 46, fps, config: { damping: 14, stiffness: 150 } });
  const CLICK = 130;
  const cur = useCursor([{ at: CLICK, x: 1030, y: 760 }], [1500, 1000], [1250, 1000]);
  const pr = press(f, CLICK);
  return (
    <AbsoluteFill>
      <RichBg />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div style={{ marginTop: -80 }}><Roll f={f} text="veoskill" at={4} size={240} color={BLUE} lipC={LIP} stagger={0} /></div>
        <div style={{ marginTop: 6 }}><Roll f={f} text="Учись играя. Каждый день." at={24} size={56} color={INK} /></div>
        <div style={{ marginTop: 50, padding: "24px 76px", borderRadius: 26, background: GREEN, boxShadow: `0 ${10 - pr * 8}px 0 ${GLIP}`, fontFamily: FONT, fontWeight: 900, fontSize: 54, color: "#fff", transform: `scale(${btn}) translateY(${pr * 8}px)` }}>veoskill.uz</div>
      </AbsoluteFill>
      <Confetti at={CLICK + 4} x={960} y={760} n={60} spread={11} />
      <CursorLayer c={cur} />
    </AbsoluteFill>
  );
};

// ================= timeline =================
const TC = (q: string, a: string, color?: string, lipC?: string): React.FC => () => <TitleCard q={q} a={a} color={color} lipC={lipC} />;
const TC_DIR = TC("Не знаешь, с чего начать?", "Выбери направление");
const TC_MIN = TC("Нет времени учиться?", "Хватит 15 минут в день", GREEN, GLIP);
const TC_LES = TC("Скучные лекции?", "Короткие уроки простыми словами");
const TC_GAME = TC("Зубришь, но не понимаешь?", "Отвечай — и сразу понимай почему", GREEN, GLIP);
const TC_LAW = TC("Не знаешь, где найти закон?", "Любой закон — за секунды");
const TC_NOTE = TC("Забываешь прочитанное?", "Выделяй и пиши заметки", GREEN, GLIP);
type Tr = "up" | "zoom" | "left" | "cut";
const SCENES: { C: React.FC; d: number; tr: Tr; pre?: number }[] = [
  { C: Hook, d: 360, tr: "cut" },
  { C: TC_DIR, d: 150, tr: "zoom" },
  { C: PickDirection, d: 300, tr: "zoom" },
  { C: Directions, d: 300, tr: "up", pre: 14 },
  { C: TC_MIN, d: 150, tr: "up" },
  { C: Minutes, d: 250, tr: "zoom", pre: 14 },
  { C: TC_LES, d: 150, tr: "up" },
  { C: PathBeat, d: 190, tr: "zoom" },
  { C: LessonLoad, d: 214, tr: "cut" },
  { C: Theory, d: 300, tr: "zoom" },
  { C: TC_GAME, d: 150, tr: "up" },
  { C: Choice, d: 340, tr: "zoom" },
  { C: Pairs, d: 300, tr: "left" },
  { C: GameRing, d: 430, tr: "up", pre: 14 },
  { C: Counters, d: 200, tr: "up", pre: 14 },
  { C: TC_LAW, d: 150, tr: "up" },
  { C: Search, d: 300, tr: "zoom" },
  { C: LawsWall, d: 230, tr: "up", pre: 14 },
  { C: Prism, d: 270, tr: "up" },
  { C: TC_NOTE, d: 150, tr: "up" },
  { C: Notes, d: 520, tr: "zoom" },
  { C: SaveRemember, d: 160, tr: "up", pre: 14 },
  { C: MistakeLoop, d: 230, tr: "up", pre: 14 },
  { C: LeagueClimb, d: 280, tr: "up", pre: 14 },
  { C: Finale, d: 230, tr: "zoom" },
  { C: End4, d: 260, tr: "up" },
];
const T = 18;
const starts: number[] = [];
let acc = 0;
SCENES.forEach((s, i) => { starts.push(acc); acc += s.d - (i < SCENES.length - 1 ? (SCENES[i + 1].tr === "cut" ? 0 : T) : 0); });
export const V4_FRAMES = acc;
export const V4_STARTS = starts;

const Scene: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const sc = SCENES[i];
  const next = SCENES[i + 1];
  const C = sc.C;
  const e = sc.tr === "cut" || i === 0 ? 1 : lin(f, 0, T, 0, 1, OUT);
  let enter: React.CSSProperties = {};
  if (e < 1) {
    if (sc.tr === "up") enter = { transform: `translateY(${(1 - e) * 1080}px) scale(${0.9 + 0.1 * e})`, borderRadius: (1 - e) * 60, overflow: "hidden" };
    if (sc.tr === "left") enter = { transform: `translateX(${(1 - e) * 1920}px) rotate(${(1 - e) * 4}deg)`, borderRadius: (1 - e) * 60, overflow: "hidden" };
    if (sc.tr === "zoom") enter = { transform: `scale(${1 + (1 - e) * 0.5})`, filter: `blur(${(1 - e) * 16}px)`, opacity: Math.min(1, e * 3) };
  }
  const lt = next && next.tr !== "cut" ? lin(f, sc.d - T, sc.d, 0, 1, Easing.bezier(0.55, 0, 0.9, 0.4)) : 0;
  let leave: React.CSSProperties = {};
  if (lt > 0 && next) {
    if (next.tr === "up") leave = { transform: `translateY(${-lt * 220}px) scale(${1 - lt * 0.08})`, filter: `blur(${lt * 8}px) brightness(${1 - lt * 0.2})` };
    if (next.tr === "left") leave = { transform: `translateX(${-lt * 500}px) scale(${1 - lt * 0.06})`, filter: `blur(${lt * 8}px) brightness(${1 - lt * 0.2})` };
    if (next.tr === "zoom") leave = { transform: `scale(${1 + lt * 0.4})`, filter: `blur(${lt * 14}px)` };
  }
  return (
    <AbsoluteFill style={leave}>
      <AbsoluteFill style={enter}>
        <Sequence from={-(sc.pre ?? 0)}>
          <C />
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const V4: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: "#f4f8fc" }}>
      {SCENES.map((s, i) => (
        <Sequence key={i} from={starts[i]} durationInFrames={s.d}>
          <Scene i={i} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
export { Caption, Light, Hook, PickDirection, LessonLoad, Theory, Choice, Pairs, Search, Prism, Notes, Finale, End4, TitleCard };
