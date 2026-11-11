import React from "react";
import { AbsoluteFill, Audio, Easing, Img, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// Fast promo: flying app screens, 3D type in the site's chunky style, real game and law flows with a cursor,
// infographics with real numbers. 60 fps, 1800 frames.
const FONT = "NunitoP, Nunito, sans-serif";
const BLUE = "#1cb0f6";
const BLUE_D = "#1478d4";
const LIP = "#0f6fbf";
const INK = "#1f2a37";
const GREEN = "#58cc02";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const IO = Easing.bezier(0.65, 0, 0.35, 1);
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const lin = (f: number, a: number, b: number, x: number, y: number, e = IO) => interpolate(f, [a, b], [x, y], { easing: e, ...clamp });
const hd = (n: string) => staticFile(`hack/hd/${n}.png`);

const useFonts = () => {
  const [h] = React.useState(() => delayRender("fonts"));
  React.useEffect(() => {
    const faces: Promise<unknown>[] = [];
    for (const w of [400, 600, 700, 800, 900]) {
      for (const s of ["cyrillic", "latin"]) {
        const f = new FontFace("NunitoP", `url(${staticFile(`fonts/nunito-${s}-${w}-normal.woff2`)})`, { weight: String(w) });
        faces.push(f.load().then(() => document.fonts.add(f)));
      }
    }
    Promise.all(faces).then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};

// ---------- 3D type, like the site's chunky buttons: a face and a solid lip under it ----------
const lip = (color: string, depth: number) =>
  [...Array.from({ length: depth }, (_, i) => `0 ${i + 1}px 0 ${color}`), `0 ${depth + 8}px 22px rgba(10,40,90,0.28)`].join(",");

const Text3D: React.FC<{ text: string; at: number; size: number; face?: string; lipColor?: string; depth?: number; out?: number; stagger?: number; style?: React.CSSProperties }> = ({
  text,
  at,
  size,
  face = BLUE,
  lipColor = LIP,
  depth = 9,
  out,
  stagger = 2,
  style,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const gone = out === undefined ? 0 : lin(f, out, out + 10, 0, 1, Easing.in(Easing.cubic));
  return (
    <div style={{ display: "flex", justifyContent: "center", perspective: 900, fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.05, letterSpacing: "-0.01em", whiteSpace: "pre", ...style }}>
      {[...text].map((ch, i) => {
        const s = spring({ frame: f - at - i * stagger, fps, config: { damping: 12, stiffness: 210, mass: 0.6 } });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              color: face,
              textShadow: lip(lipColor, depth),
              transformOrigin: "50% 100%",
              transform: `translateY(${(1 - s) * size * 0.5 - gone * size * 0.4}px) rotateX(${(1 - s) * -85 + gone * 70}deg) scale(${0.7 + s * 0.3})`,
              opacity: Math.min(1, s * 1.8) * (1 - gone),
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

const Logo3D: React.FC<{ s: number; w: number; style?: React.CSSProperties }> = ({ s, w, style }) => (
  <Img
    src={staticFile("hack/veoskill.svg")}
    style={{
      width: w,
      filter: `${Array.from({ length: 7 }, () => `drop-shadow(0 1.3px 0 ${LIP})`).join(" ")} drop-shadow(0 16px 26px rgba(10,40,90,0.3))`,
      transform: `perspective(1200px) rotateX(${(1 - s) * 60}deg) scale(${0.6 + s * 0.4})`,
      opacity: Math.min(1, s * 1.6),
      ...style,
    }}
  />
);

// ---------- backgrounds ----------
const Light: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#f4f7fb", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: -260 + Math.sin(f / 90) * 90, top: -360, width: 1100, height: 1100, borderRadius: "50%", background: "radial-gradient(circle, rgba(28,176,246,0.18), transparent 65%)" }} />
      <div style={{ position: "absolute", right: -320, bottom: -420 + Math.cos(f / 110) * 80, width: 1200, height: 1200, borderRadius: "50%", background: "radial-gradient(circle, rgba(88,204,2,0.10), transparent 65%)" }} />
    </AbsoluteFill>
  );
};
const Blue: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ background: `radial-gradient(120% 140% at ${30 + Math.sin(f / 70) * 10}% 0%, #6ad6ff 0%, ${BLUE} 40%, ${BLUE_D} 100%)` }} />;
};

// ---------- app window (no zoom: the whole screen stays visible) ----------
const Win: React.FC<{ src: string; w?: number; y?: number; x?: number; rot?: number; s?: number; children?: React.ReactNode }> = ({ src, w = 1440, y = 40, x = 0, rot = 0, s = 1, children }) => {
  const h = w * 0.625;
  const k = w / 1280;
  return (
    <div
      style={{
        position: "absolute",
        left: 960 - w / 2 + x,
        top: 540 - h / 2 + y,
        width: w,
        height: h,
        borderRadius: 22,
        overflow: "hidden",
        background: "#fff",
        boxShadow: "0 50px 120px rgba(10,40,90,0.32), 0 0 0 10px rgba(255,255,255,0.5)",
        transform: `perspective(2400px) rotateX(${rot}deg) scale(${s})`,
        opacity: Math.min(1, s * 1.5),
      }}
    >
      <Img src={src} style={{ width: w, height: h }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1280, height: 800, transformOrigin: "0 0", transform: `scale(${k})` }}>{children}</div>
    </div>
  );
};

type Pt = [number, number, number];
const posAt = (path: Pt[], f: number): [number, number] => {
  if (f <= path[0][0]) return [path[0][1], path[0][2]];
  for (let i = 0; i < path.length - 1; i += 1) {
    const [a, ax, ay] = path[i];
    const [b, bx, by] = path[i + 1];
    if (f <= b) {
      const k = Easing.bezier(0.45, 0, 0.15, 1)((f - a) / Math.max(1, b - a));
      return [ax + (bx - ax) * k, ay + (by - ay) * k];
    }
  }
  const l = path[path.length - 1];
  return [l[1], l[2]];
};
const Cursor: React.FC<{ path: Pt[]; clicks: number[] }> = ({ path, clicks }) => {
  const f = useCurrentFrame();
  const [x, y] = posAt(path, f);
  const press = clicks.some((c) => f >= c && f < c + 8);
  return (
    <>
      {clicks.map((c) =>
        f >= c && f < c + 22 ? (
          <div key={c} style={{ position: "absolute", left: posAt(path, c)[0] - 26, top: posAt(path, c)[1] - 26, width: 52, height: 52, borderRadius: "50%", border: `3px solid ${BLUE}`, transform: `scale(${lin(f, c, c + 22, 0.3, 1.5, OUT)})`, opacity: lin(f, c, c + 22, 0.9, 0) }} />
        ) : null,
      )}
      <svg width="30" height="36" viewBox="0 0 24 28" style={{ position: "absolute", left: x - 3, top: y - 2, transform: `scale(${press ? 0.85 : 1})`, transformOrigin: "3px 2px", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))" }}>
        <path d="M2 1.5 L2 22 L7.3 17.2 L10.6 25 L14 23.6 L10.8 16 L18 16 Z" fill="#111" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </>
  );
};
const stateAt = (f: number, states: [number, string][]) => states.reduce((n, [t, s]) => (f >= t ? s : n), states[0][1]);

// Window that springs in from below on entry.
const useEnter = (at: number) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - at + 4, fps, config: { damping: 15, stiffness: 150 } });
};

