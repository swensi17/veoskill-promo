import React from "react";
import { tr } from "./i18n";
import { AbsoluteFill, Easing, Img, interpolate, staticFile } from "remotion";
import { NAVY, BLUE, GREEN, GLIP, INK, UI, HEAD, OUTE, IOE, lin, press, useSp, useFrame, Pointer, TopLine } from "./Scenes9";
import { Confetti } from "./Lesson";

// The user's own page (the words from docs/RULES.md stay out of frame): avatar editor, medals, find friends.
// Then the Premium page: plans and what you get.
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const S = (n: string) => staticFile(`site/${n}`);
const mix = (a: string, b: string, t: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",")})`;
};

/** simple cartoon avatar; hair and background colours are animatable */
const AvatarOld: React.FC<{ size: number; hair: string; bg: string; ring?: boolean }> = ({ size, hair, bg, ring }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={{ borderRadius: "50%", boxShadow: ring ? "0 0 0 6px #fff, 0 0 0 10px #c78bff" : undefined }}>
    <circle cx="100" cy="100" r="100" fill={bg} />
    <path d="M40 200 C40 150 65 132 100 132 C135 132 160 150 160 200 Z" fill="#58cc02" />
    <path d="M70 170 L70 200 M130 170 L130 200" stroke="#46a302" strokeWidth="6" />
    <rect x="88" y="112" width="24" height="26" rx="8" fill="#f2c29a" />
    <circle cx="100" cy="88" r="40" fill="#f5cba7" />
    <path d="M58 86 C56 52 78 38 100 38 C124 38 146 52 142 86 C134 70 120 62 100 62 C82 62 66 70 58 86 Z" fill={hair} />
    <circle cx="86" cy="90" r="4.5" fill="#2b2b2b" /><circle cx="114" cy="90" r="4.5" fill="#2b2b2b" />
    <path d="M86 106 C94 114 106 114 114 106" stroke="#2b2b2b" strokeWidth="4" fill="none" strokeLinecap="round" />
    <circle cx="74" cy="102" r="6" fill="#f7a8a0" opacity="0.6" /><circle cx="126" cy="102" r="6" fill="#f7a8a0" opacity="0.6" />
  </svg>
);
/** the site's verified seal: blue scalloped badge with a white check */
export const Verified: React.FC<{ size: number }> = ({ size }) => {
  const pts = Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 9.2 : 11; return `${(12 + Math.cos(a) * r).toFixed(2)},${(12 + Math.sin(a) * r).toFixed(2)}`; }).join(" ");
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <defs><linearGradient id="vg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4aa8ff" /><stop offset="1" stopColor="#1f6fe0" /></linearGradient></defs>
      <polygon points={pts} fill="url(#vg)" stroke="url(#vg)" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M7.6 12.3l3 3 5.8-6.2" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};
/** a real site avatar (av/*.svg) on a coloured circle */
const AvatarImg: React.FC<{ src: string; bg: string; size: number; ring?: boolean }> = ({ src, bg, size, ring }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: bg, boxShadow: ring ? "0 0 0 6px #fff, 0 0 0 10px #c78bff" : undefined, overflow: "hidden" }}>
    <Img src={staticFile(`av/nobg/${src}.svg`)} style={{ width: "100%", height: "100%" }} />
  </div>
);
const Medal: React.FC<{ on: number; n: number; size?: number; kind?: "star" | "ribbon" }> = ({ on, n, size = 84, kind = "star" }) => (
  <div style={{ position: "relative", width: size, height: size, transform: `scale(${1 + 0.25 * Math.sin(Math.min(1, on) * Math.PI)})` }}>
    <svg width={size} height={size} viewBox="0 0 64 64">
      {kind === "ribbon" ? <path d="M20 4 L32 26 L44 4 L54 4 L38 32 L26 32 L10 4 Z" fill={on > 0.5 ? "#e8505b" : "#d9dce1"} /> : null}
      <circle cx="32" cy={kind === "ribbon" ? 40 : 32} r="22" fill={on > 0.5 ? "#ffcf4a" : "#dfe2e7"} stroke={on > 0.5 ? "#e7a700" : "#c8ccd2"} strokeWidth="4" />
      <path d={`M32 ${kind === "ribbon" ? 28 : 20} l4 8 9 1.3 -6.5 6.3 1.5 9 -8 -4.3 -8 4.3 1.5 -9 -6.5 -6.3 9 -1.3z`} fill={on > 0.5 ? "#fff6d6" : "#f2f3f5"} />
    </svg>
    <div style={{ position: "absolute", right: -2, bottom: -2, width: 24, height: 24, borderRadius: 12, background: "#fff", border: "2px solid #e1e4e8", fontFamily: UI, fontWeight: 800, fontSize: 13, color: "#6f7682", display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</div>
  </div>
);
const Modal: React.FC<{ o: number; x: number; y: number; w: number; h: number; title: string; closeDown?: number; children: React.ReactNode }> = ({ o, x, y, w, h, title, closeDown = 0, children }) => (
  <>
    <div style={{ position: "absolute", left: -400, top: -400, right: -400, bottom: -400, background: `rgba(40,46,58,${0.45 * o})` }} />
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 24, background: "#fff", boxShadow: "0 40px 120px rgba(13,22,48,0.35)", opacity: Math.min(1, o * 1.4), transform: `translateY(${(1 - o) * 40}px) scale(${0.95 + 0.05 * o})`, overflow: "hidden", fontFamily: UI }}>
      <div style={{ height: 96, display: "flex", alignItems: "center", padding: "0 32px", borderBottom: "2px solid #eef0f3" }}>
        <div style={{ flex: 1, fontWeight: 900, fontSize: 34, color: INK }}>{title}</div>
        <div style={{ width: 58, height: 58, borderRadius: 14, background: BLUE, boxShadow: `0 ${4 - 3 * closeDown}px 0 #1899d6`, transform: `translateY(${closeDown * 3}px)`, display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg></div>
      </div>
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  </>
);

