import React from "react";
import { AbsoluteFill, Audio, Easing, Img, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// Explainer in the manner of the "Courses" reference: near-white stage, one blue accent, light type,
// a real UI window, a cursor that actually plays a lesson game and searches a law. 60 fps.
const FONT = "NunitoX, Nunito, sans-serif";
const BLUE = "#1cb0f6";
const BLUE_D = "#1478d4";
const INK = "#1f2a37";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const IO = Easing.bezier(0.65, 0, 0.35, 1);
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const hd = (n: string) => staticFile(`hack/hd/${n}.png`);
const lin = (f: number, a: number, b: number, x: number, y: number, e = IO) => interpolate(f, [a, b], [x, y], { easing: e, ...clamp });

const useFonts = () => {
  const [h] = React.useState(() => delayRender("fonts"));
  React.useEffect(() => {
    const faces: Promise<unknown>[] = [];
    for (const w of [300, 400, 500, 600, 700, 800, 900]) {
      for (const s of ["cyrillic", "latin"]) {
        const f = new FontFace("NunitoX", `url(${staticFile(`fonts/nunito-${s}-${w}-normal.woff2`)})`, { weight: String(w) });
        faces.push(f.load().then(() => document.fonts.add(f)));
      }
    }
    Promise.all(faces).then(() => continueRender(h)).catch(() => continueRender(h));
  }, [h]);
};

// ---------- stage ----------
const Light: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#f6f8fc", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: -300 + Math.sin(f / 120) * 80, top: -380, width: 1100, height: 1100, borderRadius: "50%", background: "radial-gradient(circle, rgba(28,176,246,0.16), transparent 65%)" }} />
      <div style={{ position: "absolute", right: -360, bottom: -460 + Math.cos(f / 140) * 70, width: 1200, height: 1200, borderRadius: "50%", background: "radial-gradient(circle, rgba(122,140,255,0.13), transparent 65%)" }} />
    </AbsoluteFill>
  );
};
const Blue: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 140% at ${30 + Math.sin(f / 90) * 8}% 0%, #5fd0ff 0%, ${BLUE} 38%, ${BLUE_D} 100%)` }} />
  );
};

// ---------- type ----------
type W = { t: string; at: number; accent?: boolean };
const Words: React.FC<{ words: W[]; size: number; weight?: number; out?: number; style?: React.CSSProperties; color?: string }> = ({ words, size, weight = 400, out, style, color = INK }) => {
  const f = useCurrentFrame();
  const fade = out === undefined ? 1 : lin(f, out, out + 14, 1, 0);
  const lift = out === undefined ? 0 : lin(f, out, out + 14, 0, -30);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: `0 ${size * 0.28}px`, fontFamily: FONT, fontSize: size, fontWeight: weight, lineHeight: 1.15, letterSpacing: "-0.02em", opacity: fade, transform: `translateY(${lift}px)`, ...style }}>
      {words.map((w, i) => {
        const k = lin(f, w.at, w.at + 16, 0, 1, OUT);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: k,
              filter: `blur(${(1 - k) * 14}px)`,
              transform: `translateY(${(1 - k) * 26}px)`,
              color: w.accent ? "transparent" : color,
              backgroundImage: w.accent ? `linear-gradient(100deg, ${BLUE} 0%, #6d7cff 100%)` : undefined,
              WebkitBackgroundClip: w.accent ? "text" : undefined,
              backgroundClip: w.accent ? "text" : undefined,
            }}
          >
            {w.t}
          </span>
        );
      })}
    </div>
  );
};
const Typed: React.FC<{ text: string; at: number; cps?: number; size: number; color?: string; weight?: number; caret?: boolean; accentFrom?: number }> = ({
  text,
  at,
  cps = 26,
  size,
  color = INK,
  weight = 400,
  caret = true,
  accentFrom,
}) => {
  const f = useCurrentFrame();
  const n = Math.max(0, Math.min(text.length, Math.floor(((f - at) / 60) * cps)));
  const blink = Math.floor(f / 18) % 2 === 0 || n < text.length;
  const shown = text.slice(0, n);
  const cut = accentFrom ?? text.length;
  return (
    <div style={{ fontFamily: FONT, fontSize: size, fontWeight: weight, color, letterSpacing: "-0.02em", whiteSpace: "pre" }}>
      <span>{shown.slice(0, cut)}</span>
      <span style={{ backgroundImage: `linear-gradient(100deg, ${BLUE}, #6d7cff)`, WebkitBackgroundClip: "text", color: "transparent" }}>{shown.slice(cut)}</span>
      {caret && f >= at ? <span style={{ display: "inline-block", width: Math.max(3, size * 0.05), height: size * 0.9, background: BLUE, marginLeft: 6, verticalAlign: "-0.12em", opacity: blink ? 1 : 0 }} /> : null}
    </div>
  );
};

