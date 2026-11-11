import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useCursor, CursorLayer, Confetti } from "./Master";
import { DemoCam, UI, BLUE, LIP, GREEN, GLIP, RED, CHAR, SWAN, clamp, OUT, SOFT, lin, press, textWidth } from "./Kit7";

// Lesson games, rebuilt in the site's lesson style: progress bar + hearts on top, one column, result bar at the bottom.
const Shell: React.FC<{ progress: number; badge: string; title: string; children: React.ReactNode; hearts?: number }> = ({ progress, badge, title, children, hearts = 5 }) => (
  <AbsoluteFill style={{ background: "#fff", fontFamily: UI }}>
    <div style={{ position: "absolute", left: 460, top: 54, width: 1000, display: "flex", alignItems: "center", gap: 26 }}>
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#afafaf" strokeWidth="2.6" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
      <div style={{ flex: 1, height: 22, borderRadius: 11, background: SWAN, overflow: "hidden" }}><div style={{ width: `${progress * 100}%`, height: "100%", borderRadius: 11, background: GREEN, boxShadow: "inset 0 -6px 0 rgba(0,0,0,0.1)" }} /></div>
      <Img src={staticFile("v4/heart-red.webp")} style={{ width: 40, height: 40 }} />
      <span style={{ fontWeight: 900, fontSize: 28, color: RED }}>{hearts}</span>
    </div>
    <div style={{ position: "absolute", left: 460, top: 150, width: 1000 }}>
      <div style={{ display: "inline-block", padding: "6px 14px", borderRadius: 10, background: "#ddf4ff", color: BLUE, fontWeight: 900, fontSize: 24, letterSpacing: "0.08em" }}>{badge}</div>
      <div style={{ marginTop: 14, fontWeight: 900, fontSize: 46, color: CHAR }}>{title}</div>
    </div>
    {children}
  </AbsoluteFill>
);
const ResultBar: React.FC<{ at: number; good: boolean; head: string; text: string }> = ({ at, good, head, text }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping: 20, stiffness: 120 } });
  if (f < at) return null;
  const c = good ? GREEN : RED;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 200, background: good ? "#d7ffb8" : "#ffdfe0", transform: `translateY(${(1 - s) * 210}px)`, display: "flex", alignItems: "center", padding: "0 460px", gap: 26, fontFamily: UI }}>
      <div style={{ width: 84, height: 84, borderRadius: 42, background: c, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d={good ? "M5 12.5l4.5 4.5L19 7.5" : "M6 6l12 12M18 6L6 18"} /></svg>
      </div>
      <div>
        <div style={{ fontWeight: 900, fontSize: 44, color: good ? GLIP : "#ea2b2b" }}>{head}</div>
        <div style={{ marginTop: 6, fontWeight: 700, fontSize: 26, lineHeight: 1.35, color: good ? GLIP : "#ea2b2b", opacity: lin(f, at + 14, at + 30, 0, 1) }}>{text}</div>
      </div>
    </div>
  );
};
const Card: React.FC<{ text: string; state?: "idle" | "hover" | "sel" | "good" | "bad"; pr?: number; style?: React.CSSProperties }> = ({ text, state = "idle", pr = 0, style }) => {
  const c = state === "good" ? GREEN : state === "bad" ? RED : state === "sel" ? BLUE : SWAN;
  const bg = state === "good" ? "#d7ffb8" : state === "bad" ? "#ffdfe0" : state === "sel" ? "#ddf4ff" : "#fff";
  return <div style={{ borderRadius: 22, border: `2px solid ${state === "hover" ? "#cfd5db" : c}`, background: bg, boxShadow: `0 ${6 - pr * 5}px 0 ${state === "idle" || state === "hover" ? SWAN : c}`, transform: `translateY(${pr * 5}px)`, padding: "26px 32px", fontWeight: 700, fontSize: 31, lineHeight: 1.35, color: CHAR, ...style }}>{text}</div>;
};