// ---------- A. flying screens + problems + logo (0-390) ----------
const FLY = ["cabinet", "duels", "stats", "c0", "laws", "article", "forum", "m-ok", "l-reader", "materials", "home", "l-home", "c2", "m0"];
const Fly: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dist = f * 30 + (f > 290 ? (f - 290) ** 2 * 2.4 : 0);
  const logo = spring({ frame: f - 316, fps, config: { damping: 12, stiffness: 150, mass: 0.8 } });
  const n = Math.round(lin(f, 6, 70, 0, 1608, OUT));
  return (
    <AbsoluteFill>
      <Light />
      <AbsoluteFill style={{ perspective: 1100, perspectiveOrigin: "50% 50%" }}>
        {FLY.map((src, i) => {
          const lane = i % 4;
          const side = (lane - 1.5) * 2;
          const x = side * 470 + ((i * 137) % 160) - 80;
          const y = ((i * 211) % 3 - 1) * 330 + (lane % 2 ? 60 : -60);
          // each screen starts at its own depth and travels toward the camera, then wraps
          const zz = ((((i * 420 + dist) % 6000) + 6000) % 6000) - 5600;
          const fade = interpolate(zz, [-5600, -4200, 300, 800], [0, 1, 1, 0], clamp);
          const after = lin(f, 318, 340, 1, 0.12);
          return (
            <div
              key={src + i}
              style={{
                position: "absolute",
                left: 960 - 330 + x,
                top: 540 - 206 + y,
                width: 660,
                height: 412,
                borderRadius: 16,
                overflow: "hidden",
                transform: `translateZ(${zz}px) rotateY(${-side * 7}deg)`,
                opacity: fade * after,
                boxShadow: "0 30px 70px rgba(10,40,90,0.25)",
                filter: zz > 200 ? `blur(${Math.min(10, (zz - 200) / 50)}px)` : undefined,
              }}
            >
              <Img src={hd(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
            </div>
          );
        })}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(42% 30% at 50% 50%, rgba(244,247,251,0.92), rgba(244,247,251,0) 100%)" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        {f < 110 ? (
          <div style={{ textAlign: "center" }}>
            <Text3D text={`${n.toLocaleString("ru-RU")} законов`} at={6} size={150} stagger={0} out={100} />
          </div>
        ) : f < 200 ? (
          <Text3D text="кто их правда читал?" at={110} size={120} out={190} face={INK} lipColor="#9aa7b4" />
        ) : f < 305 ? (
          <Text3D text="а зубрить — скучно" at={200} size={120} out={296} face={INK} lipColor="#9aa7b4" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Logo3D s={logo} w={980} />
            <div style={{ marginTop: 40 }}>
              <Text3D text="право — играя" at={334} size={84} face={GREEN} lipColor="#3f8f02" depth={7} stagger={1} />
            </div>
          </div>
        )}
      </AbsoluteFill>
      {/* white flash as the logo lands */}
      <AbsoluteFill style={{ background: "#fff", opacity: f >= 314 && f < 334 ? lin(f, 314, 334, 0.8, 0) : 0 }} />
    </AbsoluteFill>
  );
};

