import React from "react";
import { tr } from "./i18n";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { UI, IOE, lin, press, useSp, useFrame, Pointer, TopLine } from "./Scenes9";

// Search over the whole base (veoskill.uz/hub/laws search window): "Вся база" in one click, Tab completes the word,
// a word typed in the wrong keyboard layout is understood, a word in Uzbek finds Russian acts too.
// Results: act, number, date, language, the found place marked, PDF / Word / favourite right in the list.
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SB = "#1cb0f6", INK = "#1d2a5c", META = "#7c8593", LINE = "#e9edf2";
const T = { IN: 0, ALL: 30, TYPE0: 50, TAB: 82, RES: 90, CLR: 150, TYPE1: 158, LAY: 184, CLR2: 236, TYPE2: 244, LANG: 268, END: 346 };

type R = [string, string, string]; // title, meta, snippet ("" = none)
const RES_A: R[] = [
  [tr("О нормативно-правовых актах (ЗРУ-682-сон)"), tr("ДОКУМЕНТ · 20.04.2021 · RU"), ""],
  [tr("О правовом эксперименте (ЗРУ-1127-сон)"), tr("ДОКУМЕНТ · 27.03.2026 · RU"), ""],
  [tr("О гарантиях прав ребенка (ЗРУ-139-сон)"), tr("ДОКУМЕНТ · 07.01.2008 · RU"), ""],
  [tr("О защите прав потребителей (221-I-сон)"), tr("ДОКУМЕНТ · 26.04.1996 · RU"), ""],
  [tr("О правах лиц с инвалидностью (ЗРУ-641-сон)"), tr("ДОКУМЕНТ · 15.10.2020 · RU"), ""],
];
const RES_B: R[] = [
  [tr("Об авторском праве и смежных правах (272-I-сон)"), tr("МЕСТ: 30 · 30.08.1996 · RU"), tr("Обладатели права на запись исполнения осуществляют свои права с учетом прав авторов.")],
  [tr("Гражданский кодекс Республики Узбекистан (часть вторая)"), tr("МЕСТ: 68 · 29.08.1996 · RU"), tr("К правам на интеллектуальную собственность применяется право страны, где испрашивается защита.")],
  [tr("Гражданский кодекс Республики Узбекистан (часть первая)"), tr("МЕСТ: 36 · 21.12.1995 · RU"), tr("РАЗДЕЛ II ПРАВО СОБСТВЕННОСТИ И ДРУГИЕ ВЕЩНЫЕ ПРАВА")],
];
const RES_C: R[] = [
  [tr("Конституция Республики Узбекистан"), tr("МЕСТ: 41 · 30.04.2023 · RU"), tr("Каждый имеет право на защиту своих прав и свобод.")],
  ["Fuqarolik kodeksi", "MOS: 52 · 21.12.1995 · UZ", "Har kim oʻz huquqlarini himoya qilish huquqiga ega."],
  [tr("Трудовой кодекс Республики Узбекистан"), tr("МЕСТ: 27 · 28.10.2022 · RU"), tr("Работник имеет право на отдых и безопасные условия труда.")],
];

/** Marks every word that starts with one of the stems. */
const mark = (t: string, stems: string[]) => t.split(/(\s+)/).map((w, i) => {
  const low = w.toLowerCase();
  const st = stems.find((s) => low.startsWith(s) || low.includes("-" + s));
  if (!st) return <React.Fragment key={i}>{w}</React.Fragment>;
  const k = low.indexOf(st);
  return <React.Fragment key={i}>{w.slice(0, k)}<span style={{ background: "#ffe17a", borderRadius: 3 }}>{w.slice(k, k + st.length)}</span>{w.slice(k + st.length)}</React.Fragment>;
});
const Pdf = () => (
  <svg width="34" height="38" viewBox="0 0 34 38"><path d="M3 2h20l9 9v25H3z" fill="#fff" stroke="#c9ced6" strokeWidth="2" /><rect x="0" y="18" width="26" height="12" rx="2" fill="#e5322d" /><text x="13" y="27.5" fontSize="8.5" fontWeight="900" fill="#fff" textAnchor="middle" fontFamily="Arial">PDF</text></svg>
);
const Word = () => <div style={{ width: 34, height: 34, borderRadius: 6, background: "#1f4e9c", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18, fontFamily: "Arial" }}>W</div>;
const Heart = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a3abb6" strokeWidth="1.8"><path d="M12 20s-7-4.4-9.3-8.6C1 8 3 4.5 6.8 4.5c2.2 0 3.6 1.3 5.2 3 1.6-1.7 3-3 5.2-3C21 4.5 23 8 21.3 11.4 19 15.6 12 20 12 20z" /></svg>;