// ---------------- Myth: full frame ----------------
const MYTH = ["Закон обязателен для всех, даже для чиновников.", "Если не знаешь закон — за нарушение не отвечаешь.", "Законы публикуют, чтобы их мог прочитать каждый."];
export const GameMyth: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const PICK = 110;
  const cur = useCursor([{ at: PICK, x: 1300, y: 486 }], [1500, 1000], [1600, 1000]);
  const stamp = spring({ frame: f - PICK - 8, fps, config: { damping: 14, stiffness: 160 } });
  return (
    <DemoCam from={{ s: 1.22, x: 960, y: 470 }} settle={90} tilt={0}>
      <Shell progress={0.35} badge="НАЙДИ МИФ" title="Найдите заблуждение">
        <div style={{ position: "absolute", left: 460, top: 300, width: 1000 }}>
          {MYTH.map((m, i) => {
            const s = lin(f, 6 + i * 6, 30 + i * 6, 0, 1, SOFT);
            const st = i === 1 ? (f >= PICK + 2 ? "bad" : f > PICK - 16 ? "hover" : "idle") : "idle";
            return (
              <div key={m} style={{ position: "relative", marginBottom: 22, opacity: s, transform: `translateY(${(1 - s) * 30}px)` }}>
                <Card text={m} state={st} pr={i === 1 ? press(f, PICK) : 0} style={i === 1 ? { paddingRight: 220 } : undefined} />
                {i === 1 && f >= PICK + 8 ? (
                  <div style={{ position: "absolute", right: 30, top: "50%", padding: "8px 26px", border: `5px solid ${RED}`, borderRadius: 14, color: RED, fontWeight: 900, fontSize: 40, letterSpacing: "0.1em", transform: `translateY(-50%) rotate(-10deg) scale(${1.25 - 0.25 * stamp})`, opacity: stamp, background: "rgba(255,255,255,0.85)" }}>МИФ</div>
                ) : null}
              </div>
            );
          })}
        </div>
        <ResultBar at={PICK + 26} good head="Круто!" text="Вывод: незнание закона не освобождает от ответственности." />
        <CursorLayer c={cur} />
      </Shell>
    </DemoCam>
  );
};

