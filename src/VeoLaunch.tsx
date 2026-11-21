import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { useFonts7, UI, HEAD, GREEN, GLIP } from "./Kit7";

// Prompt-to-result launch film (after the "prompt-to-website launch" motion template):
// blurred blue field -> phrase with a pill -> prompt box with mode menu -> typed request -> send ->
// a real result page scrolls -> action button closes the round; a second round with a new content type;
// an open request; many screens fold into one spatial mosaic; the wordmark on white.
export const VEO_LAUNCH_FRAMES = 2192;

const SKY = "#bce8fb";
const BLUE = "#1cb0f6";
const DEEP = "#154be6";
const INK = "#122331";
const MUTE = "#8a9aa8";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const EASE = Easing.bezier(0.65, 0, 0.35, 1);
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const lin = (f: number, a: number, b: number, x = 0, y = 1, e = EASE) => interpolate(f, [a, b], [x, y], { easing: e, ...cl });
const typed = (s: string, f: number, a: number, cps = 1.1) => Array.from(s).slice(0, Math.max(0, Math.floor((f - a) * cps))).join("");

// keyframed value with eased segments
type K = [number, ...number[]];
const track = (f: number, ks: K[]) => {
  if (f <= ks[0][0]) return ks[0].slice(1);
  for (let i = 0; i < ks.length - 1; i++) {
    const [a, ...va] = ks[i];
    const [b, ...vb] = ks[i + 1];
    if (f <= b) { const t = lin(f, a, b); return va.map((v, j) => v + (vb[j] - v) * t); }
  }
  return ks[ks.length - 1].slice(1);
};

/* ---------------- background: pale field with slowly drifting blue light ---------------- */
const Field: React.FC<{ deep?: number }> = ({ deep = 0 }) => {
  const f = useCurrentFrame();
  const blob = (x: number, y: number, r: number, c: string, sp: number, ph: number) => (
    <div style={{ position: "absolute", left: x + 140 * Math.sin(f / sp + ph) - r, top: y + 90 * Math.cos(f / (sp * 1.3) + ph) - r, width: r * 2, height: r * 2, borderRadius: "50%", background: `radial-gradient(circle, ${c} 0%, ${c}00 70%)` }} />
  );
  return (
    <AbsoluteFill style={{ background: deep > 0.5 ? DEEP : "#e8f7fe", overflow: "hidden" }}>
      <AbsoluteFill style={{ opacity: 1 - deep }}>
        {blob(300, 900, 700, "#8fd3fbcc", 90, 0)}
        {blob(1600, 200, 600, "#bce8fbff", 110, 2)}
        {blob(1500, 1000, 650, "#9fcff7cc", 80, 4)}
        {blob(900, 520, 500, "#ffffffcc", 120, 1)}
        {blob(700, 1180, 820, "#7cc4f6ee", 100, 2.5)}
        {blob(1350, 1150, 700, "#8ec9faee", 85, 1.2)}
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: deep }}>
        <AbsoluteFill style={{ background: `linear-gradient(120deg, #3fb6f8 0%, ${BLUE} 35%, ${DEEP} 100%)` }} />
        {blob(400, 300, 600, "#6fd0ffcc", 70, 0)}
        {blob(1500, 150, 700, "#0d3fd0dd", 90, 3)}
        {blob(1000, 1000, 600, "#43c6ffcc", 60, 5)}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------------- small icons ---------------- */
const Chev = ({ c = MUTE }) => (
  <svg width="22" height="36" viewBox="0 0 22 36"><path d="M4 13 L11 6 L18 13 M4 23 L11 30 L18 23" stroke={c} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Bulb = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={MUTE} strokeWidth="1.7" strokeLinecap="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.4 1 2.5h6c0-1.1.3-1.8 1-2.5A6 6 0 0 0 12 3z" /></svg>
);
const Mic = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={MUTE} strokeWidth="1.8" strokeLinecap="round"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
);
const Book = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={MUTE} strokeWidth="1.7" strokeLinejoin="round"><path d="M4 5c3-1 6-1 8 1 2-2 5-2 8-1v14c-3-1-6-1-8 1-2-2-5-2-8-1z M12 6v14" /></svg>
);
const Heart = ({ on = 0 }) => (
  <svg width="30" height="30" viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill={on > 0.5 ? "#ff4b6e" : "none"} stroke={on > 0.5 ? "#ff4b6e" : MUTE} strokeWidth="1.8" /></svg>
);
const Cursor: React.FC<{ x: number; y: number; down: number; o: number }> = ({ x, y, down, o }) => (
  <div style={{ position: "absolute", left: x, top: y, opacity: o, transform: `scale(${1 - 0.14 * down})`, transformOrigin: "4px 4px", zIndex: 50, filter: "drop-shadow(0 8px 14px rgba(18,35,49,.28))" }}>
    <svg width="54" height="64" viewBox="0 0 27 32"><path d="M3 2 L3 25 L9 19.5 L13 29 L17 27.4 L13 18 L21.5 18 Z" fill={DEEP} stroke="#fff" strokeWidth="2.2" strokeLinejoin="round" /></svg>
  </div>
);

