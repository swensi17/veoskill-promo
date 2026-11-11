import React from "react";
import { AbsoluteFill, Easing, interpolate, interpolateColors, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { RichBg, Roll } from "./Bg";
import { Arrow, useCursor, CursorLayer } from "./Master";

// "Ordinary law database vs veoskill" — the same action done side by side.
// The ordinary database is a generic grey page (no name, no logo). Everything on the veoskill side is a real feature of the site.
const FONT = "NunitoC, Nunito, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";
const BLUE = "#1cb0f6";
const LIP = "#0f6fbf";
const GREEN = "#58cc02";
const GLIP = "#58a700";
const RED = "#ff4b4b";
const INK = "#1f2a37";
const CHAR = "#4b4b4b";
const SWAN = "#e5e5e5";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const IO = Easing.bezier(0.65, 0, 0.35, 1);
const OUT = Easing.bezier(0.16, 1, 0.3, 1);
const lin = (f: number, a: number, b: number, x: number, y: number, e = IO) => interpolate(f, [a, b], [x, y], { easing: e, ...clamp });
const press = (f: number, at: number) => lin(f, at, at + 4, 0, 1) * (1 - lin(f, at + 6, at + 12, 0, 1));

// panel geometry: content area below the header bar
const PW = 860, PH = 800, HB = 64;
const typeTimes = (text: string, at: number, speed: number) => {
  const t: number[] = [];
  let x = at;
  for (let i = 0; i < text.length; i++) { t.push(x); x += speed * (0.6 + random(`c${text}${i}`) * 0.8) + (text[i] === " " ? speed * 0.6 : 0); }
  return { t, end: x };
};
/** Typing inside an input field only (that is the user's action); headlines never type. */
const Field: React.FC<{ text: string; at: number; speed?: number; size: number; color?: string; serif?: boolean }> = ({ text, at, speed = 3, size, color = INK, serif }) => {
  const f = useCurrentFrame();
  const { t, end } = typeTimes(text, at, speed);
  const n = t.filter((x) => f >= x).length;
  const caret = f < end + 4 || Math.floor(f / 16) % 2 === 0;
  return (
    <span style={{ fontFamily: serif ? SERIF : FONT, fontSize: size, fontWeight: serif ? 400 : 700, color, whiteSpace: "pre" }}>
      {text.slice(0, n)}
      {f >= at - 10 ? <span style={{ display: "inline-block", width: 3, height: size * 1.05, background: serif ? "#333" : BLUE, marginLeft: 2, verticalAlign: "text-bottom", opacity: caret ? 1 : 0 }} /> : null}
    </span>
  );
};
const Verdict: React.FC<{ good: boolean; text: string; at: number }> = ({ good, text, at }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping: 15, stiffness: 140 } });
  if (f < at) return null;
  const c = good ? GREEN : RED;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: -36, display: "flex", justifyContent: "center", zIndex: 30 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 34px", borderRadius: 24, background: "#fff", boxShadow: `0 8px 0 ${good ? "#b5ec8c" : "#ffc1c1"}, 0 24px 50px rgba(10,40,90,0.2)`, border: `3px solid ${c}`, transform: `translateY(${(1 - s) * 40}px) scale(${0.9 + 0.1 * s})`, opacity: Math.min(1, s * 1.5), fontFamily: FONT, fontWeight: 900, fontSize: 34, color: good ? GLIP : RED }}>
        <div style={{ width: 46, height: 46, borderRadius: 23, background: c, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d={good ? "M5 12.5l4.5 4.5L19 7.5" : "M6 6l12 12M18 6L6 18"} /></svg>
        </div>
        {text}
      </div>
    </div>
  );
};
const Timer: React.FC<{ seconds: number; good: boolean }> = ({ seconds, good }) => {
  const m = Math.floor(seconds / 60), s = Math.floor(seconds % 60);
  return (
    <div style={{ position: "absolute", right: 18, top: 12, padding: "6px 16px", borderRadius: 14, background: good ? "#e7ffd6" : "#ffe1e1", fontFamily: FONT, fontWeight: 900, fontSize: 26, color: good ? GLIP : RED, fontVariantNumeric: "tabular-nums", display: "flex", alignItems: "center", gap: 8 }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2M9 3h6" /></svg>
      {m}:{String(s).padStart(2, "0")}
    </div>
  );
};
/** Two panels side by side; children get their own local frame and coordinates. */
const Split: React.FC<{ title: string; left: React.ReactNode; right: React.ReactNode; vl: string; vr: string; vAt: number; timers?: [number, number] }> = ({ title, left, right, vl, vr, vAt, timers }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inL = spring({ frame: f - 2, fps, config: { damping: 18, stiffness: 90 } });
  const inR = spring({ frame: f - 8, fps, config: { damping: 18, stiffness: 90 } });
  const sway = Math.sin(f / 90) * 1.2;
  const panel = (side: "l" | "r", s: number, body: React.ReactNode) => {
    const L = side === "l";
    return (
      <div style={{ position: "absolute", left: L ? 70 : 990, top: 190, width: PW, height: PH, transform: `perspective(2400px) rotateY(${(L ? 4 : -4) + sway}deg) translateY(${(1 - s) * 80}px)`, opacity: s }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 26, overflow: "hidden", background: L ? "#f3f3f1" : "#fff", boxShadow: L ? "0 30px 70px rgba(30,30,30,0.18)" : "0 30px 80px rgba(10,60,140,0.22)", border: L ? "2px solid #d9d9d4" : `2px solid ${SWAN}` }}>
          <div style={{ height: HB, background: L ? "#e2e2dd" : "#fff", borderBottom: L ? "1px solid #cfcfc8" : `2px solid ${SWAN}`, display: "flex", alignItems: "center", gap: 14, padding: "0 24px", fontFamily: L ? SERIF : FONT, fontWeight: L ? 700 : 900, fontSize: L ? 26 : 34, color: L ? "#6b6b66" : BLUE }}>
            {L ? <><div style={{ width: 26, height: 26, borderRadius: 4, background: "#bdbdb6" }} />Обычная база законов</> : <span style={{ textShadow: `0 3px 0 ${LIP}` }}>veoskill</span>}
          </div>
          <div style={{ position: "absolute", left: 0, top: HB, width: PW, height: PH - HB, overflow: "hidden" }}>{body}</div>
          {timers ? <Timer seconds={L ? timers[0] : timers[1]} good={!L} /> : null}
        </div>
        <Verdict good={!L} text={L ? vl : vr} at={vAt + (L ? 0 : 10)} />
      </div>
    );
  };
  return (
    <AbsoluteFill>
      <RichBg />
      <div style={{ position: "absolute", top: 54, width: "100%" }}><Roll f={f} text={title} at={4} size={76} color={INK} /></div>
      {panel("l", inL, left)}
      {panel("r", inR, right)}
    </AbsoluteFill>
  );
};