// ---------------- Swipes ----------------
export const GameSwipe: React.FC = () => {
  const f = useCurrentFrame();
  const G0 = 50, G1 = 92, G2 = 150, G3 = 190;
  const drag = lin(f, G0, G1, 0, 1, Easing.bezier(0.45, 0, 0.3, 1));
  const fly = lin(f, G1, G1 + 24, 0, 1, Easing.bezier(0.5, 0, 0.9, 0.6));
  const dx = drag * 260 + fly * 1600;
  const tint = Math.min(1, drag * 1.4);
  const next = lin(f, G1 + 8, G1 + 30, 0, 1, SOFT);
  const drag2 = lin(f, G2, G3, 0, 1, Easing.bezier(0.45, 0, 0.3, 1));
  const fly2 = lin(f, G3, G3 + 24, 0, 1, Easing.bezier(0.5, 0, 0.9, 0.6));
  const dx2 = drag2 * 260 + fly2 * 1600;
  const tint2 = Math.min(1, drag2 * 1.4);
  return (
    <DemoCam from={{ s: 1.08, x: 960, y: 560 }} settle={60} tilt={0}>
      <Shell progress={0.5} badge="СВАЙПЫ" title="Верно или неверно?">
        <div style={{ position: "absolute", left: 400, top: 490, fontWeight: 900, fontSize: 30, color: RED, opacity: 0.6, transform: "translateX(-100%)", whiteSpace: "nowrap" }}>← Неверно</div>
        <div style={{ position: "absolute", left: 1340, top: 490, fontWeight: 900, fontSize: 30, color: GREEN, opacity: 0.6 + Math.max(tint * (1 - fly), tint2) * 0.4 }}>Верно →</div>
        <div style={{ position: "absolute", left: 960 - 330 + dx2, top: 330 - drag2 * 20, width: 660, height: 360, borderRadius: 30, background: `rgba(${215 + 40 * (1 - tint2)},255,${184 + 71 * (1 - tint2)},1)`, border: `${tint2 > 0.3 ? 3 : 2}px solid ${tint2 > 0.3 ? GREEN : SWAN}`, boxShadow: `0 8px 0 ${SWAN}`, transform: `scale(${0.94 + 0.06 * next}) rotate(${drag2 * 8 + fly2 * 14}deg)`, opacity: next * (1 - fly2 * 0.6), display: "flex", alignItems: "center", justifyContent: "center", padding: 44, boxSizing: "border-box", fontWeight: 800, fontSize: 36, lineHeight: 1.35, color: CHAR, textAlign: "center" }}>Брак регистрируют в органах ЗАГС.</div>
        <div style={{ position: "absolute", left: 960 - 330 + dx, top: 330 - drag * 20, width: 660, height: 360, borderRadius: 30, background: `rgba(${215 + 40 * (1 - tint)},255,${184 + 71 * (1 - tint)},1)`, border: `3px solid ${tint > 0.3 ? GREEN : SWAN}`, boxShadow: `0 ${8 + drag * 20}px ${20 + drag * 40}px rgba(10,40,90,0.18)`, transform: `rotate(${drag * 8 + fly * 14}deg)`, opacity: 1 - fly * 0.6, display: "flex", alignItems: "center", justifyContent: "center", padding: 44, boxSizing: "border-box", fontWeight: 800, fontSize: 36, lineHeight: 1.35, color: CHAR, textAlign: "center" }}>
          Конституция — главный закон страны.
          {tint > 0.3 ? <div style={{ position: "absolute", left: 30, top: 26, padding: "6px 18px", border: `4px solid ${GREEN}`, borderRadius: 12, color: GLIP, fontWeight: 900, fontSize: 28, transform: "rotate(-8deg)", opacity: tint }}>ВЕРНО</div> : null}
        </div>
        {(f >= G0 - 20 && f < G1 + 4) || (f >= G2 - 20 && f < G3 + 4) ? (
          <div style={{ position: "absolute", left: 960 + 60 + (f < G1 + 4 ? drag : drag2) * 260, top: 520 - (f < G1 + 4 ? drag : drag2) * 20, zIndex: 50, opacity: f < G1 + 4 ? lin(f, G0 - 20, G0 - 8, 0, 1) : lin(f, G2 - 20, G2 - 8, 0, 1) }}>
            <svg width="44" height="54" viewBox="0 0 22 27" style={{ filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.3))" }}><path d="M2 2 L2 21 L7 16.5 L10.5 24.5 L14 23 L10.6 15.2 L17 15 Z" fill="#111" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" /></svg>
          </div>
        ) : null}
      </Shell>
    </DemoCam>
  );
};

