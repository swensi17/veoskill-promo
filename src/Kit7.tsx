import React from "react";
import { AbsoluteFill, Easing, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import { RichBg } from "./Bg";

// Shared kit for v7: premium headline type, one text motion, one camera behaviour, one transition.
export const UI = "NunitoC, Nunito, sans-serif"; // the site's own font, used only inside the interface
export const HEAD = "Onest, NunitoC, sans-serif"; // calm adult headline font
export const BLUE = "#1cb0f6";
export const LIP = "#0f6fbf";
export const GREEN = "#58cc02";
export const GLIP = "#58a700";
export const RED = "#ff4b4b";
export const INK = "#0b1020";
export const CHAR = "#4b4b4b";
export const SWAN = "#e5e5e5";
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const IO = Easing.bezier(0.65, 0, 0.35, 1);
export const OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const SOFT = Easing.bezier(0.22, 1, 0.36, 1);
export const lin = (f: number, a: number, b: number, x: number, y: number, e = IO) => interpolate(f, [a, b], [x, y], { easing: e, ...clamp });
export const press = (f: number, at: number) => lin(f, at, at + 4, 0, 1) * (1 - lin(f, at + 6, at + 12, 0, 1));

export const useFonts7 = () => {
  const [h] = React.useState(() => delayRender("fonts7"));
  React.useEffect(() => {
    const faces: FontFace[] = [];
    for (const w of [600, 700, 800, 900]) for (const s of ["cyrillic", "latin"]) faces.push(new FontFace("NunitoC", `url(${staticFile(`fonts/nunito-${s}-${w}-normal.woff2`)})`, { weight: String(w) }));
    faces.push(new FontFace("Onest", `url(${staticFile("fonts/onest-cyr.woff2")})`, { weight: "100 900", unicodeRange: "U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116" }));
    faces.push(new FontFace("Onest", `url(${staticFile("fonts/onest-lat.woff2")})`, { weight: "100 900", unicodeRange: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD" }));
    const EXT = "U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF";
    for (const w of [600, 700, 800, 900]) faces.push(new FontFace("NunitoC", `url(${staticFile(`fonts/nunito-latin-ext-${w}-normal.woff2`)})`, { weight: String(w), unicodeRange: EXT }));
    for (const w of [400, 500, 600, 700, 800, 900]) faces.push(new FontFace("Onest", `url(${staticFile(`fonts/onest-latin-ext-${w}-normal.woff2`)})`, { weight: String(w), unicodeRange: EXT }));
    Promise.all(faces.map((x) => x.load().then(() => document.fonts.add(x)))).then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};

let ctx: CanvasRenderingContext2D | null = null;
export const textWidth = (text: string, font: string) => {
  if (!ctx) ctx = document.createElement("canvas").getContext("2d");
  ctx!.font = font;
  return ctx!.measureText(text).width;
};
/** Font size that keeps one line inside maxW. */
export const fit = (text: string, size: number, maxW: number, weight = 700, family = "Onest") => {
  const w = textWidth(text, `${weight} ${size}px ${family}`);
  return w > maxW ? Math.floor((size * maxW) / w) : size;
};

/** One headline line: the whole line slides down out of a mask (0.45 s, no bounce); `out` slides it away downward. */
export const Line: React.FC<{ text: string; at: number; out?: number; size?: number; color?: string; weight?: number; maxW?: number; accent?: string; accentColor?: string; style?: React.CSSProperties }> = ({ text, at, out, size = 84, color = INK, weight = 700, maxW = 1600, accent, accentColor = BLUE, style }) => {
  const f = useCurrentFrame();
  const fs = fit(text, size, maxW, weight);
  const tin = lin(f, at, at + 27, 0, 1, SOFT);
  const tout = out !== undefined ? lin(f, out, out + 21, 0, 1, Easing.bezier(0.55, 0, 0.75, 0.3)) : 0;
  if (f < at) return null;
  const parts = accent && text.includes(accent) ? text.split(accent) : null;
  return (
    <div style={{ overflow: "hidden", padding: `${fs * 0.12}px 0 ${fs * 0.2}px`, display: "flex", justifyContent: "center", ...style }}>
      <div style={{ fontFamily: HEAD, fontWeight: weight, fontSize: fs, lineHeight: 1.1, letterSpacing: "-0.015em", color, whiteSpace: "nowrap", transform: `translateY(${(-(1 - tin) + tout) * 115}%)`, opacity: Math.min(1, tin * 1.4) * (1 - tout) }}>
        {parts ? <>{parts[0]}<span style={{ color: accentColor }}>{accent}</span>{parts[1]}</> : text}
      </div>
    </div>
  );
};

/** Pain → solution card: line A, then it rolls away and line B arrives (like a counter). */
export const PainCard: React.FC<{ a: string; b: string; tone?: "light" | "dark"; accent?: string; kicker?: string }> = ({ a, b, tone = "light", accent, kicker }) => {
  const f = useCurrentFrame();
  const dark = tone === "dark";
  const drift = lin(f, 0, 300, 1, 1.03, Easing.linear);
  return (
    <AbsoluteFill style={{ background: dark ? "#0e1626" : undefined }}>
      {dark ? <AbsoluteFill style={{ background: "radial-gradient(70% 60% at 50% 45%, #1a2a44, #0b1220)" }} /> : <RichBg seed={a.length} />}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `scale(${drift})` }}>
        {kicker ? <div style={{ position: "absolute", top: 380, fontFamily: HEAD, fontWeight: 600, fontSize: 30, letterSpacing: "0.18em", color: dark ? "#7f93b3" : "#8a98a6", opacity: lin(f, 4, 20, 0, 1) }}>{kicker}</div> : null}
        <div style={{ position: "absolute", top: 470, width: "100%" }}>
          <Line text={a} at={6} out={100} size={88} color={dark ? "#ffffff" : INK} />
        </div>
        <div style={{ position: "absolute", top: 470, width: "100%" }}>
          <Line text={b} at={114} size={92} color={dark ? "#ffffff" : INK} accent={accent} accentColor={dark ? "#5fd0ff" : BLUE} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Short benefit line shown over a soft bed after a demo. */
export const Benefit: React.FC<{ text: string; accent?: string }> = ({ text, accent }) => (
  <AbsoluteFill>
    <RichBg seed={text.length + 3} />
    <AbsoluteFill style={{ justifyContent: "center" }}>
      <Line text={text} at={4} size={84} accent={accent} />
    </AbsoluteFill>
  </AbsoluteFill>
);

/** Section header: small number, big word, a subline of facts. */
export const Chapter: React.FC<{ n: string; title: string; sub: string }> = ({ n, title, sub }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <RichBg seed={title.length * 7} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", top: 330, width: "100%" }}><Line text={n} at={2} size={40} color={BLUE} weight={700} /></div>
        <div style={{ position: "absolute", top: 400, width: "100%" }}><Line text={title} at={8} size={150} weight={800} /></div>
        <div style={{ position: "absolute", top: 610, width: "100%" }}><Line text={sub} at={24} size={44} weight={600} color="#5d6c7c" /></div>
        <div style={{ position: "absolute", top: 590, left: 960 - 160 * lin(f, 18, 50, 0, 1, SOFT), width: 320 * lin(f, 18, 50, 0, 1, SOFT), height: 3, borderRadius: 2, background: BLUE, opacity: 0.6 }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Demo camera: starts closer on a focus point and eases back to the full working area; tiny tilt only. */
export const DemoCam: React.FC<{ children: React.ReactNode; from: { s: number; x: number; y: number }; settle?: number; later?: { at: number; s: number; x: number; y: number }[]; tilt?: number }> = ({ children, from, settle = 90, later = [], tilt = 4 }) => {
  const f = useCurrentFrame();
  const keys = [{ at: 0, ...from }, { at: settle, s: 1, x: 960, y: 540 }, ...later];
  let s = keys[0].s, x = keys[0].x, y = keys[0].y;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (f >= a.at && f <= b.at) { const t = SOFT((f - a.at) / Math.max(1, b.at - a.at)); s = a.s + (b.s - a.s) * t; x = a.x + (b.x - a.x) * t; y = a.y + (b.y - a.y) * t; }
    if (f > b.at) { s = b.s; x = b.x; y = b.y; }
  }
  if (s >= 1) { y = 540 / s; x = Math.max(x, 960 / s); x = Math.min(x, 1920 - 960 / s); }
  const rx = (s - 1) * tilt * 3;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#fff" }}>
      <AbsoluteFill style={{ perspective: 2400 }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transformOrigin: "0 0", transform: `translate(${960 - x * s}px, ${540 - y * s}px) scale(${s}) rotateX(${rx}deg)` }}>{children}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Variant B: the pain line gets struck through and fades back; the answer rises beneath it. */
export const StrikeCard: React.FC<{ a: string; b: string; accent?: string }> = ({ a, b, accent }) => {
  const f = useCurrentFrame();
  const fsA = fit(a, 80, 1600);
  const w = textWidth(a, `700 ${fsA}px Onest`);
  const strike = lin(f, 92, 112, 0, 1, SOFT);
  const dim = lin(f, 100, 120, 1, 0.28);
  return (
    <AbsoluteFill>
      <RichBg seed={a.length + 11} />
      <div style={{ position: "absolute", top: 380, width: "100%", opacity: dim }}>
        <Line text={a} at={6} size={80} />
        <div style={{ position: "absolute", left: 960 - w / 2, top: fsA * 0.12 + fsA * 0.62, width: w * strike, height: 6, borderRadius: 3, background: RED }} />
      </div>
      <div style={{ position: "absolute", top: 540, width: "100%" }}>
        <Line text={b} at={118} size={92} accent={accent} />
      </div>
    </AbsoluteFill>
  );
};
