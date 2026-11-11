import React from "react";
import { Roll } from "./Bg";
import { Line } from "./Kit7";
import { AbsoluteFill, Easing, Img, continueRender, delayRender, interpolate, interpolateColors, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// Lesson path, rebuilt 1:1 from veoskill.uz (ui/desktop/path-folder.tsx, path-ring, path-tip, path-folder.css).
const FONT = "NunitoC, Nunito, sans-serif";
const GREEN = "#58cc02";
const GLIP = "#58a700";
const LOCK_FACE = "#cccccc";
const LOCK_LIP = "#aaaaaa";
const CHAR = "#4b4b4b";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const IO = Easing.bezier(0.65, 0, 0.35, 1);
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const lin = (f: number, a: number, b: number, x: number, y: number, e = IO) => interpolate(f, [a, b], [x, y], { easing: e, ...clamp });
const lip = (c: string, d: number, s = 0.22) => [...Array.from({ length: d }, (_, i) => `0 ${i + 1}px 0 ${c}`), `0 ${d + 10}px 26px rgba(10,40,90,${s})`].join(",");
const darker = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const k = 0.94;
  return `rgb(${Math.round(((n >> 16) & 255) * k)},${Math.round(((n >> 8) & 255) * k)},${Math.round((n & 255) * k)})`;
};

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

// ---- icons exactly as on the site ----
const ICON: Record<string, React.ReactNode> = {
  check: <svg viewBox="0 0 48 48" width={34} height={34} fill="none" stroke="currentColor" strokeWidth={6.5} strokeLinecap="round" strokeLinejoin="round"><path d="M12 25.2 20.2 33.6 36.5 15.2" /></svg>,
  star: <svg viewBox="0 0 24 24" width={34} height={34} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" /></svg>,
  shield: <svg viewBox="0 0 24 24" width={34} height={34} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /></svg>,
  case: <svg viewBox="0 0 24 24" width={34} height={34} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /><rect x="2" y="6" width="20" height="14" rx="2" /></svg>,
};
const RING_D = "M 48 6 L 67.6 6 A 22.4 22.4 0 0 1 90 28.4 L 90 72.6 A 22.4 22.4 0 0 1 67.6 95 L 28.4 95 A 22.4 22.4 0 0 1 6 72.6 L 6 28.4 A 22.4 22.4 0 0 1 28.4 6 L 48 6";
const SEG_OFF = [-0.025, -0.35833, -0.69167];

const Twinkle: React.FC<{ x: number; y: number; s: number; t: number }> = ({ x, y, s, t }) => (
  <svg viewBox="0 0 20 20" width={s} height={s} style={{ position: "absolute", left: x, top: y, transform: `scale(${0.4 + 0.6 * Math.abs(Math.sin(t))}) rotate(${t * 20}deg)`, opacity: 0.4 + 0.6 * Math.abs(Math.sin(t)) }}>
    <path d="M10 0Q11.5 8.5 20 10 11.5 11.5 10 20 8.5 11.5 0 10 8.5 8.5 10 0Z" fill="#fff" />
  </svg>
);

