import React from "react";
import { AbsoluteFill, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts7, fit } from "./Kit7";
import { DemoNotes, DemoAI } from "./Laws7";
import { LessonPath } from "./V12Path";
import { IntroMosaic, Wall, Counter, LawsHome, Reader, AIReal, AiIcon, blinkAt, Langs, PhraseBank } from "./V11Parts";
import { BG, NAVY, BLUE, DEEP, GREEN, GLIP, YEL, RED, GREY, SWAN, INK, HEAD, UI, B, OUTE, IOE, lin, press, useSp, Cap, Pointer, S4b, S7b } from "./Scenes9";

// veoskill v10: Maverick-style reel after review. Lessons as a camera flight over the lesson path, three games
// (phrase, story, true/false) with cinematic hand-offs, kinetic words between sections, an honest side by side with
// lex.uz (only things lex.uz really lacks), end card with the blue site logo and a QR code to veoskill.uz.
// Copy rules: no long dashes, no plates behind headline words.

const LOGO = "#3db7f4";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const Top: React.FC<{ dark?: boolean }> = ({ dark }) => (
  <>
    <Img src={staticFile("brand/veoskill.webp")} style={{ position: "absolute", left: 56, top: 42, height: 30, filter: dark ? "brightness(0) invert(1)" : undefined }} />
    <div style={{ position: "absolute", right: 56, top: 48, fontFamily: HEAD, fontWeight: 500, fontSize: 18, color: dark ? "rgba(255,255,255,0.78)" : "#6f7682" }}>veoskill.uz</div>
  </>
);
/** Big word, letters rise out of a mask. */
const Kin: React.FC<{ text: string; at: number; size: number; color?: string; accent?: string; accentColor?: string; stagger?: number }> = ({ text, at, size, color = NAVY, accent, accentColor = BLUE, stagger = 1.4 }) => {
  const f = useCurrentFrame();
  const fs = fit(text, size, 1700, 900);
  const ai = accent ? text.indexOf(accent) : -1;
  return (
    <div style={{ display: "flex", justifyContent: "center", overflow: "hidden", padding: `${fs * 0.1}px 0 ${fs * 0.18}px`, fontFamily: HEAD, fontWeight: 900, fontSize: fs, lineHeight: 1, letterSpacing: "-0.035em", whiteSpace: "pre" }}>
      {text.split("").map((ch, i) => {
        const t = lin(f, at + i * stagger, at + i * stagger + 18, 0, 1, OUTE);
        const isA = ai >= 0 && i >= ai && i < ai + accent!.length;
        return <span key={i} style={{ display: "inline-block", color: isA ? accentColor : color, transform: `translateY(${(1 - t) * 135}%)` }}>{ch}</span>;
      })}
    </div>
  );
};
/** One word per beat on full-frame colour fields (hard cuts). */
const Words: React.FC<{ items: [string, string, string, string?][]; per: number }> = ({ items, per }) => {
  const f = useCurrentFrame();
  const i = Math.min(items.length - 1, Math.floor(f / per));
  const [w, bg, c, acc] = items[i];
  const lf = f - i * per;
  const s = 1.07 - lin(lf, 0, per, 0, 0.07, Easing.out(Easing.quad));
  return (
    <AbsoluteFill style={{ background: bg, alignItems: "center", justifyContent: "center" }}>
      <Top dark={bg === NAVY || bg === BLUE || bg === GREEN} />
      <div style={{ transform: `scale(${s})`, width: "100%" }}><Kin key={i} text={w} at={i * per} size={250} color={c} accent={acc} /></div>
    </AbsoluteFill>
  );
};

/** Directional (horizontal) blur for whip pans: an SVG filter, CSS blur is only isotropic. */
export const HBlur: React.FC<{ id: string; v: number }> = ({ id, v }) => (
  <svg width="0" height="0" style={{ position: "absolute" }}><filter id={id} x="-30%" y="0" width="160%" height="100%"><feGaussianBlur stdDeviation={`${Math.max(0.01, v)} 0`} /></filter></svg>
);
export const whip = (id: string, v: number, x: number): React.CSSProperties => ({ transform: `translateX(${x}px)`, filter: v > 0.3 ? `url(#${id})` : undefined });

// ================= S1 intro =================
export const S1: React.FC = () => {
  const f = Math.round(useCurrentFrame() * 1.25);
  const raw = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fall = lin(f, 0, 22, 0, 1, Easing.in(Easing.quad));
  const bounce = f < 22 ? 0 : Math.abs(Math.sin(((f - 22) / 26) * Math.PI)) * 120 * Math.exp(-(f - 22) / 26);
  const dotY = -40 + fall * 640 - (f >= 22 && f < 74 ? bounce : 0);
  const stretch = lin(f, 74, 98, 0, 1, OUTE);
  const W = 640 * stretch + 28 * (1 - stretch);
  const lineY = 580 + lin(f, 74, 98, 0, 60, OUTE);
  const sub = lin(f, 150, 172, 0, 1, OUTE);
  const squash = f >= 20 && f < 26 ? 1 - Math.sin(((f - 20) / 6) * Math.PI) * 0.35 : 1;
  return (
    <AbsoluteFill style={{ background: BG }}>
      {f < 98 ? <div style={{ position: "absolute", left: 960 - W / 2, top: (f < 74 ? dotY : lineY) - 14, width: W, height: 28 * (f < 74 ? squash : 1 - stretch * 0.6), borderRadius: 14, background: LOGO }} /> : null}
      {f >= 98 ? <div style={{ position: "absolute", left: 960 - 320, top: 640 - 6, width: 640, height: 12, borderRadius: 6, background: LOGO, opacity: 1 - lin(f, 150, 175) }} /> : null}
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, height: 254, overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "flex-end" }}>
        {"veoskill".split("").map((ch, i) => {
          const s = spring({ frame: raw - Math.round((100 + i * 4) / 1.25), fps, config: { damping: 11, stiffness: 190 } });
          return <span key={i} style={{ display: "inline-block", fontFamily: UI, fontWeight: 900, fontSize: 230, lineHeight: 0.92, letterSpacing: "-0.01em", color: LOGO, transform: `translateY(${(1 - s) * 110}%)` }}>{ch}</span>;
        })}
      </div>
      <div style={{ position: "absolute", top: 676, width: "100%", textAlign: "center", fontFamily: HEAD, fontWeight: 600, fontSize: 40, color: "#555c68", opacity: sub, transform: `translateY(${(1 - sub) * 20}px)` }}>Самый живой способ учиться</div>
    </AbsoluteFill>
  );
};
const S2: React.FC = () => <Words per={43.2} items={[["ЗУБРИШЬ.", NAVY, "#fff"], ["ЗАБЫВАЕШЬ.", BLUE, "#fff"], ["СКУЧНО.", "#fff", NAVY], ["ЗНАКОМО?", BG, NAVY, "?"]]} />;

