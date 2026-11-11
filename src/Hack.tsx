import React from "react";
import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, useFonts } from "./Intro";

// 120 BPM at 60 fps: one beat = 30 frames. Scenes and hits sit on beats.
const B = 30;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const IO = Easing.bezier(0.65, 0, 0.35, 1);
const OUTQ = Easing.bezier(0.16, 1, 0.3, 1);
const IN = Easing.bezier(0.7, 0, 0.84, 0);
const shot = (n: string) => staticFile(`hack/${n}.png`);
const lerp = (f: number, a: number, b: number, from: number, to: number, ease = IO) =>
  interpolate(f, [a, b], [from, to], { easing: ease, ...clamp });

// --- a screenshot as a physical card in 3D ---
const Card: React.FC<{
  src: string;
  w?: number;
  x?: number;
  y?: number;
  z?: number;
  rx?: number;
  ry?: number;
  rz?: number;
  blur?: number;
  opacity?: number;
}> = ({ src, w = 1150, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, blur = 0, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: "50%",
      top: "50%",
      width: w,
      height: w * 0.625,
      marginLeft: -w / 2,
      marginTop: (-w * 0.625) / 2,
      transform: `translate3d(${x}px, ${y}px, ${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`,
      borderRadius: 26,
      overflow: "hidden",
      background: "#fff",
      border: "6px solid #fff",
      boxShadow: "0 40px 90px rgba(28,72,120,0.28), 0 10px 26px rgba(28,72,120,0.16)",
      filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
      opacity,
    }}
  >
    <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
  </div>
);

