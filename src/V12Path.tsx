import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { GREEN, UI, lin, press, Pointer } from "./Scenes9";

// v12 lesson path: rebuilt 1:1 from the site (folder nodes, module banner, side panels, lesson popup).
// A drone camera flies low between the folders, rises to show the page, clicks the current lesson,
// presses НАЧАТЬ and dives into the button (green flood hands off to the first game).
const S = (n: string) => staticFile(`site/${n}`);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const IOE = Easing.bezier(0.45, 0, 0.25, 1);

type Kind = "done" | "now" | "lock";
type Node = { x: number; y: number; k: Kind; ic: string };
const IC: Record<string, string> = {
  check: "M12 25.2 20.2 33.6 36.5 15.2",
  star: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",
  shield: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
  bank: "M3 21h18M5 18V11M9.5 18V11M14.5 18V11M19 18V11M12 3l8.5 5h-17z",
  scale: "M12 3v18M7 21h10M3 7h3c2 0 4.5-1 6-2 1.5 1 4 2 6 2h3M2 16l3-8 3 8c-1.7 1.3-4.3 1.3-6 0zM16 16l3-8 3 8c-1.7 1.3-4.3 1.3-6 0z",
  file: "M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5zM14 2v6h6",
  book: "M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z",
};
const ZX = [876, 982, 1026, 982, 876, 770, 726, 770];
const node = (i: number, y: number, k: Kind, ic: string): Node => ({ x: ZX[i % 8], y, k, ic });
// page geometry measured on veoskill.uz at 1920 px wide
const NODES: Node[] = [
  node(0, 237, "done", "check"), node(1, 320, "done", "check"), node(2, 474, "now", "star"), node(3, 628, "lock", "shield"), node(4, 711, "lock", "book"),
  node(4, 983, "lock", "file"), node(5, 1066, "lock", "scale"), node(6, 1220, "lock", "star"), node(7, 1374, "lock", "shield"), node(0, 1457, "lock", "book"),
  node(0, 1730, "lock", "bank"), node(1, 1813, "lock", "scale"), node(2, 1967, "lock", "file"), node(3, 2121, "lock", "star"), node(4, 2204, "lock", "shield"),
  node(4, 2560, "lock", "bank"), node(5, 2643, "lock", "scale"), node(6, 2797, "lock", "file"), node(7, 2951, "lock", "star"), node(0, 3034, "lock", "book"),
  node(0, 3290, "lock", "shield"), node(1, 3373, "lock", "bank"),
];
const ARTS: [string, number, number][] = [["art_modules_e-learning_1.webp", 611, 326], ["art_modules_e-learning_3.webp", 845, 1072], ["art_modules_e-learning_4.webp", 611, 1819], ["art_modules_e-learning_2.webp", 845, 2600], ["art_modules_e-learning_6.webp", 611, 3180]];
const CUR = NODES[2];
const RING = "M 48 6 L 67.6 6 A 22.4 22.4 0 0 1 90 28.4 L 90 72.6 A 22.4 22.4 0 0 1 67.6 95 L 28.4 95 A 22.4 22.4 0 0 1 6 72.6 L 6 28.4 A 22.4 22.4 0 0 1 28.4 6 L 48 6";