const List: React.FC<{ rows: R[]; stems: string[]; f: number; at: number; banner?: string }> = ({ rows, stems, f, at, banner }) => (
  <div>
    {banner ? <div style={{ padding: "14px 34px", background: "#ecfccb", fontWeight: 600, fontSize: 20, color: "#3c4a2a", opacity: lin(f, at, at + 10), transform: `translateY(${(1 - lin(f, at, at + 12, 0, 1, Easing.out(Easing.cubic))) * -10}px)` }}>{banner}</div> : null}
    {rows.map(([title, meta, snip], i) => {
      const e = lin(f, at + 4 + i * 5, at + 18 + i * 5, 0, 1, Easing.out(Easing.cubic));
      return (
        <div key={title} style={{ display: "flex", gap: 22, padding: "20px 34px", borderBottom: `2px solid ${LINE}`, opacity: e, transform: `translateY(${(1 - e) * 18}px)` }}>
          <div style={{ width: 34, height: 34, borderRadius: 17, background: "#4a8ff0", flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 23, lineHeight: 1.3, color: "#18307a" }}>{mark(title, stems)}</div>
            <div style={{ marginTop: 6, fontWeight: 600, fontSize: 16, letterSpacing: "0.06em", color: META }}>{meta}</div>
            {snip ? <div style={{ marginTop: 8, fontWeight: 500, fontSize: 19, lineHeight: 1.5, color: "#2b2b2b" }}>{mark(snip, stems)}</div> : null}
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 18, paddingTop: 2 }}><Pdf /><Word /><Heart /></div>
        </div>
      );
    })}
  </div>
);