/* ---------------- prompt box ---------------- */
const MODES = ["Урок", "Законы", "ИИ-помощник"];
const PromptBox: React.FC<{ text: string; mode: number; caret: boolean; menu: number; hi: number; send: number; ready: number }> = ({ text, mode, caret, menu, hi, send, ready }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 420, top: 400, width: 1080, height: 260, borderRadius: 44, background: "rgba(255,255,255,0.97)", boxShadow: "0 0 0 2px rgba(28,176,246,.22), 0 0 90px rgba(28,176,246,.55), 0 30px 80px rgba(21,75,230,.16)", fontFamily: HEAD }}>
      <div style={{ position: "absolute", left: 48, top: 38, right: 60, fontSize: 38, lineHeight: 1.32, fontWeight: 500, color: text ? INK : "#a9b6c1", letterSpacing: "-0.01em" }}>
        {text || "Что изучим сегодня?"}
        {caret && Math.floor(f / 18) % 2 === 0 ? <span style={{ display: "inline-block", width: 3, height: 42, background: INK, marginLeft: 3, verticalAlign: -7 }} /> : null}
      </div>
      <div style={{ position: "absolute", left: 30, right: 30, bottom: 28, height: 76, display: "flex", alignItems: "center", gap: 28 }}>
        <div style={{ width: 74, height: 74, borderRadius: "50%", border: `2px solid #c9d3db`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 46, fontWeight: 300, color: "#5d6b77" }}>+</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
          <Img src={staticFile("brand/veoskill.webp")} style={{ height: 30 }} />
          <span style={{ fontSize: 30, fontWeight: 600, color: BLUE }}>{MODES[mode]}</span>
          <Chev />
          {/* mode menu */}
          <div style={{ position: "absolute", left: -10, top: 70, width: 380, padding: 12, borderRadius: 26, background: "#fff", boxShadow: "0 24px 70px rgba(18,35,49,.18), 0 0 0 1px rgba(18,35,49,.06)", opacity: menu, transform: `translateY(${(1 - menu) * -16}px) scale(${0.96 + 0.04 * menu})`, transformOrigin: "top left", pointerEvents: "none" }}>
            {MODES.map((m, i) => (
              <div key={m} style={{ position: "relative", height: 64, display: "flex", alignItems: "center", paddingLeft: 22, fontSize: 30, fontWeight: 600, color: INK }}>
                {i === 0 ? <div style={{ position: "absolute", left: 0, right: 0, top: hi * 64, height: 64, borderRadius: 18, background: "#e3f5fe" }} /> : null}
                <span style={{ position: "relative" }}>{m}</span>
              </div>
            ))}
          </div>
        </div>
        <Book />
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 30, color: MUTE }}><Bulb />План</div>
        <Mic />
        <div style={{ width: 74, height: 74, borderRadius: "50%", background: BLUE, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${(0.9 + 0.1 * ready) * (1 - 0.12 * send)})`, opacity: 0.45 + 0.55 * ready, boxShadow: `0 0 ${30 * ready}px rgba(28,176,246,.7)` }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
        </div>
      </div>
    </div>
  );
};

/* ---------------- browser frame ---------------- */
const Browser: React.FC<{ url: string; children: React.ReactNode; scroll: number; action?: React.ReactNode }> = ({ url, children, scroll, action }) => (
  <div style={{ position: "absolute", left: 210, top: 110, width: 1500, height: 900, borderRadius: 30, overflow: "hidden", background: "#fff", boxShadow: "0 0 0 2px rgba(28,176,246,.18), 0 0 120px rgba(28,176,246,.45), 0 40px 100px rgba(21,75,230,.18)" }}>
    <div style={{ height: 70, background: "#f4f8fb", display: "flex", alignItems: "center", gap: 12, padding: "0 26px", borderBottom: "1px solid #e6edf2", position: "relative", zIndex: 2 }}>
      {["#ff6159", "#ffbd2e", "#28c941"].map((c) => <div key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c }} />)}
      <div style={{ marginLeft: 30, flex: 1, maxWidth: 760, height: 42, borderRadius: 21, background: "#fff", border: "1px solid #e1e8ee", display: "flex", alignItems: "center", padding: "0 22px", fontFamily: UI, fontWeight: 700, fontSize: 22, color: "#6b7a87" }}>{url}</div>
      <div style={{ flex: 1 }} />
      {action}
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 70, transform: `translateY(${-scroll}px)` }}>{children}</div>
  </div>
);

const SiteBar: React.FC<{ active: string }> = ({ active }) => (
  <div style={{ height: 96, display: "flex", alignItems: "center", padding: "0 60px", gap: 48, borderBottom: "1px solid #eef2f5", fontFamily: UI, fontWeight: 800, fontSize: 24, color: "#77858f" }}>
    <Img src={staticFile("brand/veoskill.webp")} style={{ height: 40, marginRight: 30 }} />
    {["Уроки", "Законы", "Лига", "Форум"].map((n) => <span key={n} style={{ color: n === active ? BLUE : undefined }}>{n}</span>)}
  </div>
);

/* lesson page (round 1 result) */
const LessonPage: React.FC<{ f: number; a: number }> = ({ f, a }) => {
  const rise = (i: number) => ({ opacity: lin(f, a + i * 6, a + i * 6 + 20), transform: `translateY(${(1 - lin(f, a + i * 6, a + i * 6 + 26, 0, 1, OUT)) * 40}px)` });
  const steps = [
    ["1", "Кто обязан", "Каждый гражданин Республики Узбекистан, без исключений."],
    ["2", "Что именно", "Соблюдать Конституцию и законы, уважать права других людей."],
    ["3", "Зачем это нужно", "Права одного заканчиваются там, где начинаются права другого."],
  ];
  return (
    <div style={{ fontFamily: UI, color: "#3c3c3c" }}>
      <SiteBar active="Уроки" />
      <div style={{ padding: "60px 90px 0", ...rise(0) }}>
        <div style={{ display: "inline-block", padding: "10px 22px", borderRadius: 16, background: "#e3f5fe", color: BLUE, fontWeight: 800, fontSize: 24 }}>Конституция · Обязанности</div>
        <div style={{ marginTop: 26, fontFamily: HEAD, fontWeight: 800, fontSize: 76, lineHeight: 1.05, color: INK, letterSpacing: "-0.03em" }}>Обязанности граждан<br />простыми словами</div>
        <div style={{ marginTop: 22, fontSize: 30, fontWeight: 600, color: "#777" }}>Урок на 5 минут · 3 шага теории · квиз из 3 вопросов</div>
      </div>
      <div style={{ display: "flex", gap: 30, padding: "56px 90px 0" }}>
        {steps.map(([n, t, d], i) => (
          <div key={n} style={{ flex: 1, height: 300, borderRadius: 30, border: "2px solid #e5e5e5", borderBottomWidth: 6, padding: 34, boxSizing: "border-box", ...rise(2 + i) }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: BLUE, color: "#fff", fontWeight: 900, fontSize: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</div>
            <div style={{ marginTop: 22, fontWeight: 900, fontSize: 32, color: INK }}>{t}</div>
            <div style={{ marginTop: 10, fontWeight: 600, fontSize: 24, lineHeight: 1.35, color: "#6b6b6b" }}>{d}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: "70px 90px 0" }}>
        <div style={{ fontWeight: 900, fontSize: 40, color: INK }}>Проверь себя</div>
        <div style={{ marginTop: 14, fontWeight: 700, fontSize: 28, color: "#777" }}>Обязан ли гражданин соблюдать Конституцию?</div>
        <div style={{ marginTop: 30, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {["Да, каждый гражданин", "Только чиновники", "Только по желанию", "Только совершеннолетние"].map((t, i) => (
            <div key={t} style={{ height: 110, borderRadius: 24, border: `2px solid ${i === 0 ? "#a5ed6e" : "#e5e5e5"}`, borderBottomWidth: 6, background: i === 0 ? "#d7ffb8" : "#fff", display: "flex", alignItems: "center", paddingLeft: 34, fontWeight: 800, fontSize: 30, color: i === 0 ? GLIP : "#4b4b4b" }}>{t}</div>
          ))}
        </div>
      </div>
      <div style={{ height: 200 }} />
    </div>
  );
};

/* laws search page (round 2 result) */
const LawsPage: React.FC<{ f: number; a: number; all: number; fav: number }> = ({ f, a, all, fav }) => {
  const rows = [
    ["Трудовой кодекс Республики Узбекистан", "Каждый имеет", "право на труд", ", на свободный выбор работы и на справедливые условия труда.", "RU"],
    ["Mehnat kodeksi", "Har kim mehnat qilish", " huquqiga", " ega, ishni erkin tanlash huquqiga ega.", "UZ"],
    ["Конституция Республики Узбекистан", "Каждый имеет", "право на труд", ", на свободный выбор работы, на справедливые условия труда.", "RU"],
    ["Закон «О занятости населения»", "Государство гарантирует", "право на труд", " и защиту от безработицы.", "RU"],
    ["Закон «Об охране труда»", "Работник имеет", "право на труд", " в условиях, отвечающих требованиям безопасности.", "RU"],
  ];
  return (
    <div style={{ fontFamily: UI, color: "#3c3c3c" }}>
      <SiteBar active="Законы" />
      <div style={{ padding: "50px 90px 0" }}>
        <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 64, color: INK, letterSpacing: "-0.03em" }}>Поиск по тексту</div>
        <div style={{ marginTop: 26, display: "flex", gap: 20, alignItems: "center" }}>
          <div style={{ flex: 1, height: 84, borderRadius: 24, border: `2px solid ${BLUE}`, display: "flex", alignItems: "center", paddingLeft: 32, fontWeight: 700, fontSize: 32, color: INK }}>право на труд</div>
          <div style={{ display: "flex", height: 84, borderRadius: 24, background: "#f1f4f6", padding: 6, position: "relative", fontWeight: 900, fontSize: 22 }}>
            <div style={{ position: "absolute", top: 6, bottom: 6, left: 6 + all * 210, width: 210, borderRadius: 19, background: BLUE }} />
            <div style={{ position: "relative", width: 210, display: "flex", alignItems: "center", justifyContent: "center", color: all < 0.5 ? "#fff" : "#77858f" }}>В ЭТОМ АКТЕ</div>
            <div style={{ position: "relative", width: 210, display: "flex", alignItems: "center", justifyContent: "center", color: all > 0.5 ? "#fff" : "#77858f" }}>ВСЯ БАЗА</div>
          </div>
        </div>
        <div style={{ marginTop: 26, fontWeight: 800, fontSize: 26, color: "#777", opacity: all }}>Найдено в 181 акте · на русском и узбекском</div>
      </div>
      <div style={{ padding: "26px 90px 0", display: "flex", flexDirection: "column", gap: 22 }}>
        {rows.map(([t, b, m, e, l], i) => {
          const k = lin(f, a + i * 7, a + i * 7 + 24, 0, 1, OUT);
          return (
            <div key={t} style={{ borderRadius: 26, border: "2px solid #e5e5e5", borderBottomWidth: 5, padding: "26px 32px", opacity: k, transform: `translateX(${(1 - k) * 60}px)`, display: "flex", gap: 26 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ padding: "4px 12px", borderRadius: 10, background: l === "UZ" ? "#e7f9d8" : "#e3f5fe", color: l === "UZ" ? GLIP : BLUE, fontWeight: 900, fontSize: 18 }}>{l}</span>
                  <span style={{ fontWeight: 900, fontSize: 28, color: INK }}>{t}</span>
                </div>
                <div style={{ marginTop: 12, fontWeight: 600, fontSize: 24, color: "#666" }}>{b} <mark style={{ background: "#fff0a8", padding: "0 4px", borderRadius: 6, color: INK, fontWeight: 800 }}>{m.trim()}</mark>{e}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 18, fontWeight: 900, fontSize: 18 }}>
                <span style={{ padding: "8px 12px", borderRadius: 10, background: "#ffe9e9", color: "#e0393e" }}>PDF</span>
                <span style={{ padding: "8px 14px", borderRadius: 10, background: "#e5eefc", color: "#2b5fc8" }}>W</span>
                <div style={{ transform: `scale(${i === 0 ? 1 + 0.35 * Math.sin(Math.PI * lin(f, 0, 1) * 0) : 1})` }}><Heart on={i === 0 ? fav : 0} /></div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ height: 200 }} />
    </div>
  );
};

/* small extra screens for the mosaic */
const Tile: React.FC<{ kind: number }> = ({ kind }) => {
  const pad: React.CSSProperties = { position: "absolute", inset: 0, background: "#fff", fontFamily: UI, overflow: "hidden" };
  if (kind === 0) return <div style={{ ...pad, transform: "scale(.4)", transformOrigin: "0 0", width: 1500, height: 900 }}><LessonPage f={999} a={0} /></div>;
  if (kind === 1) return <div style={{ ...pad, transform: "scale(.4)", transformOrigin: "0 0", width: 1500, height: 900 }}><LawsPage f={999} a={0} all={1} fav={1} /></div>;
  if (kind === 2) // league
    return (
      <div style={{ ...pad, padding: 34, boxSizing: "border-box", background: "linear-gradient(160deg,#fff,#eef9ff)" }}>
        <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 40, color: INK }}>Лига · Сапфир</div>
        {["Малика", "Вы", "Тимур", "Дильноза"].map((n, i) => (
          <div key={n} style={{ marginTop: 18, height: 58, borderRadius: 16, background: n === "Вы" ? "#e3f5fe" : "#f6f8fa", display: "flex", alignItems: "center", gap: 16, padding: "0 18px", fontWeight: 800, fontSize: 24, color: INK }}>
            <span style={{ color: BLUE, width: 24 }}>{i + 1}</span>{n}<span style={{ marginLeft: "auto", color: "#888" }}>{[2140, 1985, 1720, 1510][i]} XP</span>
          </div>
        ))}
      </div>
    );
  if (kind === 3) // quiz
    return (
      <div style={{ ...pad, padding: 34, boxSizing: "border-box", background: `linear-gradient(150deg, ${BLUE}, ${DEEP})`, color: "#fff" }}>
        <div style={{ fontWeight: 900, fontSize: 24, opacity: 0.8 }}>КВИЗ · 2 из 3</div>
        <div style={{ marginTop: 14, fontFamily: HEAD, fontWeight: 800, fontSize: 34, lineHeight: 1.15 }}>С какого возраста наступает совершеннолетие?</div>
        <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {["16 лет", "18 лет", "21 год", "14 лет"].map((t, i) => <div key={t} style={{ height: 70, borderRadius: 18, background: i === 1 ? GREEN : "rgba(255,255,255,.18)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 26 }}>{t}</div>)}
        </div>
      </div>
    );
  if (kind === 4) // forum
    return (
      <div style={{ ...pad, padding: 34, boxSizing: "border-box" }}>
        <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 36, color: INK }}>Форум</div>
        {["Можно ли расторгнуть договор аренды досрочно?", "Как оформить отпуск по уходу за ребёнком?", "Срок исковой давности по долгу"].map((t, i) => (
          <div key={t} style={{ marginTop: 16, padding: "16px 18px", borderRadius: 16, border: "2px solid #eef1f4", display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ width: 44, textAlign: "center", fontWeight: 900, fontSize: 22, color: GLIP }}>▲<br />{[48, 31, 22][i]}</div>
            <div style={{ fontWeight: 800, fontSize: 22, color: INK, lineHeight: 1.25 }}>{t}</div>
          </div>
        ))}
      </div>
    );
  // 5: path
  return (
    <div style={{ ...pad, background: "linear-gradient(180deg,#f3fbff,#fff)" }}>
      <div style={{ position: "absolute", left: 34, top: 30, fontFamily: HEAD, fontWeight: 800, fontSize: 34, color: INK }}>Путь · Гражданское право</div>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} style={{ position: "absolute", left: 300 + 90 * Math.sin(i * 1.3), top: 110 + i * 92, width: 80, height: 74, borderRadius: "50%", background: i < 3 ? GREEN : i === 3 ? BLUE : "#e5e5e5", boxShadow: `0 8px 0 ${i < 3 ? GLIP : i === 3 ? "#1899d6" : "#c8c8c8"}` }} />
      ))}
    </div>
  );
};

/* ---------------- one prompt round ---------------- */
type Round = { a: number; mode: number; text: string; cps: number; menu: boolean; sendAt: number };
const PromptRound: React.FC<{ r: Round }> = ({ r }) => {
  const f = useCurrentFrame();
  const { a, sendAt } = r;
  const tA = r.menu ? a + 110 : a + 40;
  const text = typed(r.text, f, tA, r.cps);
  const menuOpen = r.menu ? lin(f, a + 52, a + 64, 0, 1, OUT) * (1 - lin(f, a + 96, a + 106)) : 0;
  const hi = r.menu ? lin(f, a + 70, a + 86, 0, r.mode) : 0;
  const mode = r.menu && f < a + 92 ? 0 : r.mode;
  const done = Array.from(r.text).length <= Math.floor((f - tA) * r.cps);
  const send = lin(f, sendAt - 2, sendAt + 3) * (1 - lin(f, sendAt + 5, sendAt + 12));
  // camera: start wide, push in on the text while typing, glide to the send button, then blur away
  const typeEnd = tA + Array.from(r.text).length / r.cps;
  const ks: K[] = r.menu
    ? [[a, 960, 540, 0.92, 14], [a + 30, 960, 540, 1, 0], [a + 50, 800, 600, 1.35, 0], [a + 100, 800, 600, 1.35, 0], [tA + 10, 860, 480, 1.75, 0], [typeEnd, 1000, 500, 1.75, 0], [sendAt - 16, 1380, 610, 1.9, 0], [sendAt + 10, 1380, 610, 2.05, 6], [sendAt + 30, 1380, 610, 2.3, 22]]
    : [[a, 960, 540, 0.92, 14], [a + 30, 960, 540, 1, 0], [tA + 10, 860, 480, 1.6, 0], [typeEnd, 1000, 500, 1.7, 0], [sendAt - 16, 1380, 610, 1.9, 0], [sendAt + 10, 1380, 610, 2.05, 6], [sendAt + 30, 1380, 610, 2.3, 22]];
  const [cx, cy, s, blur] = track(f, ks);
  // cursor path in stage space
  const cur: K[] = r.menu
    ? [[a, 1700, 900], [a + 46, 700, 640], [a + 66, 700, 640], [a + 84, 640, 760], [a + 100, 640, 760], [a + 130, 1150, 860], [typeEnd, 1150, 860], [sendAt - 6, 1424, 646], [sendAt + 30, 1424, 646]]
    : [[a, 1700, 900], [typeEnd, 1500, 820], [sendAt - 6, 1424, 646], [sendAt + 30, 1424, 646]];
  const [mx, my] = track(f, cur);
  const down = r.menu ? Math.max(press(f, a + 50), press(f, a + 96), press(f, sendAt)) : press(f, sendAt);
  return (
    <AbsoluteFill style={{ filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>
      <AbsoluteFill style={{ transformOrigin: "0 0", transform: `translate(${960 - cx * s}px, ${540 - cy * s}px) scale(${s})` }}>
        <div style={{ position: "absolute", inset: 0, opacity: lin(f, a, a + 20), transform: `scale(${0.94 + 0.06 * lin(f, a, a + 36, 0, 1, OUT)})` }}>
          <PromptBox text={text} mode={mode} caret={f < sendAt} menu={menuOpen} hi={hi} send={send} ready={done ? 1 : 0} />
        </div>
        <Cursor x={mx} y={my} down={down} o={lin(f, a + 20, a + 34)} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
const press = (f: number, at: number) => lin(f, at - 3, at) * (1 - lin(f, at + 4, at + 10));

/* ---------------- result rounds ---------------- */
const Result: React.FC<{ a: number; b: number; url: string; kind: "lesson" | "laws" }> = ({ a, b, url, kind }) => {
  const f = useCurrentFrame();
  const inK = lin(f, a, a + 40, 0, 1, OUT);
  const focus = (1 - lin(f, a, a + 30)) * 18 + lin(f, b - 24, b) * 18;
  const actAt = kind === "lesson" ? b - 66 : b - 70;
  const scroll = kind === "lesson" ? lin(f, a + 70, a + 230, 0, 860) : lin(f, a + 130, a + 230, 0, 420);
  const allAt = a + 70;
  const all = kind === "laws" ? lin(f, allAt, allAt + 12) : 0;
  const fav = kind === "laws" ? (f > actAt ? 1 : 0) : 0;
  const cam = 1 + 0.05 * lin(f, a, b, 0, 1, Easing.linear);
  // cursor: to the action button (lesson: top-right "Начать урок"; laws: toggle, then heart of the first row)
  const cur: K[] = kind === "lesson"
    ? [[a + 30, 1500, 980], [actAt - 26, 1580, 220], [actAt + 60, 1580, 220]]
    : [[a + 30, 1500, 980], [allAt - 4, 1580, 380], [allAt + 40, 1580, 380], [actAt - 6, 1615, 690 - 420 + 70], [actAt + 60, 1615, 340]];
  const [mx, my] = track(f, cur);
  const down = kind === "lesson" ? press(f, actAt) : Math.max(press(f, allAt), press(f, actAt));
  const btn = press(f, actAt);
  const ok = lin(f, actAt + 6, actAt + 22, 0, 1, OUT);
  const action = kind === "lesson" ? (
    <div style={{ height: 46, padding: "0 26px", borderRadius: 16, background: ok > 0.5 ? GLIP : GREEN, boxShadow: `0 ${5 - 5 * btn}px 0 ${GLIP}`, transform: `translateY(${btn * 5}px)`, color: "#fff", fontFamily: UI, fontWeight: 900, fontSize: 22, display: "flex", alignItems: "center", gap: 10 }}>
      {ok > 0.5 ? "✓ Урок добавлен" : "Начать урок"}
    </div>
  ) : (
    <div style={{ height: 46, padding: "0 24px", borderRadius: 16, background: "#e3f5fe", color: BLUE, fontFamily: UI, fontWeight: 900, fontSize: 22, display: "flex", alignItems: "center" }}>{fav ? "♥ В избранном: 1" : "Избранное"}</div>
  );
  return (
    <AbsoluteFill style={{ filter: focus > 0.3 ? `blur(${focus}px)` : undefined, opacity: lin(f, a, a + 14) * (1 - lin(f, b - 10, b)) }}>
      <AbsoluteFill style={{ transform: `translateY(${(1 - inK) * 260}px) scale(${cam * (0.9 + 0.1 * inK)})` }}>
        <Browser url={url} scroll={scroll} action={action}>
          {kind === "lesson" ? <LessonPage f={f} a={a + 20} /> : <LawsPage f={f} a={allAt + 8} all={all} fav={fav} />}
        </Browser>
        <Cursor x={mx} y={my} down={down} o={lin(f, a + 30, a + 44) * (1 - lin(f, b - 20, b - 8))} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------------- opening beats ---------------- */
const Opening: React.FC = () => {
  const f = useCurrentFrame();
  // 0-180: a huge word comes out of the blue haze, sharpens, melts away
  const blur = 26 - 22 * lin(f, 10, 90) + 30 * lin(f, 140, 180);
  const o = lin(f, 0, 30) * (1 - lin(f, 150, 180));
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: o }}>
      <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 340, letterSpacing: "-0.05em", color: "rgba(150,215,255,0.75)", filter: `blur(${blur}px)`, transform: `scale(${1.08 - 0.08 * lin(f, 0, 180, 0, 1, Easing.linear)})` }}>Учись</div>
    </AbsoluteFill>
  );
};
const Phrase: React.FC = () => {
  const f = useCurrentFrame();
  const a = 180;
  const w = (i: number) => ({ display: "inline-block", opacity: lin(f, a + 8 + i * 5, a + 26 + i * 5), filter: `blur(${(1 - lin(f, a + 8 + i * 5, a + 30 + i * 5)) * 10}px)`, transform: `translateY(${(1 - lin(f, a + 8 + i * 5, a + 34 + i * 5, 0, 1, OUT)) * 26}px)` });
  const pill = lin(f, a + 30, a + 60, 0, 1, OUT);
  const out = lin(f, 340, 362);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: 1 - out, filter: out > 0.02 ? `blur(${out * 16}px)` : undefined }}>
      <div style={{ fontFamily: HEAD, fontWeight: 600, fontSize: 92, letterSpacing: "-0.035em", color: INK, display: "flex", alignItems: "center", gap: 26, transform: `scale(${1 + 0.04 * lin(f, a, 360, 0, 1, Easing.linear)})` }}>
        <span style={w(0)}>Всё право</span><span style={w(1)}>Узбекистана в</span>
        <span style={{ ...w(2), padding: "6px 34px 12px", borderRadius: 60, background: "linear-gradient(180deg,#e9f8ff,#c4e9fd)", boxShadow: "0 0 0 2px rgba(28,176,246,.45), 0 10px 30px rgba(28,176,246,.25)", color: BLUE, transform: `scale(${0.7 + 0.3 * pill})` }}>одном</span>
        <span style={w(3)}>окне.</span>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------- mosaic + brand ---------------- */
const Mosaic: React.FC<{ a: number; b: number }> = ({ a, b }) => {
  const f = useCurrentFrame();
  const t = lin(f, a, b, 0, 1, Easing.linear);
  const order = [0, 3, 1, 4, 2, 5, 1, 0, 3, 5, 4, 2];
  const W = 600, H = 360, G = 40;
  return (
    <AbsoluteFill style={{ opacity: lin(f, a, a + 16) * (1 - lin(f, b - 20, b)), filter: `blur(${(1 - lin(f, a, a + 26)) * 14 + lin(f, b - 26, b) * 20}px)`, perspective: 2200 }}>
      <AbsoluteFill style={{ transformStyle: "preserve-3d", transform: `translateZ(${-200 - 700 * lin(f, a, b, 0, 1, EASE)}px) rotateX(${14 - 6 * t}deg) rotateZ(${-8 + 4 * t}deg)` }}>
        {order.map((k, i) => {
          const col = i % 4, row = Math.floor(i / 4);
          const x = 960 + (col - 1.5) * (W + G) - W / 2 + (row % 2 ? 120 : -120) + 120 * t * (row - 1);
          const y = 540 + (row - 1) * (H + G) - H / 2;
          const d = Math.abs(col - 1.5) + Math.abs(row - 1);
          const k2 = lin(f, a + d * 8, a + d * 8 + 40, 0, 1, OUT);
          return (
            <div key={i} style={{ position: "absolute", left: x, top: y, width: W, height: H, borderRadius: 26, overflow: "hidden", boxShadow: "0 0 0 2px rgba(255,255,255,.6), 0 30px 70px rgba(21,75,230,.25)", opacity: k2, transform: `translateZ(${(1 - k2) * 600}px) scale(${0.8 + 0.2 * k2})` }}>
              <Tile kind={k} />
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
const Brand: React.FC<{ a: number }> = ({ a }) => {
  const f = useCurrentFrame();
  const k = lin(f, a + 10, a + 40, 0, 1, OUT);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 70% at 50% 50%, #ffffff 0%, #ffffff 55%, ${SKY} 100%)`, opacity: lin(f, a, a + 18), alignItems: "center", justifyContent: "center" }}>
      <Img src={staticFile("brand/veoskill.webp")} style={{ height: 150, opacity: k, filter: `blur(${(1 - k) * 12}px)`, transform: `scale(${0.92 + 0.08 * k})` }} />
      <div style={{ marginTop: 34, fontFamily: HEAD, fontWeight: 600, fontSize: 40, color: MUTE, opacity: lin(f, a + 34, a + 56), letterSpacing: "0.02em" }}>veoskill.uz</div>
    </AbsoluteFill>
  );
};