const Folder: React.FC<{ n: Node; down?: number }> = ({ n, down = 0 }) => {
  const on = n.k !== "lock";
  const body = on ? "rgb(88,167,0)" : "#aaaaaa", back = on ? "#53a000" : "#a0a0a0";
  return (
    <div style={{ position: "relative", width: 96, height: 101 }}>
      {n.k === "done" ? (
        <svg width="96" height="101" viewBox="0 0 96 101" style={{ position: "absolute", left: 0, top: 0 }}>
          {[-0.025, -0.35833, -0.69167].map((o) => <path key={o} d={RING} fill="none" stroke="#58cc02" strokeWidth="6" strokeLinecap="round" pathLength={1} strokeDasharray="0.28333 1" strokeDashoffset={o} />)}
        </svg>
      ) : n.k === "now" ? (
        <svg width="96" height="101" viewBox="0 0 96 101" style={{ position: "absolute", left: 0, top: 0 }}>
          <path d={RING} fill="none" stroke="#e5e5e5" strokeWidth="6" strokeLinecap="round" pathLength={1} strokeDasharray="0.28333 0.05" strokeDashoffset={0.30833} />
        </svg>
      ) : null}
      <svg width="70" height="75" viewBox="0 0 70 75" style={{ position: "absolute", left: 13, top: 13 }}>
        <path d="M2.8 14V6.37Q2.8 0 9.17 0H25.83Q32.2 0 32.2 6.37V14Z" fill={back} />
        <rect x="0" y="7" width="70" height="68" rx="9.1" fill={back} />
        <rect x="8.4" y="11.9" width="53.2" height="35" rx="4.55" fill={on ? "#fff" : "#f2f2f2"} />
        <line x1="15.4" y1="17.5" x2="43.4" y2="17.5" strokeWidth="2" strokeLinecap="round" stroke={on ? "rgb(88,167,0)" : "rgb(189,189,189)"} strokeOpacity="0.35" />
        <rect x="0" y="26" width="70" height="49" rx="9.1" fill={body} />
      </svg>
      <div style={{ position: "absolute", left: 13, top: 34 + down * 4, width: 70, height: 49, borderRadius: 9.1, background: on ? "linear-gradient(#79d635 0px, #58cc02 35%)" : "linear-gradient(#dadada 0px, #cccccc 35%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
        {n.ic === "check" ? (
          <svg viewBox="0 0 48 48" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round"><path d={IC.check} /></svg>
        ) : (
          <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={IC[n.ic]} /></svg>
        )}
      </div>
    </div>
  );
};

const Banner: React.FC<{ y: number; color: string; lip: string; label: string; title: string; back?: boolean }> = ({ y, color, lip, label, title, back }) => (
  <div style={{ position: "absolute", left: 427, top: y, width: 835, height: 140, borderRadius: 20, background: color, boxShadow: `0 6px 0 ${lip}`, padding: "0 30px", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: UI, color: "#fff" }}>
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, fontWeight: 800, fontSize: 17, letterSpacing: "0.08em" }}>
        {back ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12H5M11 5.5 4.5 12 11 18.5" /></svg> : null}
        {label}
      </div>
      <div style={{ marginTop: 14, fontWeight: 800, fontSize: 31, letterSpacing: "-0.01em" }}>{title}</div>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 22px", borderRadius: 14, border: "2px solid rgba(255,255,255,0.3)", background: "rgba(0,0,0,0.08)", boxShadow: "0 3px 0 rgba(0,0,0,0.16)", fontWeight: 900, fontSize: 17, letterSpacing: "0.04em" }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2.5" width="16" height="19" rx="3" /><path d="M10 8.5h7M10 12.5h7M10 16.5h5M2.5 6h4M2.5 10h4M2.5 14h4M2.5 18h4" /></svg>
      СПРАВОЧНИК
    </div>
  </div>
);

const NAV: [string, string, boolean?][] = [["icons_hub_home.webp", "КАБИНЕТ", true], ["stickers_module.webp", "МОДУЛИ"], ["icons_duel_scales.webp", "ЗАКОНЫ"], ["icons_hub_stats.webp", "СТАТИСТИКА"], ["icons_hub_achievements.webp", "ДОСТИЖЕНИЯ"], ["icons_hub_store.webp", "МАГАЗИН"], ["stickers_key-book.webp", "МАТЕРИАЛЫ"], ["icons_hub_forum.webp", "ФОРУМ"]];
const Sidebar: React.FC = () => (
  <div style={{ position: "absolute", left: 0, top: -400, width: 315, height: 1480, background: "linear-gradient(180deg, #eef8ff 0%, #e6f4fe 100%)", border: "2px solid #d5ebfa", borderLeft: "none", borderRadius: "0 28px 28px 0", boxShadow: "6px 0 24px rgba(28,120,200,0.06)", fontFamily: UI }}>
    <Img src={staticFile("brand/veoskill.webp")} style={{ position: "absolute", left: 78, top: 420, height: 42 }} />
    <svg style={{ position: "absolute", left: 260, top: 424 }} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3c3c3c" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="4" /><path d="M9 4v16" /></svg>
    {NAV.map(([ic, t, on], i) => (
      <div key={t} style={{ position: "absolute", left: 14, top: 482 + i * 56, width: 286, height: 48, borderRadius: 14, border: on ? "2px solid #84d8ff" : "2px solid transparent", background: on ? "#ddf4ff" : undefined, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 18, padding: "0 16px" }}>
        <Img src={S(ic)} style={{ width: 34, height: 34, objectFit: "contain" }} />
        <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: "0.08em", color: on ? "#1cb0f6" : "#4b4b4b" }}>{t}</span>
      </div>
    ))}
    <div style={{ position: "absolute", left: 14, top: 1126, width: 286, height: 180, borderRadius: 24, background: "linear-gradient(140deg, #45c6ff 0%, #1aa3ec 100%)", boxShadow: "0 10px 26px rgba(26,163,236,0.3)", color: "#fff", padding: "18px 18px", boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 46, height: 46, borderRadius: 23, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><Img src={S("owl-cool.png")} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 20 }} /></div>
        <div><div style={{ fontWeight: 600, fontSize: 15, opacity: 0.9 }}>Текущий план</div><div style={{ fontWeight: 900, fontSize: 21 }}>Базовый</div></div>
      </div>
      <div style={{ marginTop: 10, fontWeight: 600, fontSize: 14, lineHeight: 1.35, opacity: 0.95 }}>Больше энергии и возможностей с Premium.</div>
      <div style={{ marginTop: 12, height: 40, borderRadius: 20, background: "#fff", color: "#1a8fd0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15 }}>Купить подписку</div>
    </div>
  </div>
);
const Card: React.FC<{ top: number; h: number; children: React.ReactNode }> = ({ top, h, children }) => (
  <div style={{ position: "absolute", left: 1342, top, width: 478, height: h, borderRadius: 22, border: "2px solid #e5e5e5", background: "#fff", boxSizing: "border-box", fontFamily: UI }}>{children}</div>
);
const RightPanel: React.FC = () => (
  <>
    {[["stickers_module.webp", "1", "#4b4b4b", 1368], ["stickers_key-fire.webp", "0", "#ff9600", 1492], ["pay_icon-gem.webp", "515", "#1cb0f6", 1600], ["heart-red.webp", "5", "#ff4b4b", 1736]].map(([ic, n, c, x]) => (
      <div key={ic as string} style={{ position: "absolute", left: x as number, top: 34, display: "flex", alignItems: "center", gap: 10, fontFamily: UI, fontWeight: 800, fontSize: 21, color: c as string }}>
        <Img src={S(ic as string)} style={{ width: 38, height: 38, objectFit: "contain" }} />{n}
      </div>
    ))}
    <Card top={92} h={350}>
      <Img src={S("premium-logo.webp")} style={{ position: "absolute", left: 24, top: 24, height: 38 }} />
      <Img src={S("owl-cool.png")} style={{ position: "absolute", right: 22, top: 12, width: 100 }} />
      <div style={{ position: "absolute", left: 24, top: 78, width: 300, fontWeight: 800, fontSize: 22, lineHeight: 1.4, color: "#3c3c3c" }}>Откройте все модули с Premium</div>
      <div style={{ position: "absolute", left: 24, top: 156, width: 330, fontWeight: 600, fontSize: 17, lineHeight: 1.75, color: "#777" }}>Без рекламы, безлимит энергии и все модули. Персональные уроки и практика под ваш темп.</div>
      <div style={{ position: "absolute", left: 24, top: 264, width: 426, height: 58, borderRadius: 16, background: "#1cb0f6", boxShadow: "0 5px 0 #1899d6", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 17, letterSpacing: "0.06em" }}>КУПИТЬ ПОДПИСКУ</div>
    </Card>
    <Card top={460} h={350}>
      <div style={{ position: "absolute", left: 24, top: 30, fontWeight: 800, fontSize: 22, color: "#3c3c3c" }}>Лига</div>
      <div style={{ position: "absolute", right: 26, top: 34, fontWeight: 800, fontSize: 17, color: "#1cb0f6", letterSpacing: "0.04em" }}>ВСЕ</div>
      <Img src={S("leagues_bronze.webp")} style={{ position: "absolute", left: 28, top: 82, width: 74 }} />
      <svg style={{ position: "absolute", left: 46, top: 168 }} width="40" height="64" viewBox="0 0 40 64" fill="none" stroke="#1cb0f6" strokeWidth="3" strokeLinecap="round"><path d="M20 4c10 4 12 18 0 22-10-4-6-16 4-12M20 26v34M12 52l8 8 8-8" /></svg>
      <svg style={{ position: "absolute", left: 30, top: 246 }} width="66" height="80" viewBox="0 0 66 80"><path d="M6 6h54v40c0 16-27 28-27 28S6 62 6 46z" fill="#ececec" stroke="#dcdcdc" strokeWidth="3" /><circle cx="33" cy="34" r="7" fill="#c9c9c9" /><rect x="30" y="38" width="6" height="14" rx="2" fill="#c9c9c9" /></svg>
      {["Лига: Бронзовая лига", "Место номер: 1", "Вы в зоне повышения", "До конца недели: 5 дн."].map((t, i) => (
        <div key={t} style={{ position: "absolute", left: 122, top: 88 + i * 68, display: "flex", alignItems: "center", gap: 14, fontWeight: 600, fontSize: 18, color: "#4b4b4b" }}>
          <span style={{ width: 24, height: 24, borderRadius: 12, border: "2px solid #c8c8c8", boxSizing: "border-box" }} />{t}
        </div>
      ))}
    </Card>
    <Card top={828} h={300}>
      <div style={{ position: "absolute", left: 24, top: 30, fontWeight: 800, fontSize: 22, color: "#3c3c3c" }}>Задания дня</div>
      <div style={{ position: "absolute", right: 26, top: 34, fontWeight: 800, fontSize: 17, color: "#1cb0f6", letterSpacing: "0.04em" }}>ВСЕ</div>
      {[0, 1].map((k) => (
        <div key={k} style={{ position: "absolute", left: 24, top: 92 + k * 92, display: "flex", gap: 16, alignItems: "center" }}>
          <Img src={S(k ? "stickers_key-book.webp" : "pay_icon-gem.webp")} style={{ width: 46, height: 46, objectFit: "contain" }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#4b4b4b" }}>{k ? "Пройдите 3 урока сегодня" : "Заработайте 100 XP сегодня"}</div>
            <div style={{ marginTop: 10, width: 330, height: 14, borderRadius: 7, background: "#e5e5e5" }}><div style={{ width: k ? 110 : 190, height: 14, borderRadius: 7, background: "#ffc800" }} /></div>
          </div>
        </div>
      ))}
    </Card>
  </>
);

const Twinkle: React.FC<{ l: string; t: string; s: number; ph: number; f: number }> = ({ l, t, s, ph, f }) => (
  <svg viewBox="0 0 20 20" width={s} height={s} style={{ position: "absolute", left: l, top: t, opacity: 0.45 + 0.55 * Math.abs(Math.sin(f / 14 + ph * 6)), transform: `scale(${0.7 + 0.3 * Math.abs(Math.sin(f / 14 + ph * 6))})` }}><path d="M10 0Q11.5 8.5 20 10 11.5 11.5 10 20 8.5 11.5 0 10 8.5 8.5 10 0Z" fill="#fff" /></svg>
);
// popup geometry (page px)
const POP = { x: CUR.x - 160, y: CUR.y + 64, w: 320 };
const START_BTN = { x: CUR.x, y: POP.y + 104 + 25 };

export const LessonPath: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const FLY = 200, LAND = 250, CLICK = 300, START = 356, DIVE = 362;
  // ---- drone flight: low and fast between the folders, weaving, banking into the turns
  const t = lin(f, 0, FLY, 0, 1, Easing.bezier(0.42, 0, 0.3, 1));
  const yStart = 2650, yEnd = CUR.y + 150;
  const fy = yStart + (yEnd - yStart) * t;
  const pathX = (y: number) => {
    // x of the path at page y (interpolated between nodes)
    const ys = NODES.map((n) => n.y), xs = NODES.map((n) => n.x);
    return interpolate(y, ys, xs, cl);
  };
  const ahead = 260;
  const weave = 0;
  const fx = 900; // straight line, like a drone: no left-right weaving
  const dx = pathX(fy - ahead - 120) - pathX(fy - ahead + 120);
  // ---- land: rise, flatten, pull back to the whole page; then push in for the click and the dive
  const up = lin(f, FLY - 40, LAND, 0, 1, IOE);
  const keysF = [LAND, LAND + 34, CLICK - 6, START + 2, DIVE + 44];
  const ox = interpolate(f, keysF, [960, 960, 1010, START_BTN.x, START_BTN.x], { ...cl, easing: IOE });
  const oy = interpolate(f, keysF, [500, 510, 590, START_BTN.y, START_BTN.y], { ...cl, easing: IOE });
  const os = interpolate(f, keysF, [1.0, 1.03, 1.55, 1.6, 9], { ...cl, easing: Easing.bezier(0.55, 0, 0.6, 1) });
  const cx = fx + (ox - fx) * up;
  const cy = fy + (oy - fy) * up;
  const sc = 2.1 + (os - 2.1) * up;
  const rx = 56 * (1 - up);
  const rz = 0 * dx;
  // ---- click + popup
  const pop = spring({ frame: f - CLICK - 3, fps, config: { damping: 13, stiffness: 220 } });
  const kx = [LAND + 10, CLICK - 4, CLICK + 18, START - 4, START + 30];
  const px = interpolate(f, kx, [CUR.x + 420, CUR.x + 4, CUR.x + 30, START_BTN.x + 10, START_BTN.x + 14], { ...cl, easing: IOE });
  const py = interpolate(f, kx, [CUR.y + 300, CUR.y + 6, CUR.y + 40, START_BTN.y - 4, START_BTN.y + 2], { ...cl, easing: IOE });
  const down = Math.max(press(f, CLICK), press(f, START));
  const flood = lin(f, DIVE + 22, DIVE + 50, 0, 1, Easing.bezier(0.5, 0, 0.3, 1));
  const fog = 1 - up;
  const bob = (i: number) => (NODES[i] === CUR ? Math.sin(f / 10) * 3 : 0);
  return (
    <AbsoluteFill style={{ background: "#fff", overflow: "hidden" }}>
      <AbsoluteFill style={{ perspective: 1100 }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 3600, transformStyle: "preserve-3d", transformOrigin: "0 0", transform: `translate(960px, ${560 + 170 * (1 - up)}px) rotateX(${rx}deg) rotateZ(${rz}deg) scale(${sc}) translate(${-cx}px, ${-cy}px)` }}>
          <div style={{ position: "absolute", left: -900, top: -300, width: 3720, height: 4000, backgroundImage: "radial-gradient(rgba(20,60,110,0.16) 2.4px, transparent 2.8px)", backgroundSize: "48px 48px", opacity: 1 - up }} />
          <Sidebar />
          <RightPanel />
          <Banner y={22} color="#58cc02" lip="#58a700" label="МОДУЛЬ 1" title="Введение в право" back />
          <Banner y={2330} color="#ff9600" lip="#e08600" label="ЧАСТЬ 2" title="Олий Мажлис и референдум" />
          {ARTS.map(([src, x, y]) => (
            <div key={src} style={{ position: "absolute", left: x, top: y, width: 296, height: 296, transformStyle: "preserve-3d", transformOrigin: "50% 100%", transform: `rotateX(${-rx * 0.9}deg)` }}>
              <Img src={S(src)} style={{ width: 296, height: 296 }} />
            </div>
          ))}
          {NODES.map((n, i) => (
            <div key={i} style={{ position: "absolute", left: n.x - 48, top: n.y - 50 + bob(i), width: 96, height: 101, transformOrigin: "50% 100%", transform: `rotateX(${-rx * 0.9}deg)` }}>
              <Folder n={n} down={n === CUR ? press(f, CLICK) : 0} />
            </div>
          ))}
          {pop > 0.01 ? (
            <div style={{ position: "absolute", left: POP.x, top: POP.y, width: POP.w, height: 220, borderRadius: 16, background: GREEN, boxShadow: "0 4px 0 #58a700, 0 24px 50px rgba(40,90,0,0.22)", color: "#fff", fontFamily: UI, transformOrigin: "50% 0%", transform: `scale(${pop})`, opacity: Math.min(1, pop * 1.6) }}>
              <div style={{ position: "absolute", left: "50%", top: -10, marginLeft: -9, width: 0, height: 0, borderLeft: "9px solid transparent", borderRight: "9px solid transparent", borderBottom: `11px solid ${GREEN}` }} />
              {[["8%", "60%", 12, 0], ["22%", "54%", 9, 0.35], ["80%", "52%", 13, 0.15], ["94%", "66%", 9, 0.55], ["90%", "16%", 10, 0.9], ["5%", "95%", 9, 0.8], ["70%", "97%", 9, 0.25]].map(([l, tt, s, ph], k) => <Twinkle key={k} l={l as string} t={tt as string} s={s as number} ph={ph as number} f={f} />)}
              <div style={{ position: "absolute", left: 18, top: 14, width: 284, fontWeight: 800, fontSize: 18, lineHeight: "24px" }}>Кто пишет правила в Узбекистане</div>
              <div style={{ position: "absolute", left: 18, top: 66, fontWeight: 600, fontSize: 15, opacity: 0.92 }}>Урок 3 из 50</div>
              <div style={{ position: "absolute", left: 18, top: 104 - press(f, START) * -4, width: 284, height: 50, borderRadius: 12, background: "#fff", boxShadow: `0 ${4 - press(f, START) * 4}px 0 #e5e5e5, 0 0 ${40 * lin(f, START, START + 14)}px rgba(255,255,255,${0.9 * lin(f, START, START + 14)})`, display: "flex", alignItems: "center", justifyContent: "center", color: GREEN, fontWeight: 800, fontSize: 16, letterSpacing: "0.06em" }}>НАЧАТЬ</div>
              <div style={{ opacity: 1 - lin(f, START + 2, START + 12), position: "absolute", left: 18, top: 160, width: 284, height: 46, borderRadius: 12, background: "#fff", boxShadow: "0 4px 0 #e5e5e5", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "#3c3c3c", fontWeight: 800, fontSize: 16, letterSpacing: "0.06em" }}>
                КУПИТЬ <span style={{ backgroundImage: "linear-gradient(90deg, #1cb0f6, #ce82ff)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>PRO</span>
              </div>
            </div>
          ) : null}
          {f >= LAND && f < DIVE + 20 ? <Pointer x={px} y={py} down={down} op={lin(f, LAND, LAND + 12) * (1 - lin(f, START + 1, START + 6))} /> : null}
        </div>
      </AbsoluteFill>
      {/* atmospheric depth while flying low */}
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(255,255,255,${fog}) 0%, rgba(255,255,255,${0.85 * fog}) 16%, rgba(255,255,255,0) 42%)` }} />
      {flood > 0 ? <AbsoluteFill style={{ background: GREEN, opacity: flood }} /> : null}
    </AbsoluteFill>
  );
};