// ---------- UI window with a camera on it ----------
// css: the captured page is 1280x800 css px (2x pixels). focus/zoom are in css px of that page.
const Win: React.FC<{ src: string; w: number; x?: number; y?: number; zoom?: number; fx?: number; fy?: number; tilt?: number; children?: React.ReactNode; opacity?: number; blur?: number }> = ({
  src,
  w,
  x = 0,
  y = 0,
  zoom = 1,
  fx = 640,
  fy = 400,
  tilt = 0,
  children,
  opacity = 1,
  blur = 0,
}) => {
  const h = w * 0.625;
  const s = w / 1280;
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
        boxShadow: "0 50px 120px rgba(10,40,90,0.30), 0 0 0 10px rgba(255,255,255,0.55)",
        transform: `perspective(2200px) rotateX(${tilt}deg)`,
        opacity,
        filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
      }}
    >
      <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, transformOrigin: `${fx * s}px ${fy * s}px`, transform: `scale(${zoom})` }}>
        <Img src={src} style={{ width: w, height: h }} />
        <div style={{ position: "absolute", left: 0, top: 0, width: 1280, height: 800, transformOrigin: "0 0", transform: `scale(${s})` }}>{children}</div>
      </div>
    </div>
  );
};

// Cursor in page css coordinates (inside Win children), with click pulses.
type Pt = [number, number, number]; // frame, x, y
const Cursor: React.FC<{ path: Pt[]; clicks: number[] }> = ({ path, clicks }) => {
  const f = useCurrentFrame();
  let x = path[0][1];
  let y = path[0][2];
  for (let i = 0; i < path.length - 1; i += 1) {
    const [a, ax, ay] = path[i];
    const [b, bx, by] = path[i + 1];
    if (f >= a && f <= b) {
      const k = Easing.bezier(0.45, 0, 0.15, 1)((f - a) / Math.max(1, b - a));
      x = ax + (bx - ax) * k;
      y = ay + (by - ay) * k;
    } else if (f > b) {
      x = bx;
      y = by;
    }
  }
  const press = clicks.reduce((m, c) => Math.max(m, f >= c && f < c + 10 ? 1 - Math.abs(f - c - 4) / 6 : 0), 0);
  return (
    <>
      {clicks.map((c) =>
        f >= c && f < c + 26 ? (
          <div
            key={c}
            style={{
              position: "absolute",
              left: pointAt(path, c)[0] - 30,
              top: pointAt(path, c)[1] - 30,
              width: 60,
              height: 60,
              borderRadius: "50%",
              border: `3px solid ${BLUE}`,
              transform: `scale(${lin(f, c, c + 26, 0.3, 1.6, OUT)})`,
              opacity: lin(f, c, c + 26, 0.9, 0),
            }}
          />
        ) : null,
      )}
      <svg width="34" height="40" viewBox="0 0 24 28" style={{ position: "absolute", left: x - 3, top: y - 2, transform: `scale(${1 - press * 0.16})`, transformOrigin: "3px 2px", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))" }}>
        <path d="M2 1.5 L2 22 L7.3 17.2 L10.6 25 L14 23.6 L10.8 16 L18 16 Z" fill="#111" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </>
  );
};
const pointAt = (path: Pt[], fr: number): [number, number] => {
  let p: [number, number] = [path[0][1], path[0][2]];
  for (const [t, x, y] of path) if (t <= fr) p = [x, y];
  return p;
};