/** One path stone: live = 0..1 (grey → part colour), crowns = 0..3 (ring segments, fractional = drawing). */
export const Stone: React.FC<{ live: number; crowns: number; ring: boolean; icon: string; press: number; pop: number }> = ({ live, crowns, ring, icon, press, pop }) => {
  const face = interpolateColors(live, [0, 1], [LOCK_FACE, GREEN]);
  const lipC = interpolateColors(live, [0, 1], [LOCK_LIP, GLIP]);
  const shine = live > 0.5 ? 20 : 28;
  const w = 70;
  const h = 70;
  const d = 5;
  const r = w * 0.13;
  const back = darker(live > 0.5 ? GLIP : LOCK_LIP);
  return (
    <div style={{ position: "relative", width: 96, height: 101, transform: `scale(${pop})` }}>
      {ring ? (
        <svg width={96} height={101} viewBox="0 0 96 101" style={{ position: "absolute", left: 0, top: 0 }}>
          <path d={RING_D} fill="none" stroke="#e5e5e5" strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray="0.28333 0.05" strokeDashoffset={0.30833} />
          {SEG_OFF.map((o, i) => {
            const k = Math.max(0, Math.min(1, crowns - i));
            return k > 0 ? <path key={i} d={RING_D} fill="none" stroke={GREEN} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={`${0.28333 * k} 1`} strokeDashoffset={o} /> : null;
          })}
        </svg>
      ) : null}
      <svg width={w} height={h + d} viewBox={`0 0 ${w} ${h + d}`} style={{ position: "absolute", left: 13, top: 13 }}>
        <path d={`M${w * 0.04} ${h * 0.2}V${r * 0.7}Q${w * 0.04} 0 ${w * 0.04 + r * 0.7} 0H${w * 0.46 - r * 0.7}Q${w * 0.46} 0 ${w * 0.46} ${r * 0.7}V${h * 0.2}Z`} fill={back} />
        <rect x={0} y={h * 0.1} width={w} height={h * 0.9 + d} rx={r} fill={back} />
        <rect x={w * 0.12} y={h * 0.17} width={w * 0.76} height={h * 0.5} rx={r * 0.5} fill={interpolateColors(live, [0, 1], ["#f2f2f2", "#ffffff"])} />
        <line x1={w * 0.22} y1={h * 0.25} x2={w * 0.62} y2={h * 0.25} strokeWidth={2} strokeLinecap="round" stroke={live > 0.5 ? GLIP : "#bdbdbd"} strokeOpacity={0.35} />
        <rect x={0} y={h * 0.3 + d} width={w} height={h * 0.7} rx={r} fill={lipC} />
      </svg>
      <div style={{ position: "absolute", left: 13, top: 34 + press * d, width: 70, height: 49, borderRadius: 9.1, background: `linear-gradient(180deg, color-mix(in srgb, #fff ${shine}%, ${face}) 0%, ${face} 35%)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
        {ICON[icon]}
      </div>
    </div>
  );
};

const Cursor: React.FC<{ x: number; y: number; down: number }> = ({ x, y, down }) => (
  <div style={{ position: "absolute", left: x, top: y, zIndex: 50, transform: `scale(${1 - down * 0.15})`, transformOrigin: "4px 4px" }}>
    <svg width="44" height="54" viewBox="0 0 22 27" style={{ filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.3))" }}>
      <path d="M2 2 L2 21 L7 16.5 L10.5 24.5 L14 23 L10.6 15.2 L17 15 Z" fill="#111" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  </div>
);
const Ripple: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) =>
  t > 0 && t < 1 ? <div style={{ position: "absolute", left: x - 40 * t, top: y - 40 * t, width: 80 * t, height: 80 * t, borderRadius: "50%", border: `4px solid rgba(28,176,246,${1 - t})`, zIndex: 49 }} /> : null;

// node layout from the live page: li heights 83/154/154/83/115, margins 0/106/150/106/0
const NODES = [
  { x: 0, y: 0, icon: "check" },
  { x: 106, y: 83, icon: "check" },
  { x: 150, y: 237, icon: "star" },
  { x: 106, y: 391, icon: "shield" },
  { x: 0, y: 474, icon: "case" },
];

export const PathWords = React.createContext(true);
export const PathBeat: React.FC = () => {
  const showWords = React.useContext(PathWords);
  useFonts();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (at: number, cfg = { damping: 12, stiffness: 170 }) => spring({ frame: f - at, fps, config: cfg });

  // story beats
  const PRESS1 = 96; // click the current stone
  const PRESS2 = 150; // click НАЧАТЬ
  const DONE = 176; // lesson finished: ring fills
  const UNLOCK = 236; // next stone turns green
  const card = sp(PRESS1 + 6, { damping: 13, stiffness: 210 }) * (1 - lin(f, PRESS2 + 8, PRESS2 + 18, 0, 1));
  const crowns2 = [0, 1, 2].reduce((a, i) => a + lin(f, DONE + i * 14, DONE + i * 14 + 12, 0, 1, OUT), 0);
  const unlock = lin(f, UNLOCK, UNLOCK + 10, 0, 1);
  const unlockPop = f < UNLOCK ? 1 : 1 + Math.sin(Math.min(1, (f - UNLOCK) / 18) * Math.PI) * 0.22;
  const done2Pop = f < DONE + 40 ? 1 : 1 + Math.sin(Math.min(1, (f - DONE - 40) / 16) * Math.PI) * 0.16;

  // camera: path space → screen. Push in, then follow down to the unlocked stone.
  const S = lin(f, 0, 90, 1.45, 1.7, OUT) + lin(f, UNLOCK - 10, UNLOCK + 40, 0, 0.08);
  const camY = lin(f, 0, 90, 90, 190) + lin(f, UNLOCK - 30, UNLOCK + 20, 0, 140);
  const OX = 640; // path centre on screen
  const toScreen = (x: number, y: number) => [OX + x * S, 540 + (y - camY) * S];

  // cursor path
  const n2 = toScreen(NODES[2].x, NODES[2].y + 50);
  const btn = toScreen(NODES[2].x + 52, NODES[2].y - 110);
  const cx = interpolate(f, [40, PRESS1 - 6, PRESS1 + 20, PRESS2 - 6, PRESS2 + 30, 300], [1700, n2[0], n2[0] + 10, btn[0], btn[0] + 60, 1500], { easing: IO, ...clamp });
  const cy = interpolate(f, [40, PRESS1 - 6, PRESS1 + 20, PRESS2 - 6, PRESS2 + 30, 300], [1150, n2[1], n2[1] + 10, btn[1], btn[1] + 40, 1150], { easing: IO, ...clamp });
  const down1 = lin(f, PRESS1, PRESS1 + 4, 0, 1) * (1 - lin(f, PRESS1 + 6, PRESS1 + 10, 0, 1));
  const down2 = lin(f, PRESS2, PRESS2 + 4, 0, 1) * (1 - lin(f, PRESS2 + 6, PRESS2 + 10, 0, 1));

  // HUD numbers
  const fire = f > DONE + 30 ? 1 : 0;
  const gems = Math.round(lin(f, DONE + 30, DONE + 60, 515, 530));
  const hud = sp(10);
  const xpT = lin(f, DONE + 8, DONE + 60, 0, 1, OUT);
  const words = ["Шаг", "за", "шагом"];

  return (
    <AbsoluteFill style={{ background: "#ffffff", overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(20,60,110,0.06) 1.6px, transparent 1.7px)", backgroundSize: "38px 38px", transform: `translateY(${-camY * 0.6}px)` }} />
      <div style={{ position: "absolute", left: -400, top: -300, width: 1200, height: 1200, borderRadius: "50%", background: "radial-gradient(circle, rgba(88,204,2,0.07), transparent 60%)" }} />

      {/* the path, in site pixels, scaled by the camera */}
      <div style={{ position: "absolute", left: OX, top: 540, transform: `scale(${S}) translateY(${-camY}px)`, transformOrigin: "0 0" }}>
        {/* unit banner */}
        {(() => {
          const s = sp(0, { damping: 15, stiffness: 140 });
          return (
            <div style={{ position: "absolute", left: -230, top: -190 + (1 - s) * -60, width: 460, height: 98, borderRadius: 16, background: GREEN, boxShadow: `0 4px 0 ${GLIP}`, color: "#fff", fontFamily: FONT, padding: "16px 20px", boxSizing: "border-box", opacity: s }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.95 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12H5M11 5.5 4.5 12 11 18.5" /></svg>
                Модуль 1
              </div>
              <div style={{ marginTop: 10, fontSize: 21, fontWeight: 800, letterSpacing: "-0.02em" }}>Введение в право</div>
              <div style={{ position: "absolute", right: 16, top: 26, height: 40, padding: "0 14px", borderRadius: 12, border: "2px solid rgba(255,255,255,0.45)", boxShadow: `0 3px 0 ${GLIP}`, display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 800, letterSpacing: "0.06em" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h4" /></svg>
                СПРАВОЧНИК
              </div>
            </div>
          );
        })()}
        {/* module art, as on the page */}
        <Img src={staticFile("real/mascot1.webp")} style={{ position: "absolute", left: -117 - 148 - 20, top: 139, width: 296, height: 296, objectFit: "contain", opacity: sp(14).valueOf(), transform: `scale(${0.8 + 0.2 * sp(14)})` }} />
        {NODES.map((n, i) => {
          const pop = spring({ frame: f - 6 - i * 4, fps, config: { damping: 9, stiffness: 190 } });
          const isCur = i === 2;
          const isNext = i === 3;
          const live = i < 2 ? 1 : isCur ? 1 : isNext ? unlock : 0;
          const crowns = i < 2 ? 3 : isCur ? crowns2 : 0;
          const icon = isCur && crowns2 >= 2.95 ? "check" : n.icon;
          const press = isCur ? Math.max(down1, 0) : 0;
          const p = (0.5 + 0.5 * pop) * (isNext ? unlockPop : isCur ? done2Pop : 1);
          return (
            <div key={i} style={{ position: "absolute", left: n.x - 48, top: n.y, opacity: Math.min(1, pop * 1.5), zIndex: isCur ? 3 : 1 }}>
              <Stone live={live} crowns={crowns} ring={i <= 2 || (isNext && unlock > 0.5)} icon={icon} press={press} pop={p} />
              {isNext && f > UNLOCK ? (
                <div style={{ position: "absolute", left: -20, top: -20, width: 136, height: 141 }}>
                  {[0, 1, 2, 3, 4, 5].map((k) => {
                    const a = (k / 6) * Math.PI * 2;
                    const d = lin(f, UNLOCK, UNLOCK + 30, 10, 70, OUT);
                    return <svg key={k} viewBox="0 0 20 20" width={16} height={16} style={{ position: "absolute", left: 60 + Math.cos(a) * d, top: 62 + Math.sin(a) * d, opacity: lin(f, UNLOCK + 14, UNLOCK + 34, 1, 0) }}><path d="M10 0Q11.5 8.5 20 10 11.5 11.5 10 20 8.5 11.5 0 10 8.5 8.5 10 0Z" fill="#ffc800" /></svg>;
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
        {/* lesson card (path-tip, side "above") */}
        {card > 0.01 ? (
          <div style={{ position: "absolute", left: NODES[2].x - 140, top: NODES[2].y - 232, width: 280, transformOrigin: "50% 100%", transform: `scale(${card})`, opacity: Math.min(1, card * 1.6), zIndex: 10 }}>
            <div style={{ position: "relative", borderRadius: 16, background: GREEN, boxShadow: `0 4px 0 ${GLIP}`, color: "#fff", padding: "14px 16px 16px", fontFamily: FONT }}>
              <span style={{ position: "absolute", left: "50%", top: "calc(100% - 1px)", transform: "translateX(-50%)", borderLeft: "9px solid transparent", borderRight: "9px solid transparent", borderTop: `11px solid ${GREEN}` }} />
              {[[8, 60, 12, 0], [22, 54, 9, 0.35], [47, 58, 10, 0.7], [80, 52, 13, 0.15], [94, 66, 9, 0.55], [90, 16, 10, 0.9]].map(([x, y, s, at], k) => <Twinkle key={k} x={(x / 100) * 280} y={(y / 100) * 200} s={s} t={f / 14 + at * 6} />)}
              <div style={{ position: "relative", fontSize: 17, fontWeight: 800, lineHeight: 1.3, letterSpacing: "-0.02em" }}>Кто пишет правила в Узбекистане</div>
              <div style={{ position: "relative", marginTop: 6, fontSize: 13, color: "rgba(255,255,255,0.92)", fontWeight: 600 }}>Урок 3 из 50</div>
              <div style={{ position: "relative", marginTop: 14, height: 48, borderRadius: 12, border: "2px solid #e5e5e5", background: "#fff", boxShadow: `0 ${4 - down2 * 4}px 0 #e5e5e5`, transform: `translateY(${down2 * 4}px)`, display: "flex", alignItems: "center", justifyContent: "center", color: GREEN, fontSize: 15, fontWeight: 800, letterSpacing: "0.053em", textTransform: "uppercase" }}>Начать</div>
            </div>
          </div>
        ) : null}
        {/* +XP rising from the finished stone */}
        {xpT > 0 && xpT < 1 ? (
          <div style={{ position: "absolute", left: NODES[2].x + 60, top: NODES[2].y + 10 - xpT * 70, opacity: Math.sin(xpT * Math.PI) * 1.4, fontFamily: FONT, fontWeight: 900, fontSize: 26, whiteSpace: "nowrap", color: "#ffc800", textShadow: lip("#d19a00", 3, 0.15), zIndex: 9 }}>+15 XP</div>
        ) : null}
      </div>

      {/* top bar as on the page: modules · streak · gems · hearts */}
      <div style={{ position: "absolute", right: 70, top: 46, display: "flex", gap: 46, fontFamily: FONT, fontWeight: 900, fontSize: 40, transform: `translateY(${(1 - hud) * -120}px)` }}>
        {[["real/module.webp", "1", "#4b4b4b"], ["real/key-fire.webp", String(fire), fire ? "#ff9600" : "#afafaf"], ["real/icon-gem.webp", String(gems), "#1cb0f6"], ["real/heart-red.webp", "5", "#ff4b4b"]].map(([src, v, c], i) => {
          const bump = i === 1 || i === 2 ? 1 + Math.sin(lin(f, DONE + 30, DONE + 46, 0, 1) * Math.PI) * 0.3 : 1;
          return (
            <div key={src} style={{ display: "flex", alignItems: "center", gap: 12, color: c }}>
              <Img src={staticFile(src)} style={{ width: 56, height: 56, objectFit: "contain", transform: `scale(${bump})` }} />
              {v}
            </div>
          );
        })}
      </div>

      {/* kinetic words on the right */}
      <div style={{ position: "absolute", left: 1240, top: 400, width: 640, display: showWords ? "block" : "none" }}>
        <Line text="Шаг за шагом" at={24} size={96} maxW={620} accent="шагом" accentColor={GREEN} style={{ justifyContent: "flex-start" }} />
      </div>

      <Ripple x={cx + 4} y={cy + 4} t={lin(f, PRESS1, PRESS1 + 18, 0, 1)} />
      <Ripple x={cx + 4} y={cy + 4} t={lin(f, PRESS2, PRESS2 + 18, 0, 1)} />
      <Cursor x={cx} y={cy} down={Math.max(down1, down2)} />
    </AbsoluteFill>
  );
};
