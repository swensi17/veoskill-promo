import React from "react";
import { tr } from "./i18n";
import { AbsoluteFill, Easing, interpolate, interpolateColors, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow, useCursor, CursorLayer } from "./Master";
import { DemoCam, UI, BLUE, LIP, GREEN, GLIP, RED, CHAR, SWAN, clamp, IO, OUT, SOFT, lin, press, textWidth } from "./Kit7";

// Laws section demos, rebuilt in the site's own style (veoskill laws pages), full frame, no browser box.
const COL = 360; // content column left
const CW = 1200; // content column width
const typeTimes = (text: string, at: number, speed: number) => {
  const t: number[] = [];
  let x = at;
  for (let i = 0; i < text.length; i++) { t.push(x); x += speed * (0.6 + random(`t${text}${i}`) * 0.8) + (text[i] === " " ? speed * 0.6 : 0); }
  return { t, end: x };
};
export const typedEnd = (text: string, at: number, speed: number) => typeTimes(text, at, speed).end;
/** Letters appear one by one only here — inside an input field, as the user types. */
const Field: React.FC<{ text: string; at: number; speed?: number; size: number; color?: string; weight?: number }> = ({ text, at, speed = 3, size, color = "#1f2a37", weight = 700 }) => {
  const f = useCurrentFrame();
  const { t, end } = typeTimes(text, at, speed);
  const n = t.filter((x) => f >= x).length;
  const caret = f < end + 4 || Math.floor(f / 16) % 2 === 0;
  return (
    <span style={{ fontFamily: UI, fontSize: size, fontWeight: weight, color, whiteSpace: "pre" }}>
      {text.slice(0, n)}
      <span style={{ display: "inline-block", width: 3, height: size * 1.05, background: BLUE, marginLeft: 2, verticalAlign: "text-bottom", opacity: caret ? 1 : 0 }} />
    </span>
  );
};
const Bot: React.FC<{ size?: number; color?: string }> = ({ size = 34, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="7" width="16" height="12" rx="3" /><path d="M12 3v4M9 12h.01M15 12h.01M9.5 15.5h5M2 12v3M22 12v3" /></svg>
);
const Spinner: React.FC<{ size?: number; color?: string }> = ({ size = 40, color = BLUE }) => {
  const f = useCurrentFrame();
  return <svg width={size} height={size} viewBox="0 0 50 50" style={{ transform: `rotate(${f * 8}deg)` }}><circle cx="25" cy="25" r="20" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeDasharray="80 50" /></svg>;
};
const Toast: React.FC<{ text: string; at: number; until?: number }> = ({ text, at, until = 9999 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping: 18, stiffness: 140 } }) * (1 - lin(f, until, until + 16, 0, 1));
  if (f < at) return null;
  return (
    <div style={{ position: "absolute", left: 960 - 280, top: 820, width: 560, height: 76, borderRadius: 22, background: "#1f2a37", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 14, fontFamily: UI, fontWeight: 800, fontSize: 28, transform: `translateY(${(1 - s) * 60}px)`, opacity: s, zIndex: 40 }}>
      <div style={{ width: 36, height: 36, borderRadius: 18, background: GREEN, display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></div>
      {text}
    </div>
  );
};
const Header: React.FC = () => (
  <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 96, borderBottom: `2px solid ${SWAN}`, background: "#fff", display: "flex", alignItems: "center", padding: `0 ${COL}px`, boxSizing: "border-box", gap: 40, fontFamily: UI }}>
    <div style={{ fontWeight: 900, fontSize: 40, color: BLUE, textShadow: `0 3px 0 ${LIP}` }}>veoskill</div>
    {[tr("Законы"), tr("Уроки"), tr("Статистика")].map((t, i) => <div key={t} style={{ fontWeight: 800, fontSize: 22, letterSpacing: "0.06em", color: i === 0 ? BLUE : "#8a98a6" }}>{t.toUpperCase()}</div>)}
  </div>
);