// picks the screenshot state for the frame: [[fromFrame, name], ...]
const stateAt = (f: number, states: [number, string][]) => {
  let n = states[0][1];
  for (const [t, s] of states) if (f >= t) n = s;
  return n;
};

// ---------- scenes (frame numbers are global) ----------
const Hook: React.FC = () => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
    <Words size={120} weight={300} out={136} words={[{ t: "Учить", at: 8 }, { t: "право", at: 22 }, { t: "—", at: 40 }, { t: "сложно?", at: 62, accent: true }]} />
  </AbsoluteFill>
);

const Pain: React.FC = () => {
  const f = useCurrentFrame();
  const L = (t: string, at: number, accent: string) => (
    <Words size={86} weight={300} out={312} words={[{ t, at }, { t: accent, at: at + 10, accent: true }]} />
  );
  return (
    <AbsoluteFill>
      {/* drifting real fragments of the law pages, out of focus */}
      <div style={{ position: "absolute", left: lin(f, 150, 330, -120, -40), top: 60, width: 700, height: 300, overflow: "hidden", borderRadius: 18, opacity: 0.55, filter: "blur(3px)", boxShadow: "0 20px 60px rgba(10,40,90,0.12)" }}>
        <Img src={hd("article")} style={{ width: 1400, marginLeft: -520, marginTop: -150 }} />
      </div>
      <div style={{ position: "absolute", right: lin(f, 150, 330, -140, -40), bottom: 50, width: 760, height: 320, overflow: "hidden", borderRadius: 18, opacity: 0.55, filter: "blur(3px)", boxShadow: "0 20px 60px rgba(10,40,90,0.12)" }}>
        <Img src={hd("laws")} style={{ width: 1400, marginTop: -60 }} />
      </div>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 6 }}>
        {L("Тысячи", 158, "статей.")}
        {L("Сухой", 200, "язык.")}
        {L("Ноль", 242, "практики.")}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const LogoScene: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - 336, fps, config: { damping: 18, stiffness: 120 } });
  const glow = lin(f, 336, 380, 0, 1, OUT) * lin(f, 470, 505, 1, 0);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", width: 1000, height: 400, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(28,176,246,0.25), transparent)", opacity: glow, transform: `scale(${0.8 + s * 0.3})` }} />
      <Img src={staticFile("hack/veoskill.svg")} style={{ width: 760, transform: `translateY(-50px) scale(${0.86 + s * 0.14})`, opacity: s, filter: `blur(${(1 - s) * 16}px)` }} />
      <div style={{ position: "absolute", top: 600, opacity: lin(f, 488, 505, 1, 0) }}>
        <Typed text="учим право играючи" at={384} size={58} weight={400} accentFrom={11} caret />
      </div>
    </AbsoluteFill>
  );
};

const Cabinet: React.FC = () => {
  const f = useCurrentFrame();
  const k = lin(f, 510, 560, 0, 1, OUT);
  return (
    <AbsoluteFill>
      <Blue />
      <div style={{ position: "absolute", top: 60, width: "100%", display: "flex", justifyContent: "center" }}>
        <Words size={54} weight={400} color="#fff" words={[{ t: "Короткие", at: 520 }, { t: "уроки", at: 528 }, { t: "шаг", at: 536 }, { t: "за", at: 541 }, { t: "шагом", at: 546 }]} />
      </div>
      <Win src={hd("cabinet")} w={1360} y={lin(f, 510, 560, 300, 70, OUT)} tilt={lin(f, 510, 600, 10, 2)} zoom={lin(f, 520, 600, 1, 1.08)} fx={700} fy={330} opacity={k} />
    </AbsoluteFill>
  );
};

