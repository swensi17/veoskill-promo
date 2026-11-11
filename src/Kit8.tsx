import React from "react";
import { AbsoluteFill, Easing, Freeze, Img, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Line, HEAD, UI, BLUE, LIP, GREEN, GLIP, INK, CHAR, SWAN, RED, clamp, SOFT, OUT, lin, fit, textWidth } from "./Kit7";
import { LessonLoad } from "./V4";
import { ArticlePage } from "./Laws7";
import { DENSE } from "./V7";

// v8 kit — reference-led language: one shared bright background, UI as big tilted panels that bleed off frame,
// explanation text on the left, typed headlines with a glowing accent word, pill highlights, 3D card stacks.

/** One background for the whole film: scenes are transparent, so transitions never mix two backgrounds. */
export const GradBg: React.FC = () => {
  const f = useCurrentFrame();
  const a = f / 240;
  return (
    <AbsoluteFill style={{ background: "#f3f8ff", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: -420 + Math.sin(a) * 120, top: -520 + Math.cos(a * 0.8) * 80, width: 1500, height: 1500, borderRadius: "50%", background: "radial-gradient(circle, rgba(120,205,255,0.55), rgba(120,205,255,0) 62%)" }} />
      <div style={{ position: "absolute", right: -520 + Math.cos(a * 0.9) * 140, bottom: -640 + Math.sin(a * 0.7) * 90, width: 1600, height: 1600, borderRadius: "50%", background: "radial-gradient(circle, rgba(150,225,110,0.42), rgba(150,225,110,0) 62%)" }} />
      <div style={{ position: "absolute", left: 620 + Math.sin(a * 1.3) * 160, top: 120 + Math.cos(a) * 60, width: 900, height: 900, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.9), rgba(255,255,255,0) 65%)" }} />
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(20,60,110,0.05) 1.6px, transparent 1.7px)", backgroundSize: "40px 40px", transform: `translateY(${-(f * 0.2) % 40}px)` }} />
    </AbsoluteFill>
  );
};

/** A full 1920×1080 UI placed as a big tilted panel with a soft brand glow under it. */
export const Panel: React.FC<{ x: number; y: number; s: number; ry?: number; rx?: number; op?: number; children: React.ReactNode }> = ({ x, y, s, ry = -10, rx = 4, op = 1, children }) => (
  <AbsoluteFill style={{ perspective: 2600, opacity: op }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transformOrigin: "0 0", transform: `translate(${x}px, ${y}px) rotateY(${ry}deg) rotateX(${rx}deg) scale(${s})` }}>
      <div style={{ position: "absolute", left: 60, top: 80, right: -40, bottom: -60, borderRadius: 60, background: `linear-gradient(120deg, ${BLUE}, ${GREEN})`, filter: "blur(70px)", opacity: 0.45 }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: 34, overflow: "hidden", background: "#fff", boxShadow: "0 50px 120px rgba(10,40,90,0.22), 0 0 0 2px rgba(255,255,255,0.8)" }}>{children}</div>
    </div>
  </AbsoluteFill>
);

