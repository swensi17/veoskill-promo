import React from "react";
import {
  Audio,
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Бренд veoskill / NeoLex (с neolex.uz): Nunito, голубой/зелёный, кнопки с «ступенькой» снизу.
export const C = {
  blue: "#1cb0f6", blueDark: "#1899d6", green: "#58cc02", greenDark: "#58a700",
  orange: "#ff9600", orangeDark: "#cc7800", violet: "#ce82ff", violetDark: "#a560d6",
  coral: "#ff705d", yellow: "#ffc800", ink: "#4b4b4b", mist: "#ddf4ff", white: "#ffffff",
};
export const FONT = "NunitoBrand, Nunito, sans-serif";
export const OUT = Easing.bezier(0.16, 1, 0.3, 1);

export const useFonts = () => {
  const [handle] = React.useState(() => delayRender("fonts"));
  React.useEffect(() => {
    const faces: Promise<unknown>[] = [];
    for (const w of [700, 800, 900]) {
      for (const [s, range] of [
        ["cyrillic", "U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116"],
        ["latin", "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"],
      ]) {
        const f = new FontFace("NunitoBrand", `url(${staticFile(`fonts/nunito-${s}-${w}-normal.woff2`)})`, {
          weight: String(w),
          unicodeRange: range,
        });
        faces.push(f.load().then(() => document.fonts.add(f)));
      }
    }
    Promise.all(faces).then(() => continueRender(handle)).catch(() => continueRender(handle));
  }, [handle]);
};

export const pop = (frame: number, fps: number, delay: number, damping = 11) =>
  spring({ frame: frame - delay, fps, config: { damping, stiffness: 140, mass: 0.7 } });

// Текст «поднимается из-за невидимого края» (#005 Mask reveal)
export const MaskWords: React.FC<{ text: string; size: number; color: string; delay: number; weight?: number }> = ({ text, size, color, delay, weight = 900 }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", gap: size * 0.28, justifyContent: "center", flexWrap: "wrap" }}>
      {text.split(" ").map((w, i) => {
        const y = interpolate(frame, [delay + i * 5, delay + i * 5 + 18], [110, 0], { easing: OUT, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={i} style={{ overflow: "hidden", padding: `${size * 0.1}px 0` }}>
            <div style={{ transform: `translateY(${y}%)`, fontFamily: FONT, fontWeight: weight, fontSize: size, color, lineHeight: 1.1 }}>{w}</div>
          </div>
        );
      })}
    </div>
  );
};

export const Dot: React.FC<{ x: number; y: number; r: number; color: string; delay: number; drift: number }> = ({ x, y, r, color, delay, drift }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, delay, 9);
  const fy = Math.sin((frame + drift * 20) / 22) * 14;
  return <div style={{ position: "absolute", left: x - r, top: y - r + fy, width: r * 2, height: r * 2, borderRadius: "50%", background: color, transform: `scale(${s})` }} />;
};

// ---------- Сцена 1: логотип ----------
const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = pop(frame, fps, 14, 9);
  const dots = [
    [330, 260, 46, C.blue], [1560, 230, 34, C.green], [260, 800, 30, C.orange],
    [1650, 760, 54, C.violet], [520, 140, 22, C.coral], [1380, 900, 26, C.yellow],
    [150, 480, 20, C.green], [1760, 500, 22, C.blue],
  ] as const;
  return (
    <AbsoluteFill style={{ background: C.white }}>
      {dots.map(([x, y, r, c], i) => <Dot key={i} x={x} y={y} r={r} color={c} delay={4 + i * 3} drift={i} />)}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 36 }}>
        <Img src={staticFile("img/logo.png")} style={{ width: 980, transform: `scale(${logo}) rotate(${(1 - logo) * -6}deg)` }} />
        <MaskWords text="Самый живой способ учиться" size={64} color={C.ink} delay={42} weight={800} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- Сцена 2: курсы, квизы, игры ----------