// ---------------- the article page used by several demos ----------------
export const ART = {
  ru: { t: "Статья 1.", p1: "Узбекистан — суверенное, демократическое, правовое, социальное и светское государство с республиканской формой правления.", p2: "Названия государства «Республика Узбекистан» и «Узбекистан» равнозначны." },
  uz: { t: "1-modda.", p1: "O‘zbekiston — boshqaruvning respublika shakliga ega bo‘lgan suveren, demokratik, huquqiy, ijtimoiy va dunyoviy davlat.", p2: "Davlatning «O‘zbekiston Respublikasi» va «O‘zbekiston» degan nomlari bir ma’noga ega." },
  en: { t: "Article 1.", p1: "Uzbekistan is a sovereign, democratic, law-governed, social and secular state with a republican form of government.", p2: "The names “Republic of Uzbekistan” and “Uzbekistan” are equivalent." },
};
const CRUMB = { ru: "Законы › Конституция Республики Узбекистан", uz: "Qonunlar › O‘zbekiston Respublikasi Konstitutsiyasi", en: "Laws › Constitution of the Republic of Uzbekistan" };
const META = { ru: "Конституция Республики Узбекистан · Дата: 30.04.2023 · Действует", uz: "O‘zbekiston Respublikasi Konstitutsiyasi · Sana: 30.04.2023 · Amalda", en: "Constitution of the Republic of Uzbekistan · Date: 30.04.2023 · In force" };
const ICON_Y = 222;
export const ICONS = { bot: 1356, heart: 1430, copy: 1504 };
const P2_Y = 480; // top of the second paragraph line
const FS = 32;
type PageProps = { lang?: "ru" | "uz" | "en"; botState?: "idle" | "hover" | "busy" | "on"; heart?: number; sel?: number; hl?: string; arrowInSel?: boolean; pin?: number; langFade?: number; offline?: React.ReactNode; tabs?: number };
export const ArticlePage: React.FC<PageProps> = ({ lang = "ru", botState = "idle", heart = 0, sel = 0, hl = "rgba(28,176,246,0.22)", arrowInSel, pin = 0, langFade = 0, offline, tabs }) => {
  const a = ART[lang];
  const botBg = botState === "on" || botState === "busy" ? BLUE : botState === "hover" ? "#ddf4ff" : "#fff";
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <Header />
      <div style={{ position: "absolute", left: COL, top: 140, fontFamily: UI, fontSize: 24, color: BLUE }}>{CRUMB[lang]}</div>
      <div style={{ position: "absolute", left: COL, top: 186, fontFamily: UI, fontWeight: 900, fontSize: 60, color: CHAR, opacity: 1 - langFade, filter: langFade > 0 ? `blur(${langFade * 6}px)` : undefined }}>{a.t}</div>
      {/* action chips: AI robot, favourite heart, copy */}
      <div style={{ position: "absolute", left: ICONS.bot - 30, top: ICON_Y - 30, width: 60, height: 60, borderRadius: 18, border: `2px solid ${botState === "idle" ? SWAN : BLUE}`, background: botBg, boxShadow: `0 4px 0 ${botState === "idle" ? SWAN : "#84d8ff"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {botState === "busy" ? <Spinner size={32} color="#fff" /> : <Bot size={34} color={botState === "on" ? "#fff" : BLUE} />}
      </div>
      <div style={{ position: "absolute", left: ICONS.heart - 30, top: ICON_Y - 30, width: 60, height: 60, borderRadius: 18, border: `2px solid ${heart > 0.5 ? "#ffb3b3" : SWAN}`, background: heart > 0.5 ? "#fff0f0" : "#fff", boxShadow: `0 4px 0 ${heart > 0.5 ? "#ffd0d0" : SWAN}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="32" height="32" viewBox="0 0 24 24" style={{ transform: `scale(${1 + Math.sin(Math.min(1, heart) * Math.PI) * 0.35})` }}><path d="M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9z" fill={heart > 0.3 ? RED : "none"} stroke={heart > 0.3 ? RED : "#8a98a6"} strokeWidth="2" strokeLinejoin="round" /></svg>
      </div>
      <div style={{ position: "absolute", left: ICONS.copy - 30, top: ICON_Y - 30, width: 60, height: 60, borderRadius: 18, border: `2px solid ${SWAN}`, boxShadow: `0 4px 0 ${SWAN}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8a98a6" strokeWidth="2" strokeLinecap="round"><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M5 16V5a1 1 0 0 1 1-1h10" /></svg>
      </div>
      <div style={{ position: "absolute", left: COL, top: 290, fontFamily: UI, fontSize: 24, color: "#8a98a6" }}>{META[lang]}</div>
      {tabs !== undefined ? (
        <div style={{ position: "absolute", left: COL, top: 640, display: "flex", alignItems: "center", gap: 14, fontFamily: UI }}>
          <span style={{ fontWeight: 800, fontSize: 25, color: "#8a98a6", marginRight: 6 }}>{tr("ЯЗЫК ТЕКСТА")}</span>
          {[tr("Русский"), "O‘zbekcha", "English"].map((l, i) => <div key={l} style={{ padding: "12px 26px", borderRadius: 16, background: i === tabs ? BLUE : "#fff", border: `2px solid ${i === tabs ? BLUE : SWAN}`, boxShadow: `0 4px 0 ${i === tabs ? LIP : SWAN}`, fontWeight: 900, fontSize: 24, color: i === tabs ? "#fff" : "#6b7785" }}>{l}</div>)}
        </div>
      ) : null}
      {offline}
      <div style={{ position: "absolute", left: COL, top: 350, width: CW + 140, fontFamily: UI, fontWeight: 600, fontSize: FS, lineHeight: 1.62, color: CHAR, opacity: 1 - langFade, filter: langFade > 0 ? `blur(${langFade * 6}px)` : undefined }}>
        <div>{a.p1}</div>
        <div style={{ marginTop: 18 }}>
          <span style={{ position: "relative", padding: "3px 0", backgroundImage: `linear-gradient(${hl}, ${hl})`, backgroundRepeat: "no-repeat", backgroundSize: `${sel * 100}% 100%` }}>
            {a.p2}
            {arrowInSel ? <span style={{ position: "absolute", left: `${sel * 100}%`, top: FS * 0.75, zIndex: 50 }}><Arrow down={0} /></span> : null}
          </span>
          {pin > 0.01 ? (
            <span style={{ display: "inline-flex", marginLeft: 16, width: 50, height: 50, borderRadius: 15, background: "#fff4c2", border: "2px solid #ffd43b", boxShadow: "0 4px 0 #f2c200", alignItems: "center", justifyContent: "center", verticalAlign: "middle", transform: `scale(${pin})` }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#b58900" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h11l3 3v13H5zM8 10h8M8 14h6" /></svg>
            </span>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};
const P2W = () => textWidth(ART.ru.p2, `600 ${FS}px NunitoC`);
const P2_TIP_Y = P2_Y + FS * 1.1;

// ---------------- 1. Search ----------------
const CODES = [tr("Конституция"), tr("Гражданский кодекс"), tr("Уголовный кодекс"), tr("Трудовой кодекс"), tr("Семейный кодекс"), tr("Налоговый кодекс"), tr("Жилищный кодекс"), tr("Земельный кодекс")];
const RESULTS: [string, string][] = [
  [tr("Конституция Республики Узбекистан · Статья 1"), tr("Узбекистан — суверенное, демократическое, правовое, социальное и светское государство…")],
  [tr("Конституция Республики Узбекистан · Статья 17"), tr("…государство осуществляет свою деятельность в интересах человека и общества…")],
  [tr("Закон «О Конституционном суде Республики Узбекистан»"), tr("…защита основ конституционного строя суверенного государства…")],
]
export const DemoSearch: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const Q = tr("суверенное государство");
  const T0 = 70;
  const end = typedEnd(Q, T0, 3.2);
  const BUSY = Math.round(end + 12), DONE = BUSY + 48, CLICK = DONE + 120;
  const cur = useCursor([{ at: T0 - 20, x: 700, y: 236 }, { at: CLICK, x: 880, y: 470 }], [1300, 900], [1100, 760]);
  const results = f >= DONE;
  return (
    <DemoCam from={{ s: 1.28, x: 760, y: 260 }} settle={110} later={[{ at: DONE + 20, s: 1, x: 960, y: 540 }, { at: CLICK + 60, s: 1.08, x: 900, y: 500 }]}>
      <AbsoluteFill style={{ background: "#f7fbff" }}>
        <Header />
        <div style={{ position: "absolute", left: COL, top: 190, width: CW, height: 92, borderRadius: 46, background: "#fff", border: `3px solid ${f > T0 - 16 ? BLUE : SWAN}`, boxShadow: `0 6px 0 ${f > T0 - 16 ? "#84d8ff" : SWAN}`, display: "flex", alignItems: "center", gap: 20, padding: "0 34px", boxSizing: "border-box" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.6" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
          {f < T0 - 4 ? <span style={{ fontFamily: UI, fontSize: 34, fontWeight: 600, color: "#a7b1bc" }}>{tr("Поиск по всей базе законов")}</span> : <Field text={Q} at={T0} speed={3.2} size={38} />}
          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            {[tr("В этом акте"), tr("Вся база")].map((t, i) => <div key={t} style={{ padding: "10px 20px", borderRadius: 14, background: i === 1 ? BLUE : "#fff", border: `2px solid ${i === 1 ? BLUE : SWAN}`, fontFamily: UI, fontWeight: 800, fontSize: 24, color: i === 1 ? "#fff" : "#8a98a6" }}>{t}</div>)}
          </div>
        </div>
        {/* before results: the catalogue of codes */}
        <div style={{ position: "absolute", left: COL, top: 330, width: CW, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 22, opacity: 1 - lin(f, BUSY, BUSY + 16, 0, 1), filter: f > BUSY ? `blur(${lin(f, BUSY, BUSY + 16, 0, 6)}px)` : undefined }}>
          {CODES.map((c) => (
            <div key={c} style={{ height: 170, borderRadius: 22, background: "#fff", border: `2px solid ${SWAN}`, boxShadow: `0 5px 0 ${SWAN}`, padding: 22, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between", fontFamily: UI }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="1.8" strokeLinecap="round"><path d="M6 3h9l3 3v15H6zM9 9h6M9 13h6M9 17h4" /></svg>
              <div style={{ fontWeight: 800, fontSize: 24, color: "#1d2a6b" }}>{c}</div>
            </div>
          ))}
        </div>
        {f >= BUSY && f < DONE ? (
          <div style={{ position: "absolute", left: COL, top: 340, display: "flex", alignItems: "center", gap: 18, fontFamily: UI, fontWeight: 700, fontSize: 28, color: "#8a98a6" }}><Spinner size={36} />{tr("Ищем, подождите пару секунд…")}</div>
        ) : null}
        {results ? (
          <div style={{ position: "absolute", left: COL, top: 320, width: CW, fontFamily: UI }}>
            <div style={{ fontWeight: 800, fontSize: 26, letterSpacing: "0.08em", color: "#8a98a6", opacity: lin(f, DONE, DONE + 12, 0, 1) }}>{tr("НАЙДЕНО АКТОВ: 3")}</div>
            {RESULTS.map(([t, snip], i) => {
              const s = spring({ frame: f - DONE - 4 - i * 8, fps, config: { damping: 18, stiffness: 130 } });
              const hit = i === 0 && f > CLICK - 14;
              const pr = i === 0 ? press(f, CLICK) : 0;
              return (
                <div key={t} style={{ marginTop: 18, borderRadius: 24, border: `2px solid ${hit ? BLUE : SWAN}`, boxShadow: `0 ${5 - pr * 4}px 0 ${hit ? "#84d8ff" : SWAN}`, background: hit ? "#f0faff" : "#fff", padding: "22px 30px", transform: `translateY(${(1 - s) * 30 + pr * 4}px)`, opacity: s }}>
                  <div style={{ fontWeight: 900, fontSize: 30, color: "#1d2a6b" }}>{t}</div>
                  <div style={{ fontSize: 24, color: "#6b7785", marginTop: 8 }}>{snip.split(/(суверен[а-яё]*|государств[а-яё]*)/).map((p, k) => (/^(суверен|государств)/.test(p) ? <span key={k} style={{ background: "#c8f5a8", borderRadius: 5, padding: "0 3px" }}>{p}</span> : p))}</div>
                </div>
              );
            })}
          </div>
        ) : null}
        <CursorLayer c={cur} />
      </AbsoluteFill>
      {/* the clicked result opens the article (the next demo continues on it) */}
      {f > CLICK + 10 ? <AbsoluteFill style={{ opacity: lin(f, CLICK + 10, CLICK + 40, 0, 1, SOFT), transform: `scale(${1.04 - 0.04 * lin(f, CLICK + 10, CLICK + 40, 0, 1, SOFT)})` }}><ArticlePage /></AbsoluteFill> : null}
    </DemoCam>
  );
};

// ---------------- 2. AI explanation (robot button) ----------------
const EXPLAIN: [string, string, string][] = [
  [tr("Коротко"), "#1cb0f6", tr("Узбекистан: независимое демократическое государство, где всё решает закон.")],
  [tr("Простыми словами"), "#58cc02", tr("Первая статья определяет главные основы государства: независимость, выборная власть, подчинение закону и забота о гражданах.")],
  [tr("Пример из жизни"), "#ff9600", tr("Если чиновник нарушил закон, гражданин вправе обжаловать его решение: правовое государство работает для людей.")],
  [tr("Запомните"), "#ce82ff", tr("Названия «Республика Узбекистан» и «Узбекистан» имеют одинаковую силу.")],
  [tr("Термины"), "#ff4b4b", tr("Суверенное значит независимое. Светское: религия отделена от государства.")],
];
export const DemoAI: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const CLICK = 100, HOVER = CLICK - 8, READY = CLICK + 110;
  const cur = useCursor([{ at: CLICK, x: ICONS.bot + 6, y: ICON_Y + 8 }], [1200, 700], [1700, 1000]);
  const tip = lin(f, HOVER - 10, HOVER, 0, 1) * (1 - lin(f, CLICK + 4, CLICK + 12, 0, 1));
  const sheet = spring({ frame: f - CLICK - 10, fps, config: { damping: 20, stiffness: 110 } });
  const busy = f >= CLICK && f < READY;
  const scroll = lin(f, READY + 260, READY + 420, 0, 330, SOFT);
  const botState = f < HOVER - 10 ? "idle" : f < CLICK ? "hover" : busy ? "busy" : "on";
  return (
    <DemoCam from={{ s: 1.14, x: 1060, y: 300 }} settle={0} later={[{ at: CLICK + 4, s: 1.14, x: 1060, y: 300 }, { at: CLICK + 70, s: 1, x: 960, y: 540 }]}>
      <ArticlePage botState={botState} />
      {/* hover hint, exactly the site string */}
      {tip > 0.01 ? <div style={{ position: "absolute", left: ICONS.bot - 260, top: ICON_Y - 104, width: 520, textAlign: "center", padding: "12px 0", borderRadius: 14, background: "#1f2a37", color: "#fff", fontFamily: UI, fontWeight: 700, fontSize: 26, opacity: tip, transform: `translateY(${(1 - tip) * 8}px)` }}>{tr("Объяснить статью с помощью ИИ")}</div> : null}
      {/* the explanation sheet rises from below */}
      <AbsoluteFill style={{ background: `rgba(15,25,40,${0.28 * sheet})` }} />
      <div style={{ position: "absolute", left: 960 - 560, top: 120, width: 1120, height: 960, borderRadius: "34px 34px 0 0", background: "#fff", boxShadow: "0 -20px 80px rgba(10,40,90,0.25)", transform: `translateY(${(1 - sheet) * 980}px)`, overflow: "hidden", fontFamily: UI }}>
        <div style={{ position: "relative", zIndex: 2, background: "#fff", height: 96, display: "flex", alignItems: "center", gap: 18, padding: "0 40px", borderBottom: `2px solid ${SWAN}` }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: BLUE, display: "flex", alignItems: "center", justifyContent: "center" }}><Bot size={32} /></div>
          <div style={{ fontWeight: 900, fontSize: 34, color: CHAR }}>{tr("Объяснение статьи")}</div>
          <div style={{ marginLeft: "auto", fontWeight: 800, fontSize: 22, color: "#8a98a6" }}>{tr("Статья 1")}</div>
        </div>
        {busy ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
            <Spinner size={64} />
            <div style={{ fontWeight: 900, fontSize: 34, color: CHAR }}>{tr("Разбираю статью…")}</div>
            <div style={{ fontWeight: 600, fontSize: 24, color: "#8a98a6" }}>{tr("Это займёт несколько секунд")}</div>
          </div>
        ) : (
          <div style={{ position: "absolute", left: 0, right: 0, top: 96, bottom: 0, overflow: "hidden", WebkitMaskImage: "linear-gradient(to bottom, transparent 0, #000 34px)", maskImage: "linear-gradient(to bottom, transparent 0, #000 34px)" }}><div style={{ padding: "26px 44px", transform: `translateY(${-scroll}px)` }}>
            {EXPLAIN.map(([title, c, txt], i) => {
              const s = lin(f, READY + i * 26, READY + i * 26 + 24, 0, 1, SOFT);
              return (
                <div key={title} style={{ marginBottom: 22, borderRadius: 24, border: `2px solid ${SWAN}`, padding: "22px 28px", opacity: s, transform: `translateY(${(1 - s) * 24}px)` }}>
                  <div style={{ display: "inline-block", padding: "6px 16px", borderRadius: 12, background: `${c}22`, color: c, fontWeight: 900, fontSize: 22, letterSpacing: "0.04em" }}>{title.toUpperCase()}</div>
                  <div style={{ marginTop: 12, fontWeight: i === 1 ? 800 : 600, fontSize: 30, lineHeight: 1.45, color: CHAR }}>{txt}</div>
                </div>
              );
            })}
            <div style={{ fontSize: 25, color: "#8a98a6", opacity: lin(f, READY + 140, READY + 160, 0, 1) }}>{tr("Объяснение подготовлено ИИ и не заменяет консультацию юриста.")}</div>
          </div></div>
        )}
      </div>
      <CursorLayer c={cur} />
    </DemoCam>
  );
};

// ---------------- shared selection + mark menu for notes and test ----------------
const COLORS = ["#ffd43b", "#ff922b", "#ff6b6b", "#f783ac", "#cc5de8", "#4dabf7", "#3bc9db", "#51cf66", "#a9e34b", "#adb5bd"];
const ACTIONS = [tr("Копия"), tr("Заметка"), tr("Как цитату"), tr("Ссылка"), tr("Прочитать"), tr("Тест"), tr("Снять цвет")];
const MENU_X = COL, MENU_Y = P2_Y + 74, MENU_W = 1060;
const colorXY = (i: number) => ({ x: MENU_X + 30 + i * 58 + 22, y: MENU_Y + 24 + 22 });
const actionXY = (i: number) => ({ x: MENU_X + 16 + i * 147 + 73, y: MENU_Y + 104 + 28 });
const MarkMenu: React.FC<{ show: number; colorOn?: boolean; pressColor?: number; pressAction?: [number, number] }> = ({ show, colorOn, pressColor, pressAction }) => {
  const f = useCurrentFrame();
  if (show <= 0.01) return null;
  return (
    <div style={{ position: "absolute", left: MENU_X, top: MENU_Y, width: MENU_W, height: 168, borderRadius: 22, background: "#fff", border: `2px solid ${BLUE}`, boxShadow: "0 24px 60px rgba(10,40,90,0.2)", transformOrigin: "20% 0%", transform: `scale(${0.92 + 0.08 * show})`, opacity: show, zIndex: 20 }}>
      {COLORS.map((c, i) => <div key={c} style={{ position: "absolute", left: 30 + i * 58, top: 24, width: 44, height: 44, borderRadius: 22, background: c, boxShadow: i === 0 && colorOn ? `0 0 0 4px #fff, 0 0 0 7px ${c}` : undefined, transform: `scale(${i === 0 && pressColor ? 1 - press(f, pressColor) * 0.15 : 1})` }} />)}
      <div style={{ position: "absolute", left: 16, right: 16, top: 88, height: 2, background: SWAN }} />
      {ACTIONS.map((a, i) => {
        const pr = pressAction && pressAction[0] === i ? press(f, pressAction[1]) : 0;
        const hot = pressAction && pressAction[0] === i && f > pressAction[1] - 14;
        return <div key={a} style={{ position: "absolute", left: 16 + i * 147, top: 104, width: 140, height: 52, borderRadius: 14, background: hot ? "#ddf4ff" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: UI, fontWeight: 800, fontSize: 24, color: BLUE, transform: `scale(${1 - pr * 0.06})` }}>{a}</div>;
      })}
    </div>
  );
};

// ---------------- 3. Highlight + note ----------------
const NOTE = tr("Спросят на экзамене");
export const DemoNotes: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const D0 = 60, D1 = 130, YEL = 175, NOTEC = 215, T0 = 270;
  const SAVE = Math.round(typedEnd(NOTE, T0, 3) + 22);
  const sel = lin(f, D0, D1, 0, 1, Easing.bezier(0.45, 0, 0.55, 1));
  const drag = f >= D0 - 26 && f < D1 + 8;
  const menu = lin(f, D1 + 6, D1 + 22, 0, 1, SOFT) * (1 - lin(f, NOTEC + 4, NOTEC + 16, 0, 1));
  const yellow = lin(f, YEL + 2, YEL + 20, 0, 1, OUT);
  const hl = interpolateColors(yellow, [0, 1], ["rgba(28,176,246,0.22)", "rgba(255,212,59,0.8)"]);
  const win = spring({ frame: f - NOTEC - 8, fps, config: { damping: 20, stiffness: 120 } }) * (1 - lin(f, SAVE + 70, SAVE + 90, 0, 1));
  const pin = spring({ frame: f - SAVE - 84, fps, config: { damping: 11, stiffness: 200 } });
  const yc = colorXY(0), na = actionXY(1);
  const WX = 960 - 430, WY = 300;
  const cur = useCursor([{ at: YEL, x: yc.x, y: yc.y }, { at: NOTEC, x: na.x, y: na.y }, { at: SAVE, x: WX + 860 - 120, y: WY + 352 }], [COL + P2W(), P2_TIP_Y], [1500, 1000]);
  const pre = f < D0 ? interpolate(f, [D0 - 26, D0], [-120, 0], { ...clamp, easing: IO }) : 0;
  return (
    <DemoCam from={{ s: 1.15, x: COL + 520, y: P2_Y + 20 }} settle={0} tilt={0} later={[{ at: D0, s: 1.15, x: COL + 520, y: P2_Y + 20 }, { at: D1, s: 1.15, x: COL + P2W() - 420, y: P2_Y + 40 }, { at: NOTEC + 30, s: 1, x: 960, y: 540 }, { at: SAVE + 90, s: 1.1, x: 960, y: 470 }]}>
      <ArticlePage sel={sel} hl={hl} pin={pin} />
      {drag ? <div style={{ position: "absolute", left: COL + P2W() * sel + pre, top: P2_TIP_Y - 4, zIndex: 50 }}><Arrow down={0} /></div> : null}
      <MarkMenu show={menu} colorOn={f >= YEL} pressColor={YEL} pressAction={[1, NOTEC]} />
      <AbsoluteFill style={{ background: `rgba(15,25,40,${0.25 * win})` }} />
      {win > 0.01 ? (
        <div style={{ position: "absolute", left: WX, top: WY, width: 860, borderRadius: 30, background: "#fff", boxShadow: "0 40px 90px rgba(10,40,90,0.3)", padding: "32px 38px", boxSizing: "border-box", transform: `translateY(${(1 - win) * 40}px) scale(${0.96 + 0.04 * win})`, opacity: win, fontFamily: UI }}>
          <div style={{ fontWeight: 900, fontSize: 36, color: CHAR }}>{tr("Заметка к выделенному")}</div>
          <div style={{ marginTop: 16, padding: "12px 18px", borderRadius: 14, background: "#fff8d6", borderLeft: "6px solid #ffd43b", fontSize: 22, color: "#6b7785" }}>{ART.ru.p2}</div>
          {/* chat-like input */}
          <div style={{ marginTop: 20, minHeight: 110, borderRadius: 22, border: `3px solid ${BLUE}`, padding: "18px 22px", boxSizing: "border-box", background: "#f7fbff" }}>
            {f < T0 - 4 ? <span style={{ fontSize: 30, color: "#a7b1bc", fontWeight: 600 }}>{tr("Что вы думаете об этом? Напишите заметку")}</span> : <Field text={NOTE} at={T0} speed={3} size={34} />}
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 22 }}>
            <div style={{ fontSize: 25, color: "#8a98a6", fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8a98a6" strokeWidth="2.2" strokeLinecap="round"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
              {tr("Заметку видите только вы")}
            </div>
            <div style={{ marginLeft: "auto", padding: "18px 34px", borderRadius: 16, background: GREEN, boxShadow: `0 ${5 - press(f, SAVE) * 4}px 0 ${GLIP}`, transform: `translateY(${press(f, SAVE) * 4}px)`, fontWeight: 900, fontSize: 24, color: "#fff", letterSpacing: "0.05em" }}>{tr("СОХРАНИТЬ")}</div>
          </div>
        </div>
      ) : null}
      <Toast text={tr("Заметка сохранена")} at={SAVE + 10} until={SAVE + 110} />
      <CursorLayer c={{ ...cur, visible: !drag && cur.visible }} />
    </DemoCam>
  );
};

// ---------------- 4. Test by selection ----------------
export const DemoTest: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const OPEN = 40, TEST = 90, ANS = 210;
  const menu = lin(f, OPEN + 4, OPEN + 18, 0, 1, SOFT) * (1 - lin(f, TEST + 4, TEST + 16, 0, 1));
  const win = spring({ frame: f - TEST - 8, fps, config: { damping: 20, stiffness: 120 } });
  const ta = actionXY(5);
  const WX = 960 - 450, WY = 250;
  const cur = useCursor([{ at: OPEN, x: COL + 520, y: P2_TIP_Y - 10 }, { at: TEST, x: ta.x, y: ta.y }, { at: ANS, x: WX + 230, y: WY + 396 }], [1300, 900], [1500, 1000]);
  const ok = f >= ANS + 2;
  const res = spring({ frame: f - ANS - 6, fps, config: { damping: 16, stiffness: 140 } });
  return (
    <DemoCam from={{ s: 1.15, x: 900, y: 560 }} settle={60} tilt={0}>
      <ArticlePage sel={1} hl="rgba(255,212,59,0.8)" pin={1} />
      <MarkMenu show={menu} colorOn pressAction={[5, TEST]} />
      <AbsoluteFill style={{ background: `rgba(15,25,40,${0.25 * win})` }} />
      {win > 0.01 ? (
        <div style={{ position: "absolute", left: WX, top: WY, width: 900, borderRadius: 30, background: "#fff", boxShadow: "0 40px 90px rgba(10,40,90,0.3)", padding: "32px 40px", boxSizing: "border-box", transform: `translateY(${(1 - win) * 40}px) scale(${0.96 + 0.04 * win})`, opacity: win, fontFamily: UI }}>
          <div style={{ fontWeight: 800, fontSize: 22, color: BLUE, letterSpacing: "0.08em" }}>{tr("ТЕСТ ПО ВЫДЕЛЕННОМУ")}</div>
          <div style={{ fontWeight: 900, fontSize: 38, color: CHAR, marginTop: 8 }}>{tr("Проверьте себя")}</div>
          <div style={{ marginTop: 24, fontWeight: 800, fontSize: 26, color: "#8a98a6" }}>{tr("Верно ли утверждение?")}</div>
          <div style={{ marginTop: 12, padding: "20px 24px", borderRadius: 18, background: "#f7fbff", border: `2px solid ${SWAN}`, fontWeight: 700, fontSize: 30, lineHeight: 1.4, color: CHAR }}>{tr("«Республика Узбекистан» и «Узбекистан»: равнозначные названия.")}</div>
          <div style={{ display: "flex", gap: 20, marginTop: 26 }}>
            {[tr("Верно"), tr("Неверно")].map((b, i) => {
              const on = i === 0 && ok;
              const pr = i === 0 ? press(f, ANS) : 0;
              return <div key={b} style={{ flex: 1, height: 84, borderRadius: 20, border: `2px solid ${on ? GREEN : SWAN}`, background: on ? "#d7ffb8" : "#fff", boxShadow: `0 ${6 - pr * 5}px 0 ${on ? GLIP : SWAN}`, transform: `translateY(${pr * 5}px)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 32, color: on ? GLIP : CHAR }}>{b}</div>;
            })}
          </div>
          <div style={{ marginTop: 24, height: 80 * res, overflow: "hidden", borderRadius: 18, background: "#d7ffb8", display: "flex", alignItems: "center", gap: 16, padding: "0 24px", opacity: res, fontWeight: 900, fontSize: 28, color: GLIP }}>
            <div style={{ width: 46, height: 46, borderRadius: 23, background: GREEN, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></div>
            {tr("Всё верно. Этот отрывок вы поняли.")}
          </div>
        </div>
      ) : null}
      <CursorLayer c={cur} />
    </DemoCam>
  );
};

// ---------------- 5. Favourite + offline ----------------
const FOLDER = tr("Сессия");
export const DemoSave: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const HEART = 70, NEWF = 130, T0 = 160;
  const CREATE = Math.round(typedEnd(FOLDER, T0, 4) + 18);
  const OFF = CREATE + 120;
  const heart = lin(f, HEART + 2, HEART + 22, 0, 1, OUT);
  const pop = spring({ frame: f - HEART - 10, fps, config: { damping: 18, stiffness: 150 } }) * (1 - lin(f, CREATE + 30, CREATE + 46, 0, 1));
  const PX = ICONS.heart - 380, PY = ICON_Y + 56;
  const offBtn = { x: COL + 280, y: 720 };
  const cur = useCursor([{ at: HEART, x: ICONS.heart + 6, y: ICON_Y + 8 }, { at: NEWF, x: PX + 200, y: PY + 190 }, { at: CREATE, x: PX + 330, y: PY + 262 }, { at: OFF, x: offBtn.x + 120, y: offBtn.y + 6 }], [1100, 800], [1300, 980]);
  const offState = f < OFF + 2 ? "idle" : f < OFF + 60 ? "busy" : "done";
  const offline = (
    <div style={{ position: "absolute", left: COL, top: 690, height: 72, display: "flex", alignItems: "center", gap: 14, padding: "0 28px", borderRadius: 20, border: `2px solid ${offState === "done" ? GREEN : SWAN}`, background: offState === "done" ? "#e7ffd6" : "#fff", boxShadow: `0 ${5 - press(f, OFF) * 4}px 0 ${offState === "done" ? "#b5ec8c" : SWAN}`, transform: `translateY(${press(f, OFF) * 4}px)`, fontFamily: UI, fontWeight: 800, fontSize: 26, color: offState === "done" ? GLIP : CHAR }}>
      {offState === "busy" ? <Spinner size={30} /> : <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={offState === "done" ? GREEN : BLUE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d={offState === "done" ? "M5 12.5l4.5 4.5L19 7.5" : "M12 4v11M7 10l5 5 5-5M5 20h14"} /></svg>}
      {offState === "done" ? tr("Сохранён на устройстве, читается без интернета") : tr("Сохранить закон для чтения без интернета")}
    </div>
  );
  return (
    <DemoCam from={{ s: 1.14, x: 1140, y: 360 }} settle={0} tilt={0} later={[{ at: HEART + 10, s: 1.14, x: 1140, y: 360 }, { at: NEWF + 20, s: 1.1, x: 1120, y: 420 }, { at: CREATE + 40, s: 1.08, x: 940, y: 480 }, { at: OFF + 80, s: 1.12, x: 900, y: 520 }]}>
      <ArticlePage heart={heart} offline={offline} />
      {pop > 0.01 ? (
        <div style={{ position: "absolute", left: PX, top: PY, width: 460, borderRadius: 24, background: "#fff", border: `2px solid ${SWAN}`, boxShadow: "0 30px 70px rgba(10,40,90,0.2)", padding: "22px 24px", boxSizing: "border-box", transformOrigin: "90% 0%", transform: `scale(${0.94 + 0.06 * pop})`, opacity: pop, fontFamily: UI, zIndex: 20 }}>
          <div style={{ fontWeight: 900, fontSize: 28, color: CHAR }}>{tr("В избранное")}</div>
          <div style={{ marginTop: 14, padding: "14px 18px", borderRadius: 14, background: "#f7fbff", fontWeight: 700, fontSize: 24, color: "#6b7785" }}>{tr("Без папки")}</div>
          {f < NEWF + 4 ? (
            <div style={{ marginTop: 12, padding: "14px 18px", borderRadius: 14, border: `2px dashed ${BLUE}`, fontWeight: 800, fontSize: 24, color: BLUE, transform: `scale(${1 - press(f, NEWF) * 0.04})` }}>{tr("+ Новая папка")}</div>
          ) : (
            <>
              <div style={{ marginTop: 12, padding: "14px 18px", borderRadius: 14, border: `3px solid ${BLUE}`, background: "#fff", minHeight: 30 }}>{f < T0 - 4 ? <span style={{ fontSize: 24, color: "#a7b1bc", fontWeight: 600 }}>{tr("Название папки")}</span> : <Field text={FOLDER} at={T0} speed={4} size={26} />}</div>
              <div style={{ marginTop: 12, marginLeft: "auto", width: 160, padding: "12px 0", textAlign: "center", borderRadius: 14, background: GREEN, boxShadow: `0 ${4 - press(f, CREATE) * 4}px 0 ${GLIP}`, transform: `translateY(${press(f, CREATE) * 4}px)`, fontWeight: 900, fontSize: 22, color: "#fff" }}>{tr("Создать")}</div>
            </>
          )}
        </div>
      ) : null}
      <Toast text={`Сохранено в папку «${FOLDER}»`} at={CREATE + 12} until={CREATE + 100} />
      <CursorLayer c={cur} />
    </DemoCam>
  );
};

// ---------------- 6. Languages flourish ----------------
export const DemoLang: React.FC = () => {
  const f = useCurrentFrame();
  const UZ = 50, EN = 150;
  const cur = useCursor([{ at: UZ, x: COL + 372, y: 674 }, { at: EN, x: COL + 570, y: 674 }], [1200, 1000], [1400, 1000]);
  const fade = (at: number) => { const t = f - at; return t < 0 || t > 24 ? 0 : t < 12 ? t / 12 : (24 - t) / 12; };
  const lang = f >= EN + 12 ? "en" : f >= UZ + 12 ? "uz" : "ru";
  const tabs = f >= EN + 2 ? 2 : f >= UZ + 2 ? 1 : 0;
  return (
    <DemoCam from={{ s: 1.18, x: 900, y: 470 }} settle={0} tilt={0} later={[{ at: 40, s: 1.12, x: 940, y: 470 }]}>
      <ArticlePage lang={lang} tabs={tabs} langFade={Math.max(fade(UZ), fade(EN))} heart={1} />
      <CursorLayer c={cur} />
    </DemoCam>
  );
};
export { SOFT as _soft, OUT as _out, IO as _io };
