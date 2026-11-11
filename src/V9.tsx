import React from "react";
import { AbsoluteFill, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFonts7, fit, textWidth } from "./Kit7";
import { S4b, S5b, S6b, S7b, S8b } from "./Scenes9";

// veoskill v9: Maverick-style reel. Flat, bold, music-led (120 BPM, beat = 30 frames), hard cuts on the beat,
// shapes that morph into the next idea, 3D icons from IconScout, product moments rebuilt as clean vector UI.
// Copy rules: no long dashes, no plates behind words.

const BG = "#f3f2ee";
const NAVY = "#0d1630";
const BLUE = "#1cb0f6";
const DEEP = "#0f6fbf";
const GREEN = "#58cc02";
const GLIP = "#46a302";
const YEL = "#ffc800";
const RED = "#ff4b4b";
const GREY = "#8b93a1";
const HEAD = "Onest, NunitoC, sans-serif";
const UI = "NunitoC, Nunito, sans-serif";
const B = 30; // one beat
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const OUTE = Easing.bezier(0.16, 1, 0.3, 1);
const IOE = Easing.bezier(0.65, 0, 0.35, 1);
const lin = (f: number, a: number, b: number, x = 0, y = 1, e = IOE) => interpolate(f, [a, b], [x, y], { easing: e, ...cl });
const useSp = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (at: number, damping = 13, stiffness = 170) => spring({ frame: f - at, fps, config: { damping, stiffness } });
};

/** Small chrome like the reference: brand top-left, address top-right, section label bottom-left. */
const Chrome: React.FC<{ label?: string; dark?: boolean }> = ({ label, dark }) => {
  const c = dark ? "rgba(255,255,255,0.75)" : "#6f7682";
  return (
    <>
      <div style={{ position: "absolute", left: 56, top: 44, fontFamily: UI, fontWeight: 900, fontSize: 26, color: dark ? "#fff" : BLUE }}>veoskill</div>
      <div style={{ position: "absolute", right: 56, top: 50, fontFamily: HEAD, fontWeight: 500, fontSize: 18, color: c }}>veoskill.uz</div>
      {label ? (
        <div style={{ position: "absolute", left: 56, bottom: 46, display: "flex", alignItems: "center", gap: 14, fontFamily: HEAD, fontWeight: 600, fontSize: 19, color: c }}>
          <div style={{ width: 28, height: 2, background: c }} />
          {label}
        </div>
      ) : null}
    </>
  );
};

/** Bold word(s): each letter rises out of a mask, fast stagger. */
const Kin: React.FC<{ text: string; at: number; size: number; color?: string; accent?: string; accentColor?: string; stagger?: number; weight?: number; maxW?: number; align?: "center" | "left" }> = ({ text, at, size, color = NAVY, accent, accentColor = BLUE, stagger = 1.6, weight = 900, maxW = 1700, align = "center" }) => {
  const f = useCurrentFrame();
  const fs = fit(text, size, maxW, weight);
  const ai = accent ? text.indexOf(accent) : -1;
  return (
    <div style={{ display: "flex", justifyContent: align === "center" ? "center" : "flex-start", overflow: "hidden", padding: `${fs * 0.1}px 0 ${fs * 0.18}px`, fontFamily: HEAD, fontWeight: weight, fontSize: fs, lineHeight: 1, letterSpacing: "-0.035em", whiteSpace: "pre" }}>
      {text.split("").map((ch, i) => {
        const t = lin(f, at + i * stagger, at + i * stagger + 16, 0, 1, OUTE);
        const isA = ai >= 0 && i >= ai && i < ai + accent!.length;
        return <span key={i} style={{ display: "inline-block", color: isA ? accentColor : color, transform: `translateY(${(1 - t) * 105}%)` }}>{ch}</span>;
      })}
    </div>
  );
};
/** A calmer line for captions: the whole line slides up from its mask. */
const Cap: React.FC<{ text: string; at: number; size?: number; color?: string; accent?: string; accentColor?: string; weight?: number; out?: number }> = ({ text, at, size = 56, color = NAVY, accent, accentColor = BLUE, weight = 800, out }) => {
  const f = useCurrentFrame();
  const t = lin(f, at, at + 22, 0, 1, OUTE);
  const o = out !== undefined ? lin(f, out, out + 14, 0, 1) : 0;
  const parts = accent && text.includes(accent) ? text.split(accent) : null;
  return (
    <div style={{ overflow: "hidden", padding: "4px 0 10px" }}>
      <div style={{ fontFamily: HEAD, fontWeight: weight, fontSize: size, lineHeight: 1.08, letterSpacing: "-0.025em", color, whiteSpace: "nowrap", transform: `translateY(${(1 - t) * 110 - o * 110}%)` }}>
        {parts ? <>{parts[0]}<span style={{ color: accentColor }}>{accent}</span>{parts[1]}</> : text}
      </div>
    </div>
  );
};