export const CardIcon: React.FC<{ kind: number }> = ({ kind }) => {
  if (kind === 0)
    return (
      <svg width="190" height="190" viewBox="0 0 100 100">
        <path d="M50 24c-9-8-26-9-38-4v52c12-5 29-4 38 4 9-8 26-9 38-4V20c-12-5-29-4-38 4z" fill="#fff" />
        <path d="M50 24v52" stroke={C.blueDark} strokeWidth="5" />
        <path d="M22 38c8-2 16-1 22 3M22 52c8-2 16-1 22 3M78 38c-8-2-16-1-22 3M78 52c-8-2-16-1-22 3" stroke={C.blue} strokeWidth="4" strokeLinecap="round" fill="none" />
      </svg>
    );
  if (kind === 1)
    return (
      <svg width="190" height="190" viewBox="0 0 100 100">
        <circle cx="50" cy="46" r="34" fill="#fff" />
        <path d="M34 74l-6 16 20-12z" fill="#fff" />
        <text x="50" y="62" textAnchor="middle" fontFamily={FONT} fontWeight="900" fontSize="52" fill={C.greenDark}>?</text>
      </svg>
    );
  return (
    <svg width="190" height="190" viewBox="0 0 100 100">
      <polygon points="50,10 61,38 91,40 68,59 76,88 50,72 24,88 32,59 9,40 39,38" fill="#fff" />
      <polygon points="50,28 55,43 71,44 59,54 63,69 50,61 37,69 41,54 29,44 45,43" fill={C.orange} />
    </svg>
  );
};

const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cards = [
    { t: "Курсы", c: C.blue, d: C.blueDark },
    { t: "Квизы", c: C.green, d: C.greenDark },
    { t: "Игры", c: C.orange, d: C.orangeDark },
  ];
  return (
    <AbsoluteFill style={{ background: C.mist }}>
      <div style={{ position: "absolute", top: 110, width: "100%" }}>
        <MaskWords text="Учись в удовольствие" size={92} color={C.ink} delay={6} />
      </div>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 70, paddingTop: 170 }}>
        {cards.map((c, i) => {
          const s = pop(frame, fps, 22 + i * 9, 10);
          const bob = Math.sin((frame + i * 14) / 18) * 8;
          return (
            <div key={i} style={{
              width: 440, height: 520, borderRadius: 52, background: c.c, boxShadow: `0 16px 0 ${c.d}`,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 34,
              transform: `translateY(${bob + (1 - s) * 160}px) scale(${s}) rotate(${(1 - s) * (i - 1) * 10}deg)`,
            }}>
              <CardIcon kind={i} />
              <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 84, color: "#fff" }}>{c.t}</div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- Сцена 3: направления + иллюстрация ----------
const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chips = [
    { t: "Право", img: "icon_legal.png", c: C.blue },
    { t: "IT", img: "icon_it.png", c: C.violet },
    { t: "Медицина", img: "icon_medical.png", c: C.coral },
    { t: "Финансы", img: "icon_finance.png", c: C.green },
  ];
  const art = pop(frame, fps, 10, 14);
  const zoom = interpolate(frame, [0, 120], [1, 1.1], { easing: Easing.inOut(Easing.quad) });
  return (
    <AbsoluteFill style={{ background: C.white }}>
      <div style={{ position: "absolute", right: 70, top: 90, width: 1080, height: 900, transform: `scale(${art * zoom}) rotate(${(1 - art) * 8}deg)` }}>
        <Img src={staticFile("img/hero_cluster.png")} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </div>
      <div style={{ position: "absolute", left: 100, top: 140 }}>
        <div style={{ textAlign: "left" }}>
          <MaskWords text="Любое" size={92} color={C.ink} delay={4} />
          <MaskWords text="направление" size={92} color={C.blue} delay={12} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 44 }}>
          {chips.map((c, i) => {
            const s = pop(frame, fps, 30 + i * 8, 12);
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 24, background: "#fff", border: `4px solid ${c.c}`, borderRadius: 40,
                padding: "14px 40px 14px 18px", width: 520, boxShadow: `0 10px 0 ${c.c}`,
                transform: `translateX(${(1 - s) * -420}px)`, opacity: Math.min(1, s * 1.5),
              }}>
                <Img src={staticFile(`img/${c.img}`)} style={{ width: 78, height: 78 }} />
                <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 54, color: C.ink }}>{c.t}</span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Сцена 4: призыв ----------
