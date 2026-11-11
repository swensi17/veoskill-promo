import React from "react";
import { AbsoluteFill, Easing, Img, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { RichBg } from "./Bg";

// Three animated beats for the veoskill film: directions, game types, counters. 60 fps.
const FONT = "NunitoB, Nunito, sans-serif";
const BLUE = "#1cb0f6";
const LIP = "#0f6fbf";
const INK = "#1f2a37";
const GREEN = "#58cc02";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const IO = Easing.bezier(0.65, 0, 0.35, 1);
const lin = (f: number, a: number, b: number, x: number, y: number, e = IO) => interpolate(f, [a, b], [x, y], { easing: e, ...clamp });

const useFonts = () => {
  const [h] = React.useState(() => delayRender("fonts"));
  React.useEffect(() => {
    const faces: Promise<unknown>[] = [];
    for (const w of [600, 700, 800, 900]) {
      for (const s of ["cyrillic", "latin"]) {
        const f = new FontFace("NunitoB", `url(${staticFile(`fonts/nunito-${s}-${w}-normal.woff2`)})`, { weight: String(w) });
        faces.push(f.load().then(() => document.fonts.add(f)));
      }
    }
    Promise.all(faces).then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};

const lip = (c: string, d: number, shadow = 0.28) => [...Array.from({ length: d }, (_, i) => `0 ${i + 1}px 0 ${c}`), `0 ${d + 10}px 26px rgba(10,40,90,${shadow})`].join(",");

// soft, slowly drifting light stage with a faint dot grid (depth layer)
const Stage: React.FC<{ tint?: string }> = () => <RichBg />;

// ================= A. Directions, one word at a time in the centre =================
const DIRS: [string, string, boolean][] = [
  ["Юриспруденция", "legal", true],
  ["Экономика", "economics", false],
  ["Медицина", "medical", false],
  ["Программирование", "it", false],
  ["Искусственный интеллект", "ai", false],
];
const RING = ["legal", "economics", "medical", "it", "ai", "dtm", "english", "math", "history", "biology"];
const STEP = 34; // frames per word after the first
export const Directions: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const first = 54; // the first word holds longer
  const idxAt = (fr: number) => (fr < first ? 0 : Math.min(DIRS.length - 1, 1 + Math.floor((fr - first) / STEP)));
  const startOf = (i: number) => (i === 0 ? 0 : first + (i - 1) * STEP);
  const endF = first + (DIRS.length - 1) * STEP;
  const outro = f >= endF + 8;
  return (
    <AbsoluteFill>
      <Stage tint={idxAt(f) === 0 ? "#dcffd0" : "#e3f4ff"} />
      <AbsoluteFill style={{ perspective: 1400 }}>
        {DIRS.map(([name, icon, ready], i) => {
          const s0 = startOf(i);
          const e0 = i === DIRS.length - 1 ? 1e9 : startOf(i + 1);
          if (f < s0 - 2 || f > e0 + 18 || outro) return null;
          const inK = spring({ frame: f - s0 - (i === 0 ? 0 : 9), fps, config: { damping: 15, stiffness: 150, mass: 0.8 } });
          const outK = lin(f, e0 - 2, e0 + 10, 0, 1, Easing.bezier(0.5, 0, 0.75, 0));
          const y = (1 - inK) * 220 - outK * 260;
          const rx = (1 - inK) * -60 + outK * 55;
          const blur = Math.abs(1 - inK) * 18 + outK * 16;
          const sc = 0.82 + inK * 0.18 - outK * 0.12;
          const isFirst = i === 0;
          return (
            <AbsoluteFill key={name} style={{ alignItems: "center", justifyContent: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26, transform: `translateY(${y}px) rotateX(${rx}deg) scale(${sc})`, opacity: Math.min(1, inK * 1.4) * (1 - outK), filter: blur > 0.4 ? `blur(${blur}px)` : undefined }}>
                <Img src={staticFile(`dom/${icon}.webp`)} style={{ width: isFirst ? 190 : 150, height: isFirst ? 190 : 150, objectFit: "contain", filter: "drop-shadow(0 18px 24px rgba(10,40,90,0.25))", transform: `rotate(${(1 - inK) * -18}deg)` }} />
                <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: isFirst ? 132 : name.length > 16 ? 92 : 112, color: isFirst ? GREEN : BLUE, textShadow: lip(isFirst ? "#3f8f02" : LIP, 9), letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>{name}</div>
              </div>
            </AbsoluteFill>
          );
        })}
      </AbsoluteFill>
      {/* progress rail of directions at the bottom */}
      {!outro ? (
        <div style={{ position: "absolute", bottom: 80, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 14 }}>
          {DIRS.map((_, i) => (
            <div key={i} style={{ width: i === idxAt(f) ? 54 : 14, height: 14, borderRadius: 7, background: i === 0 ? GREEN : i <= idxAt(f) ? BLUE : "#d3dee8", transition: "none" }} />
          ))}
        </div>
      ) : null}
      {/* outro: every icon flies into a ring around the count */}
      {outro ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          {RING.map((icon, i) => {
            const k = spring({ frame: f - endF - 8 - i * 2, fps, config: { damping: 14, stiffness: 130 } });
            const a = (i / RING.length) * Math.PI * 2 - Math.PI / 2 + (f - endF) * 0.006;
            const R = 330 * k;
            return <Img key={icon} src={staticFile(`dom/${icon}.webp`)} style={{ position: "absolute", width: 110, height: 110, objectFit: "contain", left: 960 - 55 + Math.cos(a) * R * 1.25, top: 540 - 55 + Math.sin(a) * R * 0.85, opacity: k, filter: `drop-shadow(0 12px 18px rgba(10,40,90,0.22))` }} />;
          })}
          <div style={{ textAlign: "center", fontFamily: FONT, transform: `scale(${spring({ frame: f - endF - 14, fps, config: { damping: 11, stiffness: 160 } })})` }}>
            <div style={{ fontWeight: 900, fontSize: 200, color: BLUE, textShadow: lip(LIP, 10), lineHeight: 1 }}>10</div>
            <div style={{ fontWeight: 900, fontSize: 56, color: INK, marginTop: 10 }}>направлений</div>
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

// ================= B. Game types on a turning 3D ring =================
const GAMES: [string, string][] = [
  ["Выбор ответа", "M5 12l4 4 10-10"],
  ["Соедини пары", "M4 7h6M14 7h6M4 17h6M14 17h6M10 7l4 10M10 17l4-10"],
  ["Истории", "M4 5h11a3 3 0 0 1 3 3v11H7a3 3 0 0 1-3-3zM8 10h6M8 14h4"],
  ["Свайпы", "M7 12h10M13 8l4 4-4 4M4 6v12"],
  ["На слух", "M4 10v4h4l5 4V6L8 10zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"],
];
export const GameRing: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const N = GAMES.length;
  // the ring steps one card at a time with an eased spin, holding briefly on each
  const per = 80;
  const stepIdx = Math.floor(f / per);
  const within = (f % per) / per;
  const eased = Easing.bezier(0.42, 0, 0.18, 1)(Math.min(1, within / 0.7));
  const rot = (stepIdx + eased) * (360 / N);
  const intro = spring({ frame: f, fps, config: { damping: 16, stiffness: 90 } });
  const front = ((Math.round(rot / (360 / N)) % N) + N) % N;
  return (
    <AbsoluteFill>
      <Stage />
      <div style={{ position: "absolute", top: 90, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 78, color: BLUE, textShadow: lip(LIP, 7) }}>
        Учись играя
      </div>
      <AbsoluteFill style={{ perspective: 1800, perspectiveOrigin: "50% 40%" }}>
        <div style={{ position: "absolute", left: 960, top: 600, transformStyle: "preserve-3d", transform: `translateZ(-380px) rotateX(-6deg) rotateY(${-rot}deg) scale(${0.7 + intro * 0.3})` }}>
          {GAMES.map(([name, path], i) => {
            const a = (i * 360) / N;
            const rel = (((a - rot) % 360) + 540) % 360 - 180; // -180..180, 0 = front
            const facing = Math.cos((rel * Math.PI) / 180);
            const isFront = i === front;
            return (
              <div
                key={name}
                style={{
                  position: "absolute",
                  left: -210,
                  top: -250,
                  width: 420,
                  height: 500,
                  borderRadius: 34,
                  transform: `rotateY(${a}deg) translateZ(620px)`,
                  background: isFront ? `linear-gradient(160deg, #ffffff, #eaf7ff)` : "rgba(255,255,255,0.86)",
                  border: isFront ? `4px solid ${BLUE}` : "2px solid #fff",
                  boxShadow: isFront ? `0 14px 0 ${LIP}, 0 40px 80px rgba(10,60,120,0.35)` : "0 8px 0 #d3e2ee, 0 24px 50px rgba(10,40,90,0.18)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 30,
                  backfaceVisibility: "hidden",
                  filter: facing < 0.6 ? `blur(${(0.6 - facing) * 7}px)` : undefined,
                  opacity: 0.35 + Math.max(0, facing) * 0.65,
                }}
              >
                <div style={{ width: 150, height: 150, borderRadius: 40, background: isFront ? BLUE : "#e6f4fd", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: isFront ? `0 8px 0 ${LIP}` : "none" }}>
                  <svg width="90" height="90" viewBox="0 0 24 24"><path d={path} fill="none" stroke={isFront ? "#fff" : BLUE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 40, color: INK, textAlign: "center", padding: "0 20px", lineHeight: 1.1 }}>{name}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", bottom: 26, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 30, color: "#8a98a6" }}>
        {String(front + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
      </div>
    </AbsoluteFill>
  );
};

// ================= C. Counters with rolling digits =================
const Roll: React.FC<{ value: number; at: number; size: number; color: string }> = ({ value, at, size, color }) => {
  const f = useCurrentFrame();
  const txt = value.toLocaleString("ru-RU").replace(/ /g, " ");
  const k = lin(f, at, at + 70, 0, 1, Easing.bezier(0.12, 0.8, 0.2, 1));
  const digits = [...txt];
  let di = 0;
  const nDigits = digits.filter((c) => /\d/.test(c)).length;
  return (
    <div style={{ display: "flex", fontFamily: FONT, fontWeight: 900, fontSize: size, color, lineHeight: 1, textShadow: lip("#0f6fbf", 6, 0.2), whiteSpace: "nowrap" }}>
      {digits.map((ch, i) => {
        if (!/\d/.test(ch)) return <span key={i} style={{ width: size * 0.22 }} />;
        const pos = di++;
        const d = Number(ch);
        // later digits spin more; all settle on their real value
        const turns = (nDigits - pos) * 10 + d;
        const shown = turns * k;
        const cur = Math.floor(shown) % 10;
        const frac = shown - Math.floor(shown);
        return (
          <span key={i} style={{ position: "relative", display: "inline-block", width: size * 0.62, height: size * 1.05, overflow: "hidden" }}>
            {[0, 1].map((o) => (
              <span key={o} style={{ position: "absolute", left: 0, right: 0, textAlign: "center", top: (o - frac) * size * 1.05, filter: k < 0.97 ? `blur(${Math.min(5, (1 - k) * 8)}px)` : undefined }}>
                {(cur + o) % 10}
              </span>
            ))}
          </span>
        );
      })}
    </div>
  );
};
const STATS: [number, string, string][] = [
  [50, "уроков", "lesson"],
  [1254, "заданий", "games"],
  [11, "видов игр", "kinds"],
];
export const Counters: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(120% 140% at ${30 + Math.sin(f / 70) * 8}% 0%, #6ad6ff 0%, ${BLUE} 40%, #1478d4 100%)` }} />
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.12) 1.6px, transparent 1.7px)", backgroundSize: "40px 40px", transform: `translateY(${-f * 0.3}px)` }} />
      <AbsoluteFill style={{ perspective: 1600, alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", gap: 56, transform: `rotateX(${lin(f, 0, 200, 8, 2)}deg) rotateY(${lin(f, 0, 200, -6, 4)}deg)` }}>
          {STATS.map(([v, label], i) => {
            const at = 8 + i * 12;
            const s = spring({ frame: f - at, fps, config: { damping: 13, stiffness: 140, mass: 0.9 } });
            const bar = lin(f, at + 30, at + 90, 0, 1, OUT);
            return (
              <div
                key={label}
                style={{
                  width: 470,
                  padding: "56px 30px 46px",
                  borderRadius: 40,
                  background: "linear-gradient(170deg, #ffffff 0%, #f0f8ff 100%)",
                  boxShadow: "0 16px 0 #a8d8f5, 0 50px 90px rgba(0,40,100,0.35)",
                  textAlign: "center",
                  transform: `translateY(${(1 - s) * 420}px) rotateZ(${(1 - s) * (i - 1) * 10}deg) rotateX(${(1 - s) * 40}deg)`,
                  opacity: Math.min(1, s * 1.6),
                  filter: s < 0.9 ? `blur(${(1 - s) * 10}px)` : undefined,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Roll value={v} at={at + 8} size={150} color={BLUE} />
                <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 44, color: INK, marginTop: 22 }}>{label}</div>
                <div style={{ marginTop: 28, width: 300, height: 12, borderRadius: 6, background: "#e2eef7", overflow: "hidden" }}>
                  <div style={{ width: `${bar * 100}%`, height: "100%", borderRadius: 6, background: `linear-gradient(90deg, ${BLUE}, ${GREEN})` }} />
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