export const _HAIRS = ["#111111", "#3a2418", "#6a4128", "#9a6330", "#d4a73a", "#ead48f", "#c64b16", "#7f7f7f", "#e6e6e6", "#2f4f96", "#b03c8f", "#2e8b57", "#1c1c3a", "#4a3020", "#7a5236", "#a8562c"];
export const _BGS = ["#ffe2d1", "#d6f0ff", "#e5dcff", "#dff7d0", "#fff1c2", "#ffd6e0", "#e9ecf2", "#c9f0f0", "#ffd2a6", "#cfe0ff", "#f2d4ff", "#d8f5e3", "#fbe4c8", "#e0e7ff", "#f8d7d7", "#e2f4c5"];
const T = { GEAR: 60, ED: 66, TAB1: 98, H: 126, TAB2: 150, B: 172, OK: 205, ALL: 260, MED: 266, MCLOSE: 396, FIND: 430, FR: 436, ADD1: 470, ADD2: 494, END: 560 };
// editor geometry
const EX = 460, EY = 120, EW = 1000, EH = 900, BY = EY + 96; // body origin y
const TABS = [tr("Персонаж"), tr("Лицо"), tr("Волосы"), tr("Верх"), tr("Очки"), tr("Фон"), tr("Своё фото")];
const TABW = (EW - 60 - 8) / 7;
const tabX = (i: number) => EX + 34 + i * TABW + TABW / 2, tabY = BY + 280 + 38;
const cardX = (i: number) => EX + 30 + (i % 2) * 478 + 231, cardY = (i: number) => BY + 430 + Math.floor(i / 2) * 126 + 55;
const swX = (i: number) => EX + 30 + (i % 8) * 116 + 50, swY = (i: number) => BY + 430 + Math.floor(i / 8) * 104 + 44;
const BTN = { dice: EX + EW - 201, ok: EX + EW - 131, close: EX + EW - 61, y: EY + 48 };
const CARDS: [string, string, string][] = [[tr("Классика"), tr("Знакомый аватар с одеждой и принтами"), "p1"], [tr("Приключение"), tr("Яркий персонаж с выразительными глазами"), "p5"], [tr("Забавный"), tr("Милый герой с большими ушами"), "p0"], [tr("Скетч"), tr("Чёрные линии, 48 причёсок и бороды"), "p3"]];
const BG2 = ["#e2fbc8", "#dff1ff", "#fbe3d3", "#f7d6ef", "#e6e6e6", "#fdf1b8", "#e5dcff", "#ffffff", "#d3efe6", "#c7e3f6", "#f8d3c8", "#f1e5cb", "#d8d6f2", "#f4c9dc", "#c4dcc0", "#4f617f"];