/** Headline typed with a caret; the accent word glows in the brand gradient (reference style, used sparingly). */
export const TypeHead: React.FC<{ text: string; at: number; out?: number; size?: number; accent?: string; speed?: number; maxW?: number; align?: "center" | "flex-start"; weight?: number }> = ({ text, at, out, size = 88, accent, speed = 2.2, maxW = 1600, align = "center", weight = 700 }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const fs = fit(text, size, maxW, weight);
  const n = Math.min(text.length, Math.floor((f - at) / speed) + 1);
  const done = n >= text.length;
  const doneAt = at + text.length * speed;
  const caret = !done || (f - doneAt < 40 && Math.floor((f - doneAt) / 15) % 2 === 0);
  const tout = out !== undefined ? lin(f, out, out + 20, 0, 1, Easing.bezier(0.55, 0, 0.75, 0.3)) : 0;
  const ai = accent ? text.indexOf(accent) : -1;
  const shown = text.slice(0, n);
  const pre = ai >= 0 ? shown.slice(0, ai) : shown;
  const acc = ai >= 0 ? shown.slice(ai, ai + accent!.length) : "";
  const post = ai >= 0 ? shown.slice(ai + accent!.length) : "";
  const glow = ai >= 0 ? lin(f, at + (ai + accent!.length) * speed, at + (ai + accent!.length) * speed + 30, 0, 1, SOFT) : 0;
  return (
    <div style={{ display: "flex", justifyContent: align, overflow: "hidden", padding: `${fs * 0.15}px 0 ${fs * 0.25}px` }}>
      <div style={{ position: "relative", fontFamily: HEAD, fontWeight: weight, fontSize: fs, lineHeight: 1.1, letterSpacing: "-0.015em", color: INK, whiteSpace: "pre", transform: `translateY(${tout * 110}%)`, opacity: 1 - tout }}>
        {/* invisible full text keeps the line centred while it types */}
        <span style={{ visibility: "hidden" }}>{text}</span>
        <span style={{ position: "absolute", left: 0, top: 0 }}>
          {pre}
          {acc ? <span style={{ backgroundImage: `linear-gradient(90deg, ${BLUE}, #3d7bff ${50 - glow * 10}%, ${GREEN})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: `drop-shadow(0 0 ${glow * 22}px rgba(28,176,246,${0.55 * glow}))` }}>{acc}</span> : null}
          {post}
          <span style={{ display: "inline-block", width: Math.max(4, fs * 0.05), height: fs * 0.95, marginLeft: 4, verticalAlign: "-0.12em", background: BLUE, opacity: caret ? 1 : 0 }} />
        </span>
      </div>
    </div>
  );
};

/** Small floating rounded squares around a highlight (reference accent). */
const Floaters: React.FC<{ at: number; cx: number; cy: number; w: number; h: number }> = ({ at, cx, cy, w, h }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pts = [[-0.42, -1.05, 34], [0.08, -1.1, 28], [0.56, -0.2, 22], [-0.5, 1.0, 26], [0.3, 1.05, 18], [-0.62, -0.1, 16]];
  return (
    <>
      {pts.map(([px, py, sz], k) => {
        const s = spring({ frame: f - at - k * 5, fps, config: { damping: 12, stiffness: 160 } });
        const drift = Math.sin((f + k * 40) / 50) * 8;
        return <div key={k} style={{ position: "absolute", left: cx + px * w - sz / 2, top: cy + py * h * 0.6 - sz / 2 + drift, width: sz, height: sz, borderRadius: sz * 0.28, background: k % 3 === 2 ? GREEN : BLUE, opacity: 0.85 * s, transform: `scale(${s}) rotate(${(k - 2) * 12 + drift}deg)`, boxShadow: "0 8px 20px rgba(28,120,246,0.3)" }} />;
      })}
    </>
  );
};

/** "Text [pill]" headline: the words slide in, the pill grows from the left and its words follow. */
export const PillHead: React.FC<{ pre: string; pill: string; at: number; out?: number; size?: number; cy?: number; floaters?: boolean }> = ({ pre, pill, at, out, size = 96, cy = 540, floaters = true }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const preW = textWidth(pre, `800 ${size}px Onest`) * 1.04;
  const pillW = textWidth(pill, `600 ${size}px Onest`) + size * 0.7;
  const gap = size * 0.42;
  const total = preW + gap + pillW;
  const x0 = 960 - total / 2;
  const t1 = lin(f, at, at + 27, 0, 1, SOFT);
  const grow = lin(f, at + 14, at + 44, 0, 1, Easing.bezier(0.2, 0.9, 0.2, 1));
  const t2 = lin(f, at + 26, at + 52, 0, 1, SOFT);
  const tout = out !== undefined ? lin(f, out, out + 20, 0, 1, Easing.bezier(0.55, 0, 0.75, 0.3)) : 0;
  const h = size * 1.32;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - tout, transform: `translateY(${tout * 40}px)` }}>
      <div style={{ position: "absolute", left: x0, top: cy - h / 2, height: h, display: "flex", alignItems: "center", overflow: "hidden", paddingRight: 8 }}>
        <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: size, color: INK, letterSpacing: "-0.02em", whiteSpace: "nowrap", transform: `translateY(${-(1 - t1) * 110}%)` }}>{pre}</div>
      </div>
      <div style={{ position: "absolute", left: x0 + preW + gap, top: cy - h / 2, width: pillW, height: h, borderRadius: size * 0.26, background: `linear-gradient(100deg, ${BLUE}, #3d7bff)`, boxShadow: `0 18px 50px rgba(28,120,246,${0.4 * grow})`, clipPath: `inset(0 ${(1 - grow) * 100}% 0 0 round ${size * 0.26}px)`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <div style={{ fontFamily: HEAD, fontWeight: 600, fontSize: size, color: "#fff", letterSpacing: "-0.02em", whiteSpace: "nowrap", transform: `translateX(${-(1 - t2) * 40}px)`, opacity: t2 }}>{pill}</div>
      </div>
      {floaters ? <Floaters at={at + 30} cx={x0 + preW + gap + pillW / 2} cy={cy} w={pillW} h={h} /> : null}
    </div>
  );
};

/** Small caps label above a headline. */
const Kick: React.FC<{ text: string; at: number; out?: number }> = ({ text, at, out }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const t = lin(f, at, at + 22, 0, 1, SOFT);
  const tout = out !== undefined ? lin(f, out, out + 16, 0, 1) : 0;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "8px 18px", borderRadius: 14, background: "rgba(28,176,246,0.12)", fontFamily: HEAD, fontWeight: 700, fontSize: 24, letterSpacing: "0.12em", color: LIP, opacity: t * (1 - tout), transform: `translateY(${(1 - t) * -14 + tout * 14}px)` }}>
      <div style={{ width: 10, height: 10, borderRadius: 3, background: BLUE }} />
      {text}
    </div>
  );
};

export type SideCopy = { k?: string; lines: string[]; accent?: string; sub?: string };
/** Explanation column on the left: label, 1–3 headline lines, a quiet sub-line. */
export const SideText: React.FC<SideCopy & { at: number; out?: number; x?: number; w?: number }> = ({ k, lines, accent, sub, at, out, x = 100, w = 560 }) => {
  const LH = 78;
  const h = (k ? 70 : 0) + lines.length * LH + (sub ? 70 : 0);
  const y0 = 540 - h / 2;
  return (
    <div style={{ position: "absolute", left: x, top: y0, width: w }}>
      {k ? <div style={{ height: 70 }}><Kick text={k} at={at} out={out} /></div> : null}
      {lines.map((l, i) => (
        <div key={i} style={{ height: LH, marginLeft: -2 }}>
          <Line text={l} at={at + 6 + i * 7} out={out !== undefined ? out + i * 3 : undefined} size={60} weight={800} maxW={w * 0.9} accent={accent && l.includes(accent) ? accent : undefined} style={{ justifyContent: "flex-start", padding: "4px 0 12px" }} />
        </div>
      ))}
      {sub ? <div style={{ marginTop: 14 }}><Line text={sub} at={at + 14 + lines.length * 7} out={out} size={30} weight={500} color="#5d6c7c" maxW={w} style={{ justifyContent: "flex-start" }} /></div> : null}
    </div>
  );
};

export type Step = { C: React.FC; d: number; copy?: SideCopy; then?: { at: number; copy: SideCopy } };
export const actLength = (steps: Step[], O = 20) => steps.reduce((a, s, i) => a + s.d - (i < steps.length - 1 ? O : 0), 0);

/** A run of demos inside one persistent tilted panel; the explanation on the left changes per step. */
export const SplitAct: React.FC<{ steps: Step[]; pose?: { x: number; y: number; s: number; ry?: number } }> = ({ steps, pose = { x: 690, y: 160, s: 0.74, ry: -9 } }) => {
  const f = useCurrentFrame();
  const O = 20;
  const starts: number[] = [];
  let acc = 0;
  steps.forEach((s, i) => { starts.push(acc); acc += s.d - (i < steps.length - 1 ? O : 0); });
  const enter = lin(f, 0, 46, 0, 1, Easing.bezier(0.16, 1, 0.3, 1));
  const ry = (pose.ry ?? -9) - (1 - enter) * 16 + Math.sin(f / 210) * 1.4;
  const x = pose.x + (1 - enter) * 420;
  const y = pose.y + Math.sin(f / 160) * 6;
  // text blocks: a step without copy keeps the previous text
  const blocks: { at: number; copy: SideCopy }[] = [];
  steps.forEach((s, i) => {
    if (s.copy) blocks.push({ at: starts[i] + (i === 0 ? 16 : 0), copy: s.copy });
    if (s.then) blocks.push({ at: starts[i] + s.then.at, copy: s.then.copy });
  });
  return (
    <AbsoluteFill>
      <Panel x={x} y={y} s={pose.s} ry={ry} op={Math.min(1, enter * 1.6)}>
        {steps.map((s, i) => {
          const C = s.C;
          return (
            <Sequence key={i} from={starts[i]} durationInFrames={s.d} layout="none">
              <StepFade d={s.d} first={i === 0} last={i === steps.length - 1}><C /></StepFade>
            </Sequence>
          );
        })}
      </Panel>
      {blocks.map((b, i) => <SideText key={i} {...b.copy} at={b.at} out={i < blocks.length - 1 ? blocks[i + 1].at - 22 : undefined} />)}
    </AbsoluteFill>
  );
};
const StepFade: React.FC<{ d: number; first: boolean; last: boolean; children: React.ReactNode }> = ({ d, first, last, children }) => {
  const f = useCurrentFrame();
  const i = first ? 1 : lin(f, 8, 22, 0, 1, SOFT);
  const o = last ? 0 : lin(f, d - 20, d - 12, 0, 1);
  return <AbsoluteFill style={{ opacity: i * (1 - o), transform: `translateX(${(1 - i) * 50 - o * 50}px)` }}>{children}</AbsoluteFill>;
};

// ---------------- loader beat, sped up after the match ----------------
export const LessonLoadFast: React.FC = () => {
  const f = useCurrentFrame();
  const m = f < 46 ? f : Math.min(213, Math.round(46 + (f - 46) * 1.6));
  return <Freeze frame={m}><LessonLoad /></Freeze>;
};

// ---------------- game types as a 3D stack of cards ----------------
const GAMES: [string, string, string, string][] = [
  ["Найди миф", "Отличи правду от заблуждения", BLUE, "M12 3a7 7 0 0 0-4 12.7V18h8v-2.3A7 7 0 0 0 12 3zM9 21h6"],
  ["Верно или неверно", "Решай за секунду", GREEN, "M5 12.5l4.5 4.5L19 7.5"],
  ["Собери фразу", "Запомни точную формулировку", "#ff9600", "M4 6h7v5H4zM13 6h7v5h-7zM4 13h10v5H4z"],
  ["Истории", "Разбери случай из жизни", "#ce82ff", "M4 5h16v11H8l-4 4z"],
  ["Работа над ошибками", "Повтори то, что не получилось", RED, "M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4"],
];
export const GameStack: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tilt = lin(f, 0, 300, 0, 1, Easing.linear);
  const pick = lin(f, 210, 236, 0, 1, SOFT);
  return (
    <AbsoluteFill>
      <SideText k="ИГРЫ" lines={["Играй —", "и запоминай"]} accent="запоминай" sub="5 видов игр в каждом уроке" at={10} />
      <AbsoluteFill style={{ perspective: 1800 }}>
        <div style={{ position: "absolute", left: 900, top: 200, width: 820, transformStyle: "preserve-3d", transform: `rotateY(${-16 + tilt * 6}deg) rotateX(${10 - tilt * 4}deg)` }}>
          {GAMES.map(([t, s, c, icon], i) => {
            const sp = spring({ frame: f - 24 - i * 18, fps, config: { damping: 14, stiffness: 120 } });
            const hot = i === 0 ? pick : 0;
            return (
              <div key={t} style={{ position: "absolute", left: 0, top: i * 138, width: 820, height: 118, borderRadius: 26, background: "#fff", border: `3px solid ${hot > 0.5 ? c : "rgba(255,255,255,0.9)"}`, boxShadow: `0 ${18 + hot * 12}px ${40 + hot * 30}px rgba(10,40,90,${0.14 + hot * 0.1})`, display: "flex", alignItems: "center", gap: 26, padding: "0 30px", boxSizing: "border-box", fontFamily: UI, transformOrigin: "50% 0%", transform: `translateY(${(1 - sp) * -220}px) rotateX(${(1 - sp) * -88}deg) translateZ(${hot * 40}px) scale(${1 + hot * 0.03})`, opacity: Math.min(1, sp * 2) * (1 - (i > 0 ? pick * 0.35 : 0)) }}>
                <div style={{ width: 70, height: 70, borderRadius: 20, background: c, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 0 rgba(0,0,0,0.12)` }}>
                  <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d={icon} /></svg>
                </div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 36, color: CHAR }}>{t}</div>
                  <div style={{ fontWeight: 700, fontSize: 25, color: "#8a98a6", marginTop: 2 }}>{s}</div>
                </div>
                <svg style={{ marginLeft: "auto" }} width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#b9c3cd" strokeWidth="2.6" strokeLinecap="round"><path d="M9 6l6 6-6 6" /></svg>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------- the ordinary law database vs ours ----------------
const Chip: React.FC<{ text: string; at: number; good: boolean }> = ({ text, at, good }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping: 14, stiffness: 170 } });
  if (f < at) return null;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "12px 20px", borderRadius: 16, background: good ? "#e7ffd6" : "#fff1f1", border: `2px solid ${good ? "#b5ec8c" : "#ffc9c9"}`, fontFamily: UI, fontWeight: 800, fontSize: 28, color: good ? GLIP : "#d63c3c", transform: `scale(${0.8 + 0.2 * s}) translateY(${(1 - s) * 16}px)`, opacity: s, whiteSpace: "nowrap" }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d={good ? "M5 12.5l4.5 4.5L19 7.5" : "M6 6l12 12M18 6L6 18"} /></svg>
      {text}
    </div>
  );
};
export const CompareLaws: React.FC = () => {
  const f = useCurrentFrame();
  const L = lin(f, 20, 64, 0, 1, Easing.bezier(0.16, 1, 0.3, 1));
  const dim = lin(f, 210, 250, 0, 1);
  const R = lin(f, 236, 286, 0, 1, Easing.bezier(0.16, 1, 0.3, 1));
  const scroll = lin(f, 60, 220, 0, 160, Easing.linear);
  const W = 800, H = 540, TOP = 250;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 70, width: "100%" }}>
        <Line text="Читать закон обычно — мучение." at={8} out={214} size={64} weight={800} accent="мучение" accentColor={RED} />
      </div>
      <div style={{ position: "absolute", top: 70, width: "100%" }}>
        <Line text="У нас — удобно." at={232} size={64} weight={800} accent="удобно" />
      </div>
      <AbsoluteFill style={{ perspective: 2200 }}>
        {/* left: ordinary base */}
        <div style={{ position: "absolute", left: 130, top: TOP, width: W, transformOrigin: "100% 50%", transform: `translateX(${(1 - L) * -200}px) rotateY(${12 + (1 - L) * 20}deg) scale(${1 - dim * 0.05})`, opacity: L * (1 - dim * 0.3), filter: `saturate(${1 - dim * 0.6})` }}>
          <div style={{ marginBottom: 18, display: "inline-block", padding: "8px 18px", borderRadius: 12, background: "#e9edf1", fontFamily: UI, fontWeight: 800, fontSize: 24, color: "#6b7785" }}>Обычная база законов</div>
          <div style={{ height: H, borderRadius: 18, background: "#fff", boxShadow: "0 30px 70px rgba(10,40,90,0.16)", overflow: "hidden", position: "relative" }}>
            <div style={{ height: 50, background: "#f1f1f1", borderBottom: "1px solid #ddd", display: "flex", alignItems: "center", padding: "0 18px", gap: 10 }}>
              <div style={{ width: 220, height: 26, borderRadius: 4, border: "1px solid #ccc", background: "#fff", fontSize: 14, color: "#999", fontFamily: "Arial, sans-serif", lineHeight: "26px", paddingLeft: 8 }}>Поиск по странице…</div>
            </div>
            <div style={{ padding: "20px 26px", fontFamily: "'Times New Roman', Georgia, serif", fontSize: 19, lineHeight: 1.35, color: "#444", textAlign: "justify", transform: `translateY(${-scroll}px)` }}>
              <b>Статья 1.</b> Узбекистан — суверенное, демократическое, правовое, социальное и светское государство с республиканской формой правления. {DENSE.repeat(4)}
            </div>
            <div style={{ position: "absolute", right: 6, top: 60 + scroll * 0.4, width: 8, height: 90, borderRadius: 4, background: "#c8c8c8" }} />
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 22, flexWrap: "wrap" }}>
            <Chip text="Сплошной текст" at={80} good={false} />
            <Chip text="Ничего не объясняет" at={112} good={false} />
            <Chip text="Нужен интернет" at={144} good={false} />
          </div>
        </div>
        {/* right: veoskill */}
        <div style={{ position: "absolute", left: 990, top: TOP, width: W, transformOrigin: "0% 50%", transform: `translateX(${(1 - R) * 240}px) rotateY(${-12 - (1 - R) * 20}deg)`, opacity: R }}>
          <div style={{ marginBottom: 18, display: "inline-block", padding: "8px 18px", borderRadius: 12, background: BLUE, fontFamily: UI, fontWeight: 900, fontSize: 24, color: "#fff", boxShadow: `0 4px 0 ${LIP}` }}>veoskill</div>
          <div style={{ position: "relative", height: H }}>
            <div style={{ position: "absolute", inset: "30px -20px -30px 30px", borderRadius: 40, background: `linear-gradient(120deg, ${BLUE}, ${GREEN})`, filter: "blur(50px)", opacity: 0.45 * R }} />
            <div style={{ position: "absolute", inset: 0, borderRadius: 18, background: "#fff", boxShadow: "0 30px 70px rgba(10,40,90,0.18)", overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transformOrigin: "0 0", transform: "translate(-200px, -60px) scale(0.62)" }}>
                <ArticlePage botState="on" heart={1} sel={1} hl="rgba(255,212,59,0.8)" pin={1} />
                <div style={{ position: "absolute", left: 360, top: 620, width: 1200, borderRadius: 26, border: "3px solid #9fdcf9", background: "#f5fbff", padding: "26px 32px", fontFamily: UI }}>
                  <div style={{ fontWeight: 900, fontSize: 32, color: CHAR }}>Простыми словами</div>
                  <div style={{ marginTop: 10, fontWeight: 700, fontSize: 30, lineHeight: 1.4, color: CHAR }}>Узбекистан — независимое государство, где всё решает закон.</div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 22, flexWrap: "wrap" }}>
            <Chip text="Объясняет простыми словами" at={300} good />
            <Chip text="Заметки и тесты" at={330} good />
            <Chip text="Офлайн и 3 языка" at={360} good />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------- chapter card ----------------
export const Chap8: React.FC<{ k: string; pre: string; pill: string; sub: string }> = ({ k, pre, pill, sub }) => (
  <AbsoluteFill>
    <div style={{ position: "absolute", top: 360, width: "100%", display: "flex", justifyContent: "center" }}><Kick text={k} at={4} /></div>
    <PillHead pre={pre} pill={pill} at={12} size={104} cy={520} />
    <div style={{ position: "absolute", top: 640, width: "100%" }}><Line text={sub} at={46} size={40} weight={600} color="#5d6c7c" /></div>
  </AbsoluteFill>
);

// ---------------- opening: real screens rush toward the camera ----------------
const FLY = ["cabinet", "m0", "laws", "l-marked", "article", "m-ok", "on-home", "l-note2", "stats", "laws-search", "m3", "c2"];
export const FlyField: React.FC<{ speed?: number; fade?: number }> = ({ speed = 7.5, fade = 1 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ perspective: 1300 }}>
      {FLY.map((n, i) => {
        const r1 = random(`fx${i}`), r2 = random(`fy${i}`);
        const side = i % 2 === 0 ? -1 : 1;
        const x = side * (430 + r1 * 420);
        const y = (r2 - 0.5) * 760;
        const z = -380 - i * 380 + f * speed;
        const vis = interpolate(z, [-4600, -3600, -120, 200], [0, 1, 1, 0], clamp);
        const blur = Math.min(10, Math.abs(z + 1100) / 230);
        const ry = -side * (18 + r1 * 10);
        const rx = (r2 - 0.5) * -14;
        return (
          <div key={n} style={{ position: "absolute", left: 960 - 450 + x, top: 540 - 280 + y, width: 900, height: 560, borderRadius: 26, overflow: "hidden", transform: `translateZ(${z}px) rotateY(${ry}deg) rotateX(${rx}deg)`, opacity: vis * fade, boxShadow: "0 50px 110px rgba(10,40,90,0.25)", filter: `blur(${blur}px) brightness(1.05) saturate(1.15)` }}>
            <Img src={staticFile(`hack/hd/${n}.png`)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top left" }} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------- finale: layered screens, glowing ----------------
export const LayerStack: React.FC<{ rise: number; out: number }> = ({ rise, out }) => {
  const f = useCurrentFrame();
  const shots = ["article", "m-ok", "cabinet"];
  return (
    <AbsoluteFill style={{ perspective: 2200, opacity: 1 - out, filter: out > 0 ? `blur(${out * 12}px)` : undefined }}>
      <div style={{ position: "absolute", left: 820, top: 190, width: 940, height: 600, transformStyle: "preserve-3d", transform: `rotateY(${-22 + Math.sin(f / 120) * 2}deg) rotateX(${12}deg) translateY(${(1 - rise) * 500}px) scale(${1 - out * 0.08})` }}>
        <div style={{ position: "absolute", inset: "60px -30px -50px 40px", borderRadius: 60, background: `linear-gradient(120deg, ${BLUE}, ${GREEN})`, filter: "blur(70px)", opacity: 0.5 }} />
        {shots.map((n, i) => {
          const t = lin(f, 10 + i * 16, 70 + i * 16, 0, 1, Easing.bezier(0.16, 1, 0.3, 1));
          const off = (2 - i) * 70 * t;
          return (
            <div key={n} style={{ position: "absolute", left: -off, top: -off * 0.8, width: 940, height: 600, borderRadius: 26, overflow: "hidden", boxShadow: "0 40px 90px rgba(10,40,90,0.25)", border: "3px solid rgba(255,255,255,0.9)", transform: `translateZ(${i * 60}px)` }}>
              <Img src={staticFile(`hack/hd/${n}.png`)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top left" }} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
export { SWAN as _swan, OUT as _out };
