import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile } from "remotion";
import { NAVY, BLUE, GREEN, GLIP, RED, INK, HEAD, UI, OUTE, IOE, lin, press, useSp, useFrame, Cap, Pointer, TopLine } from "./Scenes9";
import { ART } from "./Laws7";

// A whole lesson as on veoskill.uz/exercise: intro list, theory (with the Constitution side panel), find the sound,
// build the answer from words, match pairs, find the mistake (a wrong pick costs a heart), a chat story.
// Real page layout: one 880 px column, progress bar and hearts on top, book button + big button at the bottom.
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const CX = 640, CW = 880; // content column
const BTN_Y = 930, BTN_H = 84;
const MAIN_X = CX + 116 + (CW - 116) / 2;
const S = { A: 0, B: 150, C: 390, D: 560, E: 760, F: 960, G: 1130, END: 1325 };
const PROG = [0, 0.12, 0.28, 0.44, 0.6, 0.76, 0.9];
const OWL_Q = staticFile("v4/owl-q.png"), OWL_COOL = staticFile("site/owl-cool.png"), OWL_READ = staticFile("v4/owl-read.png");

const card = (on: number, tone: "plain" | "blue" | "green" | "red" = "plain"): React.CSSProperties => {
  const c = { plain: ["#ffffff", "#e5e5e5", "#e5e5e5"], blue: ["#ddf4ff", "#1cb0f6", "#1899d6"], green: ["#d7ffb8", GREEN, GLIP], red: ["#ffdfe0", RED, "#ea2b2b"] }[tone];
  return { background: c[0], border: `3px solid ${c[1]}`, boxShadow: `0 ${4 * (1 - on * 0.5)}px 0 ${c[2]}`, borderRadius: 18, boxSizing: "border-box" };
};
const Bubble: React.FC<{ owl: string; text: React.ReactNode; y: number; o: number; owlW?: number }> = ({ owl, text, y, o, owlW = 120 }) => (
  <div style={{ position: "absolute", left: CX, top: y, display: "flex", alignItems: "center", gap: 24, opacity: o, transform: `translateY(${(1 - o) * 16}px)` }}>
    <Img src={owl} style={{ width: owlW, objectFit: "contain" }} />
    <div style={{ position: "relative", padding: "18px 26px", border: "3px solid #e5e5e5", borderRadius: 20, background: "#fff", fontFamily: UI, fontWeight: 800, fontSize: 34, color: INK }}>
      <div style={{ position: "absolute", left: -12, top: "50%", marginTop: -10, width: 18, height: 18, background: "#fff", borderLeft: "3px solid #e5e5e5", borderBottom: "3px solid #e5e5e5", transform: "rotate(45deg)" }} />
      {text}
    </div>
  </div>
);
const Check: React.FC<{ on: number; c?: string; size?: number }> = ({ on, c = GREEN, size = 34 }) => (
  <div style={{ width: size, height: size, borderRadius: 8, border: `3px solid ${on > 0.5 ? c : "#cfd3d8"}`, background: on > 0.5 ? c : "#fff", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transform: `scale(${1 + 0.25 * Math.sin(Math.min(1, on) * Math.PI)})` }}>
    {on > 0.5 ? <svg width={size * 0.66} height={size * 0.66} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg> : null}
  </div>
);
/** green / red result band at the bottom of the page */
const Result: React.FC<{ o: number; ok: boolean; title: string; sub: string; btn: string; btnDown?: number }> = ({ o, ok, title, sub, btn, btnDown = 0 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 880, height: 200, background: ok ? "#d7ffb8" : "#ffdfe0", transform: `translateY(${(1 - o) * 200}px)`, zIndex: 20, fontFamily: UI }}>
    <div style={{ position: "absolute", left: CX - 110, top: 46, width: 104, height: 104, borderRadius: 52, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 84, height: 84, borderRadius: 42, background: ok ? GREEN : RED, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"><path d={ok ? "M5 12.5l4.5 4.5L19 7.5" : "M6 6l12 12M18 6L6 18"} /></svg>
      </div>
    </div>
    <div style={{ position: "absolute", left: CX + 20, top: 50 }}>
      <div style={{ fontWeight: 900, fontSize: 42, color: ok ? GLIP : "#ea2b2b" }}>{title}</div>
      <div style={{ marginTop: 6, fontWeight: 700, fontSize: 26, color: ok ? "#58a700" : "#ea2b2b" }}>{sub}</div>
    </div>
    <div style={{ position: "absolute", left: CX + CW - 300, top: 58, width: 300, height: 80, borderRadius: 18, background: ok ? GREEN : RED, boxShadow: `0 ${5 - 4 * btnDown}px 0 ${ok ? GLIP : "#ea2b2b"}`, transform: `translateY(${btnDown * 4}px)`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 26, letterSpacing: "0.06em" }}>{btn}</div>
  </div>
);

/** Confetti burst from (x, y) starting at frame `at` (deterministic). */
export const Confetti: React.FC<{ at: number; x?: number; y?: number; n?: number }> = ({ at, x = 960, y = 760, n = 90 }) => {
  const f = useFrame();
  if (f < at || f > at + 150) return null;
  const t = (f - at) / 60;
  const cols = [GREEN, BLUE, "#ffc800", "#ff4b4b", "#ce82ff"];
  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 90 }}>
      {Array.from({ length: n }, (_, i) => {
        const r = (k: number) => { const v = Math.sin(i * k) * 43758.5453; return v - Math.floor(v); };
        const vx = (r(12.9898) - 0.5) * 1400, vy = -650 - r(78.233) * 750;
        return <div key={i} style={{ position: "absolute", left: x + vx * t, top: y + vy * t + 950 * t * t, width: 14, height: 22, borderRadius: 3, background: cols[i % 5], transform: `rotate(${(r(3.1) * 720 + f * (8 + r(5.7) * 10)) % 360}deg)`, opacity: 1 - lin(t, 1.6, 2.4) }} />;
      })}
    </AbsoluteFill>
  );
};
export const Lesson: React.FC = () => {
  const f = useFrame();
  const sp = useSp();
  // --- step windows
  const win = (a: number, b: number) => { const i = lin(f, a, a + 14), o = b < S.END ? lin(f, b - 12, b) : 0; return { o: i * (1 - o), x: (1 - i) * 70 - o * 70, on: f >= a - 1 && f < b + 1 }; };
  const step = f < S.B ? 0 : f < S.C ? 1 : f < S.D ? 2 : f < S.E ? 3 : f < S.F ? 4 : f < S.G ? 5 : 6;
  const starts = [S.A, S.B, S.C, S.D, S.E, S.F, S.G];
  const prog = interpolate(f, [starts[step], starts[step] + 20], [PROG[Math.max(0, step - 1)], PROG[step]], { ...cl, easing: OUTE }) + lin(f, 1278, 1300, 0, 1 - PROG[6], OUTE);
  // --- clicks (frame, x, y): the cursor arrives 12 frames before and stays 8 after
  const CB = { book: 250, bookX: 340, contB: 375 };
  const wordsX = { "это": CX, "общие": CX + 116, "правила": CX + 272, "право": CX + 458 };
  const W = { "право": 150, "это": 100, "правила": 170, "общие": 140 } as Record<string, number>;
  const clicks: [number, number, number][] = [
    [110, MAIN_X, BTN_Y + 42],
    [CB.book, CX + 50, BTN_Y + 42], [CB.bookX, 1830, 130], [CB.contB, MAIN_X, BTN_Y + 42],
    [430, CX + 300, 420], [520, MAIN_X, BTN_Y + 42],
    [600, wordsX["право"] + 70, 740], [622, wordsX["это"] + 50, 740], [644, wordsX["правила"] + 80, 740], [666, wordsX["общие"] + 70, 740], [692, MAIN_X, BTN_Y + 42], [745, CX + CW - 150, 978],
    [790, CX + 215, 450], [810, CX + 665, 450], [840, CX + 215, 580], [860, CX + 665, 710], [890, CX + 215, 710], [910, CX + 665, 580], [940, MAIN_X, BTN_Y + 42],
    [992, CX + 400, 470], [1012, MAIN_X, BTN_Y + 42], [1066, CX + 400, 730], [1086, MAIN_X, BTN_Y + 42],
    [1250, CX + 400, 750], [1275, MAIN_X, BTN_Y + 42],
  ];
  const pk = [14, ...clicks.flatMap(([t]) => [t - 10, t + 6]), S.END];
  const pxs = [1500, ...clicks.flatMap(([, x]) => [x - 4, x - 4]), 1500];
  const pys = [900, ...clicks.flatMap(([, , y]) => [y - 4, y - 4]), 900];
  const px = interpolate(f, pk, pxs, { ...cl, easing: IOE }), py = interpolate(f, pk, pys, { ...cl, easing: IOE });
  const down = Math.max(...clicks.map(([t]) => press(f, t)));
  // --- hearts
  const lost = f >= 1014 ? 1 : 0;
  const hpop = sp(1014, 9, 260);
  // --- bottom button per step
  const mainLabel = ["НАЧАТЬ", "ПРОДОЛЖИТЬ", "ПРОВЕРИТЬ", "ПРОВЕРИТЬ", "ПРОВЕРИТЬ", "ПРОВЕРИТЬ", "ПРОВЕРИТЬ"][step];
  const mainOn = step <= 1 || (step === 2 && f >= 432) || (step === 3 && f >= 668) || (step === 4 && f >= 912) || (step === 5 && (f >= 994 && f < 1040 || f >= 1068)) || (step === 6 && f >= 1252);
  const mainDown = clicks.filter(([, x, y]) => x === MAIN_X && y === BTN_Y + 42).reduce((m, [t]) => Math.max(m, press(f, t)), 0);
  // --- captions on the left (big, for older viewers)
  const CAPS: [number, string, string?, string?][] = [
    [S.A, "Урок", "за 5 минут.", "за 5 минут."], [S.B, "Сначала", "теория.", "теория."], [CB.book, "Конституция", "прямо в уроке.", "прямо в уроке."],
    [S.C, "Слушай", "и выбирай.", "и выбирай."], [S.D, "Собери ответ", "из слов.", "из слов."], [S.E, "Соедини", "пары.", "пары."],
    [S.F, "Ошибся?", "Минус сердечко.", "Минус сердечко."], [S.G, "Истории", "из жизни.", "из жизни."],
  ];
  let ci = 0; CAPS.forEach(([t], i) => { if (f >= t) ci = i; });
  const capEnd = ci + 1 < CAPS.length ? CAPS[ci + 1][0] : S.END + 60;
  const capO = 1 - lin(f, capEnd - 10, capEnd);
  return (
    <AbsoluteFill style={{ background: "#fff", overflow: "hidden", fontFamily: UI }}>
      {/* caption column */}
      <AbsoluteFill style={{ transformOrigin: "50% 0", transform: "translateY(104px) scale(0.9)" }}>
      {/* top bar: close, progress, hearts */}
      <svg style={{ position: "absolute", left: CX - 4, top: 46 }} width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#afafaf" strokeWidth="2.6" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
      <div style={{ position: "absolute", left: CX + 64, top: 56, width: CW - 160, height: 22, borderRadius: 11, background: "#e5e5e5", overflow: "hidden" }}>
        <div style={{ width: `${Math.min(1, prog) * 100}%`, height: "100%", borderRadius: 11, background: GREEN, position: "relative" }}><div style={{ position: "absolute", left: 10, right: 10, top: 5, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.3)" }} /></div>
      </div>
      <div style={{ position: "absolute", left: CX + 64 + 150, top: 22, fontWeight: 900, fontSize: 20, letterSpacing: "0.1em", color: GLIP, opacity: lin(f, 696, 706) * (1 - lin(f, 760, 772)) }}>2 РАЗА ПОДРЯД</div>
      <div style={{ position: "absolute", left: CX + CW - 80, top: 40, display: "flex", alignItems: "center", gap: 8 }}>
        <Img src={staticFile("real/heart-red.webp")} style={{ width: 46, height: 46, transform: `scale(${1 + 0.3 * Math.sin(Math.min(1, hpop) * Math.PI) * lost})` }} />
        <div style={{ fontWeight: 900, fontSize: 30, color: RED }}>{5 - lost}</div>
        {f >= 1014 && f < 1060 ? <div style={{ position: "absolute", left: 10, top: 50 + lin(f, 1014, 1060, 0, 40), fontWeight: 900, fontSize: 30, color: RED, opacity: 1 - lin(f, 1040, 1060) }}>−1</div> : null}
      </div>

      {/* ===== A: what we learn */}
      {(() => { const w = win(S.A, S.B); if (!w.on) return null; return (
        <div style={{ position: "absolute", inset: 0, opacity: w.o, transform: `translateX(${w.x}px)` }}>
          <div style={{ position: "absolute", left: CX, top: 150, fontWeight: 900, fontSize: 50, color: INK }}>Что будем изучать</div>
          <div style={{ position: "absolute", left: CX, top: 250, fontWeight: 900, fontSize: 22, letterSpacing: "0.1em", color: BLUE }}>РАЗБЕРЁМ СЕГОДНЯ</div>
          <div style={{ position: "absolute", left: CX, top: 296, width: CW, ...card(0), overflow: "hidden" }}>
            {["Что такое право?", "Что такое общее правило?", "Что такое ответственность?"].map((t, i) => { const e = sp(14 + i * 10, 14, 180); return (
              <div key={t} style={{ height: 100, display: "flex", alignItems: "center", gap: 28, padding: "0 30px", borderTop: i ? "2px solid #e5e5e5" : undefined, opacity: Math.min(1, e * 1.4), transform: `translateX(${(1 - e) * 30}px)` }}>
                <div style={{ fontFamily: HEAD, fontWeight: 900, fontStyle: "italic", fontSize: 50, color: NAVY, textShadow: `3px 3px 0 ${GREEN}` }}>{i + 1}</div>
                <div style={{ fontWeight: 600, fontSize: 30, color: INK }}>{t}</div>
              </div>); })}
          </div>
        </div>); })()}

      {/* ===== B: theory */}
      {(() => { const w = win(S.B, S.C); if (!w.on) return null; const lf = f - S.B; const r = (a: number) => lin(lf, a, a + 16); return (
        <div style={{ position: "absolute", inset: 0, opacity: w.o, transform: `translateX(${w.x}px)` }}>
          <svg style={{ position: "absolute", left: CX + CW / 2 - 120, top: 110, opacity: r(4), transform: `scale(${0.85 + 0.15 * r(4)})` }} width="240" height="250" viewBox="0 0 120 125" fill="none" stroke="#1a1a1a" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 6h50l14 14v86a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V10a4 4 0 0 1 4-4z" fill="#fff" />
            <path d="M64 6v14h14" />
            <rect x="22" y="18" width="30" height="10" rx="2" />
            <path d="M22 40h40M22 50h28M22 60h36M22 70h22" />
            <path d="M24 92c4-8 10-8 8 0s4 8 10 2" />
            <rect x="60" y="62" width="40" height="18" rx="3" fill="#fff" />
            <path d="M56 60v22M104 60v22M80 80v32a5 5 0 0 1-10 0V80" fill="#fff" />
          </svg>
          <div style={{ position: "absolute", left: CX, top: 390, width: CW }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, fontWeight: 900, fontSize: 22, letterSpacing: "0.1em", color: "#7c8593", opacity: r(14) }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18M7 21h10M4 7h16M6 7l-3 7a3 3 0 0 0 6 0zM18 7l-3 7a3 3 0 0 0 6 0z" /></svg>ЧТО ТАКОЕ ПРАВО
            </div>
            <div style={{ marginTop: 16, marginLeft: 58, fontWeight: 600, fontSize: 32, lineHeight: 1.55, color: INK, opacity: r(24), textAlign: "justify" }}>
              <span style={{ color: "#ce82ff", borderBottom: "3px dotted #ce82ff" }}>Право</span> это правила, которые для всех одинаковые и которые защищает государство.
            </div>
            {["Правила записаны в законах, их можно прочитать.", "Они одинаковые для всех, и для богатых, и для бедных.", "Если правило нарушили, государство может наказать."].map((t, i) => (
              <div key={t} style={{ marginTop: i ? 14 : 30, marginLeft: 58, display: "flex", gap: 16, alignItems: "baseline", fontWeight: 600, fontSize: 30, color: INK, opacity: r(44 + i * 12), transform: `translateX(${(1 - r(44 + i * 12)) * 20}px)` }}>
                <div style={{ width: 18, height: 5, borderRadius: 3, background: BLUE, flexShrink: 0, transform: "translateY(-8px)" }} />{t}
              </div>
            ))}
          </div>
        </div>); })()}

      {/* ===== C: find the sound */}
      {(() => { const w = win(S.C, S.D); if (!w.on) return null; const lf = f - S.C; const pick = f >= 432 ? 1 : 0; const play = lin(f, 432, 500, 0, 1, Easing.linear); return (
        <div style={{ position: "absolute", inset: 0, opacity: w.o, transform: `translateX(${w.x}px)` }}>
          <div style={{ position: "absolute", left: CX, top: 140, fontWeight: 900, fontSize: 50, color: INK }}>Найдите звук слова</div>
          <Bubble owl={OWL_Q} text={<span style={{ color: "#ce82ff", borderBottom: "3px dotted #ce82ff", fontSize: 38 }}>Право</span>} y={224} o={lin(lf, 6, 20)} />
          {[0, 1, 2].map((i) => { const on = i === 0 ? pick : 0; const e = sp(S.C + 12 + i * 6, 14, 180); return (
            <div key={i} style={{ position: "absolute", left: CX, top: 360 + i * 140, width: CW, height: 120, ...card(on, on ? "green" : "plain"), display: "flex", alignItems: "center", gap: 22, padding: "0 30px", opacity: Math.min(1, e * 1.4) }}>
              <Check on={on ? sp(432, 10, 260) : 0} />
              <svg width="38" height="38" viewBox="0 0 24 24" fill={BLUE}><path d="M4 9h4l5-4v14l-5-4H4z" /><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke={BLUE} strokeWidth="2.2" strokeLinecap="round" /></svg>
              <div style={{ flex: 1, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                {Array.from({ length: 30 }, (_, k) => { const h = 18 + 40 * Math.abs(Math.sin(k * 1.7 + i * 2.3)) * (k % 3 === 2 ? 0.4 : 1); const lit = on && k / 30 < play; return <div key={k} style={{ width: 5, height: lit ? h * (0.8 + 0.3 * Math.sin(f / 3 + k)) : h, borderRadius: 3, background: lit ? BLUE : "#d5d9de" }} />; })}
              </div>
              <div style={{ width: 60, textAlign: "right", fontWeight: 700, fontSize: 24, color: "#7c8593" }}>0:0{on && play > 0.5 ? 1 : 0}</div>
            </div>); })}
        </div>); })()}

      {/* ===== D: build the answer */}
      {(() => { const w = win(S.D, S.E); if (!w.on) return null; const lf = f - S.D; const order = ["право", "это", "правила", "общие"]; const at = [600, 622, 644, 666];
        let ax = CX; const ansX: Record<string, number> = {}; order.forEach((wd) => { ansX[wd] = ax; ax += W[wd] + 14; });
        return (
        <div style={{ position: "absolute", inset: 0, opacity: w.o, transform: `translateX(${w.x}px)` }}>
          <Bubble owl={OWL_Q} text="Что такое право?" y={250} o={lin(lf, 4, 18)} />
          <div style={{ position: "absolute", left: CX, top: 540, width: CW, height: 3, background: "#e5e5e5" }} />
          <div style={{ position: "absolute", left: CX, top: 640, width: CW, height: 3, background: "#e5e5e5" }} />
          {Object.keys(wordsX).map((wd) => (
            <div key={"slot" + wd} style={{ position: "absolute", left: wordsX[wd as keyof typeof wordsX], top: 700, width: W[wd], height: 76, borderRadius: 16, background: "#e5e5e5" }} />
          ))}
          {order.map((wd, i) => { const m = lin(f, at[i] + 2, at[i] + 18, 0, 1, OUTE); const ok = f >= 696; const x = wordsX[wd as keyof typeof wordsX] * (1 - m) + ansX[wd] * m; const y = 700 * (1 - m) + 456 * m - Math.sin(m * Math.PI) * 50; return (
            <div key={wd} style={{ position: "absolute", left: x, top: y, width: W[wd], height: 76, ...card(0, ok ? "green" : "plain"), display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 30, color: ok ? GLIP : INK, opacity: lin(lf, 10 + i * 3, 20 + i * 3) }}>{wd}</div>); })}
        </div>); })()}

      {/* ===== E: match pairs */}
      {(() => { const w = win(S.E, S.F); if (!w.on) return null; const lf = f - S.E;
        const L = ["Право", "Ответственность", "Общее правило"]; const R = ["Нормы поведения, которые государство устанавливает и отстаивает", "Правило поведения для всех людей в одинаковой ситуации, а не для одного человека", "Последствие нарушения, которое государство применяет по процедуре"];
        const lSel = [790, 840, 890], rFor = [[810, 0], [860, 2], [910, 1]] as [number, number][];
        const done = (t: number) => f >= t + 2;
        return (
        <div style={{ position: "absolute", inset: 0, opacity: w.o, transform: `translateX(${w.x}px)` }}>
          <div style={{ position: "absolute", left: CX, top: 150, fontWeight: 900, fontSize: 50, color: INK }}>Соедини пары</div>
          <div style={{ position: "absolute", left: CX, top: 240, fontWeight: 900, fontSize: 22, letterSpacing: "0.1em", color: BLUE }}>ПАРЫ</div>
          <div style={{ position: "absolute", left: CX, top: 282, fontWeight: 600, fontSize: 26, color: "#7c8593" }}>Слева понятие, справа его значение.</div>
          {L.map((t, i) => { const sel = f >= lSel[i] && !done(rFor[i][0]); const ok = done(rFor[i][0]); const e = sp(S.E + 10 + i * 5, 14, 180); return (
            <div key={t} style={{ position: "absolute", left: CX, top: 395 + i * 130, width: 430, height: 110, ...card(0, ok ? "green" : sel ? "blue" : "plain"), display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 28, color: ok ? GLIP : INK, opacity: Math.min(1, e * 1.4) }}>{t}</div>); })}
          {R.map((t, j) => { const pair = rFor.find(([, r]) => r === j)!; const ok = done(pair[0]); const e = sp(S.E + 14 + j * 5, 14, 180); return (
            <div key={t} style={{ position: "absolute", left: CX + 450, top: 395 + j * 130, width: 430, height: 110, ...card(0, ok ? "green" : "plain"), display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 18px", fontWeight: 600, fontSize: 21, lineHeight: 1.35, color: ok ? GLIP : INK, opacity: Math.min(1, e * 1.4) }}>{t}</div>); })}
          {void lf}
        </div>); })()}

      {/* ===== F: find the mistake (wrong pick costs a heart) */}
      {(() => { const w = win(S.F, S.G); if (!w.on) return null; const lf = f - S.F;
        const opts = ["Государство признаёт право и при необходимости его защищает", "Право это общие правила поведения", "Право это совет того, кто громче спорит в чате"];
        const sel = f >= 994 && f < 1044 ? 0 : f >= 1068 ? 2 : -1; const wrong = f >= 1014 && f < 1044; const right = f >= 1088;
        return (
        <div style={{ position: "absolute", inset: 0, opacity: w.o, transform: `translateX(${w.x}px)` }}>
          <Bubble owl={OWL_COOL} owlW={100} text="Где ошибка?" y={170} o={lin(lf, 4, 18)} />
          {opts.map((t, i) => { const s = i === sel; const tone = s && wrong ? "red" : s && right ? "green" : s ? "blue" : "plain"; const e = sp(S.F + 10 + i * 6, 14, 180); return (
            <div key={t} style={{ position: "absolute", left: CX, top: 410 + i * 130, width: CW, height: 110, ...card(0, tone as "plain"), display: "flex", alignItems: "center", gap: 22, padding: "0 30px", fontWeight: 600, fontSize: 30, color: INK, opacity: Math.min(1, e * 1.4), transform: s && wrong ? `translateX(${Math.sin(f * 1.6) * 6 * (1 - lin(f, 1014, 1030))}px)` : undefined }}>
              <Check on={s ? 1 : 0} c={tone === "red" ? RED : tone === "green" ? GREEN : BLUE} />
              <div style={{ flex: 1 }}>{t}</div>
              {s && (wrong || right) ? <div style={{ padding: "6px 16px", border: `3px solid ${right ? GREEN : RED}`, borderRadius: 14, fontWeight: 900, fontSize: 22, letterSpacing: "0.08em", color: right ? GLIP : RED, transform: `rotate(-8deg) scale(${sp(wrong ? 1014 : 1088, 10, 240)})` }}>{right ? "МИФ" : "ПРАВДА"}</div> : null}
            </div>); })}
        </div>); })()}

      {/* ===== G: chat story */}
      {(() => { const w = win(S.G, S.END); if (!w.on) return null; const lf = f - S.G;
        const opts = ["Советы знакомых, которые каждый выбирает по желанию.", "Общие правила, которые защищает государство.", "Мнение одного человека о том, как жить остальным."];
        const sel = f >= 1252 ? 1 : -1; const ok = f >= 1277;
        const b = (t: number) => lin(lf, t, t + 12);
        return (
        <div style={{ position: "absolute", inset: 0, opacity: w.o, transform: `translateX(${w.x}px)` }}>
          <div style={{ position: "absolute", left: CX, top: 116, fontWeight: 900, fontSize: 46, color: INK }}>Прочитайте историю</div>
          <div style={{ position: "absolute", left: CX, top: 190, fontWeight: 600, fontSize: 27, color: INK, opacity: b(6) }}>Утро в махалле Юнусабад. Нодира и Жасур идут к остановке.</div>
          {[[OWL_READ, "Нодира, ты изучаешь право. Что это такое?", 250, 18], [OWL_COOL, "Право это общие правила, которые признаёт и защищает государство.", 340, 40]].map(([o, t, y, at]) => (
            <div key={t as string} style={{ position: "absolute", left: CX, top: y as number, display: "flex", alignItems: "center", gap: 18, opacity: b(at as number), transform: `translateY(${(1 - b(at as number)) * 14}px)` }}>
              <Img src={o as string} style={{ width: 62, height: 70, objectFit: "contain" }} />
              <div style={{ maxWidth: CW - 90, padding: "14px 22px", borderRadius: 18, background: BLUE, boxShadow: "0 4px 0 #1899d6", color: "#fff", fontWeight: 800, fontSize: 25, lineHeight: 1.35 }}>{t as string}</div>
            </div>
          ))}
          <div style={{ position: "absolute", left: CX, top: 470, fontWeight: 800, fontSize: 28, color: INK, opacity: b(62) }}>Что такое право по словам Нодиры?</div>
          {opts.map((t, i) => { const s = i === sel; const e = sp(S.G + 70 + i * 6, 14, 180); return (
            <div key={t} style={{ position: "absolute", left: CX, top: 530 + i * 115, width: CW, height: 100, ...card(0, s ? (ok ? "green" : "blue") : "plain"), display: "flex", alignItems: "center", gap: 22, padding: "0 28px", fontWeight: 600, fontSize: 27, color: s && ok ? GLIP : INK, opacity: Math.min(1, e * 1.4) }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, border: `3px solid ${s ? (ok ? GREEN : BLUE) : "#cfd3d8"}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20, color: s ? (ok ? GLIP : BLUE) : "#7c8593", flexShrink: 0 }}>{i + 1}</div>{t}
            </div>); })}
        </div>); })()}

      {/* bottom buttons */}
      <div style={{ position: "absolute", left: CX, top: BTN_Y, width: 100, height: BTN_H, borderRadius: 18, background: "#ddf4ff", border: "3px solid #84d8ff", boxShadow: `0 ${5 - 4 * press(f, CB.book)}px 0 #1cb0f6`, transform: `translateY(${press(f, CB.book) * 4}px)`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Img src={staticFile("site/stickers_module.webp")} style={{ width: 62, height: 62, objectFit: "contain" }} />
      </div>
      <div style={{ position: "absolute", left: CX + 116, top: BTN_Y, width: CW - 116, height: BTN_H, borderRadius: 18, background: mainOn ? GREEN : "#e5e5e5", boxShadow: `0 ${5 - 4 * mainDown}px 0 ${mainOn ? GLIP : "#cfcfcf"}`, transform: `translateY(${mainDown * 4}px)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 30, letterSpacing: "0.08em", color: mainOn ? "#fff" : "#afafaf" }}>{mainLabel}</div>

      {/* result bands */}
      {f >= 522 && f < 560 ? <Result o={lin(f, 522, 534, 0, 1, OUTE) * (1 - lin(f, 550, 560))} ok title="Отлично!" sub="+10 XP" btn="ДАЛЕЕ" /> : null}
      {f >= 694 && f < 760 ? <Result o={lin(f, 694, 706, 0, 1, OUTE) * (1 - lin(f, 750, 760))} ok title="Ура!" sub="+12 XP" btn="ПРОДОЛЖИТЬ" btnDown={press(f, 745)} /> : null}
      {f >= 942 && f < 960 ? <Result o={lin(f, 942, 950, 0, 1, OUTE) * (1 - lin(f, 954, 960))} ok title="Все пары верно!" sub="+15 XP" btn="ДАЛЕЕ" /> : null}
      {f >= 1014 && f < 1046 ? <Result o={lin(f, 1014, 1026, 0, 1, OUTE) * (1 - lin(f, 1036, 1046))} ok={false} title="Неверно" sub="Это правда, ищите ошибку" btn="ПОНЯТНО" /> : null}
      {f >= 1088 && f < 1130 ? <Result o={lin(f, 1088, 1100, 0, 1, OUTE) * (1 - lin(f, 1120, 1130))} ok title="Верно!" sub="+12 XP" btn="ДАЛЕЕ" /> : null}
      {[522, 694, 942, 1088, 1277].map((t) => <Confetti key={t} at={t} />)}
      {f >= 1277 ? <Result o={lin(f, 1277, 1290, 0, 1, OUTE)} ok title="Ура! Урок пройден" sub="+50 XP" btn="ПРОДОЛЖИТЬ" /> : null}

      {/* the Constitution opens from the book button, right inside the lesson */}
      {(() => { const o = lin(f, CB.book + 4, CB.book + 22, 0, 1, OUTE) * (1 - lin(f, CB.bookX + 2, CB.bookX + 16, 0, 1, IOE)); if (o <= 0.001) return null; return (
        <div style={{ position: "absolute", left: 1190, top: 60, width: 700, height: 990, borderRadius: 24, background: "#fff", boxShadow: "0 30px 90px rgba(13,22,48,0.25)", border: "2px solid #eef0f3", transform: `translateX(${(1 - o) * 760}px)`, zIndex: 30, overflow: "hidden" }}>
          <div style={{ height: 96, display: "flex", alignItems: "center", padding: "0 26px", borderBottom: "2px solid #eef0f3" }}>
            <div style={{ flex: 1, fontWeight: 800, fontSize: 30, color: INK }}>Конституция</div>
            <div style={{ width: 62, height: 62, borderRadius: 14, background: BLUE, boxShadow: "0 4px 0 #1899d6", display: "flex", alignItems: "center", justifyContent: "center", transform: `translateY(${press(f, CB.bookX) * 3}px)` }}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg></div>
          </div>
          <div style={{ margin: "14px 16px 0", height: 86, borderRadius: 14, background: BLUE, display: "flex", color: "#fff" }}>
            <div style={{ flex: 1, padding: "14px 20px", borderRight: "2px solid rgba(255,255,255,0.35)" }}><div style={{ fontWeight: 800, fontSize: 15, letterSpacing: "0.12em", opacity: 0.85 }}>ВЫБЕРИТЕ ЗАКОН</div><div style={{ fontWeight: 900, fontSize: 24, whiteSpace: "nowrap" }}>Конституция Республики</div></div>
            <div style={{ width: 250, padding: "14px 20px" }}><div style={{ fontWeight: 800, fontSize: 15, letterSpacing: "0.12em", opacity: 0.85 }}>ЧАСТЬ 1 ИЗ 10</div><div style={{ fontWeight: 900, fontSize: 24 }}>СТАТЬЯ 1</div></div>
          </div>
          <div style={{ margin: "14px 16px 0", height: 58, borderRadius: 14, border: `3px solid ${BLUE}`, display: "flex", alignItems: "center", gap: 12, padding: "0 18px", color: "#9aa1ab", fontWeight: 600, fontSize: 22 }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.8" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>Поиск по тексту закона</div>
          <div style={{ margin: "20px 16px 0", border: "2px solid #eef0f3", padding: "26px 36px", fontFamily: UI }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "flex-end", fontWeight: 800, fontSize: 20, color: "#2e9d3a" }}>
              <svg width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#2e9d3a" /><path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>Документ действует
            </div>
            <div style={{ marginTop: 22, textAlign: "center", fontWeight: 900, fontSize: 28, color: "#1a237e" }}>КОНСТИТУЦИЯ РЕСПУБЛИКИ УЗБЕКИСТАН</div>
            <div style={{ marginTop: 6, textAlign: "center", fontWeight: 600, fontSize: 22, color: "#5d6470" }}>30.04.2023</div>
            <div style={{ marginTop: 26, fontWeight: 900, fontSize: 28, color: "#1a237e" }}>Статья 1.</div>
            {[ART.ru.p1, ART.ru.p2, "Государство выражает волю народа, служит его интересам."].map((t, i) => <div key={i} style={{ marginTop: 12, fontWeight: 500, fontSize: 25, lineHeight: 1.5, color: "#2b2b2b", textAlign: "justify", textIndent: 50 }}>{t}</div>)}
          </div>
        </div>); })()}

      {/* coming out of the green "НАЧАТЬ" flood of the lesson path */}
      <AbsoluteFill style={{ background: GREEN, opacity: 1 - lin(f, 0, 18), pointerEvents: "none" }} />
      {f >= 14 && f < S.END - 20 ? <div style={{ position: "absolute", inset: 0, zIndex: 50 }}><Pointer x={px} y={py} down={down} op={lin(f, 14, 26) * (1 - lin(f, S.END - 34, S.END - 20))} /></div> : null}
      </AbsoluteFill>
      <TopLine key={ci} a={CAPS[ci][1]} b={CAPS[ci][2] || undefined} at={CAPS[ci][0] + 4} />
    </AbsoluteFill>
  );
};

/** Two more lesson games on the same page: "find the term" (definition -> pick the word) and "solve the case" (type an answer, AI checks it). */
export const LessonMore: React.FC = () => {
  const f = useFrame();
  const sp = useSp();
  const H_END = 220, END = 893;
  const PICK = 110, CHK1 = 142, NEXT = 192;
  const OPEN = 268, READ0 = 316, READ1 = 540, SCR0 = 548, SCR1 = 600, ANS = 606, CHK2 = 680, OK2 = 690;
  const win = (a: number, b: number) => { const i = lin(f, a, a + 14), o = b < END ? lin(f, b - 12, b) : 0; return { o: i * (1 - o), x: (1 - i) * 70 - o * 70, on: f >= a - 1 && f < b + 1 }; };
  // camera over the page: read the case up close, back out, then move in on the check button
  const ck = [0, OPEN + 30, READ0, READ1, ANS + 10, CHK2 - 30, CHK2 + 6, OK2, OK2 + 30];
  const cam = (v: number[]) => interpolate(f, ck, v, { ...cl, easing: IOE });
  const cx = cam([960, 960, 1080, 1080, 960, 960, 1100, 1100, 960]);
  const cy = cam([540, 540, 330, 560, 540, 540, 840, 840, 540]);
  const cs = cam([1, 1, 1.42, 1.42, 1, 1, 1.25, 1.25, 1]);
  const scroll = lin(f, SCR0, SCR1, 0, 330, IOE);
  const clicks: [number, number, number][] = [[PICK, CX + 665, 560], [CHK1, MAIN_X, BTN_Y + 42], [NEXT, CX + CW - 150, 978], [OPEN, CX + CW / 2, 100 + 10 + 80 + 250 - 50], [CHK2, MAIN_X, BTN_Y + 42]];
  const pk = [10, ...clicks.flatMap(([t]) => [t - 12, t + 8]), END];
  const px = interpolate(f, pk, [1500, ...clicks.flatMap(([, x]) => [x - 4, x - 4]), 1500], { ...cl, easing: IOE });
  const py = interpolate(f, pk, [900, ...clicks.flatMap(([, , y]) => [y - 4, y - 4]), 900], { ...cl, easing: IOE });
  const hideCursor = f > OPEN + 20 && f < CHK2 - 34;
  const down = Math.max(...clicks.map(([t]) => press(f, t)));
  const prog = 0.5 + lin(f, CHK1, CHK1 + 20, 0, 0.25, OUTE) + lin(f, OK2, OK2 + 20, 0, 0.25, OUTE);
  const step = f < H_END ? 0 : 1;
  const mainOn = (step === 0 && f >= PICK + 2) || (step === 1 && f >= ANS);
  const mainDown = Math.max(press(f, CHK1), press(f, CHK2));
  const CAPS: [number, string, string][] = [[0, "Найди", "термин."], [H_END, "Реши казус,", "как на экзамене."]];
  let ci = 0; CAPS.forEach(([t], i) => { if (f >= t) ci = i; });
  const capEnd = ci + 1 < CAPS.length ? CAPS[ci + 1][0] : END + 60;
  const TERMS = ["Право", "Ответственность", "Норма", "Договор"];
  const CASE = [
    "Гражданин Каримов купил в магазине «Техно-Плюс» смартфон за 6 500 000 сум с гарантией 12 месяцев.",
    "Через 9 дней телефон перестал включаться.",
    "Каримов вернулся в магазин с чеком и гарантийным талоном и потребовал заменить товар.",
    "Продавец отказал: «Телефон упал», хотя следов повреждений на корпусе нет, и предложил платный ремонт за 800 000 сум.",
    "Каримов направил письменную претензию, но ответа не получил.",
  ];
  const QS = ["Какие права есть у Каримова?", "Кто должен доказать, что недостаток возник по вине покупателя?", "Что грозит продавцу за отказ?"];
  const ANSW = ["Недостаток выявлен в гарантийный срок, поэтому Каримов вправе потребовать замену товара, бесплатный ремонт, уменьшение цены или возврат денег.", "Доказать вину покупателя должен продавец, например через экспертизу товара.", "За отказ и просрочку продавец платит неустойку, а Каримов может обратиться в суд и потребовать возмещения убытков."];
  const open = lin(f, OPEN + 2, OPEN + 30, 0, 1, OUTE);
  const sent = f < READ0 || f > READ1 ? -1 : Math.min(CASE.length + 2, Math.floor(lin(f, READ0, READ1, 0, CASE.length + 3, Easing.linear)));
  return (
    <AbsoluteFill style={{ background: "#fff", overflow: "hidden", fontFamily: UI }}>
      <AbsoluteFill style={{ transformOrigin: "50% 0", transform: "translateY(104px) scale(0.9)" }}>
      <AbsoluteFill style={{ transformOrigin: "0 0", transform: `translate(${960 - cs * cx}px, ${540 - cs * cy}px) scale(${cs})` }}>
      <svg style={{ position: "absolute", left: CX - 4, top: 46 }} width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#afafaf" strokeWidth="2.6" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
      <div style={{ position: "absolute", left: CX + 64, top: 56, width: CW - 160, height: 22, borderRadius: 11, background: "#e5e5e5", overflow: "hidden" }}>
        <div style={{ width: `${Math.min(1, prog) * 100}%`, height: "100%", borderRadius: 11, background: GREEN }} />
      </div>
      <div style={{ position: "absolute", left: CX + CW - 80, top: 40, display: "flex", alignItems: "center", gap: 8 }}>
        <Img src={staticFile("real/heart-red.webp")} style={{ width: 46, height: 46 }} /><div style={{ fontWeight: 900, fontSize: 30, color: RED }}>4</div>
      </div>

      {(() => { const w = win(0, H_END); if (!w.on) return null; return (
        <div style={{ position: "absolute", inset: 0, opacity: w.o, transform: `translateX(${w.x}px)` }}>
          <div style={{ position: "absolute", left: CX, top: 140, fontWeight: 900, fontSize: 50, color: INK }}>Найдите термин</div>
          <div style={{ position: "absolute", left: CX, top: 230, display: "flex", gap: 24, alignItems: "center", opacity: lin(f, 6, 20) }}>
            <Img src={OWL_READ} style={{ width: 120, objectFit: "contain" }} />
            <div style={{ width: CW - 150, padding: "20px 26px", border: "3px solid #e5e5e5", borderRadius: 20, fontWeight: 700, fontSize: 30, lineHeight: 1.4, color: INK }}>Последствие нарушения закона, которое применяет государство. Как это называется?</div>
          </div>
          {TERMS.map((t, i) => { const s = i === 1 && f >= PICK + 2; const ok = s && f >= CHK1 + 2; const e = sp(16 + i * 5, 14, 180); return (
            <div key={t} style={{ position: "absolute", left: CX + (i % 2) * 450, top: 470 + Math.floor(i / 2) * 140, width: 430, height: 110, ...card(0, ok ? "green" : s ? "blue" : "plain"), display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 32, color: ok ? GLIP : s ? "#1899d6" : INK, opacity: Math.min(1, e * 1.4) }}>{t}</div>); })}
        </div>); })()}

      {(() => { const w = win(H_END, END); if (!w.on) return null; const lf = f - H_END;
        const caseH = 250 + 330 * open;
        return (
        <div style={{ position: "absolute", inset: 0, opacity: w.o, transform: `translateX(${w.x}px)` }}>
          {/* scrolling column between the top bar and the buttons */}
          <div style={{ position: "absolute", left: 0, right: 0, top: 100, height: BTN_Y - 120, overflow: "hidden", WebkitMaskImage: "linear-gradient(180deg, transparent, #000 30px, #000 calc(100% - 30px), transparent)", maskImage: "linear-gradient(180deg, transparent, #000 30px, #000 calc(100% - 30px), transparent)" }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 10 - scroll }}>
              <div style={{ position: "absolute", left: CX, top: 0, fontWeight: 900, fontSize: 48, color: INK }}>Решите казус</div>
              <div style={{ position: "absolute", left: CX, top: 80, width: CW, height: caseH, padding: "22px 30px", borderRadius: 20, background: "#fff", border: "3px solid #ffc800", boxSizing: "border-box", overflow: "hidden", opacity: lin(lf, 6, 20) }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ flex: 1, fontWeight: 900, fontSize: 20, letterSpacing: "0.1em", color: "#d49a00" }}>КАЗУС · ЗАЩИТА ПРАВ ПОТРЕБИТЕЛЕЙ</div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: "#9aa1ab" }}>уровень: экзамен</div>
                </div>
                <div style={{ marginTop: 12, fontWeight: 600, fontSize: 25, lineHeight: 1.5, color: INK, textAlign: "justify" }}>
                  {CASE.map((t, i) => <span key={i} style={{ background: i === sent ? "rgba(255,200,0,0.32)" : "transparent", borderRadius: 6, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone", padding: "0 2px" }}>{t} </span>)}
                </div>
                <div style={{ marginTop: 16, fontWeight: 900, fontSize: 25, color: INK }}>Вопросы:</div>
                {QS.map((q, i) => (
                  <div key={q} style={{ marginTop: 8, display: "flex", gap: 14, alignItems: "baseline", fontWeight: 700, fontSize: 25, lineHeight: 1.4, color: INK, background: sent === CASE.length + i ? "rgba(255,200,0,0.32)" : "transparent", borderRadius: 8, padding: "0 4px" }}>
                    <div style={{ width: 34, height: 34, borderRadius: 17, background: "#fff4cc", color: "#c48a00", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 19, flexShrink: 0, transform: "translateY(4px)" }}>{i + 1}</div>{q}
                  </div>
                ))}
                {open < 0.99 ? <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 150, background: "linear-gradient(180deg, rgba(255,255,255,0), #fff 50%)", opacity: 1 - open, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 22 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 26px", borderRadius: 14, border: "3px solid #ffc800", boxShadow: "0 4px 0 #e0a800", background: "#fff", fontWeight: 900, fontSize: 22, letterSpacing: "0.04em", color: "#c48a00", transform: `translateY(${press(f, OPEN) * 4}px)` }}>РАСКРЫТЬ КАЗУС <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c48a00" strokeWidth="3" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg></div>
                </div> : null}
              </div>
              <div style={{ position: "absolute", left: CX, top: 80 + caseH + 28, fontWeight: 900, fontSize: 20, letterSpacing: "0.1em", color: BLUE, opacity: lin(lf, 20, 34) }}>ВАШ ОТВЕТ</div>
              <div style={{ position: "absolute", left: CX, top: 80 + caseH + 60, width: CW, minHeight: 300, borderRadius: 18, border: `3px solid ${f >= OK2 ? GREEN : f >= ANS ? BLUE : "#e5e5e5"}`, background: f >= OK2 ? "#f1ffe6" : "#fff", boxSizing: "border-box", padding: "18px 24px", opacity: lin(lf, 24, 38) }}>
                {f < ANS ? <div style={{ fontWeight: 600, fontSize: 24, color: "#afafaf" }}>Напишите решение казуса…</div> : ANSW.map((t, i) => (
                  <div key={i} style={{ marginTop: i ? 12 : 0, display: "flex", gap: 14, alignItems: "baseline", fontWeight: 600, fontSize: 23, lineHeight: 1.45, color: INK, opacity: lin(f, ANS + i * 14, ANS + i * 14 + 12), transform: `translateY(${(1 - lin(f, ANS + i * 14, ANS + i * 14 + 12)) * 10}px)` }}>
                    <div style={{ width: 32, height: 32, borderRadius: 16, background: "#ddf4ff", color: "#1899d6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18, flexShrink: 0, transform: "translateY(4px)" }}>{i + 1}</div>{t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>); })()}

      <div style={{ position: "absolute", left: CX, top: BTN_Y, width: 100, height: BTN_H, borderRadius: 18, background: "#ddf4ff", border: "3px solid #84d8ff", boxShadow: "0 5px 0 #1cb0f6", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Img src={staticFile("site/stickers_module.webp")} style={{ width: 62, height: 62, objectFit: "contain" }} />
      </div>
      <div style={{ position: "absolute", left: CX + 116, top: BTN_Y, width: CW - 116, height: BTN_H, borderRadius: 18, background: mainOn ? GREEN : "#e5e5e5", boxShadow: `0 ${5 - 4 * mainDown}px 0 ${mainOn ? GLIP : "#cfcfcf"}`, transform: `translateY(${mainDown * 4}px)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 30, letterSpacing: "0.08em", color: mainOn ? "#fff" : "#afafaf" }}>ПРОВЕРИТЬ</div>
      {f >= CHK1 + 2 && f < H_END ? <Result o={lin(f, CHK1 + 2, CHK1 + 14, 0, 1, OUTE) * (1 - lin(f, H_END - 14, H_END - 4))} ok title="Верно!" sub="+10 XP" btn="ДАЛЕЕ" btnDown={press(f, NEXT)} /> : null}
      {f >= OK2 ? <Result o={lin(f, OK2, OK2 + 12, 0, 1, OUTE)} ok title="Ура! Казус решён верно" sub="+50 XP" btn="ПРОДОЛЖИТЬ" /> : null}
      {f >= 10 && !hideCursor && f < END - 20 ? <div style={{ position: "absolute", inset: 0, zIndex: 50 }}><Pointer x={px} y={py} down={down} op={lin(f, 10, 20) * (1 - lin(f, END - 34, END - 20))} /></div> : null}
      </AbsoluteFill>
      <Confetti at={CHK1 + 2} />
      <Confetti at={OK2} />
      </AbsoluteFill>
      <TopLine key={ci} a={CAPS[ci][1]} b={CAPS[ci][2] || undefined} at={CAPS[ci][0] + 4} />
    </AbsoluteFill>
  );
};
