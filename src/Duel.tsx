import React from "react";
import { tr } from "./i18n";
import { AbsoluteFill, Easing, Img, interpolate, staticFile } from "remotion";
import { Confetti } from "./Lesson";
import { StatCard } from "./V11Parts";
import { NAVY, BLUE, GREEN, UI, HEAD, OUTE, IOE, lin, press, useSp, useFrame, Pointer, TopLine } from "./Scenes9";

// Play against another learner (veoskill.uz/hub/duels; the word itself is kept out of frame, see docs/RULES.md):
// matchmaking with speed streaks and VS, then a timed question with 4 answers on one brand-blue backdrop
// (white tiles, 3D tilt on the tap, 3D swing on the reveal), then the win card.
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const AV = (n: string) => staticFile(`av/${n}.svg`);
const SEARCH_END = 200, RES = 700, END = 950;
// three rounds of different kinds; each slides in from the right and leaves to the left
type Round = { q: string; kind: "four" | "tf"; ans: [string, string, string, string][]; right: number; opp: number; gain: number; t0: number; click: number; rev: number; out: number };
const ANS: [string, string, string, string][] = [
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

const BlueBurst: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ pointerEvents: "none", zIndex: 45 }}>
    {Array.from({ length: 120 }, (_, i) => {
      const r = (q: number) => { const v = Math.sin(i * q) * 43758.5453; return v - Math.floor(v); };
      const a = r(12.9) * Math.PI * 2, sp0 = 500 + r(78.2) * 900;
      const x = 960 + Math.cos(a) * sp0 * t, y = 420 + Math.sin(a) * sp0 * t * 0.8 - 300 * t + 900 * t * t;
      const w = 12 + r(4.4) * 16, h = 18 + r(9.1) * 18;
      return <div key={i} style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: r(2.2) > 0.6 ? w : 4, background: ["#0d8fd0", "#1cb0f6", "#3db7f4", "#84d8ff", "#bfe9ff"][i % 5], transform: `rotate(${r(5.5) * 360 + t * 400}deg)` }} />;
    })}
  </AbsoluteFill>
);

const ROUNDS: Round[] = [
  { q: tr("Право, закреплённое в законах государства, называется…"), kind: "four", ans: ANS, right: 3, opp: 1, gain: 250, t0: SEARCH_END, click: 290, rev: 302, out: 352 },
  { q: tr("Закон обязателен для всех, даже если ты с ним не согласен."), kind: "tf", ans: [[tr("ВЕРНО"), "#34a02a", "#24801c", "ok"], [tr("НЕВЕРНО"), "#e0454f", "#b8303a", "no"]], right: 0, opp: 1, gain: 200, t0: 362, click: 444, rev: 456, out: 508 },
  { q: tr("Как называется главный закон страны?"), kind: "four", ans: [[tr("Конституция"), "#7d5bb5", "#5e4192", "tri"], [tr("Кодекс"), "#e0454f", "#b8303a", "dia"], [tr("Указ"), "#b9735e", "#94573f", "cir"], [tr("Договор"), "#34a02a", "#24801c", "sq"]], right: 0, opp: 2, gain: 250, t0: 518, click: 604, rev: 616, out: 9999 },
];
// tile box of answer i in a round
const tile = (r: Round, i: number) => r.kind === "tf" ? { x: 390 + i * 580, y: 740, w: 560, h: 200 } : { x: 390 + (i % 2) * 580, y: 726 + Math.floor(i / 2) * 166, w: 560, h: 146 };
const TfIcon: React.FC<{ ok: boolean }> = ({ ok }) => <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d={ok ? "M5 12.5l4.5 4.5L19 7.5" : "M6 6l12 12M18 6L6 18"} /></svg>;