// Playthrough: choice game, then pairs. Coordinates are page css px (1280x800).
const RIGHT: [number, number] = [654, 520];
const CHECK: [number, number] = [681, 756];
const PAIRS: [number, number][][] = [
  [[485, 394], [795, 308]],
  [[485, 480], [795, 480]],
  [[485, 308], [795, 394]],
];
const Play: React.FC = () => {
  const f = useCurrentFrame();
  const choice = f < 840;
  const enter = lin(f, 600, 640, 0, 1, OUT);
  const swap = lin(f, 830, 850, 0, 1, IO);
  const zoomC = lin(f, 610, 680, 1, 1.32) * lin(f, 764, 792, 1, 1 / 1.32);
  const fyC = lin(f, 610, 680, 400, 430);
  const choiceState = stateAt(f, [[0, "c0"], [708, "c1"], [768, "c2"]]);
  const memState = stateAt(f, [[0, "m0"], [880, "m1"], [910, "m2"], [940, "m3"], [970, "m4"], [1000, "m5"], [1030, "m6"], [1068, "m-ok"]]);
  const memZoom = lin(f, 845, 880, 1.2, 1.4) * lin(f, 1058, 1088, 1, 1 / 1.4);
  return (
    <AbsoluteFill>
      <Blue />
      <div style={{ position: "absolute", top: 54, width: "100%", display: "flex", justifyContent: "center" }}>
        {choice ? (
          <Words size={54} color="#fff" out={826} words={[{ t: "Выбирайте", at: 606 }, { t: "ответ", at: 614 }]} />
        ) : (
          <Words size={54} color="#fff" words={[{ t: "Соединяйте", at: 846 }, { t: "пары", at: 854 }]} />
        )}
      </div>
      {choice ? (
        <Win src={hd(choiceState)} w={1360} y={lin(f, 600, 640, 260, 60, OUT)} zoom={zoomC} fx={660} fy={fyC} opacity={enter * (1 - swap)}>
          <Cursor
            path={[
              [600, 1150, 760],
              [690, RIGHT[0], RIGHT[1]],
              [712, RIGHT[0], RIGHT[1]],
              [752, CHECK[0], CHECK[1]],
            ]}
            clicks={[700, 760]}
          />
        </Win>
      ) : (
        <Win src={hd(memState)} w={1360} y={60} zoom={memZoom} fx={660} fy={430} opacity={lin(f, 836, 856, 0, 1)}>
          <Cursor
            path={[
              [846, 900, 700],
              [872, PAIRS[0][0][0], PAIRS[0][0][1]],
              [900, PAIRS[0][1][0], PAIRS[0][1][1]],
              [930, PAIRS[1][0][0], PAIRS[1][0][1]],
              [960, PAIRS[1][1][0], PAIRS[1][1][1]],
              [990, PAIRS[2][0][0], PAIRS[2][0][1]],
              [1020, PAIRS[2][1][0], PAIRS[2][1][1]],
              [1056, CHECK[0], CHECK[1]],
            ]}
            clicks={[877, 907, 937, 967, 997, 1027, 1063]}
          />
        </Win>
      )}
    </AbsoluteFill>
  );
};

