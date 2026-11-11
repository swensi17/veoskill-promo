import React from "react";
import { Stone } from "./PathBeat";
import { RichBg, Roll } from "./Bg";
import { AbsoluteFill, Easing, Img, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// More animated beats in the same look: laws counter, languages cube, minutes→hours, mistake loop, save/remember/repeat, league climb.
const FONT = "NunitoC, Nunito, sans-serif";
const BLUE = "#1cb0f6";
const LIP = "#0f6fbf";
const INK = "#1f2a37";
const GREEN = "#58cc02";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const IO = Easing.bezier(0.65, 0, 0.35, 1);
const lin = (f: number, a: number, b: number, x: number, y: number, e = IO) => interpolate(f, [a, b], [x, y], { easing: e, ...clamp });
const lip = (c: string, d: number, s = 0.28) => [...Array.from({ length: d }, (_, i) => `0 ${i + 1}px 0 ${c}`), `0 ${d + 10}px 26px rgba(10,40,90,${s})`].join(",");

const useFonts = () => {
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
const Stage: React.FC<{ blue?: boolean }> = () => <RichBg />;
const Word: React.FC<{ text: string; at: number; size: number; color?: string; lipC?: string; style?: React.CSSProperties }> = ({ text, at, size, color = BLUE, lipC, style }) => {
  const f = useCurrentFrame();
  return <Roll f={f} text={text} at={at} size={size} color={color} lipC={lipC === "#b9c6d2" || lipC === "#8fd0f5" ? undefined : lipC} style={style} />;
};

// ---------- 1. Laws: a wall of law tiles builds, the counter runs to 1 608 ----------
const CODES = ["Конституция", "Гражданский", "Уголовный", "Трудовой", "Семейный", "Налоговый", "Жилищный", "Земельный", "Таможенный", "Водный", "Лесной", "Градостроит.", "Админ. ответств.", "ГПК", "УПК", "Бюджетный"];
export const LawsWall: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = Math.round(lin(f, 10, 120, 0, 1608, Easing.bezier(0.2, 0.8, 0.2, 1)));
  const tilt = lin(f, 0, 240, 22, 8);
  return (
    <AbsoluteFill>
      <Stage />
      <AbsoluteFill style={{ perspective: 1600, perspectiveOrigin: "50% 30%" }}>
        <div style={{ position: "absolute", left: 960 - 760, top: 470, width: 1520, display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 18, transform: `rotateX(${tilt}deg) translateZ(${lin(f, 0, 240, -200, 40)}px)`, transformStyle: "preserve-3d" }}>
          {CODES.map((c, i) => {
            const s = spring({ frame: f - 6 - (i % 8) * 3 - Math.floor(i / 8) * 8, fps, config: { damping: 13, stiffness: 160 } });
            return (
              <div key={c} style={{ height: 150, borderRadius: 20, background: "linear-gradient(170deg,#fff,#eef7ff)", boxShadow: "0 8px 0 #bfe0f6, 0 22px 40px rgba(10,40,90,0.18)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 16, transform: `translateY(${(1 - s) * -500}px) rotateZ(${(1 - s) * (i % 2 ? 14 : -14)}deg)`, opacity: Math.min(1, s * 2) }}>
                <svg width="44" height="44" viewBox="0 0 24 24" style={{ marginBottom: "auto" }}><path d="M6 3h9l3 3v15H6zM9 9h6M9 13h6M9 17h4" fill="none" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" /></svg>
                <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 20, color: "#1d2a6b", lineHeight: 1.1 }}>{c}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 110, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 210, color: BLUE, textShadow: lip(LIP, 12), lineHeight: 1 }}>
        {n.toLocaleString("ru-RU").replace(/ /g, " ")}
      </div>
      <div style={{ position: "absolute", top: 340, width: "100%" }}>
        <Word text="законов в одном месте" at={70} size={58} color={INK} lipC="#b9c6d2" />
      </div>
    </AbsoluteFill>
  );
};

// ---------- 2. Languages: a cube turns RU → UZ → EN ----------
const LANGS = [["Русский", "Право"], ["O‘zbekcha", "Huquq"], ["English", "Law"]];
export const LangCube: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const turn = (k: number) => spring({ frame: f - 40 - k * 50, fps, config: { damping: 15, stiffness: 120 } });
  const rot = (turn(0) + turn(1)) * -90;
  const intro = spring({ frame: f, fps, config: { damping: 14, stiffness: 120 } });
  const S = 420;
  return (
    <AbsoluteFill>
      <Stage blue />
      <div style={{ position: "absolute", top: 90, width: "100%" }}><Word text="3 языка" at={6} size={110} color="#fff" lipC="#8fd0f5" /></div>
      <AbsoluteFill style={{ perspective: 1800, alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative", width: S * 1.7, height: S * 0.62, marginTop: 150, transformStyle: "preserve-3d", transform: `scale(${intro}) rotateX(-10deg) rotateY(${rot + 15 * Math.sin(f / 60)}deg)` }}>
          {LANGS.map(([lang, word], i) => (
            <div key={lang} style={{ position: "absolute", inset: 0, borderRadius: 34, background: "linear-gradient(170deg,#fff,#eef8ff)", boxShadow: "0 14px 0 #a8d8f5, 0 40px 80px rgba(0,40,100,0.35)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 70px", transform: `rotateY(${i * 90}deg) translateZ(${S * 0.85}px)`, backfaceVisibility: "hidden" }}>
              <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 120, color: BLUE, textShadow: lip(LIP, 7) }}>{word}</div>
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 44, color: INK }}>{lang}</div>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- 3. 15 minutes a day → 91 hours a year ----------
export const Minutes: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ring = lin(f, 10, 80, 0, 0.25, OUT); // 15 of 60 minutes
  const days = Math.round(lin(f, 90, 160, 1, 365, Easing.bezier(0.3, 0, 0.2, 1)));
  const hours = Math.round(lin(f, 150, 200, 0, 91, OUT));
  const card2 = spring({ frame: f - 140, fps, config: { damping: 14, stiffness: 130 } });
  const C = 2 * Math.PI * 140;
  const num: React.CSSProperties = { fontVariantNumeric: "tabular-nums", lineHeight: 1 };
  return (
    <AbsoluteFill>
      <Stage />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 70 }}>
        <div style={{ position: "relative", width: 360, height: 360, flexShrink: 0 }}>
          <svg width="360" height="360" viewBox="0 0 360 360" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="180" cy="180" r="140" fill="none" stroke="#e3edf6" strokeWidth="26" />
            <circle cx="180" cy="180" r="140" fill="none" stroke={BLUE} strokeWidth="26" strokeLinecap="round" strokeDasharray={`${C * ring} ${C}`} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT }}>
            <div style={{ fontWeight: 900, fontSize: 100, color: BLUE, textShadow: lip(LIP, 6), ...num }}>{Math.round(ring * 60)}</div>
            <div style={{ fontWeight: 800, fontSize: 26, color: INK, marginTop: 6 }}>минут в день</div>
          </div>
        </div>
        <div style={{ width: 60, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 80, color: BLUE, opacity: lin(f, 85, 100, 0, 1) }}>×</div>
        <div style={{ width: 260, textAlign: "center", fontFamily: FONT, opacity: lin(f, 88, 104, 0, 1) }}>
          <div style={{ fontWeight: 900, fontSize: 120, color: INK, ...num }}>{days}</div>
          <div style={{ fontWeight: 800, fontSize: 32, color: "#5d6c7c", marginTop: 8 }}>дней</div>
        </div>
        <div style={{ width: 60, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 80, color: BLUE, opacity: lin(f, 140, 150, 0, 1) }}>=</div>
        <div style={{ width: 340, padding: "46px 0", borderRadius: 40, background: "linear-gradient(170deg,#fff,#f0fff0)", boxShadow: "0 14px 0 #bfe8a0, 0 40px 80px rgba(10,60,20,0.2)", textAlign: "center", fontFamily: FONT, transform: `scale(${card2})`, opacity: card2 }}>
          <div style={{ fontWeight: 900, fontSize: 140, color: GREEN, textShadow: lip("#3f8f02", 8), ...num }}>{hours}</div>
          <div style={{ fontWeight: 800, fontSize: 36, color: INK, marginTop: 8, opacity: lin(f, 196, 210, 0, 1) }}>час за год</div>
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", bottom: 110, width: "100%" }}><Word text="Немного каждый день — и это уже система" at={196} size={56} color={INK} /></div>
    </AbsoluteFill>
  );
};