// =============== S1 intro: dot → line → wordmark ===============
const S1: React.FC = () => {
  const f = Math.round(useCurrentFrame() * 1.45);
  const sp = useSp();
  const fall = lin(f, 0, 22, 0, 1, Easing.in(Easing.quad));
  const bounce = f < 22 ? 0 : Math.abs(Math.sin(((f - 22) / 26) * Math.PI)) * 120 * Math.exp(-(f - 22) / 26);
  const dotY = -40 + fall * 640 - (f >= 22 && f < 74 ? bounce : 0);
  const stretch = lin(f, 74, 98, 0, 1, OUTE);
  const W = 640 * stretch + 28 * (1 - stretch);
  const lineY = 580 + lin(f, 74, 98, 0, 60, OUTE);
  const letters = "veoskill".split("");
  const sub = lin(f, 150, 172, 0, 1, OUTE);
  const squash = f >= 20 && f < 26 ? 1 - Math.sin(((f - 20) / 6) * Math.PI) * 0.35 : 1;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Chrome />
      {f < 98 ? <div style={{ position: "absolute", left: 960 - W / 2, top: (f < 74 ? dotY : lineY) - 14, width: W, height: 28 * (f < 74 ? squash : 1 - stretch * 0.6), borderRadius: 14, background: NAVY }} /> : null}
      {f >= 98 ? <div style={{ position: "absolute", left: 960 - 320, top: 640 - 6, width: 640, height: 12, borderRadius: 6, background: NAVY }} /> : null}
      {/* letters rise from behind the line */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, height: 254, overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "flex-end" }}>
        {letters.map((ch, i) => {
          const s = sp(68 + i * 4, 11, 190);
          return <span key={i} style={{ display: "inline-block", fontFamily: UI, fontWeight: 900, fontSize: 230, lineHeight: 0.92, letterSpacing: "-0.01em", color: i === 2 ? BLUE : i === 5 ? GREEN : NAVY, transform: `translateY(${(1 - s) * 110}%)` }}>{ch}</span>;
        })}
      </div>
      <div style={{ position: "absolute", top: 676, width: "100%", textAlign: "center", fontFamily: HEAD, fontWeight: 600, fontSize: 40, color: "#555c68", opacity: sub, transform: `translateY(${(1 - sub) * 20}px)` }}>Самый живой способ учиться</div>
    </AbsoluteFill>
  );
};

// =============== S2 pain beats: hard cuts on the beat ===============
const BEATS: [string, string, string, string?][] = [
  ["ЗУБРИШЬ.", NAVY, "#fff"],
  ["ЗАБЫВАЕШЬ.", BLUE, "#fff"],
  ["СКУЧНО.", "#fff", NAVY],
  ["ЗНАКОМО?", BG, NAVY, "?"],
];
const S2: React.FC = () => {
  const f = useCurrentFrame();
  const i = Math.min(BEATS.length - 1, Math.floor(f / 30));
  const [w, bg, c, acc] = BEATS[i];
  const lf = f - i * 30;
  const s = 1.08 - lin(lf, 0, 30, 0, 0.08, Easing.out(Easing.quad));
  return (
    <AbsoluteFill style={{ background: bg, alignItems: "center", justifyContent: "center" }}>
      <Chrome dark={bg === NAVY || bg === BLUE} />
      <div style={{ transform: `scale(${s})`, width: "100%" }}><Kin key={i} text={w} at={i * 30} size={260} color={c} accent={acc} stagger={1.2} /></div>
    </AbsoluteFill>
  );
};

