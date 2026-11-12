import React from "react";
import { tr } from "./i18n";
import { AbsoluteFill, Easing, Img, interpolate, staticFile } from "remotion";
import { Confetti } from "./Lesson";
import { NAVY, BLUE, GREEN, UI, HEAD, OUTE, IOE, lin, press, useSp, useFrame, Pointer, TopLine } from "./Scenes9";

// Play against another learner (veoskill.uz/hub/duels; the word itself is kept out of frame, see docs/RULES.md):
// matchmaking with speed streaks and VS, then a timed question with 4 answers on one brand-blue backdrop
// (white tiles, 3D tilt on the tap, 3D swing on the reveal), then the win card.
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const AV = (n: string) => staticFile(`av/${n}.svg`);
const SEARCH_END = 200, CLICK = 330, REVEAL = 352, RES = 470, END = 720;
const ANS: [string, string, string, "tri" | "dia" | "cir" | "sq"][] = [
  [tr("моралью общества."), "#7d5bb5", "#5e4192", "tri"], [tr("субъективным правом."), "#e0454f", "#b8303a", "dia"],
  [tr("правомочием."), "#b9735e", "#94573f", "cir"], [tr("объективным правом."), "#34a02a", "#24801c", "sq"],
];
const Shape: React.FC<{ k: string; c?: string }> = ({ k, c = "rgba(255,255,255,0.9)" }) => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill={c}>
    {k === "tri" ? <path d="M12 3l10 18H2z" /> : k === "dia" ? <path d="M12 2l10 10-10 10L2 12z" /> : k === "cir" ? <circle cx="12" cy="12" r="10" /> : <rect x="3" y="3" width="18" height="18" rx="3" />}
  </svg>
);
const Avatar: React.FC<{ src: string; size: number; bg: string; badge?: "ok" | "no" }> = ({ src, size, bg, badge }) => (
  <div style={{ position: "relative", width: size, height: size, borderRadius: "50%", background: bg, border: `${Math.max(3, size / 40)}px solid #fff`, boxShadow: "0 10px 30px rgba(13,22,48,0.18)", boxSizing: "border-box", overflow: "visible" }}>
    <Img src={src} style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
    {badge ? <div style={{ position: "absolute", right: -4, bottom: -4, width: size * 0.36, height: size * 0.36, borderRadius: "50%", background: badge === "ok" ? GREEN : "#e0454f", border: "3px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"><path d={badge === "ok" ? "M5 12.5l4.5 4.5L19 7.5" : "M6 6l12 12M18 6L6 18"} /></svg>
    </div> : null}
  </div>
);

/** Win card in the statistics style (like the "today in the base" tiles): result on top,
 *  then the XP earned counts up while five brand-blue lines grow underneath. */
const WinCard: React.FC<{ f: number; res: number }> = ({ f, res }) => {
  const W = 900, H = 640, CH = 250;
  const p = lin(f, RES + 14, RES + 120, 0, 1, Easing.bezier(0.25, 0.6, 0.25, 1));
  const xp = Math.round(30 * lin(f, RES + 14, RES + 90, 0, 1, Easing.out(Easing.cubic)));
  const cols = ["#0d8fd0", "#1cb0f6", "#3db7f4", "#84d8ff", "#bfe9ff"];
  const lines = cols.map((c, k) => {
    const pts = Array.from({ length: 40 }, (_, i) => {
      const x = i / 39;
      const g = Math.pow(x, 1.5 + k * 0.25) * (0.92 - k * 0.13) + Math.sin(x * 8 + k * 2) * 0.025 * x;
      return [30 + x * (W - 60), CH - 10 - g * (CH - 40)] as [number, number];
    });
    const n = Math.max(2, Math.round(p * pts.length));
    return { c, k, tip: pts[n - 1], d: pts.slice(0, n).map((q, i) => `${i ? "L" : "M"}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" ") };
  });
  return (
    <div style={{ position: "relative", width: W, height: H, borderRadius: 36, background: "#fff", overflow: "hidden", boxShadow: "0 40px 100px rgba(8,26,70,0.35)", transform: `rotateX(${(1 - res) * 30}deg) scale(${0.85 + 0.15 * res})`, opacity: Math.min(1, res * 1.4), fontFamily: UI }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 34, display: "flex", alignItems: "center", justifyContent: "center", gap: 26 }}>
        <Avatar src={AV("p1")} size={96} bg="#ffd5cc" />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 60, lineHeight: 1, color: "#2e9d3a" }}>{tr("Победа!")}</div>
          <div style={{ marginTop: 8, fontFamily: HEAD, fontWeight: 900, fontSize: 52, lineHeight: 1, color: NAVY, fontVariantNumeric: "tabular-nums" }}>700 : 0</div>
        </div>
        <Avatar src={AV("p3")} size={96} bg="#d9d6ff" />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center", fontFamily: HEAD, fontWeight: 900, fontSize: 28, letterSpacing: "0.16em", color: "#0d8fd0" }}>{tr("ОПЫТ ЗА ПОБЕДУ")}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 238, textAlign: "center", fontFamily: HEAD, fontWeight: 900, fontSize: 120, lineHeight: 1, letterSpacing: "-0.03em", color: "#1cb0f6", fontVariantNumeric: "tabular-nums" }}>+{xp} XP</div>
      <svg style={{ position: "absolute", left: 0, bottom: 0 }} width={W} height={CH}>
        {lines.slice().reverse().map(({ c, d, tip, k }) => (
          <g key={k}>
            {k === 0 ? <path d={`${d} L${tip[0]} ${CH} L30 ${CH} Z`} fill={c} opacity={0.08} /> : null}
            <path d={d} fill="none" stroke={c} strokeWidth={k === 0 ? 7 : 5} strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={tip[0]} cy={tip[1]} r={k === 0 ? 11 : 7} fill={c} />
          </g>
        ))}
      </svg>
    </div>
  );
};

export const Duel: React.FC = () => {
  const f = useFrame();
  const sp = useSp();
  // ---------- matchmaking
  const found = 128;
  const cyc = ["me0", "me3", "me5", "me1", "me6", "me2", "me7", "me4"];
  const opp = f < found ? cyc[Math.floor(f / 6) % cyc.length] : "p3";
  const pop = sp(found, 10, 220);
  const searchO = 1 - lin(f, SEARCH_END - 18, SEARCH_END);
  // ---------- quiz
  const q = lin(f, SEARCH_END - 10, SEARCH_END + 12);
  const timer = Math.max(0, 15 - Math.floor((Math.min(f, CLICK) - SEARCH_END) / 24));
  const picked = f >= CLICK + 2, rev = f >= REVEAL;
  const myScore = Math.round(lin(f, REVEAL + 6, REVEAL + 40, 0, 700, Easing.out(Easing.cubic)));
  const band = lin(f, REVEAL, REVEAL + 10, 0, 1, OUTE) * (1 - lin(f, RES - 30, RES - 16));
  const res = sp(RES, 15, 150);
  const pk = [SEARCH_END + 10, CLICK - 14, CLICK + 10, RES - 20];
  const px = interpolate(f, pk, [1400, 1250, 1250, 1400], { ...cl, easing: IOE });
  const py = interpolate(f, pk, [1060, 966, 966, 1010], { ...cl, easing: IOE });
  const cap: [number, string, string] = f < SEARCH_END ? [6, tr("Соревнуйся"), tr("с другими.")] : f < RES ? [SEARCH_END + 6, tr("Отвечай"), tr("быстрее соперника.")] : [RES + 6, tr("Побеждай"), tr("и расти в лиге.")];
  return (
    <AbsoluteFill style={{ background: "#fff", overflow: "hidden", fontFamily: UI }}>
      {/* ===== matchmaking */}
      {f < SEARCH_END + 2 ? (
        <AbsoluteFill style={{ opacity: searchO, transform: `scale(${1 + 0.08 * (1 - searchO)})` }}>
          {Array.from({ length: 70 }, (_, i) => {
            const a = (i * 137.5 * Math.PI) / 180, sp0 = 0.6 + ((i * 37) % 10) / 10;
            const r = ((f * 9 * sp0 + i * 53) % 1100) + 60;
            const cols = ["#1cb0f6", "#3db7f4", "#7fd0fa", "#1a8fe0", "#b9e6fd"];
            return <div key={i} style={{ position: "absolute", left: 960 + Math.cos(a) * r, top: 560 + Math.sin(a) * r, width: 30 + r * 0.05, height: 3, borderRadius: 2, background: cols[i % 5], opacity: Math.min(1, r / 300) * 0.8, transform: `rotate(${a}rad)`, transformOrigin: "0 50%" }} />;
          })}
          <div style={{ position: "absolute", left: 960 - 470, top: 330, display: "flex", alignItems: "center", gap: 60 }}>
            <Avatar src={AV("p1")} size={300} bg="#ffd5cc" />
            <div style={{ fontFamily: HEAD, fontWeight: 900, fontStyle: "italic", fontSize: 130, lineHeight: 1, transform: `scale(${1 + 0.05 * Math.sin(f / 5)}) rotate(-8deg)` }}><span style={{ color: "#e0454f", textShadow: "4px 4px 0 #ffd36a" }}>V</span><span style={{ color: BLUE, textShadow: "4px 4px 0 #ffd36a" }}>S</span></div>
            <div style={{ transform: `scale(${f < found ? 1 : 1 + 0.18 * Math.sin(Math.min(1, pop) * Math.PI)})` }}><Avatar src={AV(opp)} size={300} bg={f < found ? "#e9ecf2" : "#d9d6ff"} /></div>
          </div>
          <div style={{ position: "absolute", left: 960 + 170, width: 300, top: 650, textAlign: "center", fontWeight: 800, fontSize: 34, color: f < found ? "#9aa1ab" : NAVY }}>{f < found ? tr("Соперник") : tr("Наргиза")}</div>
          <div style={{ position: "absolute", top: 740, width: "100%", textAlign: "center", fontWeight: 900, fontSize: 58, color: f < found ? "#2b2b2b" : "#2e9d3a" }}>{f < found ? tr("Ищем соперника вашего уровня") : tr("Соперник найден!")}</div>
          <div style={{ position: "absolute", top: 830, width: "100%", textAlign: "center", fontWeight: 600, fontSize: 32, color: "#7c8593" }}>{f < found ? tr("Обычно это занимает несколько секунд.") : tr("Начинаем через 3, 2, 1…")}</div>
        </AbsoluteFill>
      ) : null}

      {/* ===== question */}
      {f >= SEARCH_END - 10 ? (
        <AbsoluteFill style={{ background: "linear-gradient(160deg, #27b8f8 0%, #1a95e3 50%, #1468c4 100%)", opacity: q, perspective: 1600 }}>
          <AbsoluteFill style={{ transform: "rotate(-10deg) scale(1.3)", opacity: 0.12 }}>
            {Array.from({ length: 8 }, (_, r) => <div key={r} style={{ position: "absolute", left: -1400, top: -120 + r * 170, whiteSpace: "nowrap", fontFamily: HEAD, fontWeight: 900, fontSize: 120, color: "#fff", transform: `translateX(${(f * (r % 2 ? 1.6 : -1.6)) % 1300 + (r % 2 ? -650 : 0)}px)` }}>{tr("ИГРЫ • КВИЗЫ • СОРЕВНОВАНИЯ • ЛИГА • ").repeat(6)}</div>)}
          </AbsoluteFill>
          <div style={{ position: "absolute", left: -200 + Math.sin(f / 120) * 60, top: -300, width: 1200, height: 1200, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 62%)" }} />
          <div style={{ position: "absolute", right: -300 + Math.cos(f / 140) * 60, bottom: -500, width: 1300, height: 1300, borderRadius: "50%", background: "radial-gradient(circle, rgba(10,40,110,0.35) 0%, rgba(10,40,110,0) 62%)" }} />
          <div style={{ position: "absolute", left: 390, top: 150, width: 1140, display: "flex", gap: 10 }}>
            {Array.from({ length: 7 }, (_, i) => <div key={i} style={{ flex: 1, height: 10, borderRadius: 5, background: i === 0 ? (rev ? GREEN : "#e0454f") : "rgba(255,255,255,0.45)" }} />)}
          </div>
          <div style={{ position: "absolute", left: 390, top: 186, display: "flex", alignItems: "center", gap: 16 }}>
            <Avatar src={AV("p1")} size={92} bg="#ffd5cc" badge={rev ? "ok" : undefined} />
            <div style={{ fontWeight: 900, fontSize: 40, color: "#fff", transform: `scale(${1 + 0.25 * Math.sin(lin(f, REVEAL + 6, REVEAL + 30) * Math.PI)})` }}>{myScore}</div>
          </div>
          <div style={{ position: "absolute", left: 960 - 50, top: 186, width: 100, height: 100, borderRadius: 50, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 44, color: timer <= 5 ? "#e0454f" : "#1f6fb5", boxShadow: "0 8px 24px rgba(13,22,48,0.15)" }}>{timer}</div>
          <div style={{ position: "absolute", right: 390, top: 186, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ textAlign: "right", color: "#fff" }}><div style={{ fontWeight: 700, fontSize: 26, opacity: 0.9 }}>{tr("Наргиза")}</div><div style={{ fontWeight: 900, fontSize: 40 }}>0</div></div>
            <Avatar src={AV("p3")} size={92} bg="#d9d6ff" badge={rev ? "no" : undefined} />
          </div>
          <div style={{ position: "absolute", left: 390, top: 306, width: 1140, height: 400, borderRadius: 26, background: "#fff", overflow: "hidden", boxShadow: "0 24px 70px rgba(8,30,80,0.30)", transform: `rotateX(${(1 - sp(SEARCH_END, 16, 150)) * 24}deg) translateZ(${(1 - sp(SEARCH_END, 16, 150)) * -120}px)`, transformOrigin: "50% 100%" }}>
            <div style={{ position: "absolute", left: 70, right: 70, top: 120, fontWeight: 800, fontSize: 52, lineHeight: 1.3, color: "#2b2b2b", textAlign: "center", opacity: lin(f, SEARCH_END + 6, SEARCH_END + 20) }}>{tr("Право, закреплённое в законах государства, называется…")}</div>
            <div style={{ position: "absolute", left: -40, right: -40, top: 145, height: 110, background: GREEN, transform: `rotate(-3deg) scaleX(${band})`, display: "flex", alignItems: "center", justifyContent: "center", gap: 18, color: "#fff", fontWeight: 900, fontSize: 52, opacity: band > 0.01 ? 1 : 0 }}>
              <div style={{ width: 62, height: 62, borderRadius: 31, border: "4px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></div>
              {tr("Верно! +700")}
            </div>
          </div>
          {ANS.map(([t, c, d, k], i) => {
            const mine = i === 3, oppPick = i === 1;
            const e = sp(SEARCH_END + 14 + i * 4, 16, 160);
            const dim = rev && !mine && !oppPick ? 0.55 : picked && !mine && !rev ? 0.7 : 1;
            // tap: the tile tilts in 3D towards the press and settles back smoothly
            const tap = mine ? lin(f, CLICK - 3, CLICK + 2, 0, 1, OUTE) * (1 - lin(f, CLICK + 4, CLICK + 26, 0, 1, IOE)) : 0;
            // reveal: the right answer swings once around its vertical axis
            const sw = mine ? Math.sin(lin(f, REVEAL, REVEAL + 28) * Math.PI) : 0;
            const won = rev && mine, lost = rev && oppPick;
            const bg = won ? "#2f9e25" : lost ? "#d33845" : c;
            const tx = "#fff";
            return (
              <div key={t} style={{ position: "absolute", left: 390 + (i % 2) * 580, top: 726 + Math.floor(i / 2) * 166, width: 560, height: 146, borderRadius: 18, background: bg, boxShadow: `0 6px 0 ${won ? "#24801c" : lost ? "#a82a35" : d}, 0 16px 34px rgba(8,30,80,0.22)`, display: "flex", alignItems: "center", gap: 22, padding: "0 36px", boxSizing: "border-box", color: tx, fontWeight: 900, fontSize: 34, opacity: Math.min(1, e * 1.4) * dim, transformOrigin: "50% 50%", transform: `translateY(${(1 - e) * 40}px) rotateX(${(1 - e) * -55 + tap * 12}deg) rotateY(${tap * -9 + sw * 14}deg) translateZ(${tap * -40 + sw * 30}px) scale(${1 + sw * 0.04})` }}>
                {won || lost ? <div style={{ width: 52, height: 52, borderRadius: 26, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={won ? GREEN : "#d33845"} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"><path d={won ? "M5 12.5l4.5 4.5L19 7.5" : "M6 6l12 12M18 6L6 18"} /></svg></div>
                  : <Shape k={k} />}
                <div style={{ flex: 1 }}>{t}</div>
                {lost ? <Avatar src={AV("p3")} size={70} bg="#d9d6ff" /> : null}
                {won ? <Avatar src={AV("p1")} size={70} bg="#ffd5cc" /> : null}
              </div>
            );
          })}
          <Confetti at={REVEAL} x={1560} y={800} n={60} />
          {/* win card */}
          {f >= RES ? (
            <AbsoluteFill style={{ background: `rgba(8,26,70,${0.45 * Math.min(1, res)})`, alignItems: "center", justifyContent: "center", perspective: 1600 }}>
              <WinCard f={f} res={res} />
            </AbsoluteFill>
          ) : null}
        </AbsoluteFill>
      ) : null}

      {/* caption, top left, white panel so it reads on both backgrounds */}
      <TopLine key={cap[0]} a={cap[1]} b={cap[2]} at={cap[0]} dark={f >= SEARCH_END} size={f < SEARCH_END ? 66 : 54} band={f >= SEARCH_END ? "rgba(150,120,170,0.0)" : undefined} />
      <Confetti at={RES + 4} />
      {f >= SEARCH_END + 10 && f < RES - 10 ? <div style={{ position: "absolute", inset: 0, zIndex: 50 }}><Pointer x={px} y={py} down={press(f, CLICK)} op={lin(f, SEARCH_END + 10, SEARCH_END + 22) * (1 - lin(f, RES - 24, RES - 10))} /></div> : null}
    </AbsoluteFill>
  );
};
export const DUEL_FRAMES = END;