// ================= S3 the turn: a slower text cylinder =================
const BAND = "УРОКИ • ИГРЫ • ЗАКОНЫ • КВИЗЫ • ";
const S3: React.FC = () => {
  const f = useCurrentFrame();
  const N = 9, R = 520;
  const spin = lin(f, 0, 175, 0, 1, Easing.bezier(0.3, 0.2, 0.3, 1)) * 120;
  const fade = lin(f, 150, 178, 0, 1);
  return (
    <AbsoluteFill style={{ background: BLUE, overflow: "hidden" }}>
      <AbsoluteFill style={{ perspective: 1400, opacity: 1 - fade * 0.85, filter: fade > 0 ? `blur(${fade * 6}px)` : undefined }}>
        <div style={{ position: "absolute", left: "50%", top: "50%", transformStyle: "preserve-3d", transform: `rotateZ(-12deg) rotateX(${spin}deg)` }}>
          {Array.from({ length: N }, (_, k) => (
            <div key={k} style={{ position: "absolute", left: -1600, top: -60, width: 3200, height: 120, display: "flex", alignItems: "center", whiteSpace: "nowrap", fontFamily: HEAD, fontWeight: 900, fontSize: 108, letterSpacing: "-0.03em", color: "#fff", backfaceVisibility: "hidden", transform: `rotateX(${(k * 360) / N}deg) translateZ(${R}px) translateX(${((f * (k % 2 ? 2.4 : -2.4)) % 1200) - 600}px)` }}>{BAND.repeat(5)}</div>
          ))}
        </div>
      </AbsoluteFill>
      <Top dark />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        {f >= 178 ? <Kin text="Учись играя." at={180} size={190} color="#fff" /> : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ================= S4 directions (carousel from v9, then Право comes forward) =================
const S4: React.FC = () => {
  const f = useCurrentFrame();
  const hero = lin(f, 300, 350, 0, 1, OUTE);
  return (
    <AbsoluteFill style={{ background: BG }}>
      <AbsoluteFill style={{ opacity: 1 - hero, filter: hero > 0 ? `blur(${hero * 10}px)` : undefined, transform: `scale(${1 + hero * 0.15})` }}>
        <S4b />
      </AbsoluteFill>
      {f >= 296 ? (
        <AbsoluteFill>
          <Top />
          <Img src={staticFile("ic3d2/law-s.png")} style={{ position: "absolute", left: 960 - 270, top: 160 + (1 - hero) * 120, width: 540, height: 540, objectFit: "contain", transform: `scale(${0.85 + 0.15 * hero}) rotate(${(1 - hero) * -6 + Math.sin(f / 30) * 2}deg)`, filter: `drop-shadow(0 ${30 + 20 * hero}px 40px rgba(13,22,48,${0.12 + 0.1 * hero}))` }} />
          <div style={{ position: "absolute", top: 750, width: "100%" }}><Kin text="Юриспруденция" at={306} size={130} stagger={1} /></div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

// ================= S5 lessons: camera flies along the lesson path =================
const STONES = 13, CUR = 9;
const SX = (i: number) => 960 + Math.sin(i * 0.95) * 190;
const SY = (i: number) => 900 - i * 230;
const MAPSTONE: React.FC<{ i: number; f: number; pr: number }> = ({ i, f, pr }) => {
  const kind = i < CUR ? "done" : i === CUR ? "now" : "lock";
  const top = kind === "lock" ? "#e5e5e5" : GREEN, lip = kind === "lock" ? "#cfcfcf" : GLIP;
  return (
    <div style={{ position: "absolute", left: SX(i) - 75, top: SY(i) - 70, width: 150, height: 140 }}>
      {kind === "now" ? <div style={{ position: "absolute", left: -18, top: -18, width: 186, height: 168, borderRadius: "50%", border: `9px solid ${GREEN}`, opacity: 0.35 + Math.sin(f / 9) * 0.15 }} /> : null}
      <div style={{ position: "absolute", left: 0, top: 16, width: 150, height: 126, borderRadius: "50%", background: lip }} />
      <div style={{ position: "absolute", left: 0, top: pr * 12, width: 150, height: 126, borderRadius: "50%", background: top, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 -6px 0 rgba(0,0,0,0.06)" }}>
        <svg width="60" height="60" viewBox="0 0 24 24" fill={kind === "now" ? "#fff" : "none"} stroke={kind === "lock" ? "#afafaf" : "#fff"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d={kind === "done" ? "M5 12.5l4.5 4.5L19 7.5" : kind === "now" ? "M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.6 6.7 19.4l1.2-6L3.4 9.3l6-.7z" : "M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z"} /></svg>
      </div>
    </div>
  );
};
const S5: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const FLY = 250, CLICK = 300, START = 352, FLOOD = 362;
  // camera focus travels from stone 0 to the current stone, the plane flattens as it arrives
  const t = lin(f, 0, FLY, 0, 1, Easing.bezier(0.45, 0.05, 0.25, 1));
  const fx = SX(0) + (SX(CUR) - SX(0)) * t + Math.sin(t * Math.PI * 2) * 60 * (1 - t);
  const fy = SY(0) + (SY(CUR) - SY(0)) * t;
  const rx = 50 - 50 * lin(f, FLY - 70, FLY, 0, 1, IOE);
  const rz = Math.sin(t * Math.PI * 1.5) * 6 * (1 - t);
  const sc = 0.9 + 0.25 * lin(f, FLY - 40, FLY + 20, 0, 1, IOE);
  const card = spring({ frame: f - CLICK - 4, fps, config: { damping: 13, stiffness: 210 } });
  const cardY = SY(CUR) - 340;
  const btn = { x: SX(CUR), y: cardY + 22 + 106 + 34 };
  // pointer in world space (same plane), tip on the exact centres
  const kx = [FLY - 30, CLICK - 4, CLICK + 16, START - 4, START + 30];
  const px = interpolate(f, kx, [SX(CUR) + 380, SX(CUR) + 6, SX(CUR) + 14, btn.x + 4, btn.x + 40], { ...cl, easing: IOE });
  const py = interpolate(f, kx, [SY(CUR) + 260, SY(CUR) + 10, SY(CUR) + 16, btn.y - 6, btn.y + 30], { ...cl, easing: IOE });
  const down = Math.max(press(f, CLICK), press(f, START));
  // flood from the button, in screen space
  const bsx = 960 + (btn.x - fx) * sc, bsy = 600 + (btn.y - fy) * sc;
  const flood = lin(f, FLOOD, FLOOD + 40, 0, 1, Easing.bezier(0.6, 0, 0.2, 1));
  const banners: [number, string, string][] = [[0, "МОДУЛЬ 1", "Введение в право"], [5, "МОДУЛЬ 2", "Конституция"], [10, "МОДУЛЬ 3", "Права человека"]];
  return (
    <AbsoluteFill style={{ background: "#f7f8f4", overflow: "hidden" }}>
      <AbsoluteFill style={{ perspective: 1300 }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transformOrigin: `${fx}px ${fy}px`, transform: `translate(${960 - fx}px, ${600 - fy}px) rotateX(${rx}deg) rotateZ(${rz}deg) scale(${sc})` }}>
          {/* dotted floor */}
          <div style={{ position: "absolute", left: -600, top: SY(STONES) - 600, width: 3100, height: 2400 + STONES * 230, backgroundImage: "radial-gradient(rgba(20,60,110,0.09) 2px, transparent 2.2px)", backgroundSize: "44px 44px" }} />
          {banners.map(([i, a, b]) => (
            <div key={i} style={{ position: "absolute", left: SX(i) + 240, top: SY(i) - 55, width: 520, height: 110, borderRadius: 24, opacity: i === 10 ? 1 - card : 1, background: i === 10 ? "#e5e5e5" : GREEN, boxShadow: `0 7px 0 ${i === 10 ? "#cfcfcf" : GLIP}`, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 34px", fontFamily: UI, color: i === 10 ? "#9aa1ab" : "#fff" }}>
              <div style={{ fontWeight: 800, fontSize: 22 }}>{a}</div><div style={{ fontWeight: 900, fontSize: 36 }}>{b}</div>
            </div>
          ))}
          {Array.from({ length: STONES }, (_, i) => <MAPSTONE key={i} i={i} f={f} pr={i === CUR ? press(f, CLICK) : 0} />)}
          <Img src={staticFile("real/mascot1.webp")} style={{ position: "absolute", left: SX(7) - 560, top: SY(7) - 280, width: 300 }} />
          <Img src={staticFile("v4/owl-q.png")} style={{ position: "absolute", left: SX(3) - 420, top: SY(3) - 120, width: 220 }} />
          {card > 0.01 ? (
            <div style={{ position: "absolute", left: SX(CUR) - 230, top: cardY, width: 460, borderRadius: 26, background: GREEN, boxShadow: `0 6px 0 ${GLIP}, 0 30px 60px rgba(40,90,0,0.25)`, padding: "22px 26px 26px", boxSizing: "border-box", fontFamily: UI, color: "#fff", transformOrigin: "50% 100%", transform: `scale(${card})`, opacity: Math.min(1, card * 1.6) }}>
              <div style={{ fontWeight: 900, fontSize: 32, lineHeight: 1.15 }}>Кто пишет законы</div>
              <div style={{ fontWeight: 700, fontSize: 21, opacity: 0.9, marginTop: 6 }}>Урок 10</div>
              <div style={{ marginTop: 18, height: 68, borderRadius: 18, background: "#fff", color: GREEN, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 26, letterSpacing: "0.05em", boxShadow: `0 ${6 - press(f, START) * 6}px 0 ${SWAN}`, transform: `translateY(${press(f, START) * 6}px)` }}>НАЧАТЬ</div>
            </div>
          ) : null}
          {f >= FLY - 30 && f < FLOOD + 10 ? <Pointer x={px} y={py} down={down} op={lin(f, FLY - 30, FLY - 18)} /> : null}
        </div>
      </AbsoluteFill>
      <Top />
      {flood > 0 ? <div style={{ position: "absolute", left: bsx, top: bsy, width: 10, height: 10, marginLeft: -5, marginTop: -5, borderRadius: "50%", background: GREEN, transform: `scale(${flood * 480})` }} /> : null}
    </AbsoluteFill>
  );
};

// ================= S6 three games =================
const card: React.CSSProperties = { position: "absolute", borderRadius: 26, background: "#fff", border: `3px solid ${SWAN}`, boxShadow: `0 6px 0 ${SWAN}, 0 24px 50px rgba(13,22,48,0.08)`, fontFamily: UI, fontWeight: 800, color: INK, boxSizing: "border-box" };
const GameTitle: React.FC<{ t: string; at?: number; color?: string }> = ({ t, at = 6, color }) => <div style={{ position: "absolute", left: 110, top: 110 }}><Cap text={t} at={at} size={76} color={color} /></div>;
/** 1. Phrase: the green flood irises out; words flip down onto one clean line, slot by slot; the extras fall away. */
export const G1: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const iris = 1 - lin(f, 0, 34, 0, 1, Easing.bezier(0.6, 0, 0.3, 1));
  const W = ["Закон", "один", "для", "всех"];
  const widths = [200, 160, 130, 150];
  const gap = 28, total = widths.reduce((a, b) => a + b, 0) + gap * 3;
  const slotX = widths.map((_, i) => 960 - total / 2 + widths.slice(0, i).reduce((a, b) => a + b, 0) + gap * i);
  const BASE = 560, H = 96;
  const landAt = (i: number) => 44 + i * 30;
  const done = f >= landAt(3) + 16;
  const glow = lin(f, landAt(3) + 16, landAt(3) + 40, 0, 1, OUTE);
  const lift = lin(f, landAt(3) + 30, landAt(3) + 70, 0, 1, OUTE);
  const extra: [string, number, number, number][] = [["только", 1330, 760, -8], ["богатых", 420, 790, 10], ["иногда", 1080, 860, 5]];
  const fall = lin(f, landAt(3) + 10, landAt(3) + 50, 0, 1, Easing.in(Easing.quad));
  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <Top />
      <GameTitle t="Собери фразу" at={30} />
      {/* slots on one baseline */}
      {widths.map((w, i) => (
        <div key={i} style={{ position: "absolute", left: slotX[i], top: BASE - H, width: w, height: H, borderRadius: 22, border: `3px dashed ${done ? "transparent" : "#d6d9de"}`, boxSizing: "border-box", opacity: lin(f, 20 + i * 4, 34 + i * 4) }} />
      ))}
      <div style={{ position: "absolute", left: 960 - total / 2 - 30, width: (total + 60) * lin(f, 16, 40, 0, 1, OUTE), top: BASE + 16, height: 6, borderRadius: 3, background: done ? GREEN : "#d6d9de", boxShadow: done ? `0 0 ${30 * glow}px rgba(88,204,2,0.7)` : undefined }} />
      {extra.map(([t, x, y, r], k) => {
        const s = spring({ frame: f - 30 - k * 6, fps, config: { damping: 14, stiffness: 150 } });
        return <div key={t} style={{ ...card, left: x, top: y + Math.sin(f / 16 + k) * 8 + fall * 600, height: H, display: "flex", alignItems: "center", padding: "0 30px", fontSize: 40, transform: `rotate(${r + fall * 30 * (k % 2 ? 1 : -1)}deg) scale(${s})`, opacity: 0.85 * s * (1 - fall) }}>{t}</div>;
      })}
      {W.map((w, i) => {
        const s = spring({ frame: f - landAt(i) + 16, fps, config: { damping: 13, stiffness: 140 } });
        const y = BASE - H - (1 - s) * 520 - (done ? lift * 30 : 0);
        return (
          <div key={w} style={{ position: "absolute", left: slotX[i], top: y, width: widths[i], height: H, perspective: 600 }}>
            <div style={{ ...card, position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, transformOrigin: "50% 100%", transform: `rotateX(${(1 - s) * 80}deg)`, opacity: Math.min(1, s * 2), border: `3px solid ${done ? GREEN : SWAN}`, background: done ? "#e7ffd6" : "#fff", color: done ? GLIP : INK, boxShadow: done ? `0 6px 0 ${GLIP}, 0 18px 40px rgba(88,204,2,${0.3 * glow})` : card.boxShadow }}>{w}</div>
          </div>
        );
      })}
      {iris > 0 ? <div style={{ position: "absolute", left: 960, top: 540, width: 10, height: 10, marginLeft: -5, marginTop: -5, borderRadius: "50%", background: GREEN, transform: `scale(${iris * 460})` }} /> : null}
    </AbsoluteFill>
  );
};
/** 2. Story: someone is typing, the message types out, the camera pulls back to the answers, one is chosen. */
const STORY = "Купил телефон, через неделю он сломался. Продавец говорит: «Сам виноват». Что делать?";
const G2: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (at: number, d = 14, s = 180) => spring({ frame: f - at, fps, config: { damping: d, stiffness: s } });
  const TYPE0 = 54, SPEED = 1.25;
  const n = Math.max(0, Math.min(STORY.length, Math.floor((f - TYPE0) / SPEED)));
  const typing = f >= 18 && f < TYPE0;

  const PICK = 238;
  const ok = f >= PICK + 2;
  // caret position inside the bubble (about 36 characters per line)
  // smoothed caret (moving average of the continuous typing position): the camera glides, never steps
  const contC = (fr: number) => Math.min(34, Math.max(0, (fr - TYPE0) / SPEED));
  let acc0 = 0; for (let k = 0; k < 24; k++) acc0 += contC(f - k);
  const csm = acc0 / 24;
  const cx = 570 + 32 + csm * 18.5, cy = 340 + 26 + 20;
  const follow = lin(f, TYPE0 - 30, TYPE0 + 14, 0, 1, Easing.bezier(0.4, 0, 0.2, 1)) * (1 - lin(f, TYPE0 + 36, TYPE0 + 116, 0, 1, Easing.bezier(0.45, 0, 0.3, 1)));
  const camS = 1 + 0.5 * follow;
  const camX = (960 - camS * cx) * follow, camYf = (560 - camS * cy) * follow;
  const W2 = lin(f, 366, 390, 0, 1, Easing.in(Easing.cubic));
  const optX = [560, 980], optY = 640, optW = [340, 560];
  const target = { x: optX[1] + optW[1] / 2, y: optY + 50 };
  const px = interpolate(f, [206, PICK - 4, PICK + 20], [1500, target.x, target.x + 20], { ...cl, easing: IOE });
  const py = interpolate(f, [206, PICK - 4, PICK + 20], [1000, target.y, target.y + 16], { ...cl, easing: IOE });
  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <Top />
      <HBlur id="hb-g2" v={W2 * 46} />
      <AbsoluteFill style={whip("hb-g2", W2 * 46, -W2 * 1700)}>
      <GameTitle t="Истории" />
      <AbsoluteFill style={{ perspective: 1600 }}><AbsoluteFill style={{ transformOrigin: "960px 560px", transform: `rotateY(${-12 * follow}deg) rotateX(${6 * follow}deg)` }}><AbsoluteFill style={{ transformOrigin: "0 0", transform: `translate(${camX}px, ${camYf}px) scale(${camS})` }}>
        <Img src={staticFile("av/p1.svg")} style={{ position: "absolute", left: 420, top: 280, width: 120, height: 120, borderRadius: 60, background: "#e9dcff", transform: `scale(${sp(4)})` }} />
        <div style={{ position: "absolute", left: 572, top: 296, fontFamily: UI, fontWeight: 800, fontSize: 26, color: GREY, opacity: lin(f, 8, 20) }}>Шахзод</div>
        {typing ? (
          <div style={{ position: "absolute", left: 570, top: 340, padding: "22px 30px", borderRadius: "28px 28px 28px 8px", background: "#fff", border: `3px solid ${SWAN}`, display: "flex", gap: 10, transform: `scale(${sp(18)})`, transformOrigin: "0 100%" }}>
            {[0, 1, 2].map((k) => <div key={k} style={{ width: 16, height: 16, borderRadius: 8, background: "#b9c1cc", transform: `translateY(${Math.sin(f / 4 - k) * 5}px)` }} />)}
          </div>
        ) : null}
        {f >= TYPE0 ? (
          <div style={{ position: "absolute", left: 570, top: 340, width: 760, padding: "26px 32px", borderRadius: "30px 30px 30px 8px", background: "#fff", border: `3px solid ${SWAN}`, fontFamily: UI, fontWeight: 700, fontSize: 36, lineHeight: 1.38, color: INK, boxSizing: "border-box" }}>
            {STORY.slice(0, n)}<span style={{ display: "inline-block", width: 3, height: 38, marginLeft: 3, verticalAlign: "-6px", background: BLUE, opacity: n < STORY.length || Math.floor(f / 14) % 2 ? 1 : 0 }} />
          </div>
        ) : null}
        {["Смириться", "Требовать ремонт или возврат"].map((o, i) => {
          const s = sp(200 + i * 6, 13, 190);
          const good = i === 1 && ok;
          return <div key={o} style={{ ...card, left: optX[i], top: optY, width: optW[i], height: 100, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, border: `3px solid ${good ? GREEN : SWAN}`, background: good ? "#e7ffd6" : "#fff", color: good ? GLIP : INK, transform: `scale(${s * (1 - (i === 1 ? press(f, PICK) * 0.05 : 0))})`, opacity: i === 0 && ok ? 0.4 : s }}>{o}</div>;
        })}
        {ok ? (
          <div style={{ position: "absolute", left: 560, top: 780, display: "flex", alignItems: "center", gap: 18, transform: `scale(${sp(PICK + 8)})`, transformOrigin: "0 50%" }}>
            <Img src={staticFile("v4/owl-q.png")} style={{ width: 110 }} />
            <div style={{ padding: "20px 28px", borderRadius: 24, background: GREEN, color: "#fff", fontFamily: UI, fontWeight: 800, fontSize: 30 }}>Верно! Закон защищает покупателя.</div>
          </div>
        ) : null}
      </AbsoluteFill></AbsoluteFill></AbsoluteFill>
      {f >= 206 && f < PICK + 40 ? <Pointer x={px} y={py} down={press(f, PICK)} op={lin(f, 206, 216) * (1 - lin(f, PICK + 28, PICK + 40))} /> : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
/** 3. True/false: cards float onto the screen, two get swiped, the last one slaps onto the lens and becomes the next frame. */
const G3: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = ["Конституция: главный закон страны", "Закон можно не соблюдать, если не согласен", "Права человека защищает государство"];
  const enter = (i: number) => spring({ frame: f - 6 - i * 10, fps, config: { damping: 15, stiffness: 120 } });
  const go = [74, 124];
  const dir = [1, -1];
  const SLAP = 190;
  const slap = lin(f, SLAP, SLAP + 26, 0, 1, Easing.bezier(0.6, 0, 0.8, 0.4));
  const settle = f >= SLAP + 26 ? spring({ frame: f - SLAP - 26, fps, config: { damping: 9, stiffness: 260 } }) : 0;
  const lean3 = lin(f, SLAP - 30, SLAP - 6, 0, 1);
  const W3 = 1 - lin(f, 0, 20, 0, 1, Easing.out(Easing.cubic));
  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <Top />
      <HBlur id="hb-g3" v={W3 * 46} />
      <AbsoluteFill style={whip("hb-g3", W3 * 46, W3 * 1700)}>
      <GameTitle t="Верно или неверно" />
      {(() => {
        const l0 = lin(f, go[0] - 18, go[0], 0, 1) * (1 - lin(f, go[0] + 10, go[0] + 30));
        const l1 = lin(f, go[1] - 18, go[1], 0, 1) * (1 - lin(f, go[1] + 10, go[1] + 30));
        const l2 = lean3 * (1 - slap);
        const g = Math.max(l0, l2), r = l1;
        return (
          <>
            <AbsoluteFill style={{ background: `radial-gradient(60% 70% at 85% 55%, rgba(88,204,2,${0.22 * g}), rgba(88,204,2,0) 70%), radial-gradient(60% 70% at 15% 55%, rgba(255,75,75,${0.2 * r}), rgba(255,75,75,0) 70%)` }} />
            <div style={{ position: "absolute", left: -40, top: 560, fontFamily: HEAD, fontWeight: 900, fontSize: 150, letterSpacing: "-0.04em", color: "transparent", WebkitTextStroke: `3px rgba(255,75,75,${0.18 + 0.6 * r})`, transform: `translateX(${-r * 30}px) rotate(-90deg)`, transformOrigin: "50% 50%", opacity: 1 - slap, whiteSpace: "nowrap" }}>НЕВЕРНО</div>
            <div style={{ position: "absolute", right: 60, top: 560, fontFamily: HEAD, fontWeight: 900, fontSize: 150, letterSpacing: "-0.04em", color: "transparent", WebkitTextStroke: `3px rgba(88,204,2,${0.18 + 0.6 * g})`, transform: `translateX(${g * 30}px) rotate(90deg)`, transformOrigin: "50% 50%", opacity: 1 - slap, whiteSpace: "nowrap" }}>ВЕРНО</div>
          </>
        );
      })()}
      {T.map((t, i) => {
        const e = enter(i);
        const isLast = i === 2;
        const fly = i < 2 ? lin(f, go[i], go[i] + 24, 0, 1, Easing.bezier(0.5, 0, 0.9, 0.6)) : 0;
        const lean = i < 2 ? lin(f, go[i] - 18, go[i], 0, 1) : lean3;
        const good = i < 2 ? dir[i] > 0 : true;
        const depth = i - (f >= go[0] + 12 ? 1 : 0) - (f >= go[1] + 12 ? 1 : 0);
        const floatY = Math.sin((f + i * 20) / 22) * 8;
        // last card: toward the lens, fills the frame, tiny bounce like a sticker
        const s3 = isLast ? 1 + slap * 3.6 - settle * 0.04 * Math.sin(settle * Math.PI) : 1 - Math.max(0, depth) * 0.05;
        const x = i < 2 ? dir[i] * (lean * 80 + fly * 1300) : 0;
        const y = (1 - e) * 700 + Math.max(0, depth) * 30 + (isLast ? -slap * 40 : 0) + floatY * (1 - slap);
        const r = i < 2 ? dir[i] * (lean * 7 + fly * 18) : (1 - slap) * -3;
        return (
          <div key={t} style={{ ...card, left: 960 - 330, top: 330, width: 660, height: 420, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 54, fontSize: 42, lineHeight: 1.3, zIndex: 20 - i + (isLast && depth <= 0 ? 10 : 0), border: `3px solid ${lean > 0.3 ? (good ? GREEN : RED) : SWAN}`, background: lean > 0.3 ? (good ? "#e7ffd6" : "#ffe3e3") : "#fff", transform: `translate(${x}px, ${y}px) rotate(${r}deg) scale(${s3})`, opacity: e * (1 - fly * 0.3), borderRadius: 26 * (1 - slap) + 2 }}>
            <span style={{ opacity: isLast ? 1 - slap : 1 }}>{t}</span>
            {lean > 0.3 ? <div style={{ position: "absolute", left: good ? 34 : undefined, right: good ? undefined : 34, top: 28, padding: "4px 16px", border: `5px solid ${good ? GREEN : RED}`, borderRadius: 12, fontFamily: HEAD, fontWeight: 900, fontSize: 32, color: good ? GLIP : RED, transform: `rotate(${good ? -8 : 8}deg)`, opacity: isLast ? 1 - slap : 1 }}>{good ? "ВЕРНО" : "НЕВЕРНО"}</div> : null}
          </div>
        );
      })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ================= S7 kinetic words between sections =================
const S7: React.FC = () => <Words per={57.6} items={[["ИГРАЕШЬ.", "#e7ffd6", GLIP], ["ЗАПОМИНАЕШЬ.", BLUE, "#fff"]]} />;
const S9: React.FC = () => <Words per={43.2} items={[["А ТЕПЕРЬ", BG, NAVY], ["ЗАКОНЫ.", NAVY, "#fff"]]} />;
/** Word cut before the AI window: "А ТЕПЕРЬ" (1 beat), then a blue card with the AI mark (2 beats). */
const AiWords: React.FC = () => {
  const f = useCurrentFrame();
  const sp = useSp();
  const B1 = 28.8;
  if (f < B1) return <Words per={B1} items={[["А ТЕПЕРЬ", BG, NAVY]]} />;
  const lf = f - B1;
  const ic = sp(B1, 12, 170);
  const s = 1.05 - lin(lf, 0, 57, 0, 0.05, Easing.out(Easing.quad));
  return (
    <AbsoluteFill style={{ background: BLUE, alignItems: "center", justifyContent: "center" }}>
      <Top dark />
      <div style={{ transform: `scale(${s})`, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ transform: `scale(${ic}) rotate(${(1 - ic) * -90}deg)`, opacity: Math.min(1, ic * 1.5), marginBottom: 6 }}><AiIcon size={170} color="#fff" spin={Math.sin(f / 10) * 5} blink={blinkAt(f - 10)} /></div>
        <Kin text="ИСКУССТВЕННЫЙ" at={B1 + 2} size={170} color="#fff" />
        <div style={{ marginTop: -30 }}><Kin text="ИНТЕЛЛЕКТ." at={B1 + 8} size={170} color="#fff" /></div>
      </div>
    </AbsoluteFill>
  );
};

// ================= S10 lex.uz vs veoskill, function by function =================
const LINES = ["Узбекистан: суверенное,", "демократическое, правовое,", "социальное и светское", "государство.", "Названия «Республика", "Узбекистан» и «Узбекистан»", "равнозначны."];
const COLORS = ["#ffd43b", "#ff922b", "#ff6b6b", "#f783ac", "#cc5de8", "#4dabf7", "#51cf66"];
const Mark: React.FC<{ ok: boolean; s?: number }> = ({ ok, s = 40 }) => (
  <div style={{ width: s, height: s, borderRadius: s / 2, background: ok ? GREEN : RED, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <svg width={s * 0.6} height={s * 0.6} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"><path d={ok ? "M5 12.5l4.5 4.5L19 7.5" : "M6 6l12 12M18 6L6 18"} /></svg>
  </div>
);
export const S10: React.FC = () => {
  const f = useCurrentFrame();
  const sp = useSp();
  const inL = lin(f, 0, 40, 0, 1, OUTE), inR = lin(f, 10, 50, 0, 1, OUTE);
  // phone layout (right half)
  const PX = 1330, PY = 610, PW = 470, PH = 860;
  const PL = PX - PW / 2, PT = PY - PH / 2;
  const lineY = (i: number) => PT + 150 + i * 43;
  // notes beat
  const N0 = 60, SEL0 = 96, SEL1 = 140, YEL_ = 160, NOTE = 188, TYPE = 214, SAVE = 280, PIN = 292;
  const sel = lin(f, SEL0, SEL1, 0, 1, Easing.bezier(0.45, 0, 0.55, 1));
  const pal = lin(f, SEL1 + 4, SEL1 + 16, 0, 1, OUTE) * (1 - lin(f, NOTE + 2, NOTE + 12));
  const yellow = f >= YEL_ + 2;
  const sheet = sp(NOTE + 6, 16, 160) * (1 - lin(f, SAVE + 6, SAVE + 20));
  const pin = sp(PIN, 10, 220);
  // AI beat
  const AI = 420, TAP = AI + 36;
  const aiOn = f >= AI;
  const tap = press(f, TAP);
  // summary beat
  const SUM = 700;
  const sum = lin(f, SUM, SUM + 40, 0, 1, IOE);
  const palTop = PT + 470, palX0 = PL + 30;
  const colorX = (i: number) => palX0 + 20 + i * 54 + 20, colorY = palTop + 20 + 20;
  const noteX = palX0 + 20 + 100, noteY = palTop + 86;
  const saveX = PL + PW - 30 - 90, saveY = PT + PH - 70;
  const botX = PL + PW - 30 - 46, botY = PT + PH - 34 - 46;
  const kf: [number, number, number][] = [[N0, 1700, 1050], [SEL0 - 4, PL + 34, lineY(4) + 30], [SEL1, PL + 34 + 300, lineY(6) + 30], [YEL_ - 6, colorX(0), colorY], [YEL_ + 8, colorX(0) + 4, colorY + 4], [NOTE - 6, noteX, noteY], [NOTE + 14, noteX + 10, noteY + 10], [SAVE - 8, saveX, saveY], [SAVE + 30, saveX + 60, saveY + 60], [TAP - 12, botX, botY], [TAP + 24, botX + 50, botY + 50]];
  const ptr = { x: interpolate(f, kf.map((k) => k[0]), kf.map((k) => k[1]), { ...cl, easing: IOE }), y: interpolate(f, kf.map((k) => k[0]), kf.map((k) => k[2]), { ...cl, easing: IOE }) };
  const down = Math.max(press(f, SEL0), press(f, YEL_), press(f, NOTE), press(f, SAVE), tap);
  const dragging = f >= SEL0 && f < SEL1 + 2;
  const cap = f < AI - 10 ? "Выдели строку и запиши заметку" : "Пойми статью простыми словами";
  const lexNo = f < AI - 10 ? "Нет заметок и выделения" : "Только юридический текст";
  const CARDS: [string, string][] = [["Коротко", "Узбекистан: суверенное правовое государство."], ["Простыми словами", "Страна сама решает, а всё держится на законе."], ["Пример из жизни", "Чиновник нарушил закон? Его решение можно обжаловать."]];
  const ROWS = ["Объяснение простыми словами", "Заметки и выделение цветом", "Тест по выделенному тексту", "Уроки и игры по праву"];
  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <Top />
      <AbsoluteFill style={{ opacity: 1 - sum, transform: `scale(${1 - sum * 0.06})`, filter: sum > 0 ? `blur(${sum * 8}px)` : undefined }}>
        {/* caption */}
        <div style={{ position: "absolute", left: 90, top: 104 }}><Cap key={cap} text={cap} at={f < AI - 10 ? N0 - 30 : AI - 6} size={50} /></div>
        {/* left: lex.uz */}
        <div style={{ position: "absolute", left: 90, top: 230, width: 820, opacity: inL, transform: `translateX(${(1 - inL) * -200}px)` }}>
          <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 36, color: "#7c8593", marginBottom: 16 }}>lex.uz</div>
          <div style={{ position: "relative", width: 820, height: 518, borderRadius: 18, overflow: "hidden", boxShadow: "0 30px 70px rgba(13,22,48,0.16)", border: "2px solid #dfe2e7" }}>
            <Img src={staticFile("lex/doc-desk.jpg")} style={{ width: 820, height: 518, objectFit: "cover", objectPosition: "top left", filter: `saturate(${0.75})` }} />
          </div>
          <div key={lexNo} style={{ marginTop: 26, display: "flex", alignItems: "center", gap: 16, fontFamily: UI, fontWeight: 800, fontSize: 34, color: "#c23a3a", opacity: lin(f, (f < AI - 10 ? N0 : AI) + 10, (f < AI - 10 ? N0 : AI) + 26), transform: `translateY(${(1 - lin(f, (f < AI - 10 ? N0 : AI) + 10, (f < AI - 10 ? N0 : AI) + 26, 0, 1, OUTE)) * 20}px)` }}>
            <Mark ok={false} />{lexNo}
          </div>
        </div>
        <div style={{ position: "absolute", left: 958, top: 250, width: 4, height: 700, borderRadius: 2, background: "#e1e3e8", transform: `scaleY(${inR})`, transformOrigin: "50% 0" }} />
        {/* right: our phone */}
        <div style={{ position: "absolute", left: PL, top: PT - 60, fontFamily: UI, fontWeight: 900, fontSize: 36, color: LOGO, opacity: inR }}>veoskill</div>
        <div style={{ position: "absolute", left: PL, top: PT, width: PW, height: PH, borderRadius: 54, background: "#fff", boxShadow: "0 40px 90px rgba(13,22,48,0.2)", border: "3px solid #e8eaee", overflow: "hidden", fontFamily: UI, opacity: inR, transform: `translateX(${(1 - inR) * 200}px)` }}>
          <div style={{ width: 130, height: 12, borderRadius: 6, background: "#e8eaee", margin: "22px auto 0" }} />
          <div style={{ padding: "22px 30px 0" }}>
            <div style={{ fontWeight: 700, fontSize: 19, color: BLUE }}>Конституция Республики Узбекистан</div>
            <div style={{ marginTop: 6, fontWeight: 900, fontSize: 40, color: INK }}>Статья 1.</div>
          </div>
          {LINES.map((l, i) => {
            const hot = i >= 4;
            const k = hot ? Math.min(1, Math.max(0, sel * 3 - (i - 4))) : 0;
            const c = yellow ? "rgba(255,212,59,0.85)" : "rgba(28,176,246,0.25)";
            return (
              <div key={i} style={{ position: "absolute", left: 30, top: lineY(i) - PT, whiteSpace: "nowrap", fontWeight: 700, fontSize: 27, color: "#4b4b4b" }}>
                <span style={{ backgroundImage: `linear-gradient(${c}, ${c})`, backgroundRepeat: "no-repeat", backgroundSize: `${k * 100}% 100%`, padding: "2px 0" }}>{l}</span>
                {i === 6 && pin > 0.02 ? <span style={{ display: "inline-flex", marginLeft: 12, width: 40, height: 40, borderRadius: 12, background: "#fff4c2", border: "2px solid #ffd43b", alignItems: "center", justifyContent: "center", verticalAlign: "middle", transform: `scale(${pin})` }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b58900" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h11l3 3v13H5zM8 10h8M8 14h6" /></svg></span> : null}
              </div>
            );
          })}
          {pal > 0.01 ? (
            <div style={{ position: "absolute", left: 30, right: 30, top: palTop - PT, borderRadius: 22, background: "#fff", border: `3px solid ${BLUE}`, boxShadow: "0 18px 40px rgba(13,22,48,0.18)", padding: "18px 20px", transform: `scale(${0.9 + 0.1 * pal})`, opacity: pal, transformOrigin: "50% 0" }}>
              <div style={{ display: "flex", gap: 14 }}>{COLORS.map((c, i) => <div key={c} style={{ width: 40, height: 40, borderRadius: 20, background: c, boxShadow: i === 0 && yellow ? `0 0 0 4px #fff, 0 0 0 7px ${c}` : undefined, transform: `scale(${i === 0 ? 1 - press(f, YEL_) * 0.2 : 1})` }} />)}</div>
              <div style={{ display: "flex", gap: 18, marginTop: 14, fontWeight: 800, fontSize: 22, color: BLUE }}>
                <span>Копия</span><span style={{ padding: "2px 10px", borderRadius: 10, background: f > NOTE - 14 ? "#ddf4ff" : "transparent" }}>Заметка</span><span>Тест</span><span>Ссылка</span>
              </div>
            </div>
          ) : null}
          {sheet > 0.01 ? (
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 400, borderRadius: "34px 34px 0 0", background: "#fff", boxShadow: "0 -20px 50px rgba(13,22,48,0.2)", padding: "26px 28px", boxSizing: "border-box", transform: `translateY(${(1 - sheet) * 420}px)` }}>
              <div style={{ fontWeight: 900, fontSize: 30, color: INK }}>Заметка к выделенному</div>
              <div style={{ marginTop: 16, minHeight: 96, borderRadius: 20, border: `3px solid ${BLUE}`, background: "#f7fbff", padding: "18px 18px", boxSizing: "border-box", fontWeight: 800, fontSize: 30, color: INK }}>
                {f < TYPE ? <span style={{ color: "#a7b1bc", fontWeight: 600, fontSize: 24 }}>Что вы думаете об этом?</span> : <>{"Спросят на экзамене".slice(0, Math.max(0, Math.floor((f - TYPE) / 2.6)))}<span style={{ display: "inline-block", width: 3, height: 30, background: BLUE, marginLeft: 2, verticalAlign: "middle" }} /></>}
              </div>
              <div style={{ marginTop: 20, display: "flex", alignItems: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: GREY }}>Видите только вы</div>
              </div>
              <div style={{ position: "absolute", left: saveX - PL - 90, top: saveY - (PT + PH - 400) - 34, width: 180, height: 68, borderRadius: 16, background: GREEN, boxShadow: `0 ${5 - press(f, SAVE) * 5}px 0 ${GLIP}`, transform: `translateY(${press(f, SAVE) * 5}px)`, color: "#fff", fontWeight: 900, fontSize: 22, letterSpacing: "0.05em", display: "flex", alignItems: "center", justifyContent: "center" }}>СОХРАНИТЬ</div>
            </div>
          ) : null}
          <div style={{ position: "absolute", left: botX - PL - 46, top: botY - PT - 46, width: 92, height: 92, borderRadius: 28, background: BLUE, boxShadow: `0 ${6 - tap * 6}px 0 ${DEEP}`, transform: `translateY(${tap * 6}px) scale(${aiOn ? 1 + Math.sin(f / 8) * 0.04 : 0.9})`, opacity: lin(f, AI - 20, AI), display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="7" width="16" height="12" rx="3" /><path d="M12 3v4M9 12h.01M15 12h.01M9.5 15.5h5M2 12v3M22 12v3" /></svg>
          </div>
          {/* AI sheet rises inside the phone */}
          {aiOn ? (() => {
            const sh = sp(TAP + 10, 16, 150);
            return (
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: PH - 120, borderRadius: "34px 34px 0 0", background: "#f5fbff", boxShadow: "0 -20px 50px rgba(13,22,48,0.2)", padding: "24px 22px", boxSizing: "border-box", transform: `translateY(${(1 - sh) * (PH - 100)}px)` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, fontWeight: 900, fontSize: 30, color: INK }}><div style={{ width: 50, height: 50, borderRadius: 16, background: BLUE }} />Объяснение статьи</div>
                {CARDS.map(([t, d], i) => {
                  const s = sp(TAP + 40 + i * B, 13, 180);
                  return (
                    <div key={t} style={{ marginTop: 18, padding: "18px 20px", borderRadius: 22, background: "#fff", border: `2px solid ${SWAN}`, transform: `translateY(${(1 - s) * 40}px)`, opacity: s }}>
                      <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 26, color: [NAVY, BLUE, GLIP][i] }}>{t}</div>
                      <div style={{ marginTop: 6, fontWeight: 700, fontSize: 24, lineHeight: 1.35, color: "#3b4250" }}>{d}</div>
                    </div>
                  );
                })}
              </div>
            );
          })() : null}
        </div>
        {f >= SAVE + 8 && f < AI - 10 ? <div style={{ position: "absolute", left: PX - 200, top: PT - 70, width: 400, height: 64, borderRadius: 20, background: NAVY, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontFamily: UI, fontWeight: 800, fontSize: 24, opacity: sp(SAVE + 8, 15, 170) * (1 - lin(f, AI - 26, AI - 12)) }}><Mark ok s={30} />Заметка сохранена</div> : null}
        {f >= N0 && f < TAP + 40 ? <Pointer x={ptr.x} y={ptr.y} down={down} op={(dragging ? 0 : 1) * lin(f, N0, N0 + 12) * (1 - lin(f, TAP + 26, TAP + 40))} /> : null}
        {dragging ? <div style={{ position: "absolute", left: ptr.x - 3, top: ptr.y - 46, width: 6, height: 48, borderRadius: 3, background: BLUE }} /> : null}
      </AbsoluteFill>
      {/* summary table */}
      {sum > 0 ? (
        <AbsoluteFill style={{ opacity: sum }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 120, display: "flex", justifyContent: "center" }}><Cap text="Чем мы удобнее" at={SUM + 10} size={72} /></div>
          <div style={{ position: "absolute", left: 300, top: 290, width: 1320 }}>
            <div style={{ display: "flex", alignItems: "center", height: 70, fontFamily: HEAD, fontWeight: 800, fontSize: 34 }}>
              <div style={{ flex: 1 }} />
              <div style={{ width: 220, textAlign: "center", color: "#7c8593" }}>lex.uz</div>
              <div style={{ width: 220, textAlign: "center", color: LOGO, fontFamily: UI, fontWeight: 900 }}>veoskill</div>
            </div>
            {ROWS.map((r, i) => {
              const s = sp(SUM + 30 + i * B, 12, 200);
              return (
                <div key={r} style={{ display: "flex", alignItems: "center", height: 118, borderTop: "2px solid #e3e5e9", transform: `translateY(${(1 - s) * 40}px)`, opacity: s }}>
                  <div style={{ flex: 1, fontFamily: UI, fontWeight: 800, fontSize: 40, color: INK }}>{r}</div>
                  <div style={{ width: 220, display: "flex", justifyContent: "center" }}><Mark ok={false} s={54} /></div>
                  <div style={{ width: 220, display: "flex", justifyContent: "center", transform: `scale(${1 + press(f, SUM + 42 + i * B) * 0.25})` }}><Mark ok s={54} /></div>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

// ================= S11 end card: brand palette, logo, QR =================
const S11: React.FC = () => {
  const f = useCurrentFrame();
  const sp = useSp();
  const logo = sp(10, 15, 140);
  const qr = sp(60, 14, 150);
  // calm end card: white, one soft brand-blue glow behind the QR, faint dot grid fading to the edges
  const glow = lin(f, 0, 40);
  const mask = "radial-gradient(ellipse 60% 70% at 50% 52%, #000 0%, rgba(0,0,0,0.35) 55%, transparent 85%)";
  return (
    <AbsoluteFill style={{ background: "#ffffff", overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(13,22,48,0.10) 1.6px, transparent 1.8px)", backgroundSize: "36px 36px", backgroundPosition: `0 ${-f * 0.15}px`, WebkitMaskImage: mask, maskImage: mask, opacity: 0.8 * glow }} />
      <div style={{ position: "absolute", left: 960 - 700, top: 640 - 460, width: 1400, height: 920, borderRadius: "50%", background: `radial-gradient(closest-side, rgba(61,183,244,0.16), rgba(61,183,244,0.05) 60%, transparent)`, opacity: glow, transform: `scale(${0.96 + 0.04 * glow})` }} />
      <Img src={staticFile("brand/veoskill.webp")} style={{ position: "absolute", left: 960 - 380, top: 170, width: 760, opacity: logo, transform: `translateY(${(1 - logo) * 40}px) scale(${0.94 + 0.06 * logo})` }} />
      <div style={{ position: "absolute", top: 380, width: "100%" }}><div style={{ display: "flex", justifyContent: "center" }}><Cap text="Учись играя. Начни сегодня." at={36} size={60} accent="Начни сегодня." /></div></div>
      <div style={{ position: "absolute", left: 960 - 216, top: 500, width: 432, padding: 52, borderRadius: 40, background: "#fff", boxShadow: "0 30px 80px rgba(13,22,48,0.16)", boxSizing: "border-box", transform: `scale(${qr})`, opacity: qr }}>
        <Img src={staticFile("brand/qr.svg")} style={{ width: 328, height: 328, display: "block" }} />
      </div>
      <div style={{ position: "absolute", top: 940, width: "100%", textAlign: "center", fontFamily: HEAD, fontWeight: 700, fontSize: 36, color: NAVY, opacity: lin(f, 80, 100) }}>Наведи камеру · <span style={{ color: BLUE }}>veoskill.uz</span></div>
    </AbsoluteFill>
  );
};


// ================= laws, desktop: lex.uz first, then ours =================
const LessonWords: React.FC = () => <Words per={43.2} items={[["КОРОТКИЕ", GREEN, "#fff"], ["УРОКИ.", BG, NAVY, "УРОКИ."], ["ШАГ", NAVY, "#fff"], ["ЗА ШАГОМ.", BLUE, "#fff"]]} />;
export const LexWords: React.FC = () => <Words per={40} items={[["ОБЫЧНО", BG, NAVY], ["ЗАКОН", NAVY, "#fff"], ["ВЫГЛЯДИТ", BG, NAVY], ["ТАК.", "#ffe3e3", RED]]} />;
const OurWords: React.FC = () => <Words per={43.2} items={[["А У НАС", BLUE, "#fff"], ["ТАК.", "#e7ffd6", GLIP]]} />;
/** A desktop browser window; the page inside is a full 1920x1080 frame scaled down. */
const Browser: React.FC<{ url: string; x: number; y: number; w: number; enter: number; children: React.ReactNode }> = ({ url, x, y, w, enter, children }) => {
  const f = useCurrentFrame();
  const s = w / 1920, h = 1080 * s;
  return (
    <AbsoluteFill style={{ perspective: 2400 }}>
      <div style={{ position: "absolute", left: x, top: y, width: w, height: h + 50, borderRadius: 22, overflow: "hidden", background: "#fff", boxShadow: "0 50px 120px rgba(13,22,48,0.22)", border: "2px solid #e3e5e9", transform: `translateY(${(1 - enter) * 160}px) rotateX(${(1 - enter) * 14 + 2}deg) rotateY(${-2 + Math.sin(f / 90) * 1}deg) scale(${0.94 + 0.06 * enter})`, opacity: Math.min(1, enter * 1.5) }}>
        <div style={{ height: 50, background: "#f1f3f6", borderBottom: "2px solid #e3e5e9", display: "flex", alignItems: "center", gap: 10, padding: "0 20px" }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => <div key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />)}
          <div style={{ marginLeft: 18, height: 30, flex: 1, maxWidth: 560, borderRadius: 15, background: "#fff", border: "1px solid #e3e5e9", display: "flex", alignItems: "center", padding: "0 16px", fontFamily: HEAD, fontWeight: 500, fontSize: 17, color: "#5d6470" }}>{url}</div>
        </div>
        <div style={{ position: "relative", width: w, height: h, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transformOrigin: "0 0", transform: `scale(${s})` }}>{children}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
const Badge: React.FC<{ ok: boolean; text: string; at: number; x: number; y: number }> = ({ ok, text, at, x, y }) => {
  const f = useCurrentFrame();
  const sp = useSp();
  const s = sp(at, 11, 200);
  if (f < at) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, display: "flex", alignItems: "center", gap: 18, transform: `translateX(${(1 - s) * 60}px) scale(${0.8 + 0.2 * s})`, opacity: Math.min(1, s * 1.4), transformOrigin: "0 50%" }}>
      <div style={{ width: 74, height: 74, borderRadius: 37, background: ok ? GREEN : RED, boxShadow: `0 6px 0 ${ok ? GLIP : "#c23a3a"}, 0 20px 40px ${ok ? "rgba(88,204,2,0.35)" : "rgba(255,75,75,0.35)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"><path d={ok ? "M12 5v14M5 12h14" : "M6 6l12 12M18 6L6 18"} /></svg>
      </div>
      <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 40, lineHeight: 1.1, color: ok ? GLIP : "#c23a3a", width: 360 }}>{text}</div>
    </div>
  );
};
const LEX_ROWS: [string, string][] = [
  ["Нет заметок и выделения", "Заметки и выделение цветом"],
  ["Нет объяснения простыми словами", "Объяснение простыми словами"],
  ["Нет примеров из жизни", "Примеры из жизни к статьям"],
  ["Нет уроков и игр", "Уроки и игры по праву"],
  ["Нет перевода на 99+ языков", "Законы на 99+ языках"],
];
const LEX_FLIP = 196;
const LexHead: React.FC<{ f: number }> = ({ f }) => {
  const a = lin(f, 70, 84) * (1 - lin(f, LEX_FLIP - 8, LEX_FLIP)), b = lin(f, LEX_FLIP, LEX_FLIP + 10);
  const st = { position: "absolute" as const, left: 1290, top: 196, fontFamily: HEAD, fontWeight: 800, fontSize: 30, letterSpacing: "0.12em" };
  return (
    <>
      <div style={{ ...st, color: "#7c8593", opacity: a }}>НА LEX.UZ</div>
      <div style={{ ...st, color: LOGO, opacity: b, transform: `translateY(${(1 - b) * 12}px)` }}>В VEOSKILL</div>
    </>
  );
};
const LexRow: React.FC<{ no: string; yes: string; at: number; flip: number; y: number }> = ({ no, yes, at, flip, y }) => {
  const f = useCurrentFrame();
  const sp = useSp();
  const s = sp(at, 13, 210);
  const g = sp(flip, 12, 220);
  const k = Math.min(1, Math.max(0, g));
  if (f < at) return null;
  const pop = 1 + press(f, flip) * 0.18;
  return (
    <div style={{ position: "absolute", left: 1290, top: y, display: "flex", alignItems: "center", gap: 18, transform: `translateX(${(1 - s) * 50}px)`, opacity: Math.min(1, s * 1.4) }}>
      <div style={{ position: "relative", width: 60, height: 60, flexShrink: 0, transform: `scale(${pop})` }}>
        {[false, true].map((ok) => (
          <div key={String(ok)} style={{ position: "absolute", inset: 0, borderRadius: 30, background: ok ? GREEN : RED, boxShadow: `0 5px 0 ${ok ? GLIP : "#c23a3a"}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: ok ? k : 1 - k, transform: `rotate(${ok ? (1 - k) * -90 : k * 90}deg)` }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"><path d={ok ? "M5 12.5l4.5 4.5L19 7.5" : "M6 6l12 12M18 6L6 18"} /></svg>
          </div>
        ))}
      </div>
      <div style={{ position: "relative", width: 520, height: 80 }}>
        {[no, yes].map((t, j) => (
          <div key={j} style={{ position: "absolute", left: 0, top: 0, height: 80, display: "flex", alignItems: "center", fontFamily: HEAD, fontWeight: 800, fontSize: 32, lineHeight: 1.1, color: j ? GLIP : "#c23a3a", opacity: j ? k : 1 - k, transform: `translateY(${(j ? 1 - k : -k) * 16}px)` }}>{t}</div>
        ))}
      </div>
    </div>
  );
};
const LexScene: React.FC = () => {
  const f = useCurrentFrame();
  const enter = lin(f, 0, 40, 0, 1, OUTE);
  const push = lin(f, 0, 317, 0, 1, Easing.linear);
  const X1 = lin(f, 50, 72, 0, 1, Easing.bezier(0.5, 0, 0.3, 1)), X2 = lin(f, 66, 88, 0, 1, Easing.bezier(0.5, 0, 0.3, 1));
  const cx = 110 + 550, cy = 200 + 370;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Top />
      <div style={{ position: "absolute", left: 110, top: 96, zIndex: 30 }}><Cap text="Обычно закон выглядит так." at={6} size={56} /></div>
      <AbsoluteFill style={{ transformOrigin: `${cx}px ${cy}px`, transform: `scale(${1 + push * 0.06})` }}>
        <AbsoluteFill style={{ perspective: 2400 }}>
          <div style={{ position: "absolute", left: 110, top: 190, width: 1100, height: 744, borderRadius: 22, overflow: "hidden", boxShadow: "0 50px 120px rgba(13,22,48,0.2)", border: "2px solid #e3e5e9", transform: `translateY(${(1 - enter) * 160}px) rotateX(${(1 - enter) * 14 + 2}deg)`, opacity: enter, background: "#fff" }}>
            <Img src={staticFile("lex/doc-desk.jpg")} style={{ width: 1100, height: 744, objectFit: "cover", objectPosition: "top left", filter: `saturate(${1 - X2 * 0.4}) brightness(${1 - X2 * 0.05})` }} />
          </div>
        </AbsoluteFill>
        {/* a big red cross drawn over the page */}
        <svg style={{ position: "absolute", left: cx - 300, top: cy - 300, filter: "drop-shadow(0 18px 30px rgba(194,58,58,0.35))" }} width="600" height="600" viewBox="0 0 600 600">
          <path d="M90 90 L510 510" stroke={RED} strokeWidth="44" strokeLinecap="round" strokeDasharray="600" strokeDashoffset={600 * (1 - X1)} />
          <path d="M510 90 L90 510" stroke={RED} strokeWidth="44" strokeLinecap="round" strokeDasharray="600" strokeDashoffset={600 * (1 - X2)} />
        </svg>
      </AbsoluteFill>
      {/* 5 red points (lex.uz), then each flips to a green check (veoskill); timed on the 125 BPM grid (1 beat = 28.8 frames) */}
      <LexHead f={f} />
      {LEX_ROWS.map((r, i) => (
        <LexRow key={i} no={r[0]} yes={r[1]} at={Math.round(86.4 + i * 14.4)} flip={Math.round(201.6 + i * 7.2)} y={262 + i * 128} />
      ))}
    </AbsoluteFill>
  );
};
const OurScene: React.FC<{ kind: "notes" | "ai" }> = ({ kind }) => {
  const f = useCurrentFrame();
  const enter = kind === "notes" ? lin(f, 0, 36, 0, 1, OUTE) : 1;
  const Demo = kind === "notes" ? DemoNotes : DemoAI;
  const off = kind === "notes" ? 30 : 50;
  const badgeAt = kind === "notes" ? 400 : 200;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Top />
      <Browser url="veoskill.uz/ru/laws/konstitutsiya" x={80} y={170} w={1300} enter={enter}>
        <Sequence from={-off} layout="none"><Demo /></Sequence>
      </Browser>
      {kind === "notes" ? <Badge ok text="Заметки и выделение цветом" at={badgeAt} x={1410} y={420} /> : <Badge ok text="Объяснение простыми словами" at={badgeAt} x={1410} y={420} />}
      {kind === "ai" ? <Badge ok text="Пример из жизни" at={badgeAt + 40} x={1410} y={580} /> : null}
    </AbsoluteFill>
  );
};
export const OurNotes: React.FC = () => <OurScene kind="notes" />;
export const OurAI: React.FC = () => <OurScene kind="ai" />;
const Table: React.FC = () => {
  const f = useCurrentFrame();
  const sp = useSp();
  const ROWS = [
    "Объяснение статьи простыми словами",
    "Пример из жизни к статье",
    "Заметки и выделение цветом",
    "Короткие уроки шаг за шагом",
    "Игры по праву",
    "Очки опыта и лига",
    "Законы на 99+ языках",
    "Уроки, игры и законы в одном месте",
  ];
  // rows land on half-beats of the 125 BPM track (the scene starts on a beat; 1 beat = 28.8 frames)
  const rowAt = (i: number) => Math.round(28.8 + i * 14.4);
  const push = lin(f, 0, 288, 0, 1, Easing.linear);
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Top />
      <AbsoluteFill style={{ transform: `scale(${1.0 + push * 0.04})` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 120, display: "flex", justifyContent: "center" }}><Cap text="Чем мы удобнее" at={6} size={68} /></div>
      <div style={{ position: "absolute", left: 300, top: 252, width: 1320 }}>
        <div style={{ display: "flex", alignItems: "center", height: 60, fontFamily: HEAD, fontWeight: 800, fontSize: 32, opacity: lin(f, 10, 24) }}>
          <div style={{ flex: 1 }} />
          <div style={{ width: 200, textAlign: "center", color: "#7c8593" }}>lex.uz</div>
          <div style={{ width: 200, textAlign: "center", color: LOGO, fontFamily: UI, fontWeight: 900 }}>veoskill</div>
        </div>
        {ROWS.map((r, i) => {
          const s = sp(rowAt(i), 14, 220);
          return (
            <div key={r} style={{ display: "flex", alignItems: "center", height: 84, borderTop: "2px solid #e3e5e9", transform: `translateY(${(1 - s) * 30}px)`, opacity: Math.min(1, s * 1.3) }}>
              <div style={{ flex: 1, fontFamily: UI, fontWeight: 800, fontSize: 36, color: INK }}>{r}</div>
              <div style={{ width: 200, display: "flex", justifyContent: "center" }}><Mark ok={false} s={46} /></div>
              <div style={{ width: 200, display: "flex", justifyContent: "center", transform: `scale(${1 + press(f, rowAt(i) + 7) * 0.25})` }}><Mark ok s={46} /></div>
            </div>
          );
        })}
      </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// xo: the scene keeps playing over the start of the next one for xo frames and dissolves away (push + blur),
// so the next scene builds up underneath instead of appearing on an empty background.
const SCENES: { C: React.FC; d: number; xo?: number }[] = [
  { C: IntroMosaic, d: 233 },
  { C: S2, d: 173 },
  { C: S3, d: 288 },
  { C: S4, d: 432 },
  { C: LessonWords, d: 173 },
  { C: LessonPath, d: 403 },
  { C: PhraseBank, d: 288, xo: 10 },
  { C: G2, d: 403 },
  { C: G3, d: 231 },
  { C: S7, d: 115 },
  { C: S7b, d: 374, xo: 16 },
  { C: Wall, d: 288 },
  { C: S9, d: 87, xo: 12 },
  { C: Counter, d: 345, xo: 16 },
  { C: LexScene, d: 317 },
  { C: OurWords, d: 86 },
  { C: LawsHome, d: 202 },
  { C: Reader, d: 432 },
  { C: AiWords, d: 86 },
  { C: AIReal, d: 316, xo: 16 },
  { C: Langs, d: 231, xo: 10 },
  { C: Table, d: 288, xo: 16 },
  { C: S11, d: 360 },
];
const starts: number[] = [];
let acc = 0;
SCENES.forEach((s) => { starts.push(acc); acc += s.d; });
export const V11_FRAMES = acc;
export const V11_STARTS = starts;
const Out: React.FC<{ d: number; xo: number; children: React.ReactNode }> = ({ d, xo, children }) => {
  const f = useCurrentFrame();
  const t = xo ? lin(f, d, d + xo, 0, 1, Easing.bezier(0.4, 0, 0.6, 1)) : 0;
  return <AbsoluteFill style={{ zIndex: xo && f >= d ? 5 : 1, opacity: 1 - t, transform: t > 0 ? `scale(${1 + t * 0.06})` : undefined, filter: t > 0.02 ? `blur(${t * 12}px)` : undefined }}>{children}</AbsoluteFill>;
};
export const V11: React.FC = () => {
  useFonts7();
  return (
    <AbsoluteFill style={{ background: BG }}>
      {SCENES.map((s, i) => (
        <Sequence key={i} from={starts[i]} durationInFrames={s.d + (s.xo ?? 0)}>
          <Out d={s.d} xo={s.xo ?? 0}><s.C /></Out>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
export { YEL as _y, RED as _r };