// --- chunky site button tile (3D "lip" like the site's buttons) ---
const Tile: React.FC<{ color: string; dark: string; label: string; icon: string; style?: React.CSSProperties }> = ({ color, dark, label, icon, style }) => (
  <div
    style={{
      position: "absolute",
      display: "flex",
      alignItems: "center",
      gap: 22,
      padding: "26px 40px",
      borderRadius: 30,
      background: color,
      boxShadow: `0 12px 0 ${dark}, 0 30px 60px rgba(0,0,0,0.18)`,
      fontFamily: FONT,
      fontWeight: 900,
      fontSize: 64,
      color: "#fff",
      letterSpacing: "0.02em",
      textTransform: "uppercase",
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    <Img src={staticFile(`img/${icon}`)} style={{ width: 86, height: 86, objectFit: "contain" }} />
    {label}
  </div>
);

// --- word that types itself letter by letter with a spring ---
const Kinetic: React.FC<{ text: string; at: number; size: number; color: string; stagger?: number; style?: React.CSSProperties; outline?: boolean }> = ({
  text,
  at,
  size,
  color,
  stagger = 2,
  style,
  outline,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1, whiteSpace: "pre", ...style }}>
      {[...text].map((ch, i) => {
        const s = spring({ frame: f - at - i * stagger, fps, config: { damping: 12, stiffness: 220, mass: 0.6 } });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              color: outline ? "transparent" : color,
              WebkitTextStroke: outline ? `4px ${color}` : undefined,
              transform: `translateY(${(1 - s) * size * 0.55}px) scale(${0.6 + s * 0.4}) rotate(${(1 - s) * (i % 2 ? 8 : -8)}deg)`,
              opacity: Math.min(1, s * 1.6),
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

const Pill: React.FC<{ text: string; color: string; at: number; style?: React.CSSProperties }> = ({ text, color, at, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping: 11, stiffness: 260, mass: 0.5 } });
  return (
    <div
      style={{
        position: "absolute",
        padding: "16px 34px",
        borderRadius: 999,
        background: color,
        color: "#fff",
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 40,
        boxShadow: "0 8px 0 rgba(0,0,0,0.16), 0 18px 40px rgba(0,0,0,0.15)",
        transform: `scale(${s}) translateY(${(1 - s) * 40}px)`,
        opacity: Math.min(1, s * 2),
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {text}
    </div>
  );
};

// Soft site-coloured background with slow floating blobs (depth layer).
const Backdrop: React.FC<{ tint?: string; vivid?: [string, string] }> = ({ tint = C.mist, vivid }) => {
  const f = useCurrentFrame();
  const blob = (cx: number, cy: number, r: number, col: string, sp: number) => (
    <div
      style={{
        position: "absolute",
        left: cx + Math.sin(f / sp) * 60,
        top: cy + Math.cos(f / (sp * 1.3)) * 50,
        width: r,
        height: r,
        borderRadius: "50%",
        background: col,
        filter: "blur(80px)",
        opacity: 0.55,
      }}
    />
  );
  return (
    <AbsoluteFill style={{ background: vivid ? `radial-gradient(120% 120% at 20% 10%, ${vivid[0]} 0%, ${vivid[1]} 100%)` : `linear-gradient(160deg, #ffffff 0%, ${tint} 100%)`, overflow: "hidden" }}>
      {blob(-200, -150, 700, vivid ? "rgba(255,255,255,0.35)" : "#bfe9ff", 70)}
      {blob(1300, 600, 800, vivid ? "rgba(255,255,255,0.22)" : "#d7ffb8", 90)}
      {blob(900, -300, 500, vivid ? "rgba(255,255,255,0.18)" : "#ffe2b8", 60)}
    </AbsoluteFill>
  );
};

// Camera: perspective stage whose transform the scene drives.
const Stage: React.FC<{ cam: string; children: React.ReactNode }> = ({ cam, children }) => (
  <AbsoluteFill style={{ perspective: 1700, perspectiveOrigin: "50% 45%" }}>
    <AbsoluteFill style={{ transformStyle: "preserve-3d", transform: cam }}>{children}</AbsoluteFill>
  </AbsoluteFill>
);

// ---------- Scene 1: tiles collide into the logo (0-3 s) ----------
const S1: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tiles = [
    { label: "Уроки", color: C.green, dark: C.greenDark, icon: "icon_legal.png", from: [-1400, -260], to: [-430, -170], at: 0 },
    { label: "Игры", color: C.blue, dark: C.blueDark, icon: "icon_it.png", from: [1400, 0], to: [380, 0], at: B },
    { label: "Лига", color: C.orange, dark: C.orangeDark, icon: "icon_finance.png", from: [-1300, 300], to: [-300, 190], at: 2 * B },
  ];
  const collapse = lerp(f, 3 * B - 8, 3 * B + 2, 0, 1, IN);
  const logo = spring({ frame: f - 3 * B, fps, config: { damping: 10, stiffness: 140, mass: 0.8 } });
  const shine = lerp(f, 3 * B + 6, 3 * B + 34, -40, 140, IO);
  const camZ = lerp(f, 0, 6 * B, 0, 120, IO);
  return (
    <AbsoluteFill>
      <Backdrop />
      <Stage cam={`translateZ(${camZ}px) rotateZ(${lerp(f, 0, 6 * B, -1.5, 1)}deg)`}>
        {tiles.map((t, i) => {
          const s = spring({ frame: f - t.at, fps, config: { damping: 13, stiffness: 170, mass: 0.7 } });
          const x = interpolate(s, [0, 1], [t.from[0], t.to[0]]) * (1 - collapse);
          const y = interpolate(s, [0, 1], [t.from[1], t.to[1]]) * (1 - collapse);
          const vel = Math.abs(1 - s) * 22;
          return (
            <AbsoluteFill key={i} style={{ alignItems: "center", justifyContent: "center" }}>
              <Tile
                {...t}
                style={{
                  transform: `translate(${x}px, ${y}px) rotate(${(1 - s) * (i % 2 ? 14 : -14) + (i - 1) * 4 * (1 - collapse)}deg) scale(${1 - collapse * 0.9})`,
                  opacity: f < t.at ? 0 : 1 - collapse,
                  filter: vel > 0.5 ? `blur(${Math.min(14, vel)}px)` : undefined,
                }}
              />
            </AbsoluteFill>
          );
        })}
        {f >= 3 * B - 2 ? (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "relative", width: 1000, transform: `translateY(-90px) scale(${0.3 + logo * 0.7})`, opacity: Math.min(1, logo * 2) }}>
              <Img src={staticFile("hack/veoskill.svg")} style={{ width: "100%" }} />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `linear-gradient(105deg, transparent ${shine - 12}%, rgba(255,255,255,0.85) ${shine}%, transparent ${shine + 12}%)`,
                  WebkitMaskImage: `url(${staticFile("hack/veoskill.svg")})`,
                  WebkitMaskSize: "100% 100%",
                  mixBlendMode: "screen",
                }}
              />
            </div>
          </AbsoluteFill>
        ) : null}
        {/* burst ring on the collision */}
        {f >= 3 * B - 2 && f < 3 * B + 30 ? (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <div
              style={{
                width: 200,
                height: 200,
                borderRadius: "50%",
                border: `${lerp(f, 3 * B, 3 * B + 26, 24, 1)}px solid ${C.blue}`,
                transform: `translateY(-70px) scale(${lerp(f, 3 * B - 2, 3 * B + 28, 0.2, 9, OUTQ)})`,
                opacity: lerp(f, 3 * B + 8, 3 * B + 28, 0.8, 0),
              }}
            />
          </AbsoluteFill>
        ) : null}
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: "translateY(150px)" }}>
          <div style={{ display: "flex", gap: 28 }}>
            <Kinetic text="Право Узбекистана" at={4 * B} size={78} color={C.ink} stagger={1} />
          </div>
          <Kinetic text="играючи" at={5 * B} size={104} color={C.green} stagger={2} style={{ marginTop: 14 }} />
        </AbsoluteFill>
      </Stage>
    </AbsoluteFill>
  );
};