// Laws: question, search typed, results, article in plain words.
const INPUT: [number, number] = [694, 51];
const QUERY = "штраф за парковку";
const Laws: React.FC = () => {
  const f = useCurrentFrame();
  const page = f < 1300 ? "laws-focus" : f < 1345 ? "laws-search" : "article";
  const n = Math.max(0, Math.min(QUERY.length, Math.floor((f - 1222) / 3.6)));
  const win = lin(f, 1168, 1205, 0, 1, OUT);
  const zoom = f < 1345 ? lin(f, 1180, 1225, 1, 1.35) : lin(f, 1345, 1400, 1.15, 1.3);
  const fy = f < 1345 ? 40 : 450;
  return (
    <AbsoluteFill>
      {f < 1172 ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <Typed text="Не знаете, где найти закон?" at={1112} cps={30} size={78} weight={300} accentFrom={11} />
        </AbsoluteFill>
      ) : (
        <>
          <Blue />
          <div style={{ position: "absolute", top: 54, width: "100%", display: "flex", justifyContent: "center" }}>
            {f < 1345 ? (
              <Words size={54} color="#fff" out={1336} words={[{ t: "Поиск", at: 1176 }, { t: "по", at: 1182 }, { t: "всей", at: 1186 }, { t: "базе", at: 1190 }, { t: "законов", at: 1194 }]} />
            ) : (
              <Words size={54} color="#fff" words={[{ t: "Каждая", at: 1350 }, { t: "статья", at: 1356 }, { t: "простыми", at: 1362 }, { t: "словами", at: 1368 }]} />
            )}
          </div>
          <Win src={hd(page)} w={1360} y={lin(f, 1168, 1205, 240, 60, OUT)} zoom={zoom} fx={f < 1345 ? 700 : 600} fy={fy} opacity={win}>
            {page === "laws-focus" ? (
              <div style={{ position: "absolute", left: 576, top: 37, width: 212, height: 28, background: "#fff", fontFamily: FONT, fontSize: 17, color: "#333", lineHeight: "26px", whiteSpace: "pre" }}>
                {QUERY.slice(0, n)}
                <span style={{ display: "inline-block", width: 2, height: 18, background: BLUE, marginLeft: 1, verticalAlign: "-3px", opacity: Math.floor(f / 16) % 2 ? 0 : 1 }} />
              </div>
            ) : null}
            {page === "article" ? (
              <div style={{ position: "absolute", left: 262, top: 272, width: 756, height: 410, borderRadius: 14, border: `3px solid ${BLUE}`, boxShadow: `0 0 0 ${lin(f, 1352, 1380, 0, 10)}px rgba(28,176,246,0.18)`, opacity: lin(f, 1350, 1366, 0, 1) }} />
            ) : null}
            {page !== "article" ? <Cursor path={[[1172, 1000, 500], [1210, INPUT[0], INPUT[1]]]} clicks={[1214]} /> : null}
          </Win>
        </>
      )}
    </AbsoluteFill>
  );
};