// ---------------- Build the phrase ----------------
const WORDS = ["Права", "человека", "защищает", "государство"];
const SHUF = [2, 0, 3, 1]; // order in the bank (indexes into WORDS)
const chipW = (w: string) => textWidth(w, "800 30px NunitoC") + 56;
export const GameScramble: React.FC = () => {
  const f = useCurrentFrame();
  const clickAt = (k: number) => 40 + k * 26;
  const done = clickAt(3) + 20;
  // bank: words in shuffled order, laid out left→right with a gap; answer row: in sentence order
  const bankX: number[] = [];
  let bx = 460;
  SHUF.forEach((k) => { bankX[k] = bx; bx += chipW(WORDS[k]) + 20; });
  const slotX: number[] = [];
  let sx = 470;
  WORDS.forEach((w, k) => { slotX[k] = sx; sx += chipW(w) + 14; });
  const clicks = WORDS.map((w, k) => ({ at: clickAt(k), x: bankX[k] + chipW(w) / 2, y: 730 }));
  const cur = useCursor(clicks, [1400, 1000], [1500, 1000]);
  return (
    <DemoCam from={{ s: 1.08, x: 960, y: 560 }} settle={60} tilt={0}>
      <Shell progress={0.65} badge="СОБЕРИ ФРАЗУ" title="Соберите ответ из слов">
        <div style={{ position: "absolute", left: 460, top: 330, width: 1000, height: 120, borderBottom: `3px solid ${SWAN}` }} />
        {WORDS.map((w, k) => {
          const t = lin(f, clickAt(k) + 2, clickAt(k) + 22, 0, 1, Easing.bezier(0.3, 0, 0.2, 1));
          const x = bankX[k] + (slotX[k] - bankX[k]) * t;
          const y = 690 + (360 - 690) * t - Math.sin(t * Math.PI) * 60;
          const ok = f >= done;
          return (
            <React.Fragment key={w}>
              <div style={{ position: "absolute", left: bankX[k], top: 690, width: chipW(w), height: 72, borderRadius: 18, background: "#eef1f4" }} />
              <div style={{ position: "absolute", left: x, top: y, width: chipW(w), height: 72, boxSizing: "border-box", borderRadius: 18, background: ok ? "#d7ffb8" : "#fff", border: `2px solid ${ok ? GREEN : SWAN}`, boxShadow: `0 5px 0 ${ok ? GLIP : SWAN}`, fontWeight: 800, fontSize: 30, color: CHAR, display: "flex", alignItems: "center", justifyContent: "center", whiteSpace: "nowrap", zIndex: t > 0 && t < 1 ? 5 : 1 }}>{w}</div>
            </React.Fragment>
          );
        })}
        <ResultBar at={done + 6} good head="Верно!" text="Права человека защищает государство." />
        <CursorLayer c={cur} />
      </Shell>
    </DemoCam>
  );
};

// ---------------- Stories ----------------
export const GameStory: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const PICK = 130;
  const cur = useCursor([{ at: PICK, x: 1300, y: 760 }], [1500, 1000], [1600, 1000]);
  const b1 = spring({ frame: f - 10, fps, config: { damping: 18, stiffness: 140 } });
  const b2 = spring({ frame: f - 46, fps, config: { damping: 18, stiffness: 140 } });
  const opts = lin(f, 70, 92, 0, 1, SOFT);
  return (
    <DemoCam from={{ s: 1.1, x: 900, y: 460 }} settle={70} tilt={0}>
      <Shell progress={0.8} badge="ИСТОРИИ" title="Помогите Шахзоду">
        <div style={{ position: "absolute", left: 460, top: 300, display: "flex", gap: 20, alignItems: "flex-start", opacity: b1, transform: `translateY(${(1 - b1) * 20}px)` }}>
          <Img src={staticFile("av/p1.svg")} style={{ width: 76, height: 76, borderRadius: 38, flexShrink: 0 }} />
          <div style={{ maxWidth: 820, padding: "22px 28px", borderRadius: "8px 28px 28px 28px", background: "#f2f5f8", fontWeight: 700, fontSize: 30, lineHeight: 1.4, color: CHAR }}>Купил телефон, а через неделю он сломался. Продавец говорит: «Сам виноват».</div>
        </div>
        <div style={{ position: "absolute", left: 556, top: 470, padding: "18px 26px", borderRadius: "8px 28px 28px 28px", background: "#f2f5f8", fontWeight: 700, fontSize: 30, color: CHAR, opacity: b2, transform: `translateY(${(1 - b2) * 20}px)` }}>Что мне делать?</div>
        <div style={{ position: "absolute", left: 460, top: 600, width: 1000, opacity: opts, transform: `translateY(${(1 - opts) * 24}px)` }}>
          <Card text="Смириться — гарантии на телефоны нет" state={f > PICK - 30 && f < PICK ? "idle" : "idle"} style={{ marginBottom: 18, padding: "20px 28px" }} />
          <Card text="Потребовать ремонт или возврат по закону" state={f >= PICK + 2 ? "good" : f > PICK - 16 ? "hover" : "idle"} pr={press(f, PICK)} style={{ padding: "20px 28px" }} />
        </div>
        <ResultBar at={PICK + 20} good head="Молодец!" text="Покупатель вправе требовать ремонт, замену или возврат денег." />
        <CursorLayer c={cur} />
      </Shell>
    </DemoCam>
  );
};