// ---------- Scene 2: lessons (3-6 s) ----------
const S2: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: f + 12, fps, config: { damping: 16, stiffness: 120, mass: 1 } });
  const swap = lerp(f, 3 * B, 3 * B + 18, 0, 1, IO); // second theory screen slides over
  const exit = lerp(f, 6 * B - 10, 6 * B, 0, 1, IN);
  return (
    <AbsoluteFill>
      <Backdrop vivid={["#7ee03a", C.greenDark]} />
      <Stage cam={`translateX(${-exit * 1600}px) rotateY(${lerp(f, 0, 6 * B, 6, -4)}deg)`}>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ transform: `translate3d(${lerp(f, 0, 6 * B, 220, -220)}px, -395px, -200px)` }}>
            <Kinetic text="УРОКИ" at={0} size={360} color="rgba(255,255,255,0.9)" outline stagger={3} />
          </div>
        </AbsoluteFill>
        <Card src={shot("lesson-theory")} w={1300} x={(1 - enter) * 1300 - 60} y={150} z={-80} ry={-16 + enter * 8} rz={(1 - enter) * 6} blur={(1 - enter) * 16 + swap * 4} opacity={1 - swap * 0.4} />
        <Card src={shot("lesson-theory2")} w={1300} x={lerp(f, 3 * B, 3 * B + 18, 1400, 120, OUTQ)} y={170} z={60} ry={-10} blur={(1 - swap) * 14 + exit * 20} />
      </Stage>
      <Pill text="Теория" color={C.blue} at={B + 6} style={{ left: 170, top: 760 }} />
      <Pill text="Пример" color={C.violet} at={2 * B + 6} style={{ left: 330, top: 860 }} />
      <Pill text="Практика" color={C.orange} at={4 * B + 6} style={{ left: 1420, top: 180 }} />
    </AbsoluteFill>
  );
};