export const Profile: React.FC = () => {
  const f = useFrame();
  const sp = useSp();
  const page = lin(f, 0, 16);
  const ed = lin(f, T.ED, T.ED + 14, 0, 1, OUTE) * (1 - lin(f, T.OK + 4, T.OK + 16));
  const med = lin(f, T.MED, T.MED + 14, 0, 1, OUTE) * (1 - lin(f, T.MCLOSE + 4, T.MCLOSE + 16));
  const fr = lin(f, T.FR, T.FR + 14, 0, 1, OUTE);
  const tab = f < T.TAB2 + 2 ? 0 : 5;
  const av = "p3";
  const card: number = 3;
  const bg = mix("#ffe2d1", "#f7d6ef", lin(f, T.B + 2, T.B + 14));
  const clicks: [number, number, number][] = [
    [T.GEAR, 1190, 92], [T.TAB2, tabX(5), tabY], [T.B, swX(3), swY(3)], [T.OK, BTN.ok, BTN.y],
    [T.ALL, 1206, 712], [T.MCLOSE, 460 + 1000 - 61, 190 + 48], [T.FIND, 1560, 222], [T.ADD1, 510 + 900 - 70, 170 + 96 + 150 + 50], [T.ADD2, 510 + 900 - 70, 170 + 96 + 150 + 2 * 100 + 50],
  ];
  const pk = [8, ...clicks.flatMap(([t]) => [t - 12, t + 8]), T.END];
  const px = interpolate(f, pk, [1000, ...clicks.flatMap(([, x]) => [x - 4, x - 4]), 1000], { ...cl, easing: IOE });
  const py = interpolate(f, pk, [900, ...clicks.flatMap(([, , y]) => [y - 4, y - 4]), 900], { ...cl, easing: IOE });
  const down = Math.max(...clicks.map(([t]) => press(f, t)));
  const xpFill = lin(f, T.MED + 16, T.MED + 70, 0.32, 1, Easing.bezier(0.3, 0, 0.2, 1));
  const lsFill = lin(f, T.MED + 50, T.MED + 100, 0.2, 1, Easing.bezier(0.3, 0, 0.2, 1));
  const caps: [number, string, string][] = [[0, tr("Твоя страница"), tr("в veoskill.")], [T.ED, tr("Создай аватар"), tr("как хочешь.")], [T.MED, tr("Медали"), tr("за каждый шаг.")], [T.FR, tr("Находи друзей"), tr("и учись вместе.")]];
  let ci = 0; caps.forEach(([t], i) => { if (f >= t) ci = i; });
  const NAV: [string, string][] = [["icons_hub_home.webp", tr("КАБИНЕТ")], ["stickers_module.webp", tr("МОДУЛИ")], ["icons_duel_scales.webp", tr("ЗАКОНЫ")], ["icons_hub_stats.webp", tr("СТАТИСТИКА")], ["icons_hub_achievements.webp", tr("ДОСТИЖЕНИЯ")], ["icons_hub_store.webp", tr("МАГАЗИН")], ["icons_hub_forum.webp", tr("ФОРУМ")]];
  const FRIENDS: [string, string, string][] = [[tr("Ясмин"), "yasmin", "p5"], [tr("Аяна Каримова"), "ayana_karimova", "p0"], [tr("Сардор"), "sardor", "p2"], [tr("Тута Джейн"), "tuta_jain", "p4"], [tr("Асад Асадов"), "asad", "me1"]];
  return (
    <AbsoluteFill style={{ background: "#fff", fontFamily: UI, overflow: "hidden" }}>
      <AbsoluteFill style={{ opacity: page, transformOrigin: "50% 0", transform: "translateY(110px) scale(0.89)" }}>
        {/* sidebar */}
        <div style={{ position: "absolute", left: 0, top: 0, width: 300, height: 1220, background: "linear-gradient(180deg, #eaf6ff, #f6fbff)" }}>
          <Img src={staticFile("brand/veoskill.webp")} style={{ position: "absolute", left: 60, top: 30, height: 46 }} />
          {NAV.map(([ic, t], i) => (
            <div key={t} style={{ position: "absolute", left: 22, top: 110 + i * 70, width: 256, height: 58, display: "flex", alignItems: "center", gap: 16, paddingLeft: 12, fontWeight: 800, fontSize: 19, letterSpacing: "0.08em", color: "#5d6470" }}>
              <Img src={S(ic)} style={{ width: 40, height: 40, objectFit: "contain" }} />{t}
            </div>
          ))}
          <div style={{ position: "absolute", left: 14, top: 760, width: 272, height: 150, borderRadius: 20, background: "linear-gradient(135deg, #1cb0f6, #3db7f4)", color: "#fff", padding: "18px 20px", boxSizing: "border-box" }}>
            <div style={{ fontWeight: 700, fontSize: 15, opacity: 0.85 }}>{tr("Текущий план")}</div>
            <div style={{ fontWeight: 900, fontSize: 26 }}>Premium</div>
            <div style={{ marginTop: 6, fontWeight: 600, fontSize: 14, opacity: 0.9 }}>{tr("Полный доступ открыт. Энергия и возможности без лимитов.")}</div>
          </div>
        </div>
        {/* header card */}
        <div style={{ position: "absolute", left: 400, top: 20, width: 840, height: 380, borderRadius: 28, background: "linear-gradient(120deg, #f2c4bd, #f7d9cf 60%, #f4cfc7)", overflow: "hidden" }}>
          {[["⇪", 1110 - 400], ["⚙", 1190 - 400]].map(([k, x], i) => <div key={k} style={{ position: "absolute", left: (x as number) - 32, top: 40, width: 64, height: 64, borderRadius: 16, background: "#fff", boxShadow: `0 ${4 - 3 * (i ? press(f, T.GEAR) : 0)}px 0 #e2e2e2`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#3c3c3c" }}>{k}</div>)}
          <div style={{ position: "absolute", left: 420 - 85, top: 34, transform: `scale(${1 + 0.12 * Math.sin(lin(f, T.OK + 8, T.OK + 30) * Math.PI)})` }}><AvatarImg size={170} src="p3" bg={f >= T.OK ? "#f7d6ef" : "#ffe2d1"} ring /></div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 224, textAlign: "center", fontFamily: HEAD, fontWeight: 900, fontSize: 40, color: "#3c3c3c" }}>{tr("Нодира")} <Verified size={38} /></div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 278, textAlign: "center", fontWeight: 600, fontSize: 19, color: "#7c6f6a" }}><span style={{ color: "#2e9d3a", fontWeight: 800 }}>{tr("В сети")}</span> {tr("· С нами с 6 ноября 2026 г.")}</div>
          <div style={{ position: "absolute", left: 28, top: 312, display: "flex", gap: 12 }}>{[tr("12 подписки"), tr("48 подписчиков")].map((t) => <div key={t} style={{ padding: "12px 20px", borderRadius: 14, background: "#fff", fontWeight: 900, fontSize: 18, color: BLUE }}>{t}</div>)}</div>
        </div>
        {/* stats */}
        <div style={{ position: "absolute", left: 400, top: 430, fontWeight: 800, fontSize: 30, color: INK }}>{tr("Статистика")}</div>
        <div style={{ position: "absolute", left: 400, top: 480, width: 840, height: 190, borderRadius: 20, border: "2px solid #e5e5e5", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          {[["real/key-fire.webp", "12", tr("Серия")], ["site/gem.svg", "1 250", tr("Всего XP")], ["site/icons_hub_docs.webp", "34", tr("Уроки")], ["site/stickers_module.webp", "3", tr("Курсы")]].map(([ic, v, l], i) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 18, padding: "0 28px", borderLeft: i % 2 ? "2px solid #e5e5e5" : undefined, borderTop: i > 1 ? "2px solid #e5e5e5" : undefined }}>
              <Img src={staticFile(ic)} style={{ width: 42, height: 42, objectFit: "contain" }} />
              <div><div style={{ fontWeight: 900, fontSize: 28, color: INK }}>{v}</div><div style={{ fontWeight: 600, fontSize: 17, color: "#7c8593" }}>{l}</div></div>
            </div>
          ))}
        </div>
        {/* medals */}
        <div style={{ position: "absolute", left: 400, top: 696, fontWeight: 800, fontSize: 30, color: INK }}>{tr("Медали")}</div>
        <div style={{ position: "absolute", left: 1170, top: 702, fontWeight: 900, fontSize: 20, letterSpacing: "0.08em", color: BLUE }}>{tr("ВСЕ")}</div>
        <div style={{ position: "absolute", left: 400, top: 746, width: 840, height: 140, borderRadius: 20, border: "2px solid #e5e5e5", display: "flex", alignItems: "center", justifyContent: "space-around" }}>
          {[1, 1, 0, 0, 0, 0].map((o, i) => <Medal key={i} on={o} n={i + 1} size={78} kind={i % 2 ? "ribbon" : "star"} />)}
        </div>
        {/* right column */}
        <div style={{ position: "absolute", left: 1330, top: 30, display: "flex", gap: 46, fontWeight: 900, fontSize: 24 }}>
          {[["site/stickers_module.webp", "3", "#3c3c3c"], ["real/key-fire.webp", "12", "#ff9600"], ["site/gem.svg", "100", BLUE], ["real/heart-red.webp", "∞", "#ff4b4b"]].map(([ic, v, c]) => <div key={ic} style={{ display: "flex", alignItems: "center", gap: 8, color: c }}><Img src={staticFile(ic)} style={{ width: 38, height: 38, objectFit: "contain" }} />{v}</div>)}
        </div>
        <div style={{ position: "absolute", left: 1320, top: 100, width: 400, height: 230, borderRadius: 20, border: "2px solid #e5e5e5", padding: "22px 26px", boxSizing: "border-box" }}>
          <div style={{ fontWeight: 800, fontSize: 24, color: INK }}>{tr("Добавить друзей")}</div>
          {[["🔍", tr("Найти друзей")], ["🦉", tr("Пригласить друзей")]].map(([ic, t], i) => <div key={t} style={{ marginTop: i ? 10 : 22, height: 60, display: "flex", alignItems: "center", gap: 16, fontWeight: 800, fontSize: 21, color: INK, borderRadius: 14, border: i === 0 && f >= T.FIND - 14 ? `3px solid ${BLUE}` : "3px solid transparent", padding: "0 8px" }}><span style={{ fontSize: 30 }}>{ic}</span>{t}<span style={{ marginLeft: "auto", color: "#9aa1ab" }}>›</span></div>)}
        </div>

        {/* avatar editor, laid out like the site */}
        {ed > 0.001 ? (
          <>
            <div style={{ position: "absolute", left: -400, top: -400, right: -400, bottom: -400, background: `rgba(40,46,58,${0.45 * ed})` }} />
            <div style={{ position: "absolute", left: EX, top: EY, width: EW, height: EH, borderRadius: 26, background: "#fff", boxShadow: "0 40px 120px rgba(13,22,48,0.35)", opacity: Math.min(1, ed * 1.4), transform: `translateY(${(1 - ed) * 40}px)`, overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 40, top: 28, fontWeight: 800, fontSize: 32, color: "#3c3c3c" }}>{tr("Редактировать")}</div>
              {[["dice", "#fff", "#e3e5e9"], ["ok", GREEN, GLIP], ["close", "#fff", "#e3e5e9"]].map(([k, c, sh]) => { const cx = BTN[k as "dice"] - EX; const d = k === "ok" ? press(f, T.OK) : 0; return (
                <div key={k} style={{ position: "absolute", left: cx - 29, top: 19, width: 58, height: 58, borderRadius: 16, background: c, border: c === "#fff" ? "3px solid #e3e5e9" : undefined, boxSizing: "border-box", boxShadow: `0 ${4 - 3 * d}px 0 ${sh}`, transform: `translateY(${d * 3}px)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {k === "dice" ? <svg width="28" height="28" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4" fill={BLUE} /><g fill="#fff"><circle cx="8" cy="8" r="1.6" /><circle cx="16" cy="8" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="8" cy="16" r="1.6" /><circle cx="16" cy="16" r="1.6" /></g></svg>
                    : k === "ok" ? <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                    : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6f7682" strokeWidth="2.8" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>}
                </div>); })}
              <div style={{ position: "absolute", left: 30, top: 96 + 20, width: EW - 60, height: 240, borderRadius: 22, background: bg, overflow: "hidden", display: "flex", justifyContent: "center" }}>
                <Img key={av} src={staticFile(`av/nobg/${av}.svg`)} style={{ width: 280, height: 280, marginTop: 10, transform: `scale(${1 + 0.05 * Math.sin(lin(f, T.B + 2, T.B + 18) * Math.PI)})` }} />
              </div>
              <div style={{ position: "absolute", left: 30, top: 96 + 280, width: EW - 60, height: 76, borderRadius: 18, background: "#f4f6f9", display: "flex", padding: 4, boxSizing: "border-box" }}>
                {TABS.map((t, i) => (
                  <div key={t} style={{ width: TABW, borderRadius: 14, background: i === tab ? "#4aa8f0" : "transparent", color: i === tab ? "#fff" : "#3c3c3c", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, fontWeight: 800, fontSize: 18 }}>
                    <span style={{ fontSize: 22 }}>{["👤", "🙂", "✂", "👕", "👓", "🎨", "📷"][i]}</span>{t}
                  </div>
                ))}
              </div>
              <div style={{ position: "absolute", left: 40, top: 96 + 384, fontWeight: 800, fontSize: 26, color: "#3c3c3c" }}>{tab === 0 ? tr("Тип персонажа") : tr("Цвет фона")}</div>
              {tab === 0 ? CARDS.map(([t, d, a], i) => (
                <div key={t} style={{ position: "absolute", left: 30 + (i % 2) * 478, top: 96 + 430 + Math.floor(i / 2) * 126, width: 462, height: 110, borderRadius: 18, border: `3px solid ${i === card ? BLUE : "#e5e5e5"}`, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 16, padding: "0 18px", transform: `scale(${i === card && card > 0 ? 1 + 0.04 * Math.sin(lin(f, card === 1 ? T.TAB1 + 2 : T.H + 2, (card === 1 ? T.TAB1 : T.H) + 14) * Math.PI) : 1})` }}>
                  <Img src={staticFile(`av/${a}.svg`)} style={{ width: 76, height: 76, borderRadius: 16 }} />
                  <div><div style={{ fontWeight: 800, fontSize: 23, color: INK }}>{t}</div><div style={{ fontWeight: 600, fontSize: 16, color: "#7c8593" }}>{d}</div></div>
                </div>
              )) : BG2.map((c, i) => { const sel = f >= T.B + 2 ? i === 3 : i === 2; return (
                <div key={c + i} style={{ position: "absolute", left: 30 + (i % 8) * 116, top: 96 + 430 + Math.floor(i / 8) * 104, width: 100, height: 88, borderRadius: 18, border: `3px solid ${sel ? BLUE : "#e5e5e5"}`, padding: 6, boxSizing: "border-box", transform: sel && f >= T.B + 2 ? `scale(${1 + 0.08 * Math.sin(lin(f, T.B + 2, T.B + 16) * Math.PI)})` : undefined }}>
                  <div style={{ width: "100%", height: "100%", borderRadius: 12, background: c }} />
                </div>); })}
            </div>
          </>
        ) : null}
        {/* medals */}
        {med > 0.001 ? (
          <Modal o={med} x={460} y={190} w={1000} h={720} title={tr("Медали")} closeDown={press(f, T.MCLOSE)}>
            {[[tr("Опыт"), xpFill, `${Math.round(xpFill * 100)} / 100`, "#ffc800", [100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000], xpFill >= 1 ? 2 : 1, T.MED + 70], [tr("Уроки"), lsFill, `${Math.round(lsFill * 5)} / 5`, BLUE, [1, 3, 5, 10, 15, 25, 40, 60, 100], lsFill >= 1 ? 3 : 2, T.MED + 100]].map(([t, fill, lb, c, ns, on, at], k) => (
              <div key={t as string} style={{ padding: "26px 32px 0", borderTop: k ? "2px solid #eef0f3" : undefined, marginTop: k ? 16 : 0 }}>
                <div style={{ fontWeight: 900, fontSize: 28, color: INK }}>{t as string}</div>
                <div style={{ marginTop: 16, height: 40, borderRadius: 20, background: "#eef0f3", position: "relative", overflow: "hidden" }}>
                  <div style={{ width: `${(fill as number) * 100}%`, height: "100%", borderRadius: 20, background: c as string }} />
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 21, color: INK }}>{lb as string}</div>
                </div>
                <div style={{ marginTop: 22, display: "flex", justifyContent: "space-between" }}>
                  {(ns as number[]).map((n, i) => { const lit = i < (on as number); const pop = i === (on as number) - 1 && f >= (at as number) ? sp(at as number, 9, 240) : lit ? 1 : 0; return (
                    <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <Medal on={lit ? Math.max(0.6, pop) : 0} n={i + 1} size={78} kind={k ? "ribbon" : "star"} />
                      <div style={{ fontWeight: 800, fontSize: 18, color: lit ? BLUE : "#7c8593" }}>{n.toLocaleString("ru-RU")}</div>
                    </div>); })}
                </div>
              </div>
            ))}
          </Modal>
        ) : null}

        {/* find friends */}
        {fr > 0.001 ? (
          <Modal o={fr} x={510} y={170} w={900} h={900} title={tr("Найдите друзей")}>
            <div style={{ margin: "20px 32px 0", height: 62, borderRadius: 16, border: "3px solid #e5e5e5", display: "flex", alignItems: "center", gap: 12, padding: "0 20px", fontWeight: 600, fontSize: 22, color: "#9aa1ab" }}>{tr("🔍 Имя или имя пользователя")}</div>
            <div style={{ margin: "22px 32px 10px", fontWeight: 800, fontSize: 22, color: INK }}>{tr("Вы можете их знать")}</div>
            {FRIENDS.map(([n, u, av], i) => { const added = (i === 0 && f >= T.ADD1 + 2) || (i === 2 && f >= T.ADD2 + 2); const e = lin(f, T.FR + 8 + i * 4, T.FR + 20 + i * 4); return (
              <div key={u} style={{ height: 100, display: "flex", alignItems: "center", gap: 20, padding: "0 32px", borderTop: "2px solid #f0f1f4", opacity: e, transform: `translateY(${(1 - e) * 14}px)` }}>
                <Img src={staticFile(`av/${av}.svg`)} style={{ width: 66, height: 66, borderRadius: 33, background: "#eef1f5" }} />
                <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 24, color: INK }}>{n}</div><div style={{ fontWeight: 600, fontSize: 18, color: "#7c8593" }}>{u}</div></div>
                <div style={{ width: added ? 150 : 64, height: 60, borderRadius: 14, background: added ? GREEN : BLUE, boxShadow: `0 4px 0 ${added ? GLIP : "#1899d6"}`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontWeight: 900, fontSize: 18, transform: `scale(${1 + 0.12 * Math.sin(lin(f, i === 0 ? T.ADD1 + 2 : T.ADD2 + 2, (i === 0 ? T.ADD1 : T.ADD2) + 16) * Math.PI)})` }}>
                  {added ? <><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>{tr("ДРУЗЬЯ")}</> : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round"><circle cx="10" cy="8" r="4" /><path d="M3 20c0-4 3-6 7-6s7 2 7 6M19 8v6M16 11h6" /></svg>}
                </div>
              </div>); })}
          </Modal>
        ) : null}
        {f >= 8 && f < T.END - 12 ? <Pointer x={px} y={py} down={down} op={lin(f, 8, 18) * (1 - lin(f, T.END - 26, T.END - 12))} /> : null}
      </AbsoluteFill>
      <Confetti at={T.OK + 8} y={420} />
      <Confetti at={T.MED + 72} y={520} n={60} />
      {(() => { const dim = Math.max(ed, med, fr); return dim > 0.5 ? <TopLine key={ci} a={caps[ci][1]} b={caps[ci][2]} at={caps[ci][0] + 4} size={66} dark band="rgba(0,0,0,0)" accentColor="#9fe3ff" /> : <TopLine key={ci} a={caps[ci][1]} b={caps[ci][2]} at={caps[ci][0] + 4} size={66} />; })()}
    </AbsoluteFill>
  );
};

/** Premium page: night banner with owls, three plans, then what you get (basic vs Premium). */
export const Premium: React.FC = () => {
  const f = useFrame();
  const sp = useSp();
  const CLICK = 150, SCR0 = 186, SCR1 = 236, ROW0 = 246;
  const scroll = lin(f, SCR0, SCR1, 0, 470, IOE);
  const PLANS: [string, string, string, string, string][] = [[tr("ПОПУЛЯРНОЕ"), "#ffc800", tr("1 месяц"), tr("69 999 сум"), tr("в месяц")], [tr("ВЫГОДНО"), BLUE, tr("3 месяца"), tr("209 999 сум"), tr("за 3 месяца")], [tr("МАКСИМУМ"), BLUE, tr("12 месяцев"), tr("839 999 сум"), tr("за 12 месяцев")]];
  const ROWS: [string, boolean][] = [[tr("Уроки и теория"), true], [tr("Тексты законов Узбекистана"), true], [tr("Безлимитная энергия"), false], [tr("Все модули"), false], [tr("ИИ-помощник без очереди"), false], [tr("Книги veoskill"), false]];
  const CW = 520, GX = 40, CX0 = (1920 - 3 * CW - 2 * GX) / 2;
  const btnX = CX0 + 2 * (CW + GX) + CW / 2, btnY = 570 + 440 - 66;
  const pk = [20, CLICK - 14, CLICK + 10, SCR0];
  const px = interpolate(f, pk, [1100, btnX, btnX, btnX + 60], { ...cl, easing: IOE });
  const py = interpolate(f, pk, [1000, btnY, btnY, btnY + 40], { ...cl, easing: IOE });
  const Badge: React.FC<{ s?: number }> = ({ s = 1 }) => (
    <div style={{ display: "inline-block", padding: `${6 * s}px ${22 * s}px`, borderRadius: 10 * s, background: "linear-gradient(90deg, #2ee59d, #3db7f4 50%, #b46cff)", transform: "skewX(-14deg)", boxShadow: `0 0 0 ${3 * s}px #fff, 0 6px 16px rgba(0,0,0,0.2)` }}>
      <div style={{ transform: "skewX(14deg)", fontFamily: HEAD, fontWeight: 900, fontStyle: "italic", fontSize: 30 * s, color: "#fff", letterSpacing: "0.02em" }}>PREMIUM</div>
    </div>
  );
  return (
    <AbsoluteFill style={{ background: "#fff", fontFamily: UI, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translateY(${-scroll}px)` }}>
        {/* night banner, full bleed under the caption; the owls stand on a cloud */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 560, background: "linear-gradient(180deg, #0b1446 0%, #121d5c 100%)", overflow: "hidden", opacity: lin(f, 0, 14) }}>
          {Array.from({ length: 16 }, (_, i) => <div key={i} style={{ position: "absolute", left: (i * 137 + 40) % 1880, top: 150 + ((i * 71) % 230), color: "#fff", fontSize: 16 + (i % 3) * 8, opacity: 0.35 + 0.6 * Math.abs(Math.sin(f / 12 + i)) }}>✦</div>)}
          <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: HEAD, fontWeight: 800, fontSize: 40, lineHeight: 1.3, color: "#fff" }}>{tr("С Premium все модули, ИИ-помощник")}<br />{tr("и книги veoskill")} <span style={{ color: "#58e05a" }}>{tr("без ограничений")}</span></div>
          <div style={{ position: "absolute", right: 70, top: 160, transform: `rotate(-4deg) scale(${sp(6, 11, 180)})` }}><Badge /></div>
          <svg style={{ position: "absolute", left: 0, top: 380 }} width="1920" height="180" viewBox="0 0 1920 180">
            {[0, 1].map((layer) => (
              <g key={layer} transform={layer ? "" : "translate(0,-10)"} fill={layer ? "#ffffff" : "#bfe9ff"}>
                <rect x="0" y="120" width="1920" height="60" />
                {Array.from({ length: 18 }, (_, i) => { const x = i * 116 - 20; const r = 70 + ((i * 37) % 5) * 9 + (Math.abs(x - 960) < 360 ? 24 : 0); return <circle key={i} cx={x} cy={150 - (Math.abs(x - 960) < 360 ? 26 : 0)} r={r} />; })}
              </g>
            ))}
          </svg>
          {["v4/owl-read.png", "v4/owl-q.png", "hack/owl.png"].map((o, i) => <Img key={o} src={staticFile(o)} style={{ position: "absolute", left: 960 + (i - 1) * 230 - 65, top: 300 - Math.abs(Math.sin(f / 9 + i * 1.3)) * 16, width: 130, height: 130, objectFit: "contain" }} />)}
        </div>
        {/* plans */}
        {PLANS.map(([tag, tc, t, price, per], i) => { const e = sp(14 + i * 6, 14, 170); const hot = i === 2 && f >= CLICK - 30; return (
          <div key={t} style={{ position: "absolute", left: CX0 + i * (CW + GX), top: 570, width: CW, height: 440, borderRadius: 28, border: `4px solid ${hot ? "#1899d6" : BLUE}`, background: "#fff", boxSizing: "border-box", padding: "40px 36px", opacity: Math.min(1, e * 1.4), transform: `translateY(${(1 - e) * 50}px) scale(${hot ? 1.03 : 1})`, boxShadow: hot ? "0 24px 60px rgba(28,176,246,0.3)" : undefined }}>
            <div style={{ position: "absolute", right: 30, top: -22, padding: "6px 18px", borderRadius: 14, background: tc, color: tc === "#ffc800" ? "#5a4300" : "#fff", fontWeight: 900, fontSize: 18, letterSpacing: "0.06em" }}>{tag}</div>
            <Badge s={0.75} />
            <div style={{ marginTop: 18, fontWeight: 900, fontSize: 32, color: INK }}>{t}</div>
            <div style={{ marginTop: 6, fontWeight: 600, fontSize: 19, lineHeight: 1.4, color: "#6f7682" }}>{tr("Все модули, безлимитная энергия, ИИ без очереди и книги veoskill")}</div>
            <div style={{ marginTop: 18, fontFamily: HEAD, fontWeight: 900, fontSize: 46, color: INK }}>{price}</div>
            <div style={{ fontWeight: 600, fontSize: 18, color: "#6f7682" }}>{per}</div>
          </div>); })}
        {PLANS.map((_, i) => <div key={i} style={{ position: "absolute", left: CX0 + i * (CW + GX) + 36, top: btnY - 34, width: CW - 72, height: 68, borderRadius: 16, background: BLUE, boxShadow: `0 ${5 - 4 * (i === 2 ? press(f, CLICK) : 0)}px 0 #1899d6`, transform: `translateY(${i === 2 ? press(f, CLICK) * 4 : 0}px)`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 22, letterSpacing: "0.06em", opacity: lin(f, 20 + i * 6, 34 + i * 6) }}>{tr("ОФОРМИТЬ")}</div>)}
        {/* what you get */}
        <div style={{ position: "absolute", left: 140, top: 1080, width: 1640, borderRadius: 26, border: "3px solid #e5e5e5", overflow: "hidden" }}>
          <div style={{ height: 90, display: "flex", alignItems: "center", padding: "0 36px", fontWeight: 900, fontSize: 28, color: INK }}>
            <div style={{ flex: 1 }}>{tr("Что вы получите")}</div>
            <div style={{ width: 240, textAlign: "center", fontSize: 20, letterSpacing: "0.1em", color: "#6f7682" }}>{tr("БАЗОВЫЙ")}</div>
            <div style={{ width: 240, height: 90, display: "flex", alignItems: "center", justifyContent: "center", background: "#eef8ff" }}><Badge s={0.6} /></div>
          </div>
          {ROWS.map(([t, base], i) => { const at = ROW0 + i * 10; const e = sp(at, 12, 220); return (
            <div key={t} style={{ height: 80, display: "flex", alignItems: "center", padding: "0 36px", background: i % 2 ? "#fff" : "#f7f8fa", fontWeight: 600, fontSize: 26, color: INK }}>
              <div style={{ flex: 1 }}>{t}</div>
              <div style={{ width: 240, textAlign: "center", fontSize: 32, color: "#3c3c3c", opacity: Math.min(1, e) }}>{base ? "✓" : "—"}</div>
              <div style={{ width: 240, height: 80, display: "flex", alignItems: "center", justifyContent: "center", background: "#eef8ff" }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" style={{ transform: `scale(${e})` }}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
              </div>
            </div>); })}
        </div>
        {f >= 20 && f < SCR0 + 6 ? <Pointer x={px} y={py} down={press(f, CLICK)} op={lin(f, 20, 30) * (1 - lin(f, SCR0 - 8, SCR0 + 6))} /> : null}
      </AbsoluteFill>
      {f < SCR0 ? <TopLine key={0} a="Premium:" b={tr("всё без ограничений.")} at={4} size={66} dark band="rgba(11,20,70,0)" accentColor="#58e05a" /> : <TopLine key={1} a={tr("Всё сразу,")} b={tr("без лимитов.")} at={SCR0} size={66} />}
      {void NAVY}
    </AbsoluteFill>
  );
};