// ---------------- Mistakes come back + XP into the league ----------------
export const GameMistakes: React.FC = () => {
  const f = useCurrentFrame();
  const WRONG = 60, S2 = 200, S3 = 300, RIGHT = 360, S4 = 440, CLAIM = 520;
  const curA = useCursor([{ at: WRONG, x: 1300, y: 386 }], [1500, 1000], [1600, 1000]);
  const curB = useCursor([{ at: RIGHT, x: 1300, y: 508 }], [1500, 1000], [1600, 1000]);
  const curC = useCursor([{ at: CLAIM, x: 960, y: 748 }], [1400, 1000], [1120, 860]);
  const sceneIn = (at: number) => lin(f, at + 14, at + 34, 0, 1, SOFT);
  const sceneOut = (at: number) => 1 - lin(f, at, at + 14, 0, 1);
  const vis = [f < S2 + 16, f >= S2 && f < S3 + 16, f >= S3 && f < S4 + 16, f >= S4];
  const op = [sceneOut(S2), sceneIn(S2) * sceneOut(S3), sceneIn(S3) * sceneOut(S4), sceneIn(S4)];
  const xpT = lin(f, CLAIM + 6, CLAIM + 50, 0, 1, Easing.bezier(0.5, 0, 0.3, 1));
  const bar = interpolate(f, [CLAIM + 46, CLAIM + 90], [0.45, 0.7], { ...clamp, easing: OUT });
  const Q = (st: "idle" | "bad" | "good", prAt: number, title: string, badge: string) => (
    <Shell progress={st === "good" ? 0.97 : 0.88} badge={badge} title={title} hearts={st === "idle" && prAt === WRONG ? 5 : 4}>
      <div style={{ position: "absolute", left: 460, top: 300, width: 1000 }}>
        <Card text="Нормы ищут в обычаях соседей" state={st === "bad" ? "bad" : "idle"} pr={st === "bad" ? press(f, prAt) : 0} style={{ marginBottom: 22 }} />
        <Card text="Нормы ищут в законе, который признаёт государство" state={st === "good" ? "good" : "idle"} pr={st === "good" ? press(f, prAt) : 0} />
      </div>
    </Shell>
  );
  return (
    <DemoCam from={{ s: 1.1, x: 960, y: 480 }} settle={60} tilt={0}>
      {vis[0] ? (
        <AbsoluteFill style={{ opacity: op[0] }}>
          {Q(f >= WRONG + 2 ? "bad" : "idle", WRONG, "Где искать правовую норму?", "ВЫБОР ОТВЕТА")}
          <ResultBar at={WRONG + 16} good={false} head="Неверно" text="Правильный ответ: в законе, который признаёт государство." />
          <CursorLayer c={curA} />
        </AbsoluteFill>
      ) : null}
      {vis[1] ? (
        <AbsoluteFill style={{ background: "#fff", opacity: op[1], alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 30, fontFamily: UI }}>
          <Img src={staticFile("v4/owl-read.png")} style={{ width: 220, transform: `translateY(${(1 - sceneIn(S2)) * 30}px)` }} />
          <div style={{ fontWeight: 900, fontSize: 48, color: CHAR, textAlign: "center", maxWidth: 1100, lineHeight: 1.3 }}>Не расстраивайтесь из-за ошибок: мы на них учимся!</div>
          <div style={{ padding: "16px 40px", borderRadius: 20, background: "#ffe9c2", color: "#c76d00", fontWeight: 900, fontSize: 32, opacity: lin(f, S2 + 40, S2 + 60, 0, 1) }}>Исправляем ошибки</div>
        </AbsoluteFill>
      ) : null}
      {vis[2] ? (
        <AbsoluteFill style={{ opacity: op[2] }}>
          {Q(f >= RIGHT + 2 ? "good" : "idle", RIGHT, "Где искать правовую норму?", "ИСПРАВЛЯЕМ ОШИБКИ")}
          <ResultBar at={RIGHT + 14} good head="Ошибка исправлена" text="Вы исправили 1 ошибку. Вперёд!" />
          <CursorLayer c={curB} />
        </AbsoluteFill>
      ) : null}
      {vis[3] ? (
        <AbsoluteFill style={{ background: "#fff", opacity: op[3], fontFamily: UI }}>
          <div style={{ position: "absolute", top: 170, width: "100%", textAlign: "center", fontWeight: 900, fontSize: 64, color: CHAR }}>Урок пройден!</div>
          <div style={{ position: "absolute", left: 960 - 420, top: 300, width: 840, display: "flex", gap: 24 }}>
            {[["ВСЕГО XP", "15", "#ffc800"], ["ТОЧНОСТЬ", "80%", GREEN], ["ВРЕМЯ", "2:14", BLUE]].map(([k, v, c]) => (
              <div key={k} style={{ flex: 1, borderRadius: 22, border: `3px solid ${c}`, overflow: "hidden", textAlign: "center" }}>
                <div style={{ background: c, color: c === "#ffc800" ? "#6b4e00" : "#fff", fontWeight: 900, fontSize: 23, padding: "8px 0", letterSpacing: "0.08em" }}>{k}</div>
                <div style={{ fontWeight: 900, fontSize: 48, color: CHAR, padding: "18px 0" }}>{v}</div>
              </div>
            ))}
          </div>
          {/* league progress bar the XP flies into */}
          <div style={{ position: "absolute", left: 960 - 420, top: 540, width: 840, fontWeight: 800, fontSize: 26, color: "#6b7785" }}>
            {f < CLAIM + 60 ? "Ещё 40 XP до Серебряной лиги" : "Ещё 25 XP до Серебряной лиги"}
            <div style={{ marginTop: 12, height: 26, borderRadius: 13, background: SWAN, overflow: "hidden" }}><div style={{ width: `${bar * 100}%`, height: "100%", borderRadius: 13, background: "#ffc800", boxShadow: "inset 0 -6px 0 rgba(0,0,0,0.1)" }} /></div>
          </div>
          <div style={{ position: "absolute", left: 960 - 420, top: 720, width: 840, height: 84, borderRadius: 20, background: f > CLAIM + 12 ? "#d7ffb8" : GREEN, color: f > CLAIM + 12 ? GLIP : "#fff", boxShadow: `0 ${6 - press(f, CLAIM) * 5}px 0 ${f > CLAIM + 12 ? "#b5ec8c" : GLIP}`, transform: `translateY(${press(f, CLAIM) * 5}px)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 30, letterSpacing: "0.04em", zIndex: 80 }}>{f > CLAIM + 12 ? "XP ЗАЧИСЛЕНЫ" : "ЗАБРАТЬ XP"}</div>
          {xpT > 0 && xpT < 1 ? <div style={{ position: "absolute", left: 900 + (Math.min(1, bar) * 0) - 60 * xpT, top: 650 - xpT * 70, padding: "8px 20px", borderRadius: 22, background: "#ffc800", color: "#fff", fontWeight: 900, fontSize: 30, boxShadow: "0 5px 0 #d19a00", transform: `scale(${1 - xpT * 0.4})`, opacity: 1 - lin(f, CLAIM + 40, CLAIM + 50, 0, 1) }}>+15 XP</div> : null}
          <Confetti at={CLAIM + 50} x={960 - 420 + 840 * 0.7} y={580} n={26} spread={6} />
          <CursorLayer c={curC} />
        </AbsoluteFill>
      ) : null}
    </DemoCam>
  );
};
export { LIP as _lip };