// Features: a list on the left with an arrow, the matching page on the right (reference's word list).
const FEATS: [string, string][] = [
  ["Дуэли", "duels"],
  ["Лига", "stats"],
  ["Форум", "forum"],
  ["Материалы", "materials"],
];
const Features: React.FC = () => {
  const f = useCurrentFrame();
  const local = f - 1410;
  const i = Math.min(FEATS.length - 1, Math.max(0, Math.floor(local / 60)));
  const lf = local - i * 60;
  const enter = lin(f, 1410, 1445, 0, 1, OUT);
  return (
    <AbsoluteFill>
      <Blue />
      <div style={{ position: "absolute", left: 150, top: 300, display: "flex", flexDirection: "column", gap: 18, opacity: enter, transform: `translateX(${(1 - enter) * -60}px)` }}>
        {FEATS.map(([t], k) => {
          const on = k === i;
          return (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: FONT, fontSize: 64, fontWeight: on ? 700 : 300, color: on ? "#fff" : "rgba(255,255,255,0.5)", transition: "none" }}>
              {t}
              {on ? <span style={{ fontSize: 54, transform: `translateX(${lin(lf, 0, 14, -20, 0, OUT)}px)`, opacity: lin(lf, 0, 10, 0, 1) }}>←</span> : null}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 760, top: 210, width: 1040, height: 650 }}>
        {FEATS.map(([, src], k) => {
          const t = lin(local - k * 60, 0, 18, 0, 1, OUT);
          const gone = k < i ? lin(local - (k + 1) * 60, 0, 14, 1, 0) : 1;
          if (local < k * 60 - 2) return null;
          return (
            <div key={src} style={{ position: "absolute", inset: 0, borderRadius: 20, overflow: "hidden", boxShadow: "0 40px 100px rgba(10,40,90,0.3)", opacity: t * gone, transform: `translateY(${(1 - t) * 60}px) scale(${0.96 + t * 0.04})` }}>
              <Img src={hd(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const End: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - 1656, fps, config: { damping: 18, stiffness: 120 } });
  const b = spring({ frame: f - 1700, fps, config: { damping: 14, stiffness: 170 } });
  const press = f >= 1772 && f < 1782 ? 0.94 : 1;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Img src={staticFile("hack/veoskill.svg")} style={{ width: 640, transform: `translateY(-110px) scale(${0.88 + s * 0.12})`, opacity: s, filter: `blur(${(1 - s) * 14}px)` }} />
      <div style={{ position: "absolute", top: 560 }}>
        <Words size={50} weight={400} words={[{ t: "Право", at: 1672 }, { t: "Узбекистана", at: 1678 }, { t: "—", at: 1686 }, { t: "играя", at: 1692, accent: true }]} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 680,
          padding: "22px 70px",
          borderRadius: 18,
          background: BLUE,
          boxShadow: `0 8px 0 ${BLUE_D}`,
          color: "#fff",
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 40,
          letterSpacing: "0.04em",
          transform: `scale(${b * press})`,
          opacity: b,
        }}
      >
        neolex.uz
      </div>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080 }}>
        {f > 1700 ? (
          <svg width="34" height="40" viewBox="0 0 24 28" style={{ position: "absolute", left: lin(f, 1730, 1768, 1500, 990) - 3, top: lin(f, 1730, 1768, 980, 735) - 2, opacity: lin(f, 1728, 1738, 0, 1), transform: `scale(${f >= 1772 && f < 1782 ? 0.86 : 1})`, filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))" }}>
            <path d="M2 1.5 L2 22 L7.3 17.2 L10.6 25 L14 23.6 L10.8 16 L18 16 Z" fill="#111" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        ) : null}
        {f >= 1774 && f < 1800 ? (
          <div style={{ position: "absolute", left: 960, top: 722, width: 0, height: 0 }}>
            {Array.from({ length: 14 }, (_, k) => {
              const a = (k / 14) * Math.PI * 2;
              const d = lin(f, 1774, 1800, 20, 150, OUT);
              return <div key={k} style={{ position: "absolute", left: Math.cos(a) * d * 1.6, top: Math.sin(a) * d * 0.7, width: 8, height: 8, borderRadius: 4, background: k % 2 ? BLUE : "#9fdcff", opacity: lin(f, 1785, 1800, 1, 0) }} />;
            })}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

const SCENES: { from: number; to: number; C: React.FC; light?: boolean }[] = [
  { from: 0, to: 150, C: Hook, light: true },
  { from: 150, to: 330, C: Pain, light: true },
  { from: 330, to: 510, C: LogoScene, light: true },
  { from: 510, to: 600, C: Cabinet },
  { from: 600, to: 1110, C: Play },
  { from: 1110, to: 1410, C: Laws, light: true },
  { from: 1410, to: 1650, C: Features },
  { from: 1650, to: 1860, C: End, light: true },
];

export const Explainer30: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const cur = SCENES.find((s) => f >= s.from && f < s.to) ?? SCENES[SCENES.length - 1];
  const local = f - cur.from;
  // soft cross-cut: each scene opens with a short blur-to-sharp and a slight zoom settle
  const settle = cur.from === 0 ? 0 : lin(local, 0, 12, 1, 0, OUT);
  return (
    <AbsoluteFill>
      <Light />
      <AbsoluteFill style={{ filter: settle > 0.02 ? `blur(${settle * 10}px)` : undefined, transform: `scale(${1 + settle * 0.03})` }}>
        <cur.C />
      </AbsoluteFill>
      <Audio src={staticFile("audio/explainer-mix.wav")} />
    </AbsoluteFill>
  );
};