// ---------- 4. Mistakes come back until learned: a loop ----------
const QCard: React.FC<{ state: "wrong" | "review" | "right"; style?: React.CSSProperties }> = ({ state, style }) => {
  const c = state === "wrong" ? "#ff4b4b" : state === "right" ? GREEN : BLUE;
  const bg = state === "wrong" ? "#ffdfe0" : state === "right" ? "#d7ffb8" : "#ddf4ff";
  return (
    <div style={{ width: 400, borderRadius: 28, background: "#fff", boxShadow: "0 12px 0 #e5e5e5, 0 40px 70px rgba(10,40,90,0.18)", padding: 26, boxSizing: "border-box", fontFamily: FONT, ...style }}>
      <div style={{ fontWeight: 800, fontSize: 26, color: "#4b4b4b" }}>Что такое право?</div>
      <div style={{ marginTop: 16, borderRadius: 16, border: `2px solid ${c}`, background: bg, boxShadow: `0 4px 0 ${c}`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, fontWeight: 700, fontSize: 21, color: "#4b4b4b" }}>
        <div style={{ width: 34, height: 34, borderRadius: 17, background: c, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d={state === "wrong" ? "M6 6l12 12M18 6L6 18" : state === "right" ? "M5 12.5l4.5 4.5L19 7.5" : "M4 12a8 8 0 0 1 13.7-5.6L20 9M20 4v5h-5"} /></svg>
        </div>
        {state === "wrong" ? "Совет продавца на базаре" : "Общие правила, которые признаёт государство"}
      </div>
    </div>
  );
};
export const MistakeLoop: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const X = [430, 960, 1490];
  const st = (k: number) => spring({ frame: f - [8, 70, 140][k], fps, config: { damping: 15, stiffness: 120 } });
  // the card travels: wrong (left) → into review (middle) → out learned (right)
  const t1 = lin(f, 44, 82, 0, 1, Easing.bezier(0.6, 0, 0.3, 1));
  const t2 = lin(f, 112, 150, 0, 1, Easing.bezier(0.6, 0, 0.3, 1));
  const cx = t2 > 0 ? X[1] + (X[2] - X[1]) * t2 : X[0] + (X[1] - X[0]) * t1;
  const cy = 520 - Math.sin((t2 > 0 ? t2 : t1) * Math.PI) * 120;
  const state: "wrong" | "review" | "right" = t2 >= 0.5 ? "right" : t1 >= 0.5 ? "review" : "wrong";
  const inBox = t1 >= 1 && t2 <= 0;
  const appear = spring({ frame: f - 4, fps, config: { damping: 15, stiffness: 140 } });
  const labels: [string, string][] = [["Ошибся", "#ff4b4b"], ["Повторил", BLUE], ["Запомнил", GREEN]];
  return (
    <AbsoluteFill>
      <Stage />
      <svg width="1920" height="1080" style={{ position: "absolute" }}>
        {[[0, 1, 44], [1, 2, 112]].map(([a, b, at]) => {
          const d = `M ${X[a] + 220} 520 Q ${(X[a] + X[b]) / 2} 360 ${X[b] - 220} 520`;
          const p = lin(f, at - 20, at + 6, 0, 1, OUT);
          return <path key={a} d={d} fill="none" stroke="#c9dceb" strokeWidth={6} strokeDasharray="14 14" strokeLinecap="round" opacity={p} />;
        })}
      </svg>
      {labels.map(([t, c], k) => (
        <div key={t} style={{ position: "absolute", left: X[k] - 200, width: 400, top: 250, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 52, color: c, opacity: st(k), transform: `translateY(${(1 - st(k)) * 30}px)` }}>{t}</div>
      ))}
      <div style={{ position: "absolute", left: X[1] - 210, top: 610, width: 420, height: 150, borderRadius: 30, background: "#ddf4ff", border: `3px solid ${BLUE}`, boxShadow: "0 10px 0 #84d8ff", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 22, boxSizing: "border-box", fontFamily: FONT, fontWeight: 900, fontSize: 28, color: BLUE, opacity: lin(f, 30, 50, 0, 1), transform: `scale(${inBox ? 1.04 : 1})` }}>Исправляем ошибки</div>
      <div style={{ position: "absolute", left: cx - 200, top: cy - 120, transform: `scale(${(inBox ? 0.82 : 1) * appear}) rotate(${(t2 > 0 ? Math.sin(t2 * Math.PI) : Math.sin(t1 * Math.PI)) * -6}deg)`, zIndex: 3 }}>
        <QCard state={state} />
      </div>
      <Confetti2 at={152} x={X[2]} y={430} />
      <div style={{ position: "absolute", bottom: 90, width: "100%" }}><Word text="Ошибки возвращаются, пока не выучишь" at={150} size={56} color={INK} /></div>
    </AbsoluteFill>
  );
};
const Confetti2: React.FC<{ at: number; x: number; y: number }> = ({ at, x, y }) => {
  const f = useCurrentFrame();
  const t = f - at;
  if (t < 0 || t > 70) return null;
  return <>{Array.from({ length: 28 }, (_, k) => { const a = (k / 28) * Math.PI * 2 + k; const v = 5 + (k % 5); return <div key={k} style={{ position: "absolute", left: x + Math.cos(a) * v * t, top: y + Math.sin(a) * v * t * 0.8 + t * t * 0.05, width: 12, height: 18, borderRadius: 3, background: [BLUE, GREEN, "#ffc800", "#ce82ff"][k % 4], transform: `rotate(${t * (6 + k)}deg)`, opacity: lin(f, at + 45, at + 70, 1, 0) }} />; })}</>;
};

// ---------- 5. Save. Remember. Repeat. — each card gets its own little life ----------
const SRR: [string, string][] = [
  ["Сохраняй", "M6 3h12v18l-6-4-6 4z"],
  ["Запоминай", "M12 3a6 6 0 0 0-6 6c0 2.5 1.6 3.8 2.6 5 .6.7.9 1.4.9 2.3V18h5v-1.7c0-.9.3-1.6.9-2.3 1-1.2 2.6-2.5 2.6-5a6 6 0 0 0-6-6zM9.5 20.5h5"],
  ["Повторяй", "M4 12a8 8 0 0 1 13.7-5.6L20 9M20 4v5h-5M20 12a8 8 0 0 1-13.7 5.6L4 15M4 20v-5h5"],
];
export const SaveRemember: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Stage blue />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 70, perspective: 1400 }}>
        {SRR.map(([t, d], i) => {
          const at = 8 + i * 26;
          const s = spring({ frame: f - at, fps, config: { damping: 12, stiffness: 160, mass: 0.8 } });
          const draw = lin(f, at + 6, at + 36, 0, 1, OUT);
          const act = spring({ frame: f - at - 40, fps, config: { damping: 9, stiffness: 140 } });
          const floatY = Math.sin((f - i * 20) / 22) * 10 * s;
          const iconT = i === 0 ? `translateY(${(1 - act) * -40}px)` : i === 2 ? `rotate(${act * 360 + Math.max(0, f - at - 80) * 1.2}deg)` : `scale(${1 + act * 0.08})`;
          const fill = i === 0 ? `rgba(28,176,246,${act})` : i === 1 ? `rgba(255,200,0,${act * 0.95})` : "none";
          const glow = i === 1 ? act : 0;
          return (
            <div key={t} style={{ position: "relative", width: 440, height: 520, borderRadius: 44, background: "linear-gradient(170deg,#fff,#eef8ff)", boxShadow: "0 16px 0 #a8d8f5, 0 50px 90px rgba(0,40,100,0.35)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 46, transform: `translateY(${(1 - s) * 500 + floatY}px) rotateY(${(1 - s) * (i - 1) * 40}deg) rotateZ(${(1 - s) * (i - 1) * 6}deg)`, opacity: s, overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 60, width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, rgba(255,214,0,${0.55 * glow}), transparent 65%)` }} />
              {i === 1 ? Array.from({ length: 8 }, (_, k) => (
                <div key={k} style={{ position: "absolute", top: 120, left: 216, width: 8, height: 34, borderRadius: 4, background: "#ffc800", opacity: glow, transformOrigin: "4px 90px", transform: `rotate(${k * 45}deg) translateY(${-glow * 30}px)` }} />
              )) : null}
              <svg width="190" height="190" viewBox="0 0 24 24" style={{ transform: iconT, position: "relative" }}>
                <path d={d} fill={fill} stroke={i === 1 && act > 0.3 ? "#e0a800" : BLUE} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} />
              </svg>
              <div style={{ position: "relative", fontFamily: FONT, fontWeight: 900, fontSize: 70, color: BLUE, textShadow: lip(LIP, 6) }}>{t}</div>
              <div style={{ position: "absolute", top: -100, bottom: -100, width: 120, left: lin(f, at + 30, at + 70, -200, 600), transform: "rotate(18deg)", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)" }} />
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- 6. League: you start 6th, every lesson pushes you up to 1st ----------
const OTHERS: [string, number][] = [["Дилноза", 400], ["Азиз", 360], ["Камила", 300], ["Тимур", 210], ["Севара", 150]];
const STEPS = [60, 92, 124, 156, 188];
const XPS = [80, 170, 230, 320, 380, 430];
const ROW = 112;
const TX = 760;
const TY = 290;
export const LeagueClimb: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const st = STEPS.map((a) => spring({ frame: f - a - 14, fps, config: { damping: 13, stiffness: 150 } }));
  const mePos = 5 - st.reduce((a, b) => a + b, 0);
  const done = STEPS.filter((a) => f >= a + 14).length;
  const xp = done === 0 ? XPS[0] : Math.round(interpolate(f, [STEPS[done - 1] + 14, STEPS[done - 1] + 34], [XPS[done - 1], XPS[done]], clamp));
  const win = spring({ frame: f - 215, fps, config: { damping: 10, stiffness: 140 } });
  const badge = spring({ frame: f - 4, fps, config: { damping: 12, stiffness: 140 } });
  const rows = [
    ...OTHERS.map(([n, x], r) => ({ n, x, av: `av/p${r}.svg`, pos: r + Math.max(0, Math.min(1, r + 1 - mePos)), me: false })),
    { n: "Вы", x: xp, av: "av/me0.svg", pos: mePos, me: true },
  ];
  return (
    <AbsoluteFill>
      <Stage />
      <div style={{ position: "absolute", left: TX, top: 70, display: "flex", alignItems: "center", gap: 28 }}>
        <Img src={staticFile("av/gold.webp")} style={{ width: 150, height: 150, transform: `scale(${badge}) rotate(${(1 - badge) * -40}deg)`, filter: "drop-shadow(0 16px 24px rgba(160,110,0,0.35))" }} />
        <div style={{ fontFamily: FONT }}>
          <div style={{ fontWeight: 900, fontSize: 80, color: BLUE, textShadow: lip(LIP, 6), lineHeight: 1, opacity: badge }}>Золотая лига</div>
          <div style={{ fontWeight: 800, fontSize: 34, color: "#5d6c7c", marginTop: 10, opacity: lin(f, 15, 30, 0, 1) }}>Проходи уроки и поднимайся</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 210, top: 250, width: 380, height: 720 }}>
        <svg width="380" height="720" style={{ position: "absolute" }}>
          <path d="M190 40 C 60 140, 320 220, 190 320 S 60 500, 190 620" fill="none" stroke="#dbe7f1" strokeWidth="14" strokeLinecap="round" strokeDasharray="2 26" />
        </svg>
        {STEPS.map((a, k) => {
          const y = 40 + k * 145;
          const x = 190 + Math.sin(k * 1.4) * 110;
          const pop = spring({ frame: f - 8 - k * 4, fps, config: { damping: 13, stiffness: 170 } });
          const ok = spring({ frame: f - a, fps, config: { damping: 9, stiffness: 200 } });
          const g = ok > 0.5;
          return (
            <div key={k} style={{ position: "absolute", left: x - 58, top: y - 60, transform: "scale(1.2)" }}>
              <Stone live={1} crowns={g ? 3 * Math.min(1, ok) : 0} ring icon={g ? "check" : k === 0 ? "star" : "star"} press={0} pop={pop * (1 + Math.sin(Math.min(1, ok) * Math.PI) * 0.15)} />
            </div>
          );
        })}
      </div>
      {STEPS.map((a, k) => {
        const t = lin(f, a + 2, a + 18, 0, 1, Easing.bezier(0.5, 0, 0.3, 1));
        if (t <= 0 || t >= 1) return null;
        const sx = 400 + Math.sin(k * 1.4) * 110;
        const sy = 290 + k * 145;
        const ex = TX + 820;
        const ey = TY + (5 - k) * ROW + 48;
        return <div key={k} style={{ position: "absolute", left: sx + (ex - sx) * t - 70, top: sy + (ey - sy) * t - Math.sin(t * Math.PI) * 160 - 30, padding: "10px 22px", borderRadius: 30, background: "#ffc800", boxShadow: "0 6px 0 #d19a00, 0 14px 24px rgba(160,110,0,0.35)", fontFamily: FONT, fontWeight: 900, fontSize: 34, color: "#fff", zIndex: 9, transform: `scale(${0.7 + Math.sin(t * Math.PI) * 0.5})` }}>+{XPS[k + 1] - XPS[k]} XP</div>;
      })}
      <div style={{ position: "absolute", left: TX, top: TY, width: 980 }}>
        {rows.map((p, i) => {
          const s = spring({ frame: f - 8 - i * 4, fps, config: { damping: 14, stiffness: 160 } });
          const rank = Math.round(p.pos) + 1;
          const lift = p.me ? Math.sin((mePos % 1) * Math.PI) * 14 : 0;
          return (
            <div key={p.n} style={{ position: "absolute", top: p.pos * ROW, left: 0, right: 0, height: 96, borderRadius: 26, background: p.me ? `linear-gradient(90deg, ${BLUE}, #39c2ff)` : "#fff", boxShadow: p.me ? `0 8px 0 ${LIP}, 0 ${30 + lift}px 60px rgba(10,60,120,0.35)` : "0 6px 0 #d7e4ee, 0 16px 30px rgba(10,40,90,0.12)", display: "flex", alignItems: "center", padding: "0 34px", gap: 26, fontFamily: FONT, transform: `translateX(${(1 - s) * 300}px) scale(${p.me ? 1.04 + lift / 300 + win * 0.04 : 1})`, opacity: s, zIndex: p.me ? 5 : 1 }}>
              <div style={{ fontWeight: 900, fontSize: 40, width: 50, color: p.me ? "#fff" : "#8a98a6" }}>{rank}</div>
              <div style={{ position: "relative" }}>
                <Img src={staticFile(p.av)} style={{ width: 70, height: 70, borderRadius: 35, border: `4px solid ${p.me ? "#fff" : "#e3edf6"}` }} />
                {p.me && rank === 1 ? <Img src={staticFile("av/medal-1.webp")} style={{ position: "absolute", right: -18, bottom: -14, width: 44, height: 44, transform: `scale(${win})` }} /> : null}
              </div>
              <div style={{ fontWeight: 900, fontSize: 42, color: p.me ? "#fff" : INK, flex: 1 }}>{p.n}</div>
              <div style={{ fontWeight: 900, fontSize: 40, color: p.me ? "#fff" : "#5d6c7c" }}>{p.x} XP</div>
            </div>
          );
        })}
      </div>
      {win > 0.01 ? Array.from({ length: 36 }, (_, k) => {
        const a = (k / 36) * Math.PI * 2 + k;
        const t = f - 215;
        const d = t * (5 + (k % 5));
        return <div key={k} style={{ position: "absolute", left: TX + 490 + Math.cos(a) * d, top: TY + 48 + Math.sin(a) * d * 0.7 + t * t * 0.05, width: 14, height: 22, borderRadius: 4, background: [BLUE, GREEN, "#ffc800", "#ff705d", "#ce82ff"][k % 5], transform: `rotate(${t * (8 + k)}deg)`, opacity: lin(f, 250, 275, 1, 0), zIndex: 9 }} />;
      }) : null}
    </AbsoluteFill>
  );
};

// ---------- 7. Profile: your avatar, your way ----------
const OPTS = ["Стиль", "Причёска", "Очки", "Цвет", "Фон"];
export const Profile: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const PER = 26;
  const k = Math.max(0, Math.min(7, Math.floor((f - 40) / PER)));
  const local = f - 40 - k * PER;
  const swap = f < 40 ? 1 : spring({ frame: local, fps, config: { damping: 11, stiffness: 190 } });
  const intro = spring({ frame: f, fps, config: { damping: 13, stiffness: 130 } });
  const arc = lin(f, 10, 230, 0.1, 1, Easing.bezier(0.3, 0, 0.2, 1));
  const C = 2 * Math.PI * 250;
  const ROT = f * 0.4;
  return (
    <AbsoluteFill>
      <Stage blue />
      <div style={{ position: "absolute", top: 60, width: "100%" }}><Word text="Профиль — какой хочешь" at={4} size={88} color="#fff" lipC="#8fd0f5" /></div>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + (ROT * Math.PI) / 180;
        const s = spring({ frame: f - 20 - i * 3, fps, config: { damping: 13, stiffness: 150 } });
        const front = Math.sin(a);
        return <Img key={i} src={staticFile(`av/me${i}.svg`)} style={{ position: "absolute", left: 960 + Math.cos(a) * 600 * s - 60, top: 590 + front * 250 * s - 60, width: 120, height: 120, borderRadius: 60, border: `6px solid ${i === k && f >= 40 ? "#ffc800" : "#fff"}`, boxShadow: "0 14px 30px rgba(0,40,100,0.3)", opacity: s * (front > -0.2 ? 1 : 0.6), transform: `scale(${(i === k && f >= 40 ? 1.15 : 0.9) + front * 0.12})`, zIndex: front > 0 ? 3 : 0 }} />;
      })}
      <div style={{ position: "absolute", left: 960 - 250, top: 590 - 250, width: 500, height: 500, transform: `scale(${intro})`, zIndex: 2 }}>
        <svg width="500" height="500" style={{ position: "absolute", transform: "rotate(-90deg)" }}>
          <circle cx="250" cy="250" r="232" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="18" />
          <circle cx="250" cy="250" r="232" fill="none" stroke="#ffc800" strokeWidth="18" strokeLinecap="round" strokeDasharray={`${(2 * Math.PI * 232) * arc} ${C}`} />
        </svg>
        <div style={{ position: "absolute", inset: 36, borderRadius: "50%", overflow: "hidden", background: "#fff", boxShadow: "0 30px 70px rgba(0,40,100,0.4)", perspective: 800 }}>
          <Img src={staticFile(`av/me${k}.svg`)} style={{ width: "100%", height: "100%", transform: `rotateY(${(1 - swap) * 90}deg) scale(${0.85 + swap * 0.15})` }} />
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 50, width: "100%", display: "flex", justifyContent: "center", gap: 22, zIndex: 4 }}>
        {OPTS.map((o, i) => {
          const s = spring({ frame: f - 30 - i * 4, fps, config: { damping: 13, stiffness: 160 } });
          const on = f >= 40 && k % OPTS.length === i;
          return <div key={o} style={{ padding: "16px 34px", borderRadius: 22, background: on ? "#ffc800" : "#fff", boxShadow: `0 7px 0 ${on ? "#d19a00" : "#a8d8f5"}`, fontFamily: FONT, fontWeight: 900, fontSize: 34, color: on ? "#fff" : BLUE, transform: `translateY(${(1 - s) * 120 - (on ? 8 : 0)}px)`, opacity: s }}>{o}</div>;
        })}
      </div>
    </AbsoluteFill>
  );
};