// ================= Round 1 · Search =================
const Q = "штраф за парковку";
const JUNK = [
  "О внесении изменений и дополнений в некоторые законодательные акты Республики Узбекистан",
  "Постановление о мерах по дальнейшему совершенствованию порядка рассмотрения обращений",
  "Об утверждении Положения о порядке ведения реестра нормативных документов",
  "Решение о внесении изменений в ранее принятые решения по вопросам благоустройства",
  "О признании утратившими силу некоторых решений Правительства",
  "Об утверждении Административного регламента оказания государственной услуги",
  "О дополнительных мерах по совершенствованию системы учёта и отчётности",
  "Постановление об утверждении перечня документов, представляемых заявителями",
];
const FOUND = [
  ["О мерах по дальнейшему совершенствованию системы обеспечения дорожной безопасности в Республике Узбекистан", "…усиление ответственности участников дорожного движения за нарушения…"],
  ["Об организационных мерах по совершенствованию системы городского пассажирского транспорта", "…за счёт части средств, уплачиваемых за выдачу лицензий…"],
  ["Об утверждении единого плана мероприятий по обеспечению безопасности дорожного движения", "…ответственность за нарушение правил стоянки…"],
];
export const RoundSearch: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T0 = 40;
  const { end } = typeTimes(Q, T0, 3);
  const GO = Math.round(end + 10);
  // left: endless grey list that keeps scrolling; right: the answer arrives at once
  const scroll = Math.max(0, f - GO - 10) * 3.2;
  const leftTime = f < GO ? 0 : interpolate(f, [GO, 470], [0, 47], clamp);
  const rightTime = f < GO ? 0 : Math.min(2, (f - GO) / 30);
  const lc = useCursor([{ at: GO + 60, x: 520, y: 360 }, { at: GO + 150, x: 480, y: 610 }, { at: GO + 250, x: 540, y: 300 }], [700, 700], [600, 650]);
  const rc = useCursor([{ at: GO + 70, x: 640, y: 200 }], [760, 700], [700, 650]);
  const left = (
    <div style={{ position: "absolute", inset: 0, padding: 24 }}>
      <div style={{ height: 58, border: "1px solid #b9b9b2", background: "#fff", display: "flex", alignItems: "center", padding: "0 14px" }}><Field text={Q} at={T0} speed={3} size={26} serif color="#333" /></div>
      <div style={{ marginTop: 16, height: 640, overflow: "hidden", position: "relative" }}>
        {f > GO ? (
          <div style={{ transform: `translateY(${-scroll}px)` }}>
            {Array.from({ length: 40 }, (_, i) => (
              <div key={i} style={{ padding: "14px 6px", borderBottom: "1px solid #d6d6cf", fontFamily: SERIF, fontSize: 19, lineHeight: 1.35, color: "#3c4a7a", opacity: lin(f, GO + i * 2, GO + i * 2 + 8, 0, 1) }}>
                {JUNK[i % JUNK.length]}
                <div style={{ fontSize: 15, color: "#8a8a82", marginTop: 4 }}>Документ № {3100 + ((i * 397) % 900)} · {10 + (i % 18)}.0{1 + (i % 9)}.20{10 + (i % 14)}</div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <CursorLayer c={lc} />
    </div>
  );
  const right = (
    <div style={{ position: "absolute", inset: 0, padding: 26 }}>
      <div style={{ height: 70, borderRadius: 35, border: `3px solid ${BLUE}`, boxShadow: "0 5px 0 #84d8ff", background: "#fff", display: "flex", alignItems: "center", gap: 16, padding: "0 24px" }}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.6" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
        <Field text={Q} at={T0} speed={3} size={28} />
      </div>
      {f > GO ? <div style={{ marginTop: 18, fontFamily: FONT, fontWeight: 800, fontSize: 20, color: "#8a98a6", letterSpacing: "0.06em", opacity: lin(f, GO, GO + 10, 0, 1) }}>НАЙДЕНО: 4</div> : null}
      {FOUND.map(([t, snip], i) => {
        const s = spring({ frame: f - GO - 4 - i * 7, fps, config: { damping: 16, stiffness: 140 } });
        const hit = i === 0 && f > GO + 70;
        return (
          <div key={i} style={{ marginTop: 16, borderRadius: 20, border: `2px solid ${hit ? BLUE : SWAN}`, boxShadow: `0 5px 0 ${hit ? "#84d8ff" : SWAN}`, background: hit ? "#f0faff" : "#fff", padding: "18px 22px", transform: `translateY(${(1 - s) * 40 + press(f, GO + 70) * (i === 0 ? 4 : 0)}px)`, opacity: s, fontFamily: FONT }}>
            <div style={{ fontWeight: 800, fontSize: 23, color: "#1d2a6b", lineHeight: 1.3 }}>{t}</div>
            <div style={{ fontSize: 19, color: "#6b7785", marginTop: 8 }}>{snip.split(/(за|стоянки|ответственность)/).map((p, k) => (["за", "стоянки", "ответственность"].includes(p) ? <span key={k} style={{ background: "#c8f5a8", borderRadius: 4, padding: "0 2px" }}>{p}</span> : p))}</div>
          </div>
        );
      })}
      <CursorLayer c={rc} />
    </div>
  );
  return <Split title="Найти закон" left={left} right={right} vl="Долго и не то" vr="Сразу по смыслу" vAt={GO + 180} timers={[leftTime, rightTime]} />;
};

// ================= Round 2 · Reading =================
const DENSE = "Статья 1. Узбекистан — суверенное, демократическое, правовое, социальное и светское государство с республиканской формой правления. Названия государства «Республика Узбекистан» и «Узбекистан» равнозначны. Статья 2. Государство выражает волю народа, служит его интересам. Государственные органы и должностные лица ответственны перед обществом и гражданами. Статья 3. Республика Узбекистан определяет своё национально-государственное и административно-территориальное устройство, структуру органов государственной власти и управления, проводит внутреннюю и внешнюю политику. Государственная граница и территория Республики Узбекистан неприкосновенны и неделимы. Статья 4. Государственным языком Республики Узбекистан является узбекский язык. Республика Узбекистан обеспечивает уважительное отношение к языкам, обычаям и традициям наций и народностей, проживающих на её территории, создание условий для их развития. ";
const PLAIN = "Первая статья определяет главные основы государства. Узбекистан признаётся независимой страной с выборной властью, подчинением закону и заботой о гражданах, а его короткое и полное названия имеют равную силу.";
export const RoundRead: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const box = spring({ frame: f - 110, fps, config: { damping: 18, stiffness: 110 } });
  const left = (
    <div style={{ position: "absolute", inset: 0, padding: "20px 24px", transform: `translateY(${-f * 0.6}px)` }}>
      <div style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.32, color: "#333", textAlign: "justify", filter: `blur(${lin(f, 120, 220, 0, 0.8)}px)` }}>{DENSE.repeat(5)}</div>
    </div>
  );
  const right = (
    <div style={{ position: "absolute", inset: 0, padding: "26px 34px", fontFamily: FONT, color: CHAR }}>
      <div style={{ fontSize: 18, color: BLUE }}>Законы › Конституция Республики Узбекистан</div>
      <div style={{ fontWeight: 900, fontSize: 40, marginTop: 10 }}>Статья 1.</div>
      <div style={{ fontSize: 24, lineHeight: 1.5, marginTop: 12 }}>Узбекистан — суверенное, демократическое, правовое, социальное и светское государство с республиканской формой правления.</div>
      <div style={{ marginTop: 24, borderRadius: 22, border: "3px solid #9fdcf9", padding: "22px 26px", background: "#fff", transform: `translateY(${(1 - box) * 120}px) scale(${0.94 + 0.06 * box})`, opacity: box, boxShadow: `0 ${20 * box}px 50px rgba(28,176,246,${0.18 * box})` }}>
        <div style={{ fontWeight: 900, fontSize: 30 }}>Простыми словами</div>
        <div style={{ fontSize: 24, lineHeight: 1.5, marginTop: 10, fontWeight: 700 }}>{PLAIN}</div>
      </div>
    </div>
  );
  return <Split title="Понять статью" left={left} right={right} vl="Сложный юридический язык" vr="Понятно с первого раза" vAt={200} />;
};

// ================= Round 3 · Languages =================
const A1 = {
  ru: ["Статья 1.", "Узбекистан — суверенное, демократическое, правовое, социальное и светское государство с республиканской формой правления."],
  uz: ["1-modda.", "O‘zbekiston — boshqaruvning respublika shakliga ega bo‘lgan suveren, demokratik, huquqiy, ijtimoiy va dunyoviy davlat."],
  en: ["Article 1.", "Uzbekistan is a sovereign, democratic, law-governed, social and secular state with a republican form of government."],
};
const Tabs: React.FC<{ active: number; flat?: boolean; pressAt?: number[] }> = ({ active, flat, pressAt = [] }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ display: "flex", gap: flat ? 0 : 12 }}>
      {["RU", "UZ", "EN"].map((l, i) => {
        const on = i === active;
        const pr = pressAt[i] ? press(f, pressAt[i]) : 0;
        return flat ? (
          <div key={l} style={{ padding: "6px 18px", border: "1px solid #b9b9b2", background: on ? "#cfcfc8" : "#fff", fontFamily: SERIF, fontSize: 20, color: "#333" }}>{l}</div>
        ) : (
          <div key={l} style={{ padding: "10px 24px", borderRadius: 16, background: on ? BLUE : "#fff", border: `2px solid ${on ? BLUE : SWAN}`, boxShadow: `0 ${4 - pr * 4}px 0 ${on ? LIP : SWAN}`, transform: `translateY(${pr * 4}px)`, fontFamily: FONT, fontWeight: 900, fontSize: 22, color: on ? "#fff" : "#8a98a6" }}>{l}</div>
        );
      })}
    </div>
  );
};
export const RoundLang: React.FC = () => {
  const f = useCurrentFrame();
  const UZ = 90, EN = 220;
  const loadL = f >= UZ + 4 && f < UZ + 120;
  const lc = useCursor([{ at: UZ, x: 113, y: 46 }], [500, 500], [500, 600]);
  const rc = useCursor([{ at: UZ, x: 163, y: 50 }, { at: EN, x: 253, y: 50 }], [500, 500], [560, 620]);
  const flip = (at: number) => lin(f, at, at + 16, 0, 1, Easing.bezier(0.5, 0, 0.3, 1));
  const lang = f >= EN + 8 ? "en" : f >= UZ + 8 ? "uz" : "ru";
  const fl = f >= EN ? flip(EN) : flip(UZ);
  const rot = fl < 0.5 ? fl * 180 : (fl - 1) * 180;
  const left = (
    <div style={{ position: "absolute", inset: 0, padding: 24 }}>
      <Tabs active={f >= UZ + 120 ? 1 : 0} flat />
      {loadL ? (
        <div style={{ position: "absolute", inset: 0, top: 90, background: "#f3f3f1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
          <svg width="70" height="70" viewBox="0 0 50 50" style={{ transform: `rotate(${f * 9}deg)` }}><circle cx="25" cy="25" r="20" fill="none" stroke="#b9b9b2" strokeWidth="5" strokeDasharray="90 40" /></svg>
          <div style={{ fontFamily: SERIF, fontSize: 22, color: "#8a8a82" }}>Загрузка…</div>
        </div>
      ) : (
        <div style={{ marginTop: 24, fontFamily: SERIF, fontSize: 19, lineHeight: 1.4, color: "#333", textAlign: "justify" }}>
          {f < UZ ? <>{"…" + DENSE.slice(0, 520)}</> : <><b>KIRISH</b><br />{"Biz, O‘zbekiston xalqi, inson huquqlari va erkinliklariga, milliy va umuminsoniy qadriyatlarga, davlat suvereniteti tamoyillariga sodiqligimizni tantanali ravishda e’lon qilib… ".repeat(4)}</>}
        </div>
      )}
      <CursorLayer c={lc} />
    </div>
  );
  const right = (
    <div style={{ position: "absolute", inset: 0, padding: "26px 34px", fontFamily: FONT, color: CHAR }}>
      <Tabs active={lang === "en" ? 2 : lang === "uz" ? 1 : 0} pressAt={[0, UZ, EN]} />
      <div style={{ marginTop: 40, perspective: 1200 }}>
        <div style={{ transform: `rotateX(${rot}deg)`, transformOrigin: "50% 50%" }}>
          <div style={{ fontWeight: 900, fontSize: 42 }}>{A1[lang][0]}</div>
          <div style={{ fontSize: 30, lineHeight: 1.5, marginTop: 14 }}>{A1[lang][1]}</div>
        </div>
      </div>
      <div style={{ marginTop: 40, display: "flex", alignItems: "center", gap: 12, fontFamily: FONT, fontWeight: 800, fontSize: 22, color: GLIP, opacity: lin(f, UZ + 20, UZ + 34, 0, 1) }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        Та же статья, то же место
      </div>
      <CursorLayer c={rc} />
    </div>
  );
  return <Split title="Читать на своём языке" left={left} right={right} vl="Перезагрузка, место потеряно" vr="3 языка без перезагрузки" vAt={300} />;
};

// ================= Round 4 · Notes =================
const LINE = "Узбекистан — суверенное, демократическое, правовое государство";
const NOTE = "Повторить перед экзаменом";
export const RoundNotes: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const D0 = 40, D1 = 110;
  const sel = lin(f, D0, D1, 0, 1, Easing.bezier(0.45, 0, 0.55, 1));
  const drag = f >= D0 - 20 && f < D1 + 6;
  // left: only "copy", then the note lives in a separate notepad
  const menuL = f > D1 + 10 && f < 190;
  const pad = spring({ frame: f - 200, fps, config: { damping: 16, stiffness: 120 } });
  const lc = useCursor([{ at: 170, x: 300, y: 222 }], [560, 300], [600, 650]);
  // right: palette → yellow → note typed → pinned
  const YEL = 150, NOTEC = 190, T0 = 230;
  const { end } = typeTimes(NOTE, T0, 2.4);
  const SAVE = Math.round(end + 16);
  const pal = spring({ frame: f - D1 - 6, fps, config: { damping: 14, stiffness: 170 } }) * (1 - lin(f, NOTEC + 2, NOTEC + 12, 0, 1));
  const yellow = lin(f, YEL + 2, YEL + 20, 0, 1, OUT);
  const dlg = spring({ frame: f - NOTEC - 4, fps, config: { damping: 16, stiffness: 130 } });
  const fold = lin(f, SAVE + 6, SAVE + 30, 0, 1, Easing.bezier(0.5, 0, 0.4, 1));
  const pin = spring({ frame: f - SAVE - 28, fps, config: { damping: 9, stiffness: 220 } });
  const rc = useCursor([{ at: YEL, x: 135, y: 71 }, { at: NOTEC, x: 133, y: 127 }, { at: SAVE, x: 667, y: 534 }], [560, 300], [600, 700]);
  const hlR = interpolateColors(yellow, [0, 1], ["rgba(28,176,246,0.22)", "rgba(255,212,59,0.85)"]);
  const text = (serif: boolean, hl: string, extra?: React.ReactNode, dragArrow?: boolean) => (
    <div style={{ fontFamily: serif ? SERIF : FONT, fontSize: serif ? 22 : 27, lineHeight: 1.6, color: serif ? "#333" : CHAR, fontWeight: serif ? 400 : 600 }}>
      <span style={{ position: "relative", backgroundImage: `linear-gradient(${hl}, ${hl})`, backgroundRepeat: "no-repeat", backgroundSize: `${sel * 100}% 100%`, padding: "2px 0" }}>
        {LINE}
        {dragArrow && drag ? <span style={{ position: "absolute", left: `${sel * 100}%`, top: serif ? 18 : 22, zIndex: 5 }}><Arrow down={0} /></span> : null}
      </span>
      {extra}
      <span> с республиканской формой правления. Названия государства «Республика Узбекистан» и «Узбекистан» равнозначны.</span>
    </div>
  );
  const left = (
    <div style={{ position: "absolute", inset: 0, padding: "40px 30px" }}>
      {text(true, "rgba(51,102,204,0.35)", null, true)}
      {menuL ? (
        <div style={{ position: "absolute", left: 250, top: 190, width: 220, background: "#fff", border: "1px solid #b9b9b2", boxShadow: "0 8px 20px rgba(0,0,0,0.18)", fontFamily: SERIF, fontSize: 20, color: "#333" }}>
          <div style={{ padding: "10px 16px", background: f > 166 ? "#dfe7f5" : "#fff" }}>Копировать</div>
          <div style={{ padding: "10px 16px", color: "#aaa" }}>Печать</div>
        </div>
      ) : null}
      {/* the note has to live in a separate notepad */}
      <div style={{ position: "absolute", left: 360, top: 420, width: 440, height: 250, background: "#fffbe0", border: "1px solid #d8cf9a", boxShadow: "0 16px 40px rgba(0,0,0,0.2)", transform: `translateY(${(1 - pad) * 300}px) rotate(${(1 - pad) * 6 + 2}deg)`, opacity: pad, fontFamily: SERIF, fontSize: 19, color: "#555", padding: "14px 18px" }}>
        <div style={{ fontSize: 16, color: "#999", borderBottom: "1px solid #e5dca6", paddingBottom: 6 }}>Блокнот — без названия</div>
        <div style={{ marginTop: 10 }}>{f > 214 ? LINE + "…" : ""}</div>
        <div style={{ marginTop: 6, color: "#aaa" }}>{f > 236 ? "(откуда это? какая статья?)" : ""}</div>
      </div>
      <CursorLayer c={lc} />
    </div>
  );
  const right = (
    <div style={{ position: "absolute", inset: 0, padding: "40px 34px" }}>
      {text(false, hlR, f > SAVE + 24 ? (
        <span style={{ display: "inline-flex", marginLeft: 12, width: 44, height: 44, borderRadius: 13, background: "#fff4c2", border: "2px solid #ffd43b", boxShadow: "0 3px 0 #f2c200", alignItems: "center", justifyContent: "center", verticalAlign: "middle", transform: `scale(${pin})` }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#b58900" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h11l3 3v13H5zM8 10h8M8 14h6" /></svg>
        </span>
      ) : null, true)}
      {pal > 0.01 ? (
        <div style={{ position: "absolute", left: 100, top: -20 + 40, width: 470, borderRadius: 18, background: "#fff", border: `2px solid ${BLUE}`, boxShadow: "0 20px 50px rgba(10,40,90,0.2)", padding: "14px 18px", transformOrigin: "20% 100%", transform: `scale(${pal})`, fontFamily: FONT, zIndex: 3 }}>
          <div style={{ display: "flex", gap: 10 }}>
            {["#ffd43b", "#ff922b", "#ff6b6b", "#f783ac", "#cc5de8", "#4dabf7", "#51cf66", "#adb5bd"].map((c, i) => <div key={c} style={{ width: 34, height: 34, borderRadius: 17, background: c, boxShadow: i === 0 && f >= YEL ? `0 0 0 3px #fff, 0 0 0 6px ${c}` : undefined }} />)}
          </div>
          <div style={{ display: "flex", gap: 30, marginTop: 14, paddingTop: 10, borderTop: `2px solid ${SWAN}` }}>
            {["M5 4h11l3 3v13H5zM8 10h8M8 14h6", "M8 8h11v11H8zM5 16V5h11", "M5 9v6h4l5 4V5L9 9z"].map((d, i) => <svg key={i} width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>)}
          </div>
        </div>
      ) : null}
      {dlg > 0.01 && fold < 1 ? (
        <div style={{ position: "absolute", left: 60, top: 280, width: 720, borderRadius: 22, background: "#fff", boxShadow: "0 40px 80px rgba(10,40,90,0.25)", padding: "24px 28px", transformOrigin: "60% 0%", transform: `scale(${(0.8 + 0.2 * dlg) * (1 - fold * 0.9)}) translateY(${-fold * 220}px)`, opacity: Math.min(1, dlg * 2) * (1 - lin(f, SAVE + 22, SAVE + 30, 0, 1)), fontFamily: FONT, zIndex: 4 }}>
          <div style={{ fontWeight: 900, fontSize: 28, color: INK }}>Заметка к выделенному</div>
          <div style={{ marginTop: 14, height: 100, borderRadius: 14, border: `2px solid ${BLUE}`, padding: "14px 18px", boxSizing: "border-box" }}>
            {f < T0 - 4 ? <span style={{ fontSize: 26, color: "#b8bec5", fontWeight: 600 }}>Что вы думаете об этом?</span> : <Field text={NOTE} at={T0} speed={2.4} size={28} />}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
            <div style={{ padding: "14px 28px", borderRadius: 14, background: GREEN, boxShadow: `0 ${4 - press(f, SAVE) * 4}px 0 ${GLIP}`, transform: `translateY(${press(f, SAVE) * 4}px)`, fontWeight: 900, fontSize: 20, color: "#fff", letterSpacing: "0.05em" }}>СОХРАНИТЬ</div>
          </div>
        </div>
      ) : null}
      <CursorLayer c={rc} />
    </div>
  );
  return <Split title="Сохранить важное" left={left} right={right} vl="Заметки где-то отдельно" vr="Заметки прямо в статье" vAt={SAVE + 50} />;
};

// ================= Scoreboard =================
const ROWS = ["Поиск по смыслу", "Объяснение простыми словами", "3 языка без перезагрузки", "Выделения и заметки в статье", "Уроки и игры по законам"];
export const Score: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <RichBg />
      <div style={{ position: "absolute", top: 70, width: "100%" }}><Roll f={f} text="Итог" at={4} size={84} color={INK} /></div>
      <div style={{ position: "absolute", left: 260, top: 210, width: 1400, borderRadius: 34, background: "#fff", boxShadow: "0 40px 90px rgba(10,40,90,0.16)", overflow: "hidden", fontFamily: FONT }}>
        <div style={{ display: "flex", alignItems: "center", height: 100, borderBottom: `2px solid ${SWAN}`, fontWeight: 900, fontSize: 30 }}>
          <div style={{ flex: 1 }} />
          <div style={{ width: 330, textAlign: "center", color: "#8a8a82", fontFamily: SERIF, fontWeight: 700, fontSize: 26 }}>Обычная база</div>
          <div style={{ width: 300, textAlign: "center", color: BLUE, fontSize: 38, textShadow: `0 3px 0 ${LIP}` }}>veoskill</div>
        </div>
        {ROWS.map((r, i) => {
          const at = 30 + i * 22;
          const s = spring({ frame: f - at, fps, config: { damping: 14, stiffness: 150 } });
          const ck = spring({ frame: f - at - 10, fps, config: { damping: 9, stiffness: 220 } });
          return (
            <div key={r} style={{ display: "flex", alignItems: "center", height: 112, borderBottom: i < ROWS.length - 1 ? `2px solid ${SWAN}` : undefined, opacity: s, transform: `translateY(${(1 - s) * 20}px)` }}>
              <div style={{ flex: 1, paddingLeft: 50, fontWeight: 800, fontSize: 34, color: CHAR }}>{r}</div>
              <div style={{ width: 330, display: "flex", justifyContent: "center" }}><div style={{ width: 40, height: 6, borderRadius: 3, background: "#cfcfc8" }} /></div>
              <div style={{ width: 300, display: "flex", justifyContent: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: 32, background: GREEN, boxShadow: `0 5px 0 ${GLIP}`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${ck})` }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