// ---------- B. games (390-900) ----------
const RIGHT: [number, number] = [654, 520];
const CHECK: [number, number] = [681, 756];
const PAIRS: [number, number][][] = [
  [[485, 394], [795, 308]],
  [[485, 480], [795, 480]],
  [[485, 308], [795, 394]],
];
const Games: React.FC = () => {
  const f = useCurrentFrame();
  const title = f < 456;
  const e1 = useEnter(456);
  const e2 = useEnter(600);
  const choice = f < 600;
  const cState = stateAt(f, [[0, "c0"], [520, "c1"], [560, "c2"]]);
  const mState = stateAt(f, [[0, "m0"], [628, "m1"], [646, "m2"], [664, "m3"], [682, "m4"], [700, "m5"], [718, "m6"], [744, "m-ok"]]);
  return (
    <AbsoluteFill>
      <Blue />
      {title ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <Text3D text="Учись играя" at={392} size={190} face="#fff" lipColor="#9fd8f7" depth={10} out={446} />
        </AbsoluteFill>
      ) : (
        <>
          <div style={{ position: "absolute", top: 44, width: "100%" }}>
            {choice ? (
              <Text3D text="Выбирай ответ" at={458} size={64} face="#fff" lipColor="#8fd0f5" depth={5} stagger={1} out={592} />
            ) : (
              <Text3D text="Соединяй пары" at={602} size={64} face="#fff" lipColor="#8fd0f5" depth={5} stagger={1} out={772} />
            )}
          </div>
          {choice ? (
            <Win src={hd(cState)} w={1300} y={70} s={e1}>
              <Cursor path={[[456, 1120, 760], [506, RIGHT[0], RIGHT[1]], [524, RIGHT[0], RIGHT[1]], [550, CHECK[0], CHECK[1]]]} clicks={[514, 556]} />
            </Win>
          ) : f < 780 ? (
            <Win src={hd(mState)} w={1300} y={70} s={e2}>
              <Cursor
                path={[
                  [600, 900, 700],
                  [620, PAIRS[0][0][0], PAIRS[0][0][1]],
                  [640, PAIRS[0][1][0], PAIRS[0][1][1]],
                  [658, PAIRS[1][0][0], PAIRS[1][0][1]],
                  [676, PAIRS[1][1][0], PAIRS[1][1][1]],
                  [694, PAIRS[2][0][0], PAIRS[2][0][1]],
                  [712, PAIRS[2][1][0], PAIRS[2][1][1]],
                  [736, CHECK[0], CHECK[1]],
                ]}
                clicks={[624, 643, 661, 679, 697, 715, 740]}
              />
            </Win>
          ) : (
            <GameStats />
          )}
        </>
      )}
    </AbsoluteFill>
  );
};