// ---------- Scene 3: games and duels (6-9 s) ----------
const S3: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: f + 12, fps, config: { damping: 15, stiffness: 140 } });
  const flip = lerp(f, 3 * B - 6, 3 * B + 14, 0, 1, IO);
  const vs = spring({ frame: f - 3 * B, fps, config: { damping: 9, stiffness: 200, mass: 0.6 } });
  const exitZ = lerp(f, 6 * B - 12, 6 * B, 0, 1, IN);
  return (
    <AbsoluteFill>
      <Backdrop vivid={["#5fd0ff", C.blueDark]} />
      <Stage cam={`translateZ(${exitZ * 900}px) rotateX(${lerp(f, 0, 6 * B, 4, -3)}deg)`}>
        <Card src={shot("duels")} w={1240} x={interpolate(flip, [0, 1], [380, -120])} y={interpolate(flip, [0, 1], [-120, 30])} z={interpolate(flip, [0, 1], [-420, 120])} ry={14} blur={interpolate(flip, [0, 1], [6, 0])} opacity={a} />
        <Card src={shot("lesson-step")} w={1280} x={interpolate(flip, [0, 1], [-140, -520]) + (1 - a) * -1500} y={interpolate(flip, [0, 1], [40, 120])} z={interpolate(flip, [0, 1], [80, -480])} ry={-12} blur={interpolate(flip, [0, 1], [0, 7]) + (1 - a) * 18} />
      </Stage>
      <AbsoluteFill style={{ padding: "70px 110px", justifyContent: "flex-start" }}>
        <Kinetic text="ИГРЫ" at={0} size={180} color="#fff" stagger={3} />
      </AbsoluteFill>
      {f >= 3 * B ? (
        <AbsoluteFill style={{ alignItems: "flex-end", justifyContent: "flex-end", padding: "0 120px 90px 0" }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 110, color: "#fff", transform: `scale(${vs}) rotate(${(1 - vs) * -10}deg)`, textShadow: "0 8px 0 rgba(0,60,110,0.35)" }}>
            Дуэли 1×1
          </div>
        </AbsoluteFill>
      ) : null}
      {/* white flash on the swap beat */}
      <AbsoluteFill style={{ background: "#fff", opacity: lerp(f, 3 * B - 2, 3 * B + 10, 0.55, 0) * (f >= 3 * B - 2 ? 1 : 0) }} />
    </AbsoluteFill>
  );
};

// ---------- Scene 4: league (9-11.5 s) ----------
const S4: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: f + 12, fps, config: { damping: 14, stiffness: 150 } });
  const xp = Math.round(lerp(f, B, 3 * B, 0, 100, OUTQ));
  const chip = (i: number) => spring({ frame: f - B - i * 8, fps, config: { damping: 10, stiffness: 240, mass: 0.5 } });
  return (
    <AbsoluteFill>
      <Backdrop vivid={["#ffbd4d", C.orangeDark]} />
      <Stage cam={`rotateY(${lerp(f, 0, 5 * B, -8, 6)}deg) translateZ(${lerp(f, 0, 5 * B, -60, 80)}px)`}>
        <Card src={shot("stats")} w={1300} x={(1 - a) * 1400 + 200} y={50} ry={-14} blur={(1 - a) * 16} />
      </Stage>
      <AbsoluteFill style={{ padding: "70px 110px" }}>
        <Kinetic text="ЛИГА" at={0} size={180} color="#fff" stagger={3} />
      </AbsoluteFill>
      {[0, 1, 2].map((i) => {
        const s = chip(i);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 160 + i * 40,
              top: 380 + i * 150,
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 66,
              color: "#fff",
              background: [C.green, C.blue, C.violet][i],
              borderRadius: 26,
              padding: "14px 30px",
              boxShadow: "0 10px 0 rgba(0,0,0,0.15)",
              transform: `translateX(${(1 - s) * -300}px) scale(${s})`,
              opacity: Math.min(1, s * 2),
            }}
          >
            {["+10 XP", "Серия 🔥", "Серебро →"][i]}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 160, bottom: 60, fontFamily: FONT, fontWeight: 900, fontSize: 130, color: "#fff", textShadow: "0 8px 0 rgba(120,60,0,0.3)" }}>
        {xp} <span style={{ fontSize: 60 }}>XP</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Scene 5 + 6: wall of every section, then the logo (11.5-15 s) ----------