// =============== S3 the turn: a rotating text cylinder ===============
const BAND = "УРОКИ • КВИЗЫ • ИГРЫ • ЗАКОНЫ • ";
const S3: React.FC = () => {
  const f = useCurrentFrame();
  const N = 9;
  const R = 520;
  const spin = lin(f, 0, 118, 0, 1, Easing.bezier(0.2, 0.6, 0.3, 1)) * 200;
  const fade = lin(f, 100, 124, 0, 1);
  return (
    <AbsoluteFill style={{ background: BLUE, overflow: "hidden" }}>
      <AbsoluteFill style={{ perspective: 1400, opacity: 1 - fade * 0.85, filter: fade > 0 ? `blur(${fade * 6}px)` : undefined }}>
        <div style={{ position: "absolute", left: "50%", top: "50%", transformStyle: "preserve-3d", transform: `rotateZ(-14deg) rotateX(${spin}deg)` }}>
          {Array.from({ length: N }, (_, k) => {
            const x = ((f * (k % 2 ? 5 : -5)) % 1200) - 600;
            return (
              <div key={k} style={{ position: "absolute", left: -1600, top: -60, width: 3200, height: 120, display: "flex", alignItems: "center", whiteSpace: "nowrap", fontFamily: HEAD, fontWeight: 900, fontSize: 108, letterSpacing: "-0.03em", color: "#fff", backfaceVisibility: "hidden", transform: `rotateX(${(k * 360) / N}deg) translateZ(${R}px) translateX(${x}px)` }}>
                {BAND.repeat(5)}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <Chrome dark />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        {f >= 118 ? <Kin text="Учись играя." at={120} size={190} color="#fff" stagger={1.4} /> : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// =============== S4 directions: a 3D carousel of IconScout icons ===============
const DIRS: [string, string][] = [
  ["history", "История"], ["math", "Математика"], ["english", "Английский"], ["business", "Бизнес"], ["psychology", "Психология"],
  ["it", "Программирование"], ["ai", "Искусственный интеллект"], ["medicine", "Медицина"], ["economics", "Экономика"], ["law", "Право"],
];
const S4: React.FC = () => {
  const f = useCurrentFrame();
  const n = DIRS.length;
  // step one icon per beat, each step eased like a dial
  const stepF = Math.max(0, f - 40);
  const k = Math.min(n - 1, Math.floor(stepF / B));
  const frac = k >= n - 1 ? 0 : lin(stepF - k * B, 0, 18, 0, 1, Easing.bezier(0.5, 0, 0.2, 1));
  const pos = k + frac; // which icon is in front
  const done = lin(f, 40 + (n - 1) * B + 10, 40 + (n - 1) * B + 40, 0, 1, OUTE);
  const front = Math.round(pos) % n;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Chrome label="01  Направления" />
      <div style={{ position: "absolute", top: 96, width: "100%" }}><Kin text="10 направлений" at={6} size={110} accent="10" stagger={1.3} /></div>
      <div style={{ position: "absolute", left: 960 - 520, top: 700, width: 1040, height: 60, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(13,22,48,0.16), rgba(13,22,48,0))" }} />
      {DIRS.map(([slug], i) => {
        const a = ((i - pos) / n) * Math.PI * 2;
        const x = Math.sin(a) * 760;
        const z = Math.cos(a); // 1 front, -1 back
        const y = -z * 60;
        const s = 0.42 + 0.58 * ((z + 1) / 2) ** 2;
        const dim = i === n - 1 ? 1 : 1 - done * 0.55;
        const enter = lin(f, i * 2, i * 2 + 30, 0, 1, OUTE);
        return (
          <div key={slug} style={{ position: "absolute", left: 960 + x - 250, top: 470 + y - 250, width: 500, height: 500, zIndex: Math.round((z + 1) * 50), transform: `scale(${s * enter})`, opacity: (0.35 + 0.65 * ((z + 1) / 2)) * dim, filter: `blur(${Math.max(0, (1 - z) * 2.2)}px) saturate(${0.6 + 0.4 * dim})` }}>
            <Img src={staticFile(`ic3d/${slug}-s.png`)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        );
      })}
      <div style={{ position: "absolute", top: 760, width: "100%", display: "flex", justifyContent: "center" }}>
        <Cap key={front} text={DIRS[front][1]} at={40 + Math.round(pos) * B - (front === n - 1 ? 0 : 0)} size={64} />
      </div>
      {done > 0.01 ? (
        <div style={{ position: "absolute", top: 856, width: "100%", display: "flex", justifyContent: "center", gap: 28, fontFamily: HEAD, fontWeight: 700, fontSize: 30, opacity: done }}>
          <span style={{ color: GLIP }}>● Уже открыто</span>
          <span style={{ color: GREY }}>Остальные скоро</span>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// =============== S5 lessons: a clean vector lesson assembles ===============
const Stone: React.FC<{ x: number; y: number; at: number; kind: "done" | "now" | "lock"; press?: number }> = ({ x, y, at, kind, press = 0 }) => {
  const sp = useSp();
  const s = sp(at, 11, 200);
  const c = kind === "lock" ? "#e2e4e8" : GREEN;
  const lip = kind === "lock" ? "#c9ccd2" : GLIP;
  return (
    <div style={{ position: "absolute", left: x - 64, top: y - 60, width: 128, height: 118, transform: `scale(${s})` }}>
      <div style={{ position: "absolute", left: 0, top: 12 + press * 8, width: 128, height: 104, borderRadius: "50%", background: lip }} />
      <div style={{ position: "absolute", left: 0, top: press * 8, width: 128, height: 104, borderRadius: "50%", background: c, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="52" height="52" viewBox="0 0 24 24" fill={kind === "now" ? "#fff" : "none"} stroke={kind === "lock" ? "#a3a8b0" : "#fff"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d={kind === "done" ? "M5 12.5l4.5 4.5L19 7.5" : kind === "now" ? "M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.6 6.7 19.4l1.2-6L3.4 9.3l6-.7z" : "M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z"} />
        </svg>
      </div>
      {kind === "now" ? <div style={{ position: "absolute", inset: -16, borderRadius: "50%", border: `6px solid rgba(88,204,2,0.35)`, transform: `scale(${1 + Math.sin(useCurrentFrame() / 9) * 0.04})` }} /> : null}
    </div>
  );
};
const Pointer: React.FC<{ x: number; y: number; down?: number; op?: number }> = ({ x, y, down = 0, op = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, zIndex: 80, opacity: op, transform: `scale(${1 - down * 0.14})`, transformOrigin: "4px 4px" }}>
    <svg width="46" height="56" viewBox="0 0 22 27" style={{ filter: "drop-shadow(0 8px 12px rgba(0,0,0,0.25))" }}><path d="M2 2 L2 21 L7 16.5 L10.5 24.5 L14 23 L10.6 15.2 L17 15 Z" fill={NAVY} stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" /></svg>
  </div>
);
const press = (f: number, at: number) => lin(f, at, at + 4) * (1 - lin(f, at + 6, at + 12));
const S5: React.FC = () => {
  const f = useCurrentFrame();
  const sp = useSp();
  const P = [[700, 820], [860, 680], [700, 540], [540, 400], [700, 260]] as const; // path, bottom→top
  const C1 = 168, C2 = 214, OPEN = 236, PICK = 418;
  const card = sp(C1 + 4, 13, 210) * (1 - lin(f, C2 + 8, C2 + 20));
  const lesson = lin(f, OPEN, OPEN + 40, 0, 1, OUTE);
  const tilt = lin(f, 0, 600, 0, 1, Easing.linear);
  // pointer
  const px = interpolate(f, [120, C1 - 4, C1 + 16, C2 - 4, C2 + 30, PICK - 30, PICK - 4, PICK + 40], [1500, 560, 580, 620, 700, 1180, 1200, 1300], { ...cl, easing: IOE });
  const py = interpolate(f, [120, C1 - 4, C1 + 16, C2 - 4, C2 + 30, PICK - 30, PICK - 4, PICK + 40], [1000, 560, 560, 306, 330, 690, 700, 820], { ...cl, easing: IOE });
  const down = Math.max(press(f, C1), press(f, C2), press(f, PICK));
  const ok = f >= PICK + 4;
  const toast = sp(PICK + 60, 15, 160) * (1 - lin(f, 590, 610));
  const streak = Math.min(7, 1 + Math.max(0, Math.floor((f - PICK - 90) / 12)));
  const optY = (i: number) => 560 + i * 110;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Chrome label="02  Уроки" />
      <div style={{ position: "absolute", left: 120, top: 380 }}>
        <Cap text="Короткий урок." at={10} size={72} />
        <Cap text="Каждый день." at={22} size={72} accent="Каждый день." accentColor={GREEN} />
        <div style={{ marginTop: 22, fontFamily: HEAD, fontWeight: 500, fontSize: 30, color: "#5d6470", opacity: lin(f, 40, 60) }}>Теория, игры и проверка за пару минут</div>
      </div>
      <AbsoluteFill style={{ perspective: 2200 }}>
        <div style={{ position: "absolute", left: 520, top: 0, width: 1320, height: 1080, transformStyle: "preserve-3d", transform: `rotateY(${-12 + tilt * 5}deg) rotateX(${8 - tilt * 3}deg)` }}>
          {/* path phase */}
          <div style={{ position: "absolute", inset: 0, opacity: 1 - lesson, transform: `scale(${1 + lesson * 0.25})`, transformOrigin: "620px 306px" }}>
            <svg style={{ position: "absolute", left: 0, top: 0 }} width="1320" height="1080"><path d={`M${P[0][0]} ${P[0][1]} L${P[1][0]} ${P[1][1]} L${P[2][0]} ${P[2][1]} L${P[3][0]} ${P[3][1]} L${P[4][0]} ${P[4][1]}`} fill="none" stroke="#d5d8de" strokeWidth="10" strokeDasharray="2 26" strokeLinecap="round" strokeDashoffset={-f} /></svg>
            {P.map(([x, y], i) => <Stone key={i} x={x} y={y} at={14 + i * B * 0.5} kind={i < 2 ? "done" : i === 2 ? "now" : "lock"} press={i === 2 ? press(f, C1) : 0} />)}
            {card > 0.01 ? (
              <div style={{ position: "absolute", left: 700 - 210, top: 540 - 330, width: 420, borderRadius: 26, background: GREEN, boxShadow: `0 6px 0 ${GLIP}, 0 30px 60px rgba(40,90,0,0.25)`, padding: "22px 24px 24px", boxSizing: "border-box", fontFamily: UI, color: "#fff", transformOrigin: "50% 100%", transform: `scale(${card})`, opacity: Math.min(1, card * 1.6) }}>
                <div style={{ fontWeight: 900, fontSize: 30, lineHeight: 1.2 }}>Кто пишет законы</div>
                <div style={{ fontWeight: 700, fontSize: 20, opacity: 0.9, marginTop: 6 }}>Урок 3</div>
                <div style={{ marginTop: 18, height: 64, borderRadius: 16, background: "#fff", color: GREEN, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 24, letterSpacing: "0.05em", boxShadow: `0 ${5 - press(f, C2) * 5}px 0 #dfe3e8`, transform: `translateY(${press(f, C2) * 5}px)` }}>НАЧАТЬ</div>
              </div>
            ) : null}
          </div>
          {/* lesson phase */}
          {lesson > 0.01 ? (
            <div style={{ position: "absolute", left: 300, top: 170, width: 940, height: 780, borderRadius: 40, background: "#fff", boxShadow: "0 50px 120px rgba(13,22,48,0.16)", opacity: lesson, transform: `scale(${0.85 + 0.15 * lesson})`, fontFamily: UI, overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 60, top: 54, right: 60, height: 22, borderRadius: 11, background: "#e8eaee" }}><div style={{ width: `${lin(f, OPEN + 20, PICK + 20, 20, 70)}%`, height: "100%", borderRadius: 11, background: GREEN }} /></div>
              <div style={{ position: "absolute", left: 60, top: 130, right: 60 }}>
                <div style={{ fontWeight: 800, fontSize: 22, letterSpacing: "0.08em", color: GREY, opacity: lin(f, OPEN + 30, OPEN + 50) }}>ТЕОРИЯ</div>
                <div style={{ marginTop: 12, fontWeight: 800, fontSize: 40, lineHeight: 1.3, color: "#2b3240", opacity: lin(f, OPEN + 40, OPEN + 62), transform: `translateY(${(1 - lin(f, OPEN + 40, OPEN + 62, 0, 1, OUTE)) * 24}px)` }}>
                  <span style={{ position: "relative", color: BLUE }}>Законы<span style={{ position: "absolute", left: 0, bottom: -4, height: 5, borderRadius: 3, background: BLUE, width: `${lin(f, OPEN + 70, OPEN + 100) * 100}%` }} /></span> в Узбекистане принимает Олий Мажлис.
                </div>
              </div>
              <div style={{ position: "absolute", left: 60, top: 430, fontWeight: 900, fontSize: 32, color: "#2b3240", opacity: lin(f, OPEN + 100, OPEN + 120) }}>Кто принимает законы?</div>
              {["Соседи по махалле", "Олий Мажлис", "Блогеры"].map((o, i) => {
                const s = sp(OPEN + 116 + i * 8, 14, 190);
                const good = i === 1 && ok;
                return <div key={o} style={{ position: "absolute", left: 60, right: 60, top: optY(i) - 50 + 0, height: 88, borderRadius: 22, border: `3px solid ${good ? GREEN : "#e2e4e8"}`, background: good ? "#e7ffd6" : "#fff", boxShadow: `0 ${6 - (i === 1 ? press(f, PICK) * 6 : 0)}px 0 ${good ? "#b5ec8c" : "#e2e4e8"}`, display: "flex", alignItems: "center", padding: "0 30px", fontWeight: 800, fontSize: 30, color: good ? GLIP : "#3b4250", transform: `scale(${s}) translateY(${i === 1 ? press(f, PICK) * 6 : 0}px)`, opacity: s }}>{o}{good ? <svg style={{ marginLeft: "auto" }} width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg> : null}</div>;
              })}
            </div>
          ) : null}
          {/* pointer lives in the same tilted plane */}
          {f >= 120 && f < 470 ? <Pointer x={px} y={py} down={down} op={lin(f, 120, 132) * (1 - lin(f, 456, 470))} /> : null}
        </div>
      </AbsoluteFill>
      {/* toast + streak */}
      {toast > 0.01 ? (
        <div style={{ position: "absolute", left: 1010, top: 70, width: 620, height: 104, borderRadius: 28, background: "#fff", boxShadow: "0 24px 60px rgba(13,22,48,0.18)", display: "flex", alignItems: "center", gap: 22, padding: "0 28px", boxSizing: "border-box", fontFamily: UI, transform: `translateY(${(1 - toast) * -160}px)`, zIndex: 90 }}>
          <div style={{ width: 60, height: 60, borderRadius: 30, background: GREEN, display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 32, color: "#2b3240" }}>Урок пройден</div>
            <div style={{ fontWeight: 800, fontSize: 24, color: "#e0a800" }}>+15 XP</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontWeight: 900, fontSize: 40, color: "#ff9600" }}>
            <svg width="40" height="46" viewBox="0 0 24 28"><path d="M12 1c1 5 7 7 7 15a7 7 0 0 1-14 0c0-4 2-6 3-8 0 3 2 4 2 4 0-5 1-8 2-11z" fill="#ff9600" /><path d="M12 14c.6 2.5 3.5 3.5 3.5 7a3.5 3.5 0 0 1-7 0c0-2 1-3 1.5-4 .5 1.5 1.5 2 1.5 2 0-2 .2-3.5.5-5z" fill="#ffd04a" /></svg>
            {streak}
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// =============== S6 games: one card, five formats ===============
type G = { name: string; w: number; h: number };
const GAMES: G[] = [
  { name: "Найди миф", w: 760, h: 440 },
  { name: "Верно или неверно", w: 520, h: 600 },
  { name: "Собери фразу", w: 980, h: 360 },
  { name: "Истории", w: 600, h: 560 },
  { name: "Работа над ошибками", w: 560, h: 480 },
];
const GD = 84; // each game holds ~3 beats
const Chip: React.FC<{ t: string; x: number; y: number }> = ({ t, x, y }) => (
  <div style={{ position: "absolute", left: x, top: y, padding: "16px 26px", borderRadius: 18, border: "3px solid #e2e4e8", boxShadow: "0 5px 0 #e2e4e8", background: "#fff", fontFamily: UI, fontWeight: 800, fontSize: 32, color: "#2b3240", whiteSpace: "nowrap" }}>{t}</div>
);
const GameFace: React.FC<{ i: number; lf: number }> = ({ i, lf }) => {
  const { fps } = useVideoConfig();
  const sp = (at: number, d = 12, s = 180) => spring({ frame: lf - at, fps, config: { damping: d, stiffness: s } });
  const txt: React.CSSProperties = { fontFamily: UI, fontWeight: 800, color: "#2b3240", textAlign: "center" };
  if (i === 0) {
    const st = sp(28, 9, 220);
    return (
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 60 }}>
        <div style={{ ...txt, fontSize: 40, lineHeight: 1.3 }}>Незнание закона освобождает от ответственности</div>
        <div style={{ position: "absolute", right: 50, top: 40, padding: "8px 24px", border: `6px solid ${RED}`, borderRadius: 16, fontFamily: HEAD, fontWeight: 900, fontSize: 52, color: RED, transform: `rotate(-12deg) scale(${2.2 - 1.2 * st})`, opacity: Math.min(1, st * 2) }}>МИФ</div>
      </AbsoluteFill>
    );
  }
  if (i === 1) {
    const sw = lin(lf, 34, 60, 0, 1, Easing.bezier(0.5, 0, 0.3, 1));
    return (
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 50, transform: `translateX(${sw * 60}px) rotate(${sw * 8}deg)`, background: `rgba(215,255,184,${sw})` }}>
        <div style={{ ...txt, fontSize: 42, lineHeight: 1.3 }}>Конституция: главный закон страны</div>
        <div style={{ position: "absolute", left: 34, top: 30, padding: "6px 18px", border: `5px solid ${GREEN}`, borderRadius: 12, fontFamily: HEAD, fontWeight: 900, fontSize: 34, color: GLIP, opacity: sw, transform: "rotate(-8deg)" }}>ВЕРНО</div>
      </AbsoluteFill>
    );
  }
  if (i === 2) {
    const words = ["Закон", "один", "для", "всех"];
    const xs = [70, 280, 470, 620];
    return (
      <AbsoluteFill>
        {words.map((w, k) => {
          const s = sp(14 + k * 9, 14, 200);
          return <Chip key={w} t={w} x={xs[k] + (1 - s) * (k % 2 ? 80 : -60)} y={140 + (1 - s) * (k % 2 ? 160 : -140)} />;
        })}
        <div style={{ position: "absolute", left: 70, right: 70, top: 252, height: 4, borderRadius: 2, background: "#e8eaee" }} />
      </AbsoluteFill>
    );
  }
  if (i === 3) {
    const a = sp(8, 15, 170), b = sp(40, 15, 170);
    return (
      <AbsoluteFill style={{ padding: 44, fontFamily: UI }}>
        <div style={{ alignSelf: "flex-start", maxWidth: 420, padding: "22px 26px", borderRadius: "26px 26px 26px 6px", background: "#eef1f5", fontWeight: 700, fontSize: 30, lineHeight: 1.35, color: "#2b3240", transform: `scale(${a})`, transformOrigin: "0 100%" }}>Купил телефон, через неделю сломался. Что делать?</div>
        <div style={{ alignSelf: "flex-end", marginTop: 26, maxWidth: 430, padding: "22px 26px", borderRadius: "26px 26px 6px 26px", background: BLUE, fontWeight: 800, fontSize: 30, lineHeight: 1.35, color: "#fff", transform: `scale(${b})`, transformOrigin: "100% 100%" }}>Требовать ремонт или возврат по закону</div>
      </AbsoluteFill>
    );
  }
  const flip = lin(lf, 30, 52, 0, 1, IOE);
  const good = flip > 0.5;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 26, transform: `rotateY(${flip * 180 - (good ? 180 : 0)}deg)` }}>
      <div style={{ width: 150, height: 150, borderRadius: 75, background: good ? GREEN : RED, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d={good ? "M5 12.5l4.5 4.5L19 7.5" : "M6 6l12 12M18 6L6 18"} /></svg>
      </div>
      <div style={{ ...txt, fontSize: 42, color: good ? GLIP : RED }}>{good ? "Исправлено" : "Ошибка"}</div>
    </AbsoluteFill>
  );
};
const S6: React.FC = () => {
  const f = useCurrentFrame();
  const sp = useSp();
  const idx = Math.min(GAMES.length - 1, Math.floor(f / GD));
  const lf = f - idx * GD;
  const prev = GAMES[Math.max(0, idx - 1)];
  const cur = GAMES[idx];
  const m = idx === 0 ? sp(0, 14, 160) : spring({ frame: lf, fps: 60, config: { damping: 15, stiffness: 190 } });
  const w = prev.w + (cur.w - prev.w) * m, h = prev.h + (cur.h - prev.h) * m;
  const row = lin(f, GD * 5, GD * 5 + 40, 0, 1, OUTE);
  const ent = idx === 0 ? sp(0, 14, 160) : 1;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Chrome label="02  Уроки · игры" />
      <div style={{ position: "absolute", left: 120, top: 120 }}>
        <Cap text="Пять видов игр." at={6} size={64} out={GD * 5 - 10} />
      </div>
      <div style={{ position: "absolute", left: 120, top: 120 }}>
        {row > 0 ? <Cap text="Одна тема. Пять способов запомнить." at={GD * 5 + 6} size={64} accent="запомнить." /> : null}
      </div>
      {row < 1 ? (
        <>
          <div style={{ position: "absolute", left: 960 - w / 2, top: 560 - h / 2, width: w, height: h, borderRadius: 44, background: "#fff", boxShadow: "0 40px 100px rgba(13,22,48,0.14)", overflow: "hidden", perspective: 1200, transform: `scale(${ent * (1 - row * 0.5)})`, opacity: 1 - row }}>
            {m > 0.6 || idx === 0 ? <GameFace key={idx} i={idx} lf={lf} /> : null}
          </div>
          <div style={{ position: "absolute", top: 560 + h / 2 + 34, width: "100%", opacity: 1 - row }}><div style={{ display: "flex", justifyContent: "center" }}><Cap key={idx} text={cur.name} at={idx * GD + 6} size={44} weight={700} color="#4b5260" /></div></div>
        </>
      ) : null}
      {row > 0 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 430, display: "flex", justifyContent: "center", gap: 26 }}>
          {GAMES.map((g, i) => {
            const s = sp(GD * 5 + i * 5, 13, 190);
            return (
              <div key={g.name} style={{ width: 300, height: 300, borderRadius: 34, background: "#fff", boxShadow: "0 24px 60px rgba(13,22,48,0.12)", display: "flex", alignItems: "flex-end", padding: 26, boxSizing: "border-box", transform: `translateY(${(1 - s) * 80}px) scale(${0.9 + 0.1 * s})`, opacity: s }}>
                <div style={{ position: "absolute" }} />
                <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 30, lineHeight: 1.15, color: NAVY }}>
                  <div style={{ width: 54, height: 54, borderRadius: 16, background: [BLUE, GREEN, YEL, "#ce82ff", RED][i], marginBottom: 90 }} />
                  {g.name}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// =============== S7 progress: 3D bars on navy ===============
const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const HS = [0.35, 0.5, 0.42, 0.66, 0.58, 0.82, 1];
const S7: React.FC = () => {
  const f = useCurrentFrame();
  const sp = useSp();
  const xp = Math.round(lin(f, 20, 20 + 7 * 15 + 20, 0, 105, Easing.out(Easing.quad)));
  const ring = lin(f, 120, 220, 0, 0.72, OUTE);
  const C = 2 * Math.PI * 120;
  return (
    <AbsoluteFill style={{ background: NAVY }}>
      <Chrome label="03  Прогресс" dark />
      <div style={{ position: "absolute", left: 120, top: 150, fontFamily: HEAD, fontWeight: 900, fontSize: 150, letterSpacing: "-0.04em", color: "#fff", fontVariantNumeric: "tabular-nums" }}>+{xp} <span style={{ color: YEL }}>XP</span></div>
      <div style={{ position: "absolute", left: 126, top: 330, fontFamily: HEAD, fontWeight: 500, fontSize: 30, color: "rgba(255,255,255,0.7)", opacity: lin(f, 30, 50) }}>за неделю коротких уроков</div>
      {/* bars: front + top + side faces */}
      <div style={{ position: "absolute", left: 130, top: 470, width: 1000, height: 460 }}>
        {DAYS.map((d, i) => {
          const s = sp(20 + i * 15, 14, 150);
          const h = 360 * HS[i] * s;
          const x = i * 135;
          const hot = i === 6;
          const c = hot ? YEL : i % 2 ? BLUE : "#f3f2ee";
          return (
            <div key={d} style={{ position: "absolute", left: x, bottom: 60, width: 92 }}>
              <div style={{ position: "absolute", left: 0, bottom: 0, width: 92, height: h, background: c, borderRadius: "6px 6px 0 0" }} />
              <div style={{ position: "absolute", left: 92, bottom: 0, width: 22, height: h, background: c, filter: "brightness(0.72)", transform: "skewY(-40deg)", transformOrigin: "0 100%" }} />
              <div style={{ position: "absolute", left: 0, bottom: h, width: 92, height: 18, background: c, filter: "brightness(1.15)", transform: "skewX(-50deg)", transformOrigin: "0 100%" }} />
              <div style={{ position: "absolute", left: 0, bottom: h + 30, width: 92, textAlign: "center", fontFamily: HEAD, fontWeight: 700, fontSize: 24, color: "rgba(255,255,255,0.85)", opacity: s }}>+15</div>
              <div style={{ position: "absolute", left: 0, bottom: -44, width: 92, textAlign: "center", fontFamily: HEAD, fontWeight: 600, fontSize: 24, color: "rgba(255,255,255,0.6)" }}>{d}</div>
            </div>
          );
        })}
      </div>
      {/* league ring */}
      <div style={{ position: "absolute", left: 1330, top: 380, width: 320, height: 320, opacity: lin(f, 110, 130) }}>
        <svg width="320" height="320" viewBox="0 0 320 320" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="160" cy="160" r="120" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="34" />
          <circle cx="160" cy="160" r="120" fill="none" stroke={BLUE} strokeWidth="34" strokeLinecap="round" strokeDasharray={`${C * ring} ${C}`} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HEAD, fontWeight: 900, fontSize: 64, color: "#fff" }}>{Math.round(ring * 100)}%</div>
      </div>
      <div style={{ position: "absolute", left: 1290, top: 730, width: 400, textAlign: "center", fontFamily: HEAD, fontWeight: 700, fontSize: 30, color: "rgba(255,255,255,0.85)", opacity: lin(f, 160, 180) }}>до Серебряной лиги</div>
    </AbsoluteFill>
  );
};

// =============== S8 laws: circle → phone → plain words ===============
const S8: React.FC = () => {
  const f = useCurrentFrame();
  const sp = useSp();
  const a = sp(0, 14, 170);
  const m1 = lin(f, 30, 60, 0, 1, OUTE); // circle → square
  const m2 = lin(f, 66, 104, 0, 1, OUTE); // square → phone
  const w = 240 + (380 - 240) * m2, h = 240 + (760 - 240) * m2, r = 120 - 70 * m1 - 0 * m2;
  const TAP = 150;
  const tap = press(f, TAP);
  const ripple = lin(f, TAP, TAP + 26);
  const steps = lin(f, 360, 380, 0, 1);
  const card = (i: number) => sp(TAP + 30 + i * B, 13, 180);
  const CARDS: [string, string, number, number][] = [
    ["Коротко", "Узбекистан: суверенное правовое государство.", 300, 430],
    ["Простыми словами", "Страна сама решает, а всё держится на законе.", 1260, 250],
    ["Пример из жизни", "Чиновник нарушил закон? Его решение можно обжаловать.", 1260, 650],
  ];
  const phone = { x: 960, y: 560 };
  const shift = lin(f, 330, 370, 0, 1, IOE);
  return (
    <AbsoluteFill style={{ background: GREEN }}>
      <Chrome label="04  Законы" dark />
      <div style={{ position: "absolute", left: 120, top: 120, opacity: 1 - shift }}>
        <Cap text="Любая статья." at={8} size={64} color="#fff" />
        <Cap text="Простыми словами." at={20} size={64} color="#fff" accent="Простыми словами." accentColor={NAVY} />
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - shift, transform: `translateY(${shift * -60}px)` }}>
        {/* dashed connectors */}
        <svg style={{ position: "absolute", left: 0, top: 0 }} width="1920" height="1080">
          {CARDS.map(([, , x, y], i) => {
            const t = lin(f, TAP + 20 + i * B, TAP + 40 + i * B);
            const ex = x + 180, ey = y + 70;
            return <line key={i} x1={phone.x} y1={phone.y} x2={phone.x + (ex - phone.x) * t} y2={phone.y + (ey - phone.y) * t} stroke="#fff" strokeWidth="4" strokeDasharray="4 14" strokeLinecap="round" opacity={0.9} />;
          })}
        </svg>
        <div style={{ position: "absolute", left: phone.x - w / 2, top: phone.y - h / 2, width: w, height: h, borderRadius: r, background: "#fff", boxShadow: "0 40px 90px rgba(20,60,0,0.3)", transform: `scale(${a})`, overflow: "hidden", fontFamily: UI }}>
          {m2 > 0.6 ? (
            <div style={{ position: "absolute", inset: 0, padding: "56px 30px", opacity: lin(f, 96, 114) }}>
              <div style={{ width: 120, height: 10, borderRadius: 5, background: "#e8eaee", margin: "-30px auto 30px" }} />
              <div style={{ fontWeight: 900, fontSize: 34, color: "#2b3240" }}>Статья 1.</div>
              {[1, 0.92, 1, 0.8, 0.95, 0.7, 1, 0.86, 0.6].map((k, i) => <div key={i} style={{ marginTop: 16, height: 12, borderRadius: 6, width: `${k * 100}%`, background: "#dfe2e7" }} />)}
              <div style={{ position: "absolute", left: "50%", bottom: 50, marginLeft: -48, width: 96, height: 96, borderRadius: 30, background: BLUE, boxShadow: `0 ${6 - tap * 6}px 0 ${DEEP}`, transform: `translateY(${tap * 6}px) scale(${1 + Math.sin(f / 8) * 0.03})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="7" width="16" height="12" rx="3" /><path d="M12 3v4M9 12h.01M15 12h.01M9.5 15.5h5M2 12v3M22 12v3" /></svg>
              </div>
              <div style={{ position: "absolute", left: "50%", bottom: 98, width: 220, height: 220, marginLeft: -110, marginBottom: -110, borderRadius: "50%", border: `5px solid ${BLUE}`, transform: `scale(${0.3 + ripple})`, opacity: f >= TAP ? 1 - ripple : 0 }} />
            </div>
          ) : null}
        </div>
        {CARDS.map(([t, d, x, y], i) => {
          const s = card(i);
          return (
            <div key={t} style={{ position: "absolute", left: x, top: y, width: 360, padding: "24px 26px", borderRadius: 28, background: "#fff", boxShadow: "0 24px 60px rgba(20,60,0,0.25)", fontFamily: UI, transform: `scale(${s})`, opacity: Math.min(1, s * 1.5) }}>
              <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 30, color: [NAVY, BLUE, GLIP][i] }}>{t}</div>
              <div style={{ marginTop: 10, fontWeight: 700, fontSize: 25, lineHeight: 1.35, color: "#3b4250" }}>{d}</div>
            </div>
          );
        })}
      </div>
      {/* stepper: find · understand · remember */}
      {steps > 0 ? <Stepper at={380} /> : null}
    </AbsoluteFill>
  );
};
const Stepper: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const sp = useSp();
  const L = [["Найди", "поиск по 1 608 законам"], ["Пойми", "объяснение ИИ"], ["Запомни", "заметки и тест"]];
  const X = [560, 960, 1360];
  const travel = interpolate(f, [at + 30, at + 30 + B, at + 30 + B * 2, at + 30 + B * 3, at + 30 + B * 4], [0, 0, 1, 1, 2], { ...cl, easing: IOE });
  const dotX = X[0] + (X[2] - X[0]) * (travel / 2);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 120, top: 120 }}>
        <Cap text="Найди. Пойми. Запомни." at={at + 4} size={64} color="#fff" accent="Запомни." accentColor={NAVY} />
      </div>
      <div style={{ position: "absolute", left: X[0], top: 560 - 3, width: (X[2] - X[0]) * lin(f, at + 6, at + 36), height: 6, borderRadius: 3, background: "rgba(255,255,255,0.6)" }} />
      {L.map(([t, d], i) => {
        const s = sp(at + 6 + i * 8, 12, 200);
        const lit = travel >= i - 0.05;
        return (
          <div key={t} style={{ position: "absolute", left: X[i] - 60, top: 560 - 60, width: 120, height: 120, borderRadius: 60, background: lit ? NAVY : "#fff", color: lit ? "#fff" : NAVY, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HEAD, fontWeight: 900, fontSize: 52, transform: `scale(${s})` }}>
            {i + 1}
            <div style={{ position: "absolute", top: 150, width: 420, left: -150, textAlign: "center", fontFamily: HEAD }}>
              <div style={{ fontWeight: 900, fontSize: 40, color: "#fff" }}>{t}</div>
              <div style={{ fontWeight: 600, fontSize: 26, color: "rgba(255,255,255,0.85)", marginTop: 6 }}>{d}</div>
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: dotX - 18, top: 560 - 108, width: 36, height: 36, borderRadius: 18, background: YEL, boxShadow: "0 8px 20px rgba(0,0,0,0.2)", opacity: lin(f, at + 26, at + 34) }} />
    </AbsoluteFill>
  );
};

// =============== S9 end card ===============
const S9: React.FC = () => {
  const f = useCurrentFrame();
  const sp = useSp();
  const draw = lin(f, 0, 50, 0, 1, OUTE);
  const word = sp(30, 14, 150);
  return (
    <AbsoluteFill style={{ background: NAVY, alignItems: "center", justifyContent: "center" }}>
      <svg style={{ position: "absolute", left: 960 - 470, top: 260 }} width="940" height="330" viewBox="0 0 940 330">
        <path d="M150 6 H6 V324 H150" fill="none" stroke="#fff" strokeWidth="6" strokeDasharray="620" strokeDashoffset={620 * (1 - draw)} />
        <path d="M790 6 H934 V324 H790" fill="none" stroke="#fff" strokeWidth="6" strokeDasharray="620" strokeDashoffset={620 * (1 - draw)} />
      </svg>
      <div style={{ position: "absolute", top: 330, width: "100%", textAlign: "center", fontFamily: UI, fontWeight: 900, fontSize: 170, color: "#fff", opacity: word, transform: `scale(${0.9 + 0.1 * word})` }}>ve<span style={{ color: BLUE }}>o</span>sk<span style={{ color: GREEN }}>i</span>ll</div>
      <div style={{ position: "absolute", top: 640, width: "100%" }}><div style={{ display: "flex", justifyContent: "center" }}><Cap text="Самый живой способ учиться" at={60} size={46} color="#fff" weight={700} /></div></div>
      <div style={{ position: "absolute", top: 740, width: "100%", textAlign: "center", fontFamily: HEAD, fontWeight: 700, fontSize: 34, color: BLUE, opacity: lin(f, 90, 110) }}>veoskill.uz</div>
      <div style={{ position: "absolute", top: 812, width: "100%", display: "flex", justifyContent: "center", gap: 14 }}>
        {[BLUE, GREEN, YEL].map((c, i) => <div key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c, transform: `scale(${sp(110 + i * 6, 10, 220)})` }} />)}
      </div>
    </AbsoluteFill>
  );
};

const SCENES: { C: React.FC; d: number }[] = [
  { C: S1, d: 240 },
  { C: S2, d: 120 },
  { C: S3, d: 240 },
  { C: S4b, d: 420 },
  { C: S5b, d: 600 },
  { C: S6b, d: 720 },
  { C: S7b, d: 360 },
  { C: S8b, d: 900 },
  { C: S9, d: 300 },
];
const starts: number[] = [];
let acc = 0;
SCENES.forEach((s) => { starts.push(acc); acc += s.d; });
export const V9_FRAMES = acc;
export const V9_STARTS = starts;
export const V9: React.FC = () => {
  useFonts7();
  return (
    <AbsoluteFill style={{ background: BG }}>
      {SCENES.map((s, i) => (
        <Sequence key={i} from={starts[i]} durationInFrames={s.d}>
          <s.C />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
export { textWidth as _tw, S4, S5, S6, S7, S8 };