const Burst: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [at, at + 22], [0, 1], { easing: OUT, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cols = [C.yellow, C.orange, C.coral, C.violet, C.blue, C.green];
  return (
    <>
      {Array.from({ length: 14 }).map((_, i) => {
        const a = (i / 14) * Math.PI * 2;
        const r = 170 + t * 330;
        return (
          <div key={i} style={{
            position: "absolute", left: 960 + Math.cos(a) * r - 12, top: 770 + Math.sin(a) * r * 0.75 - 12, width: 24, height: 24,
            borderRadius: i % 2 ? 6 : "50%", background: cols[i % cols.length], opacity: t === 0 ? 0 : 1 - t, transform: `scale(${1 - t * 0.4}) rotate(${t * 160}deg)`,
          }} />
        );
      })}
    </>
  );
};

const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = pop(frame, fps, 4, 10);
  const btn = pop(frame, fps, 30, 9);
  const press = interpolate(frame, [66, 70, 76], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const url = interpolate(frame, [86, 104], [0, 1], { easing: OUT, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: C.white }}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 150 }}>
        <Img src={staticFile("img/logo.png")} style={{ width: 760, transform: `scale(${logo})` }} />
      </AbsoluteFill>
      <Burst at={68} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: 280 }}>
        <div style={{
          fontFamily: FONT, fontWeight: 900, fontSize: 70, letterSpacing: 3, color: "#fff", background: C.green, borderRadius: 40,
          padding: "46px 110px", boxShadow: `0 ${14 - press * 10}px 0 ${C.greenDark}`,
          transform: `scale(${btn * (1 - press * 0.03)}) translateY(${press * 10}px)`,
        }}>НАЧАТЬ УЧИТЬСЯ</div>
        <div style={{ marginTop: 70, fontFamily: FONT, fontWeight: 800, fontSize: 56, color: C.blueDark, opacity: url, transform: `translateY(${(1 - url) * 30}px)` }}>neolex.uz</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- Переход: цветная шторка ----------
export const Wipe: React.FC<{ at: number; color: string }> = ({ at, color }) => {
  const frame = useCurrentFrame();
  const y = interpolate(frame, [at - 12, at, at + 12], [112, 0, -112], { easing: Easing.bezier(0.65, 0, 0.35, 1), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (frame < at - 12 || frame > at + 12) return null;
  return <AbsoluteFill style={{ background: color, transform: `translateY(${y}%)`, borderRadius: y > 0 || y < 0 ? "50% 50% 0 0 / 8% 8% 0 0" : 0 }} />;
};

export const Intro: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const fadeEnd = interpolate(frame, [438, 450], [1, 0.0], { extrapolateLeft: "clamp" });
  void fadeEnd;
  return (
    <AbsoluteFill style={{ background: C.white }}>
      <Sequence from={0} durationInFrames={90}><Scene1 /></Sequence>
      <Sequence from={90} durationInFrames={120}><Scene2 /></Sequence>
      <Sequence from={210} durationInFrames={120}><Scene3 /></Sequence>
      <Sequence from={330} durationInFrames={120}><Scene4 /></Sequence>
      <Audio src={staticFile("audio/mix.wav")} />
      <Wipe at={90} color={C.blue} />
      <Wipe at={210} color={C.green} />
      <Wipe at={330} color={C.orange} />
    </AbsoluteFill>
  );
};