// infographic: counters + a bar chart of the game types in the module
const TYPES: [string, number][] = [
  ["Выбор ответа", 506],
  ["Найди миф", 100],
  ["Собери фразу", 100],
  ["Услышь слово", 100],
  ["Истории", 100],
  ["Свайпы", 50],
  ["Сортировка", 50],
];
const Count: React.FC<{ to: number; at: number; label: string; x: number }> = ({ to, at, label, x }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping: 14, stiffness: 170 } });
  const n = Math.round(lin(f, at, at + 40, 0, to, OUT));
  return (
    <div style={{ position: "absolute", left: x, top: 230, width: 400, padding: "34px 30px", borderRadius: 30, background: "#fff", boxShadow: `0 10px 0 #cfe6f7, 0 30px 60px rgba(10,40,90,0.25)`, transform: `translateY(${(1 - s) * 120}px) rotate(${(1 - s) * 6}deg)`, opacity: s, textAlign: "center", fontFamily: FONT }}>
      <div style={{ fontSize: 110, fontWeight: 900, color: BLUE, textShadow: lip("#bfe4fb", 5), lineHeight: 1 }}>{n.toLocaleString("ru-RU")}</div>
      <div style={{ fontSize: 34, fontWeight: 700, color: INK, marginTop: 18 }}>{label}</div>
    </div>
  );
};
const GameStats: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Count to={50} at={782} label="уроков" x={210} />
      <Count to={1254} at={792} label="заданий" x={760} />
      <Count to={11} at={802} label="видов игр" x={1310} />
      <div style={{ position: "absolute", left: 260, top: 560, width: 1400, display: "flex", alignItems: "flex-end", gap: 26, height: 300 }}>
        {TYPES.map(([label, v], i) => {
          const h = lin(f, 820 + i * 4, 860 + i * 4, 0, (v / 506) * 240 + 26, OUT);
          return (
            <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{ width: "100%", height: h, borderRadius: 14, background: i === 0 ? "#fff" : "rgba(255,255,255,0.55)", boxShadow: i === 0 ? "0 8px 0 #9fd8f7" : undefined }} />
              <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 24, color: "#fff", opacity: lin(f, 840 + i * 4, 856 + i * 4, 0, 1), whiteSpace: "nowrap" }}>{label}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- C. laws (900-1470) ----------
const TILE: [number, number] = [410, 292];
const SEL: [number, number, number] = [421, 937, 358]; // x1, x2, y of the selected line
const YELLOW: [number, number] = [527, 275];
const NOTE: [number, number] = [514, 533];
const Laws: React.FC = () => {
  const f = useCurrentFrame();
  const e = useEnter(962);
  const title = f < 960;
  const page = stateAt(f, [[0, "l-home"], [1032, "l-reader"], [1112, "l-select"], [1150, "l-marked"], [1196, "l-note"], [1236, "l-note2"]]);
  const caption = f < 1032 ? "Все законы — в одном месте" : f < 1196 ? "Выделяй главное" : "Пиши заметки";
  const capAt = f < 1032 ? 964 : f < 1196 ? 1034 : 1198;
  return (
    <AbsoluteFill>
      {title ? (
        <>
          <Light />
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 10 }}>
            <Text3D text="1 608 законов" at={902} size={150} out={950} />
            <Text3D text="и все понятны" at={914} size={90} face={INK} lipColor="#9aa7b4" depth={6} out={950} />
          </AbsoluteFill>
        </>
      ) : f < 1290 ? (
        <>
          <Blue />
          <div style={{ position: "absolute", top: 44, width: "100%" }}>
            <Text3D key={caption} text={caption} at={capAt} size={60} face="#fff" lipColor="#8fd0f5" depth={5} stagger={1} />
          </div>
          <Win src={hd(page)} w={1300} y={70} s={e}>
            {/* selection sweep before the menu appears */}
            {page === "l-reader" && f > 1080 ? (
              <div style={{ position: "absolute", left: SEL[0], top: SEL[2] - 10, height: 22, width: lin(f, 1084, 1108, 0, SEL[1] - SEL[0]), background: "rgba(28,176,246,0.25)" }} />
            ) : null}
            <Cursor
              path={[
                [962, 1000, 600],
                [1004, TILE[0], TILE[1]],
                [1060, TILE[0], TILE[1]],
                [1082, SEL[0], SEL[2]],
                [1108, SEL[1], SEL[2]],
                [1136, YELLOW[0], YELLOW[1]],
                [1170, 760, 600],
                [1188, NOTE[0], NOTE[1]],
              ]}
              clicks={[1010, 1084, 1142, 1192]}
            />
          </Win>
        </>
      ) : (
        <Mantra />
      )}
    </AbsoluteFill>
  );
};