export const Duel: React.FC = () => {
  const f = useFrame();
  const sp = useSp();
  // ---------- matchmaking
  const found = 128;
  const cyc = ["me0", "me3", "me5", "me1", "me6", "me2", "me7", "me4"];
  // the opponent avatars roll upwards like a slot reel and stop on the found opponent
  const REEL = [...cyc, ...cyc, ...cyc, "p3"];
  const reel = (REEL.length - 1) * (1 - Math.pow(1 - Math.min(1, f / found), 3));
  const pop = sp(found, 10, 220);
  const searchO = 1 - lin(f, SEARCH_END - 18, SEARCH_END);
  // ---------- quiz
  const q = lin(f, SEARCH_END - 10, SEARCH_END + 12);
  const ri = f < ROUNDS[1].t0 ? 0 : f < ROUNDS[2].t0 ? 1 : 2;      // current round
  const cur = ROUNDS[ri];
  const timer = Math.max(0, 15 - Math.floor((Math.min(f, cur.click) - cur.t0) / 24));
  const rev = f >= cur.rev && f < cur.out;
  const myScore = Math.round(ROUNDS.reduce((a, r) => a + r.gain * lin(f, r.rev + 6, r.rev + 40, 0, 1, Easing.out(Easing.cubic)), 0));
  const bump = Math.max(...ROUNDS.map((r) => Math.sin(lin(f, r.rev + 6, r.rev + 30) * Math.PI)));
  const res = sp(RES, 15, 150);
  // the cursor visits the right answer of every round
  const pk: number[] = [], pxs: number[] = [], pys: number[] = [];
  ROUNDS.forEach((r) => { const b = tile(r, r.right); const cx = b.x + b.w * 0.62, cy = b.y + b.h * 0.6; pk.push(r.t0 + 14, r.click - 14, r.click + 10); pxs.push(1500, cx, cx); pys.push(1050, cy, cy); });
  pk.push(RES - 20); pxs.push(1500); pys.push(1050);
  const px = interpolate(f, pk, pxs, { ...cl, easing: IOE });
  const py = interpolate(f, pk, pys, { ...cl, easing: IOE });
  const down = Math.max(...ROUNDS.map((r) => press(f, r.click)));
  // after the win card: full-screen XP counter (same look as the "today in the base" counter)
  const XP0 = RES + 96;
  const xpIn = lin(f, XP0, XP0 + 22, 0, 1, Easing.bezier(0.65, 0, 0.35, 1));
  const xpN = Math.round(30 * lin(f, XP0 + 14, XP0 + 104, 0, 1, Easing.bezier(0.2, 0.6, 0.25, 1)));
  const cap: [number, string, string] = f < SEARCH_END ? [6, tr("Соревнуйся"), tr("с другими.")] : f < RES ? [SEARCH_END + 6, tr("Отвечай"), tr("быстрее соперника.")] : [RES + 6, tr("Побеждай"), tr("и расти в лиге.")];
  return (
    <AbsoluteFill style={{ background: "#fff", overflow: "hidden", fontFamily: UI }}>
      {/* ===== matchmaking */}
      {f < SEARCH_END + 2 ? (
        <AbsoluteFill style={{ opacity: searchO, transform: `scale(${1 + 0.08 * (1 - searchO)})`, background: "radial-gradient(ellipse at 50% 45%, #ffffff 0%, #f1f8fe 55%, #dff0fc 100%)", perspective: 1400 }}>
          {/* 3D tunnel: rounded rings fly towards the camera */}
          {Array.from({ length: 9 }, (_, k) => {
            const z = ((f / 70 + k / 9) % 1);
            const sc = 0.15 + Math.pow(z, 2.2) * 2.6;
            return <div key={"r" + k} style={{ position: "absolute", left: 960 - 400, top: 480 - 400, width: 800, height: 800, borderRadius: "50%", border: `${2 + z * 4}px solid rgba(28,176,246,${0.2 * Math.sin(z * Math.PI)})`, transform: `scale(${sc})` }} />;
          })}
          <div style={{ position: "absolute", left: 960 - 470, top: 330, display: "flex", alignItems: "center", gap: 60 }}>
            <div style={{ transform: `translateY(${(1 - sp(2, 16, 140)) * 260 + Math.sin(f / 18) * 8}px)`, opacity: Math.min(1, sp(2, 16, 140) * 2) }}><Avatar src={AV("p1")} size={300} bg="#ffd5cc" /></div>
            <div style={{ fontFamily: HEAD, fontWeight: 900, fontStyle: "italic", fontSize: 140, lineHeight: 1, transform: `rotateY(${Math.sin(f / 16) * 18}deg) rotateX(${Math.cos(f / 20) * 8}deg) scale(${0.6 + 0.4 * sp(8, 14, 220) + (f >= found ? 0.12 * Math.sin(Math.min(1, pop) * Math.PI) : 0)}) rotate(-8deg)` }}>
              <span style={{ color: "#e0454f", textShadow: "1px 1px 0 #b8303a, 2px 2px 0 #b8303a, 3px 3px 0 #b8303a, 4px 4px 0 #b8303a, 5px 5px 0 #a42a33, 6px 6px 0 #a42a33, 10px 14px 24px rgba(13,22,48,0.25)" }}>V</span>
              <span style={{ color: BLUE, textShadow: "1px 1px 0 #1789c4, 2px 2px 0 #1789c4, 3px 3px 0 #1789c4, 4px 4px 0 #1789c4, 5px 5px 0 #136fa0, 6px 6px 0 #136fa0, 10px 14px 24px rgba(13,22,48,0.25)" }}>S</span>
            </div>
            <div style={{ position: "relative", transform: `translateY(${(1 - sp(6, 16, 140)) * 260 + Math.sin(f / 18 + 1) * 8}px) scale(${f < found ? 1 : 1 + 0.15 * Math.sin(Math.min(1, pop) * Math.PI)})`, opacity: Math.min(1, sp(6, 16, 140) * 2) }}>
              <div style={{ width: 300, height: 300, borderRadius: "50%", background: f < found ? "#e9ecf2" : "#d9d6ff", border: "8px solid #fff", boxShadow: "0 10px 30px rgba(13,22,48,0.18)", boxSizing: "border-box", overflow: "hidden" }}>
                <div style={{ transform: `translateY(${-reel * 284}px)` }}>
                  {REEL.map((n, k) => <Img key={k} src={AV(n)} style={{ display: "block", width: 284, height: 284, filter: f < found && Math.abs(k - reel) < 2 ? `blur(${Math.min(6, (1 - f / found) * 8)}px)` : undefined }} />)}
                </div>
              </div>
              {f >= found && f < found + 30 ? <div style={{ position: "absolute", left: 150 - 150 * (1 + (f - found) / 12), top: 150 - 150 * (1 + (f - found) / 12), width: 300 * (1 + (f - found) / 12), height: 300 * (1 + (f - found) / 12), borderRadius: "50%", border: "6px solid rgba(46,157,58,0.6)", opacity: 1 - (f - found) / 30, boxSizing: "border-box" }} /> : null}
            </div>
          </div>
          <div style={{ position: "absolute", left: 960 - 470, width: 300, top: 650, textAlign: "center", fontWeight: 800, fontSize: 34, color: NAVY }}>{tr("Ты")}</div>
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
            {Array.from({ length: 7 }, (_, i) => <div key={i} style={{ flex: 1, height: 10, borderRadius: 5, background: i < 3 && f >= ROUNDS[i].rev ? GREEN : i === ri ? "#fff" : "rgba(255,255,255,0.4)" }} />)}
          </div>
          <div style={{ position: "absolute", left: 390, top: 186, display: "flex", alignItems: "center", gap: 16 }}>
            <Avatar src={AV("p1")} size={92} bg="#ffd5cc" badge={rev ? "ok" : undefined} />
            <div style={{ fontWeight: 900, fontSize: 40, color: "#fff", transform: `scale(${1 + 0.25 * bump})`, fontVariantNumeric: "tabular-nums" }}>{myScore}</div>
          </div>
          <div style={{ position: "absolute", left: 960 - 50, top: 186, width: 100, height: 100, borderRadius: 50, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 44, color: timer <= 5 ? "#e0454f" : "#1f6fb5", boxShadow: "0 8px 24px rgba(13,22,48,0.15)" }}>{timer}</div>
          <div style={{ position: "absolute", right: 390, top: 186, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ textAlign: "right", color: "#fff" }}><div style={{ fontWeight: 700, fontSize: 26, opacity: 0.9 }}>{tr("Наргиза")}</div><div style={{ fontWeight: 900, fontSize: 40 }}>0</div></div>
            <Avatar src={AV("p3")} size={92} bg="#d9d6ff" badge={rev ? "no" : undefined} />
          </div>
          {ROUNDS.map((r, n) => {
            if (f < r.t0 - 14 || f > r.out + 22) return null;
            // slide: in from the right, out to the left, with a little 3D turn
            const inn = n === 0 ? 1 : lin(f, r.t0 - 14, r.t0 + 10, 0, 1, Easing.bezier(0.2, 0.8, 0.2, 1));
            const out = lin(f, r.out, r.out + 20, 0, 1, Easing.bezier(0.6, 0, 0.8, 0.4));
            const dx = (1 - inn) * 1400 - out * 1500, ry = (1 - inn) * -25 + out * 25;
            const card = n === 0 ? sp(SEARCH_END, 16, 150) : 1;
            const rv = f >= r.rev, picked = f >= r.click + 2;
            const band = lin(f, r.rev, r.rev + 10, 0, 1, OUTE) * (1 - lin(f, Math.min(r.out, RES) - 14, Math.min(r.out, RES)));
            return (
              <AbsoluteFill key={n} style={{ transform: `translateX(${dx}px) rotateY(${ry}deg)`, opacity: 1 - out * 0.6 }}>
                <div style={{ position: "absolute", left: 390, top: 306, width: 1140, height: r.kind === "tf" ? 410 : 400, borderRadius: 26, background: "#fff", overflow: "hidden", boxShadow: "0 24px 70px rgba(8,30,80,0.30)", transform: `rotateX(${(1 - card) * 24}deg) translateZ(${(1 - card) * -120}px)`, transformOrigin: "50% 100%" }}>
                  <div style={{ position: "absolute", left: 0, right: 0, top: 34, textAlign: "center", fontWeight: 900, fontSize: 22, letterSpacing: "0.16em", color: "#1cb0f6" }}>{tr("ВОПРОС")} {n + 1} / 7</div>
                  <div style={{ position: "absolute", left: 70, right: 70, top: r.kind === "tf" ? 130 : 120, fontWeight: 800, fontSize: 50, lineHeight: 1.3, color: "#2b2b2b", textAlign: "center" }}>{r.q}</div>
                  <div style={{ position: "absolute", left: -40, right: -40, top: 150, height: 110, background: GREEN, transform: `rotate(-3deg) scaleX(${band})`, display: "flex", alignItems: "center", justifyContent: "center", gap: 18, color: "#fff", fontWeight: 900, fontSize: 52, opacity: band > 0.01 ? 1 : 0 }}>
                    <div style={{ width: 62, height: 62, borderRadius: 31, border: "4px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></div>
                    {tr("Верно!")} +{r.gain}
                  </div>
                </div>
                {r.ans.map(([t, c, d, k], i) => {
                  const b = tile(r, i);
                  const mine = i === r.right, oppPick = i === r.opp;
                  const e = n === 0 ? sp(SEARCH_END + 14 + i * 4, 16, 160) : 1;
                  const dim = rv && !mine && !oppPick ? 0.55 : picked && !mine && !rv ? 0.7 : 1;
                  const tap = mine ? lin(f, r.click - 3, r.click + 2, 0, 1, OUTE) * (1 - lin(f, r.click + 4, r.click + 26, 0, 1, IOE)) : 0;
                  const sw = mine ? Math.sin(lin(f, r.rev, r.rev + 28) * Math.PI) : 0;
                  const won = rv && mine, lost = rv && oppPick;
                  const bg = won ? "#2f9e25" : lost ? "#d33845" : c;
                  return (
                    <div key={t} style={{ position: "absolute", left: b.x, top: b.y, width: b.w, height: b.h, borderRadius: 18, background: bg, boxShadow: `0 6px 0 ${won ? "#24801c" : lost ? "#a82a35" : d}, 0 16px 34px rgba(8,30,80,0.22)`, display: "flex", alignItems: "center", justifyContent: r.kind === "tf" ? "center" : undefined, gap: 22, padding: "0 36px", boxSizing: "border-box", color: "#fff", fontWeight: 900, fontSize: r.kind === "tf" ? 50 : 34, letterSpacing: r.kind === "tf" ? "0.04em" : undefined, opacity: Math.min(1, e * 1.4) * dim, transformOrigin: "50% 50%", transform: `translateY(${(1 - e) * 40}px) rotateX(${(1 - e) * -55 + tap * 12}deg) rotateY(${tap * -9 + sw * 14}deg) translateZ(${tap * -40 + sw * 30}px) scale(${1 + sw * 0.04})` }}>
                      {won || lost ? <div style={{ width: 52, height: 52, borderRadius: 26, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={won ? GREEN : "#d33845"} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"><path d={won ? "M5 12.5l4.5 4.5L19 7.5" : "M6 6l12 12M18 6L6 18"} /></svg></div>
                        : r.kind === "tf" ? <TfIcon ok={k === "ok"} /> : <Shape k={k} />}
                      <div style={{ flex: r.kind === "tf" ? undefined : 1 }}>{t}</div>
                      {lost ? <Avatar src={AV("p3")} size={70} bg="#d9d6ff" /> : null}
                      {won ? <Avatar src={AV("p1")} size={70} bg="#ffd5cc" /> : null}
                    </div>
                  );
                })}
                <Confetti at={r.rev} x={tile(r, r.right).x + 300} y={tile(r, r.right).y + 40} n={50} />
              </AbsoluteFill>
            );
          })}
          {/* win card */}
          {f >= RES ? (
            <AbsoluteFill style={{ background: `rgba(8,26,70,${0.45 * Math.min(1, res)})`, alignItems: "center", justifyContent: "center", perspective: 1600 }}>
              <div style={{ width: 760, padding: "50px 40px 46px", borderRadius: 36, background: "#fff", textAlign: "center", boxShadow: "0 40px 100px rgba(8,26,70,0.35)", transform: `rotateX(${(1 - res) * 30}deg) scale(${0.85 + 0.15 * res})`, opacity: Math.min(1, res * 1.4) }}>
                <Img src={staticFile("av/medal-1.webp")} style={{ width: 150, height: 150, objectFit: "contain", transform: `rotate(${Math.sin(f / 10) * 5}deg)` }} />
                <div style={{ marginTop: 10, fontFamily: HEAD, fontWeight: 900, fontSize: 76, color: "#2e9d3a" }}>{tr("Победа!")}</div>
                <div style={{ marginTop: 18, display: "flex", alignItems: "center", justifyContent: "center", gap: 30 }}>
                  <Avatar src={AV("p1")} size={110} bg="#ffd5cc" />
                  <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 64, color: NAVY }}>700 : 0</div>
                  <Avatar src={AV("p3")} size={110} bg="#d9d6ff" />
                </div>
              </div>
            </AbsoluteFill>
          ) : null}
        </AbsoluteFill>
      ) : null}

      {f >= XP0 ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", zIndex: 40 }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transformOrigin: "50% 50%", transform: `scale(${0.4 + 0.6 * xpIn})`, opacity: Math.min(1, xpIn * 2), borderRadius: 70 * (1 - xpIn), overflow: "hidden", boxShadow: "0 40px 120px rgba(8,26,70,0.35)" }}>
            <StatCard label={tr("ОПЫТ ЗА ПОБЕДУ")} value={`+${xpN} XP`} at={XP0 + 14} dur={90} seed={1} vs={300} />
          </div>
        </AbsoluteFill>
      ) : null}
      {/* caption, top left, white panel so it reads on both backgrounds */}
      <TopLine key={cap[0]} a={cap[1]} b={cap[2]} at={cap[0]} dark={f >= SEARCH_END && f < XP0 + 10} size={f < SEARCH_END ? 66 : 54} band={f >= SEARCH_END ? "rgba(150,120,170,0.0)" : undefined} />
      <Confetti at={RES + 4} />
      {f >= XP0 + 104 && f < XP0 + 240 ? <BlueBurst t={(f - XP0 - 104) / 60} /> : null}
      {f >= SEARCH_END + 10 && f < RES - 10 ? <div style={{ position: "absolute", inset: 0, zIndex: 50 }}><Pointer x={px} y={py} down={down} op={lin(f, SEARCH_END + 10, SEARCH_END + 22) * (1 - lin(f, RES - 24, RES - 10))} /></div> : null}
    </AbsoluteFill>
  );
};
export const DUEL_FRAMES = END;