/* ---------------- film ---------------- */
const R1: Round = { a: 360, mode: 0, text: "Объясни обязанности граждан по Конституции простыми словами и сделай квиз из трёх вопросов.", cps: 0.75, menu: true, sendAt: 640 };
const R2: Round = { a: 1020, mode: 1, text: "Найди во всей базе нормы о праве на труд, на русском и узбекском.", cps: 0.8, menu: false, sendAt: 1245 };
const R3: Round = { a: 1560, mode: 2, text: "Готовь меня к экзамену по трудовому праву каждый день.", cps: 1.1, menu: false, sendAt: 1740 };

export const VeoLaunch: React.FC = () => {
  useFonts7();
  const f = useCurrentFrame();
  const deep = 1 - lin(f, 150, 200);
  const show = (x: number, y: number) => f >= x && f < y;
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <Field deep={deep} />
      {show(0, 182) ? <Opening /> : null}
      {show(178, 366) ? <Phrase /> : null}
      {show(360, 672) ? <PromptRound r={R1} /> : null}
      {show(660, 1024) ? <Result a={660} b={1024} url="veoskill.uz/lesson/konstitutsiya-obyazannosti" kind="lesson" /> : null}
      {show(1020, 1276) ? <PromptRound r={R2} /> : null}
      {show(1262, 1566) ? <Result a={1262} b={1566} url="veoskill.uz/laws/search?q=право на труд" kind="laws" /> : null}
      {show(1560, 1772) ? <PromptRound r={R3} /> : null}
      {show(1766, 2112) ? <Mosaic a={1766} b={2112} /> : null}
      {f >= 2096 ? <Brand a={2096} /> : null}
    </AbsoluteFill>
  );
};