const WALL = ["cabinet", "games", "forum", "laws", "duels", "stats", "lesson-theory2", "shop", "modules"];
const LABELS = ["Законы", "Форум", "Материалы", "Дуэли"];
const S5: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pull = lerp(f, 0, 4 * B, 0, 1, OUTQ);
  const end = lerp(f, 4 * B, 4 * B + 20, 0, 1, IO);
  const logo = spring({ frame: f - 4 * B - 4, fps, config: { damping: 11, stiffness: 150, mass: 0.8 } });
  const btn = spring({ frame: f - 5 * B - 4, fps, config: { damping: 10, stiffness: 220, mass: 0.6 } });
  const label = Math.min(LABELS.length - 1, Math.floor(f / 24));
  return (
    <AbsoluteFill>
      <Backdrop />
      <Stage cam={`translateZ(${interpolate(pull, [0, 1], [700, -700])}px) rotateX(${interpolate(pull, [0, 1], [18, 26])}deg) rotateZ(${interpolate(pull, [0, 1], [-10, -16])}deg) translateY(${lerp(f, 0, 7 * B, 0, -260, IO)}px)`}>
        {WALL.map((n, i) => {
          const col = (i % 3) - 1;
          const row = Math.floor(i / 3) - 1;
          const d = Math.abs(col) + Math.abs(row);
          const s = spring({ frame: f - d * 4, fps, config: { damping: 15, stiffness: 160 } });
          return <Card key={n} src={shot(n)} w={880} x={col * 940} y={row * 600} z={(1 - s) * -900} opacity={s} blur={end * 9} />;
        })}
      </Stage>
      {f < 4 * B ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div
            key={label}
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 150,
              color: "#fff",
              background: [C.blue, C.green, C.violet, C.orange][label],
              padding: "18px 60px",
              borderRadius: 36,
              boxShadow: "0 12px 0 rgba(0,0,0,0.18), 0 30px 70px rgba(28,72,120,0.35)",
              transform: `scale(${spring({ frame: f - label * 24, fps, config: { damping: 9, stiffness: 260, mass: 0.5 } })})`,
            }}
          >
            {LABELS[label]}
          </div>
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{ background: "rgba(255,255,255,0.55)", opacity: end }} />
      {f >= 4 * B ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <Img src={staticFile("hack/veoskill.svg")} style={{ width: 960, transform: `translateY(-40px) scale(${0.4 + logo * 0.6})`, opacity: Math.min(1, logo * 2) }} />
          <div
            style={{
              marginTop: 40,
              padding: "22px 64px",
              borderRadius: 28,
              background: C.green,
              boxShadow: `0 10px 0 ${C.greenDark}`,
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 60,
              color: "#fff",
              letterSpacing: "0.04em",
              transform: `scale(${btn})`,
              opacity: Math.min(1, btn * 2),
            }}
          >
            neolex.uz
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------- timeline ----------
const SCENES: { from: number; dur: number; C: React.FC }[] = [
  { from: 0, dur: 6 * B, C: S1 },
  { from: 6 * B, dur: 6 * B, C: S2 },
  { from: 12 * B, dur: 6 * B, C: S3 },
  { from: 18 * B, dur: 5 * B, C: S4 },
  { from: 23 * B, dur: 7 * B, C: S5 },
];

export const Hack15: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      {SCENES.map(({ from, dur, C: Scene }, i) => {
        if (f < from - 1 || f >= from + dur + 1) return null;
        const local = f - from;
        // 6-frame cut: incoming scene punches in from a small blur
        const inBlur = i === 0 ? 0 : interpolate(local, [0, 6], [12, 0], clamp);
        return (
          <AbsoluteFill key={i} style={{ filter: inBlur > 0.3 ? `blur(${inBlur}px)` : undefined }}>
            <SceneClock from={from}>
              <Scene />
            </SceneClock>
          </AbsoluteFill>
        );
      })}
      <Audio src={staticFile("audio/hack15-mix.wav")} />
    </AbsoluteFill>
  );
};

// Gives each scene its own frame counter starting at 0.
const SceneClock: React.FC<{ from: number; children: React.ReactNode }> = ({ from, children }) => (
  <Sequence from={from} layout="none">
    {children}
  </Sequence>
);
