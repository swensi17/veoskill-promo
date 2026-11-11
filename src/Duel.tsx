import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile } from "remotion";
import { Confetti } from "./Lesson";
import { NAVY, BLUE, GREEN, UI, HEAD, OUTE, IOE, lin, press, useSp, useFrame, Cap, Pointer } from "./Scenes9";

// Play against another learner (veoskill.uz/hub/duels; the word itself is kept out of frame, see docs/RULES.md):
// matchmaking with speed streaks and VS, then a timed question with 4 coloured answers, then the win card.
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const AV = (n: string) => staticFile(`av/${n}.svg`);
const SEARCH_END = 200, CLICK = 330, REVEAL = 352, RES = 470, END = 720;
const ANS: [string, string, string, "tri" | "dia" | "cir" | "sq"][] = [
  ["моралью общества.", "#7d5bb5", "#5e4192", "tri"], ["субъективным правом.", "#e0454f", "#b8303a", "dia"],
  ["правомочием.", "#b9735e", "#94573f", "cir"], ["объективным правом.", "#34a02a", "#24801c", "sq"],
];
const Shape: React.FC<{ k: string }> = ({ k }) => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="rgba(255,255,255,0.9)">
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
  const cap: [number, string, string] = f < SEARCH_END ? [6, "Соревнуйся", "с другими."] : f < RES ? [SEARCH_END + 6, "Отвечай", "быстрее соперника."] : [RES + 6, "Побеждай", "и расти в лиге."];
  return (
    <AbsoluteFill style={{ background: "#fff", overflow: "hidden", fontFamily: UI }}>
      {/* ===== matchmaking */}
      {f < SEARCH_END + 2 ? (
        <AbsoluteFill style={{ opacity: searchO, transform: `scale(${1 + 0.08 * (1 - searchO)})` }}>
          {Array.from({ length: 70 }, (_, i) => {
            const a = (i * 137.5 * Math.PI) / 180, sp0 = 0.6 + ((i * 37) % 10) / 10;
            const r = ((f * 9 * sp0 + i * 53) % 1100) + 60;
            const cols = ["#ff8fa3", "#7fd6ff", "#ffd36a", "#8fe39a", "#c9a7ff"];
            return <div key={i} style={{ position: "absolute", left: 960 + Math.cos(a) * r, top: 560 + Math.sin(a) * r, width: 30 + r * 0.05, height: 3, borderRadius: 2, background: cols[i % 5], opacity: Math.min(1, r / 300) * 0.8, transform: `rotate(${a}rad)`, transformOrigin: "0 50%" }} />;
          })}
          <div style={{ position: "absolute", left: 960 - 470, top: 330, display: "flex", alignItems: "center", gap: 60 }}>
            <Avatar src={AV("p1")} size={300} bg="#ffd5cc" />
            <div style={{ fontFamily: HEAD, fontWeight: 900, fontStyle: "italic", fontSize: 130, lineHeight: 1, transform: `scale(${1 + 0.05 * Math.sin(f / 5)}) rotate(-8deg)` }}><span style={{ color: "#e0454f", textShadow: "4px 4px 0 #ffd36a" }}>V</span><span style={{ color: BLUE, textShadow: "4px 4px 0 #ffd36a" }}>S</span></div>
            <div style={{ transform: `scale(${f < found ? 1 : 1 + 0.18 * Math.sin(Math.min(1, pop) * Math.PI)})` }}><Avatar src={AV(opp)} size={300} bg={f < found ? "#e9ecf2" : "#d9d6ff"} /></div>
          </div>
          <div style={{ position: "absolute", left: 960 + 170, width: 300, top: 650, textAlign: "center", fontWeight: 800, fontSize: 34, color: f < found ? "#9aa1ab" : NAVY }}>{f < found ? "Соперник" : "Наргиза"}</div>
          <div style={{ position: "absolute", top: 740, width: "100%", textAlign: "center", fontWeight: 900, fontSize: 58, color: f < found ? "#2b2b2b" : "#2e9d3a" }}>{f < found ? "Ищем соперника вашего уровня" : "Соперник найден!"}</div>
          <div style={{ position: "absolute", top: 830, width: "100%", textAlign: "center", fontWeight: 600, fontSize: 32, color: "#7c8593" }}>{f < found ? "Обычно это занимает несколько секунд." : "Начинаем через 3, 2, 1…"}</div>
        </AbsoluteFill>
      ) : null}

      {/* ===== question */}
      {f >= SEARCH_END - 10 ? (
        <AbsoluteFill style={{ background: "linear-gradient(110deg, #b893a6 0%, #8d82b8 55%, #7d86c2 100%)", opacity: q }}>
          <div style={{ position: "absolute", left: 390, top: 150, width: 1140, display: "flex", gap: 10 }}>
            {Array.from({ length: 7 }, (_, i) => <div key={i} style={{ flex: 1, height: 10, borderRadius: 5, background: i === 0 ? (rev ? GREEN : "#e0454f") : "rgba(255,255,255,0.45)" }} />)}
          </div>
          <div style={{ position: "absolute", left: 390, top: 186, display: "flex", alignItems: "center", gap: 16 }}>
            <Avatar src={AV("p1")} size={92} bg="#ffd5cc" badge={rev ? "ok" : undefined} />
            <div style={{ fontWeight: 900, fontSize: 40, color: "#fff", transform: `scale(${1 + 0.25 * Math.sin(lin(f, REVEAL + 6, REVEAL + 30) * Math.PI)})` }}>{myScore}</div>
          </div>
          <div style={{ position: "absolute", left: 960 - 50, top: 186, width: 100, height: 100, borderRadius: 50, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 44, color: timer <= 5 ? "#e0454f" : "#1f6fb5", boxShadow: "0 8px 24px rgba(13,22,48,0.15)" }}>{timer}</div>
          <div style={{ position: "absolute", right: 390, top: 186, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ textAlign: "right", color: "#fff" }}><div style={{ fontWeight: 700, fontSize: 26, opacity: 0.9 }}>Наргиза</div><div style={{ fontWeight: 900, fontSize: 40 }}>0</div></div>
            <Avatar src={AV("p3")} size={92} bg="#d9d6ff" badge={rev ? "no" : undefined} />
          </div>
          <div style={{ position: "absolute", left: 390, top: 306, width: 1140, height: 400, borderRadius: 26, background: "#fff", overflow: "hidden", boxShadow: "0 20px 60px rgba(13,22,48,0.2)" }}>
            <div style={{ position: "absolute", left: 70, right: 70, top: 120, fontWeight: 800, fontSize: 52, lineHeight: 1.3, color: "#2b2b2b", textAlign: "center", opacity: lin(f, SEARCH_END + 6, SEARCH_END + 20) }}>Право, закреплённое в законах государства, называется…</div>
            <div style={{ position: "absolute", left: -40, right: -40, top: 145, height: 110, background: GREEN, transform: `rotate(-3deg) scaleX(${band})`, display: "flex", alignItems: "center", justifyContent: "center", gap: 18, color: "#fff", fontWeight: 900, fontSize: 52, opacity: band > 0.01 ? 1 : 0 }}>
              <div style={{ width: 62, height: 62, borderRadius: 31, border: "4px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></div>
              Верно! +700
            </div>
          </div>
          {ANS.map(([t, c, d, k], i) => {
            const mine = i === 3, oppPick = i === 1;
            const e = sp(SEARCH_END + 14 + i * 4, 14, 180);
            const dim = rev && !mine && !oppPick ? 0.45 : picked && !mine && !rev ? 0.6 : 1;
            const bg = rev && mine ? "#2f9e25" : rev && oppPick ? "#d33845" : c;
            return (
              <div key={t} style={{ position: "absolute", left: 390 + (i % 2) * 580, top: 726 + Math.floor(i / 2) * 166, width: 560, height: 146, borderRadius: 18, background: bg, boxShadow: `0 6px 0 ${d}`, display: "flex", alignItems: "center", gap: 22, padding: "0 36px", boxSizing: "border-box", color: "#fff", fontWeight: 900, fontSize: 34, opacity: Math.min(1, e * 1.4) * dim, transform: `translateY(${(1 - e) * 30 + (mine ? press(f, CLICK) * 5 : 0)}px)` }}>
                {rev && (mine || oppPick) ? <div style={{ width: 46, height: 46, borderRadius: 23, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={mine ? GREEN : "#d33845"} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"><path d={mine ? "M5 12.5l4.5 4.5L19 7.5" : "M6 6l12 12M18 6L6 18"} /></svg></div> : <Shape k={k} />}
                <div style={{ flex: 1 }}>{t}</div>
                {rev && oppPick ? <Avatar src={AV("p3")} size={70} bg="#d9d6ff" /> : null}
                {rev && mine ? <Avatar src={AV("p1")} size={70} bg="#ffd5cc" /> : null}
              </div>
            );
          })}
          <Confetti at={REVEAL} x={1560} y={800} n={60} />
          {/* win card */}
          {f >= RES ? (
            <AbsoluteFill style={{ background: `rgba(30,24,60,${0.45 * Math.min(1, res)})`, alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 760, padding: "50px 40px 46px", borderRadius: 36, background: "#fff", textAlign: "center", boxShadow: "0 40px 100px rgba(13,22,48,0.35)", transform: `scale(${0.85 + 0.15 * res})`, opacity: Math.min(1, res * 1.4) }}>
                <Img src={staticFile("av/medal-1.webp")} style={{ width: 150, height: 150, objectFit: "contain", transform: `rotate(${Math.sin(f / 10) * 5}deg)` }} />
                <div style={{ marginTop: 10, fontFamily: HEAD, fontWeight: 900, fontSize: 76, color: "#2e9d3a" }}>Победа!</div>
                <div style={{ marginTop: 18, display: "flex", alignItems: "center", justifyContent: "center", gap: 30 }}>
                  <Avatar src={AV("p1")} size={110} bg="#ffd5cc" />
                  <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 64, color: NAVY }}>700 : 0</div>
                  <Avatar src={AV("p3")} size={110} bg="#d9d6ff" />
                </div>
                <div style={{ marginTop: 22, display: "inline-block", padding: "12px 30px", borderRadius: 18, background: "#fff4cc", fontWeight: 900, fontSize: 38, color: "#d49a00" }}>+30 XP</div>
              </div>
            </AbsoluteFill>
          ) : null}
        </AbsoluteFill>
      ) : null}

      {/* caption, top left, white panel so it reads on both backgrounds */}
      <div key={cap[0]} style={{ position: "absolute", left: f < SEARCH_END ? 80 : 0, right: f < SEARCH_END ? undefined : 0, top: f < SEARCH_END ? 50 : 28, width: f < SEARCH_END ? 600 : undefined, zIndex: 40, display: "flex", flexDirection: f < SEARCH_END ? "column" : "row", justifyContent: "center", columnGap: 18 }}>
        <Cap text={cap[1]} at={cap[0]} size={f < SEARCH_END ? 64 : 56} color={f < SEARCH_END ? NAVY : "#fff"} />
        <Cap text={cap[2]} at={cap[0] + 8} size={f < SEARCH_END ? 64 : 56} color={f < SEARCH_END ? NAVY : "#fff"} accent={cap[2]} accentColor={f < SEARCH_END ? BLUE : "#ffe27a"} />
      </div>
      <Confetti at={RES + 4} />
      {f >= SEARCH_END + 10 && f < RES - 10 ? <div style={{ position: "absolute", inset: 0, zIndex: 50 }}><Pointer x={px} y={py} down={press(f, CLICK)} op={lin(f, SEARCH_END + 10, SEARCH_END + 22) * (1 - lin(f, RES - 24, RES - 10))} /></div> : null}
    </AbsoluteFill>
  );
};
export const DUEL_FRAMES = END;