// Save. Remember. Repeat. One word at a time, each with its own little icon.
const WORDS: [string, string][] = [
  ["Сохраняй", "M6 3h12v18l-6-4-6 4z"],
  ["Запоминай", "M12 3a6 6 0 0 0-6 6c0 2.5 1.6 3.8 2.6 5 .6.7.9 1.4.9 2.3V18h5v-1.7c0-.9.3-1.6.9-2.3 1-1.2 2.6-2.5 2.6-5a6 6 0 0 0-6-6zM9.5 20.5h5"],
  ["Повторяй", "M4 12a8 8 0 0 1 13.7-5.6L20 9M20 4v5h-5M20 12a8 8 0 0 1-13.7 5.6L4 15M4 20v-5h5"],
];
const Mantra: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const i = Math.min(2, Math.floor((f - 1290) / 60));
  const at = 1290 + i * 60;
  const s = spring({ frame: f - at, fps, config: { damping: 11, stiffness: 220, mass: 0.6 } });
  return (
    <AbsoluteFill>
      <Light />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 30 }}>
        <svg width="150" height="150" viewBox="0 0 24 24" style={{ transform: `scale(${s}) rotate(${(1 - s) * -30}deg)`, filter: `drop-shadow(0 6px 0 ${LIP})` }}>
          <path d={WORDS[i][1]} fill="none" stroke={BLUE} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <Text3D key={i} text={`${WORDS[i][0]}.`} at={at} size={170} stagger={2} />
        <div style={{ display: "flex", gap: 14 }}>
          {WORDS.map((_, k) => (
            <div key={k} style={{ width: k === i ? 46 : 14, height: 14, borderRadius: 7, background: k <= i ? BLUE : "#cfdbe6" }} />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- D. law numbers + end (1470-1800) ----------
const End: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < 1590) {
    const cards: [number, string, number][] = [
      [1608, "законов", 1472],
      [21, "кодекс", 1482],
      [3, "языка", 1492],
    ];
    return (
      <AbsoluteFill>
        <Blue />
        <div style={{ position: "absolute", top: 70, width: "100%" }}>
          <Text3D text="Вся база законов Узбекистана" at={1474} size={64} face="#fff" lipColor="#8fd0f5" depth={5} stagger={1} />
        </div>
        {cards.map(([to, label, at], k) => (
          <Count key={label} to={to} at={at} label={label} x={210 + k * 550} />
        ))}
        {/* language chips under the cards */}
        <div style={{ position: "absolute", top: 640, width: "100%", display: "flex", justifyContent: "center", gap: 24 }}>
          {["Русский", "O‘zbekcha", "English"].map((t, k) => {
            const s = spring({ frame: f - 1520 - k * 6, fps, config: { damping: 12, stiffness: 220 } });
            return (
              <div key={t} style={{ padding: "16px 40px", borderRadius: 999, background: "rgba(255,255,255,0.18)", border: "2px solid rgba(255,255,255,0.6)", color: "#fff", fontFamily: FONT, fontWeight: 800, fontSize: 38, transform: `scale(${s})`, opacity: s }}>
                {t}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    );
  }
  const s = spring({ frame: f - 1592, fps, config: { damping: 12, stiffness: 140, mass: 0.8 } });
  const b = spring({ frame: f - 1640, fps, config: { damping: 12, stiffness: 200 } });
  const press = f >= 1712 && f < 1722 ? 0.93 : 1;
  const [cx, cy] = posAt([[1664, 1500, 1000], [1708, 960, 790]], f);
  return (
    <AbsoluteFill>
      <Light />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Logo3D s={s} w={860} style={{ marginTop: -170 }} />
        <div style={{ marginTop: 34 }}>
          <Text3D text="Право Узбекистана — играя" at={1612} size={62} face={INK} lipColor="#b3c0cc" depth={5} stagger={1} />
        </div>
        <div style={{ marginTop: 50, padding: "24px 80px", borderRadius: 20, background: GREEN, boxShadow: "0 10px 0 #46a302", color: "#fff", fontFamily: FONT, fontWeight: 900, fontSize: 48, letterSpacing: "0.04em", transform: `scale(${b * press})`, opacity: b }}>
          neolex.uz
        </div>
      </AbsoluteFill>
      {f > 1660 ? (
        <svg width="34" height="40" viewBox="0 0 24 28" style={{ position: "absolute", left: cx - 3, top: cy - 2, opacity: lin(f, 1660, 1670, 0, 1), transform: `scale(${press < 1 ? 0.86 : 1})`, filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))" }}>
          <path d="M2 1.5 L2 22 L7.3 17.2 L10.6 25 L14 23.6 L10.8 16 L18 16 Z" fill="#111" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      ) : null}
      {f >= 1714 && f < 1750 ? (
        <div style={{ position: "absolute", left: 960, top: 790 }}>
          {Array.from({ length: 18 }, (_, k) => {
            const a = (k / 18) * Math.PI * 2;
            const d = lin(f, 1714, 1750, 20, 210, OUT);
            return <div key={k} style={{ position: "absolute", left: Math.cos(a) * d * 1.6, top: Math.sin(a) * d * 0.8 - lin(f, 1714, 1750, 0, -40), width: 10, height: 10, borderRadius: 3, background: [BLUE, GREEN, "#ffc800"][k % 3], transform: `rotate(${k * 40 + f * 6}deg)`, opacity: lin(f, 1732, 1750, 1, 0) }} />;
          })}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const SCENES: { from: number; to: number; C: React.FC }[] = [
  { from: 0, to: 390, C: Fly },
  { from: 390, to: 900, C: Games },
  { from: 900, to: 1470, C: Laws },
  { from: 1470, to: 1800, C: End },
];

export const Promo30: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const cur = SCENES.find((s) => f >= s.from && f < s.to) ?? SCENES[SCENES.length - 1];
  const local = f - cur.from;
  const settle = cur.from === 0 ? 0 : lin(local, 0, 8, 1, 0, OUT);
  return (
    <AbsoluteFill style={{ background: "#f4f7fb" }}>
      <AbsoluteFill style={{ filter: settle > 0.02 ? `blur(${settle * 12}px)` : undefined, transform: `scale(${1 + settle * 0.04})` }}>
        <cur.C />
      </AbsoluteFill>
      <Audio src={staticFile("audio/promo-mix.wav")} />
    </AbsoluteFill>
  );
};