export const Search: React.FC = () => {
  const f = useFrame();
  const sp = useSp();
  const win = sp(T.IN + 2, 16, 170);
  const all = lin(f, T.ALL, T.ALL + 10, 0, 1, IOE);              // the toggle slides to "ВСЯ БАЗА"
  // ---- input: three words in turn
  const W1 = tr("право"), G1 = tr("вых"), W2 = "ghfdj", W3 = "huquq";
  const ty = (w: string, t0: number, sp0 = 5) => Array.from(w).slice(0, Math.max(0, Math.floor((f - t0) / sp0))).join("");
  let text = "", ghost = "", arrow = "";
  if (f < T.CLR) {
    text = ty(W1, T.TYPE0);
    ghost = text.length >= 3 && f < T.TAB ? (W1 + G1).slice(text.length) : "";
    if (f >= T.TAB) text = W1 + G1;
  } else if (f < T.CLR2) {
    text = ty(W2, T.TYPE1);
    if (text.length === W2.length) arrow = W1;
  } else {
    text = ty(W3, T.TYPE2);
    if (text.length === W3.length) arrow = `${W1} · huquq`;
  }
  const tabKey = sp(T.TAB - 12, 14, 220) * (1 - lin(f, T.TAB + 10, T.TAB + 20));
  const stage = f < T.CLR ? 0 : f < T.CLR2 ? 1 : 2;
  const resAt = [T.RES, T.LAY, T.LANG][stage];
  const showRes = f >= resAt;
  const out = stage === 0 ? lin(f, T.CLR - 8, T.CLR) : stage === 1 ? lin(f, T.CLR2 - 8, T.CLR2) : 0;
  const scroll = 0;
  const caret = Math.floor(f / 8) % 2 === 0;
  // ---- pointer: "ВСЯ БАЗА" (screen coords; the window is centred, 1160 wide)
  const L = (1920 - 1160) / 2, TOP = 110;
  const pk = [6, T.ALL - 10, T.ALL + 8, T.ALL + 30];
  const px = interpolate(f, pk, [1500, L + 900, L + 900, L + 760], { ...cl, easing: IOE });
  const py = interpolate(f, pk, [900, TOP + 82, TOP + 82, TOP + 300], { ...cl, easing: IOE });
  const caps: [number, string, string][] = [[0, tr("Поиск"), tr("сразу по всей базе.")], [T.TAB - 20, tr("Tab"), tr("дописывает слово.")], [T.LAY - 10, tr("Ошибся раскладкой?"), tr("Поиск поймёт.")], [T.LANG - 10, tr("Даже на другом языке."), ""]];
  let ci = 0; caps.forEach(([t], i) => { if (f >= t) ci = i; });
  const rows = [RES_A, RES_B, RES_C][stage];
  const stems = [[tr("прав")], [tr("прав")], [tr("прав"), "huquq"]][stage];
  const banner = stage === 1 ? tr("Показано для «право»: вы набрали в другой раскладке") : stage === 2 ? tr("Найдено и на русском, и на узбекском: «huquq» = «право»") : undefined;
  return (
    <AbsoluteFill style={{ background: "#eef3f8", overflow: "hidden", fontFamily: UI }}>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #dfe9f3, #f3f7fb)", opacity: 0.9 }} />
      <div style={{ position: "absolute", left: L, top: TOP, width: 1160, height: 920, borderRadius: 30, background: "#fff", boxShadow: "0 40px 100px rgba(13,22,48,0.22)", overflow: "hidden", opacity: Math.min(1, win * 1.4), transform: `translateY(${(1 - win) * 40}px) scale(${0.96 + 0.04 * win})` }}>
        {/* header */}
        <div style={{ position: "absolute", left: 34, top: 34, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontWeight: 900, fontSize: 34, color: "#3c3c3c" }}>{tr("Поиск по тексту")}</div>
          <div style={{ padding: "4px 12px", borderRadius: 16, background: "#58cc02", color: "#fff", fontWeight: 900, fontSize: 19, opacity: showRes ? 1 : 0.35 }}>181+</div>
        </div>
        <div style={{ position: "absolute", left: 34, top: 84, fontWeight: 600, fontSize: 18, color: META }}>«{stage === 0 ? W1 : stage === 1 ? W2 : W3}» · {all > 0.5 ? tr("Вся база") : tr("В этом акте")}</div>
        <div style={{ position: "absolute", right: 120, top: 42, width: 340, height: 56, borderRadius: 16, border: "2px solid #dfe5ec", boxSizing: "border-box" }}>
          <div style={{ position: "absolute", top: 4, bottom: 4, left: 4 + all * 166, width: 164, borderRadius: 12, background: SB }} />
          {[tr("В ЭТОМ АКТЕ"), tr("ВСЯ БАЗА")].map((t, i) => <div key={t} style={{ position: "absolute", top: 0, bottom: 0, left: i * 170, width: 170, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, letterSpacing: "0.08em", color: (i === 1) === (all > 0.5) ? "#fff" : "#5d6470" }}>{t}</div>)}
        </div>
        <div style={{ position: "absolute", right: 34, top: 42, width: 60, height: 56, borderRadius: 14, background: SB, display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg></div>
        {/* input */}
        <div style={{ position: "absolute", left: 34, right: 34, top: 140, height: 76, display: "flex", alignItems: "center", gap: 18, borderBottom: `2px solid ${LINE}` }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={SB} strokeWidth="2.6" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
          <div style={{ fontWeight: 600, fontSize: 32, color: "#2b2b2b", display: "flex", alignItems: "center" }}>
            {text}{f >= T.TYPE0 - 4 && !arrow && caret ? <span style={{ width: 2, height: 34, background: "#2b2b2b", marginLeft: 1 }} /> : null}
            <span style={{ color: "#b4bcc6" }}>{ghost}</span>
            {arrow ? <span style={{ color: "#9aa3ae", marginLeft: 12, opacity: lin(f, resAt - 6, resAt + 4) }}>→ {arrow}</span> : null}
          </div>
          {tabKey > 0.01 ? <div style={{ marginLeft: 18, padding: "6px 14px", borderRadius: 10, border: "2px solid #c9d2dc", boxShadow: `0 ${4 - 3 * press(f, T.TAB)}px 0 #c9d2dc`, transform: `translateY(${press(f, T.TAB) * 3}px) scale(${tabKey})`, fontWeight: 800, fontSize: 20, color: "#5d6470", background: "#fff" }}>Tab ⇥</div> : null}
        </div>
        {/* results */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 218, bottom: 0, overflow: "hidden" }}>
          {showRes ? <div style={{ transform: `translateY(${-scroll}px)`, opacity: 1 - out }}><List rows={rows} stems={stems} f={f} at={resAt} banner={banner} /></div>
            : f > T.TYPE0 ? <div style={{ padding: "30px 34px", fontWeight: 700, fontSize: 21, color: SB, opacity: 0.8 }}>{tr("Ищем по всей базе")}{".".repeat(1 + (Math.floor(f / 6) % 3))}</div> : null}
        </div>
      </div>
      <TopLine key={caps[ci][0]} a={caps[ci][1]} b={caps[ci][2] || undefined} at={caps[ci][0]} size={60} />
      {f >= 6 && f < T.ALL + 34 ? <div style={{ position: "absolute", inset: 0, zIndex: 50 }}><Pointer x={px} y={py} down={press(f, T.ALL)} op={lin(f, 6, 16) * (1 - lin(f, T.ALL + 20, T.ALL + 34))} /></div> : null}
    </AbsoluteFill>
  );
};
