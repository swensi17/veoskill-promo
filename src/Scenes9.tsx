import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { fit } from "./Kit7";

// v9 scenes rebuilt after review: lessons in the site's own look, five games with their own motion,
// league table climbing on +15 XP, notes on a phone. No long dashes, no plates behind headline words.

export const BG = "#f3f2ee";
export const NAVY = "#0d1630";
export const BLUE = "#1cb0f6";
export const DEEP = "#0f6fbf";
export const GREEN = "#58cc02";
export const GLIP = "#46a302";
export const YEL = "#ffc800";
export const RED = "#ff4b4b";
export const GREY = "#8b93a1";
export const SWAN = "#e5e5e5";
export const INK = "#3c3c3c";
export const HEAD = "Onest, NunitoC, sans-serif";
export const UI = "NunitoC, Nunito, sans-serif";
export const B = 30;
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const OUTE = Easing.bezier(0.16, 1, 0.3, 1);
export const IOE = Easing.bezier(0.65, 0, 0.35, 1);
export const lin = (f: number, a: number, b: number, x = 0, y = 1, e = IOE) => interpolate(f, [a, b], [x, y], { easing: e, ...cl });
// quick press (2 frames), short hold, soft release over 14 frames: the release drives the click ripple in Pointer
export const press = (f: number, at: number) => lin(f, at, at + 2) * (1 - lin(f, at + 4, at + 18, 0, 1, Easing.out(Easing.quad)));
/** Time stretch for a whole scene: inside <SlowCtx.Provider value={k}> every useFrame()/useSp()/Cap runs k times slower. */
export const SlowCtx = React.createContext(1);
export const useFrame = () => useCurrentFrame() / React.useContext(SlowCtx);
export const useSp = () => {
  const f = useFrame();
  const { fps } = useVideoConfig();
  return (at: number, damping = 13, stiffness = 170) => spring({ frame: f - at, fps, config: { damping, stiffness } });
};

export const Chrome: React.FC<{ label?: string; dark?: boolean }> = ({ label, dark }) => {
  const c = dark ? "rgba(255,255,255,0.78)" : "#6f7682";
  return (
    <>
      <Img src={staticFile("brand/veoskill.webp")} style={{ position: "absolute", left: 60, top: 40, height: 46, filter: dark ? "brightness(0) invert(1)" : undefined }} />
      {label ? (
        <div style={{ position: "absolute", left: 56, bottom: 46, display: "flex", alignItems: "center", gap: 14, fontFamily: HEAD, fontWeight: 600, fontSize: 19, color: c }}>
          <div style={{ width: 28, height: 2, background: c }} />
          {label}
        </div>
      ) : null}
    </>
  );
};
export const Cap: React.FC<{ text: string; at: number; size?: number; color?: string; accent?: string; accentColor?: string; weight?: number; out?: number }> = ({ text, at, size = 56, color = NAVY, accent, accentColor = BLUE, weight = 800, out }) => {
  const f = useFrame();
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
/** One-line caption across the top with a soft fade band behind it (for older viewers: big, one line, easy to read). */
export const TopLine: React.FC<{ a: string; b?: string; at: number; dark?: boolean; band?: string; size?: number; accentColor?: string }> = ({ a, b, at, dark, band, size, accentColor }) => {
  const chars = a.length + (b ? b.length + 1 : 0);
  const fs = size ?? Math.min(72, Math.round(1680 / (chars * 0.56)));
  const bg = band ?? (dark ? "rgba(30,24,60,0.55)" : "rgba(255,255,255,0.97)");
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: fs + 120, background: `linear-gradient(180deg, ${bg} 0%, ${bg} 55%, transparent 100%)`, zIndex: 85, pointerEvents: "none" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 26, zIndex: 86, display: "flex", justifyContent: "center", columnGap: Math.round(fs * 0.3) }}>
        <Cap text={a} at={at} size={fs} color={dark ? "#fff" : NAVY} />
        {b ? <Cap text={b} at={at + 8} size={fs} accent={b} accentColor={accentColor ?? (dark ? "#ffe27a" : BLUE)} /> : null}
      </div>
    </>
  );
};
export const Pointer: React.FC<{ x: number; y: number; down?: number; op?: number }> = ({ x, y, down = 0, op = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, zIndex: 80, opacity: op }}>
    {/* click ripple (Telegram-like): a soft disc and a ring grow out of the tip while the press releases */}
    {down > 0.01 ? (
      <>
        <div style={{ position: "absolute", left: 4 - 40, top: 4 - 40, width: 80, height: 80, borderRadius: "50%", background: "rgba(28,176,246,0.22)", transform: `scale(${0.35 + 0.9 * (1 - down)})`, opacity: Math.min(1, down * 1.6) }} />
        <div style={{ position: "absolute", left: 4 - 40, top: 4 - 40, width: 80, height: 80, borderRadius: "50%", border: "3px solid rgba(28,176,246,0.8)", boxSizing: "border-box", transform: `scale(${0.3 + 1.2 * (1 - down)})`, opacity: down }} />
      </>
    ) : null}
    <svg width="46" height="56" viewBox="0 0 22 27" style={{ position: "relative", transform: `scale(${1 - down * 0.14})`, transformOrigin: "4px 4px", filter: "drop-shadow(0 8px 12px rgba(0,0,0,0.25))" }}><path d="M2 2 L2 21 L7 16.5 L10.5 24.5 L14 23 L10.6 15.2 L17 15 Z" fill={NAVY} stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" /></svg>
  </div>
);
const Check: React.FC<{ s?: number; c?: string; w?: number }> = ({ s = 30, c = "#fff", w = 3.4 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;
const Cross: React.FC<{ s?: number; c?: string }> = ({ s = 30, c = "#fff" }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={3.4} strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>;
/** Pointer path through keyframes [frame, x, y]. */
const usePath = (keys: [number, number, number][]) => {
  const f = useCurrentFrame();
  const fr = keys.map((k) => k[0]);
  return { x: interpolate(f, fr, keys.map((k) => k[1]), { ...cl, easing: IOE }), y: interpolate(f, fr, keys.map((k) => k[2]), { ...cl, easing: IOE }) };
};

// ====================== S4 directions ======================
const DIRS: [string, string][] = [
  ["history", "История"], ["math", "Математика"], ["english", "Английский"], ["business", "Бизнес"], ["psychology", "Психология"],
  ["it", "Программирование"], ["ai", "Искусственный интеллект"], ["medicine", "Медицина"], ["economics", "Экономика"], ["law", "Юриспруденция"],
];
export const S4b: React.FC = () => {
  const f = useCurrentFrame();
  const n = DIRS.length;
  const stepF = Math.max(0, f - 30);
  const k = Math.min(n - 1, Math.floor(stepF / B));
  const frac = k >= n - 1 ? 0 : lin(stepF - k * B, 0, 18, 0, 1, Easing.bezier(0.5, 0, 0.2, 1));
  const pos = k + frac;
  const LAND = 30 + (n - 1) * B;
  const done = lin(f, LAND + 10, LAND + 40, 0, 1, OUTE);
  const front = Math.round(pos) % n;
  const head = lin(f, 0, 24, 0, 1, OUTE);
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Chrome />
      <div style={{ position: "absolute", top: 96, width: "100%", textAlign: "center", overflow: "hidden", fontFamily: HEAD, fontWeight: 900, fontSize: 110, letterSpacing: "-0.035em", color: NAVY }}>
        <div style={{ transform: `translateY(${(1 - head) * 110}%)` }}><span style={{ color: BLUE }}>10</span> направлений</div>
      </div>
      <div style={{ position: "absolute", left: 960 - 520, top: 790, width: 1040, height: 60, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(13,22,48,0.16), rgba(13,22,48,0))" }} />
      {DIRS.map(([slug], i) => {
        const a = ((i - pos) / n) * Math.PI * 2;
        const x = Math.sin(a) * 860;
        const z = Math.cos(a);
        const y = -z * 60;
        const s = 0.32 + 0.68 * ((z + 1) / 2) ** 2.6;
        const dim = i === n - 1 ? 1 : 1 - done * 0.6;
        const enter = lin(f, i * 2, i * 2 + 30, 0, 1, OUTE);
        const bob = Math.sin((f + i * 17) / 26) * 8 * (z > 0.9 ? 1 : 0.4);
        return (
          <div key={slug} style={{ position: "absolute", left: 960 + x - 240, top: 540 + y - 240 + bob, width: 480, height: 480, zIndex: Math.round((z + 1) * 50), transform: `scale(${s * enter}) rotate(${Math.sin(a) * -8}deg)`, opacity: (0.35 + 0.65 * ((z + 1) / 2)) * dim, filter: `blur(${Math.max(0, (1 - z) * 2.2)}px) saturate(${0.55 + 0.45 * dim})` }}>
            <Img src={staticFile(`ic3d2/${slug}-s.png`)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
        );
      })}
      <div style={{ position: "absolute", top: 820, width: "100%", display: "flex", justifyContent: "center" }}>
        <Cap key={front} text={DIRS[front][1]} at={front === 0 ? 0 : 30 + Math.round(pos) * B - B + 10} size={66} />
      </div>

    </AbsoluteFill>
  );
};

// ====================== S5 lessons, the site's look ======================
const SiteStone: React.FC<{ x: number; y: number; at: number; kind: "done" | "now" | "lock"; pr?: number }> = ({ x, y, at, kind, pr = 0 }) => {
  const sp = useSp();
  const f = useCurrentFrame();
  const s = sp(at, 10, 210);
  const top = kind === "lock" ? "#e5e5e5" : GREEN;
  const lip = kind === "lock" ? "#cfcfcf" : GLIP;
  return (
    <div style={{ position: "absolute", left: x - 70, top: y - 64, width: 140, height: 132, transform: `scale(${s})` }}>
      {kind === "now" ? <div style={{ position: "absolute", left: -16, top: -16, width: 172, height: 156, borderRadius: "50%", border: "8px solid #e5e5e5" }}><div style={{ position: "absolute", inset: -8, borderRadius: "50%", border: `8px solid ${GREEN}`, clipPath: `inset(0 ${100 - lin(f, at + 20, at + 70) * 40}% 0 0)` }} /></div> : null}
      <div style={{ position: "absolute", left: 0, top: 14, width: 140, height: 118, borderRadius: "50%", background: lip }} />
      <div style={{ position: "absolute", left: 0, top: pr * 10, width: 140, height: 118, borderRadius: "50%", background: top, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 -6px 0 rgba(0,0,0,0.06)" }}>
        <svg width="56" height="56" viewBox="0 0 24 24" fill={kind === "now" ? "#fff" : "none"} stroke={kind === "lock" ? "#afafaf" : "#fff"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d={kind === "done" ? "M5 12.5l4.5 4.5L19 7.5" : kind === "now" ? "M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.6 6.7 19.4l1.2-6L3.4 9.3l6-.7z" : "M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z"} />
        </svg>
      </div>
    </div>
  );
};
export const S5b: React.FC = () => {
  const f = useCurrentFrame();
  const sp = useSp();
  const C1 = 150, C2 = 196, OPEN = 214, PICK = 330, CHECK = 372, DONE = 470;
  const P: [number, number][] = [[620, 900], [760, 760], [620, 620], [480, 480], [620, 340]];
  const card = sp(C1 + 4, 13, 210) * (1 - lin(f, C2 + 8, C2 + 18));
  const lesson = lin(f, OPEN, OPEN + 36, 0, 1, OUTE);
  const tilt = lin(f, 0, 660, 0, 1, Easing.linear);
  const ptr = usePath([[90, 1300, 1150], [C1 - 6, 640, 640], [C1 + 14, 660, 650], [C2 - 6, 650, 412], [C2 + 24, 760, 470], [PICK - 26, 700, 690], [PICK - 4, 640, 694], [PICK + 16, 660, 720], [CHECK - 8, 650, 930], [CHECK + 30, 760, 980]]);
  const down = Math.max(press(f, C1), press(f, C2), press(f, PICK), press(f, CHECK));
  const picked = f >= PICK + 2;
  const checked = f >= CHECK + 2;
  const bar = sp(CHECK + 4, 15, 170);
  const toast = sp(DONE, 15, 160);
  const fire = f >= DONE + 34 ? 1 : 0;
  const OPTS = ["Соседи по махалле", "Олий Мажлис", "Популярные блогеры"];
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Chrome label="02  Уроки" />
      <div style={{ position: "absolute", left: 120, top: 390 }}>
        <Cap text="Короткий урок." at={10} size={76} />
        <Cap text="Каждый день." at={22} size={76} accent="Каждый день." accentColor={GREEN} />
        <div style={{ marginTop: 20, fontFamily: HEAD, fontWeight: 500, fontSize: 30, color: "#5d6470", opacity: lin(f, 40, 60) }}>Теория, вопрос и награда за пару минут</div>
      </div>
      <AbsoluteFill style={{ perspective: 2400 }}>
        <div style={{ position: "absolute", left: 700, top: 0, width: 1220, height: 1080, transformStyle: "preserve-3d", transform: `rotateY(${-11 + tilt * 5}deg) rotateX(${7 - tilt * 3}deg)` }}>
          {/* path, as on the site */}
          <div style={{ position: "absolute", inset: 0, opacity: 1 - lesson, transform: `scale(${1 + lesson * 0.2})`, transformOrigin: "620px 620px" }}>
            <div style={{ position: "absolute", left: 300, top: 150, width: 640, height: 104, borderRadius: 22, background: GREEN, boxShadow: `0 6px 0 ${GLIP}`, display: "flex", alignItems: "center", padding: "0 30px", fontFamily: UI, color: "#fff", transform: `translateY(${(1 - sp(4, 14, 160)) * -60}px)`, opacity: sp(4, 14, 160) }}>
              <div><div style={{ fontWeight: 800, fontSize: 20, opacity: 0.9 }}>МОДУЛЬ 1</div><div style={{ fontWeight: 900, fontSize: 32 }}>Введение в право</div></div>
            </div>
            {P.map(([x, y], i) => <SiteStone key={i} x={x} y={y} at={14 + i * 14} kind={i < 2 ? "done" : i === 2 ? "now" : "lock"} pr={i === 2 ? press(f, C1) : 0} />)}
            <Img src={staticFile("real/mascot1.webp")} style={{ position: "absolute", left: 830, top: 520, width: 300, opacity: sp(40, 14, 150), transform: `translateY(${(1 - sp(40, 14, 150)) * 40}px)` }} />
            {card > 0.01 ? (
              <div style={{ position: "absolute", left: 620 - 220, top: 620 - 330, width: 440, borderRadius: 24, background: GREEN, boxShadow: `0 6px 0 ${GLIP}, 0 30px 60px rgba(40,90,0,0.25)`, padding: "22px 24px 24px", boxSizing: "border-box", fontFamily: UI, color: "#fff", transformOrigin: "50% 100%", transform: `scale(${card})`, opacity: Math.min(1, card * 1.6) }}>
                <div style={{ fontWeight: 900, fontSize: 30, lineHeight: 1.2 }}>Кто пишет законы</div>
                <div style={{ fontWeight: 700, fontSize: 20, opacity: 0.9, marginTop: 6 }}>Урок 3</div>
                <div style={{ marginTop: 18, height: 64, borderRadius: 16, background: "#fff", color: GREEN, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 24, letterSpacing: "0.05em", boxShadow: `0 ${5 - press(f, C2) * 5}px 0 ${SWAN}`, transform: `translateY(${press(f, C2) * 5}px)` }}>НАЧАТЬ</div>
              </div>
            ) : null}
          </div>
          {/* lesson screen, as on the site */}
          {lesson > 0.01 ? (
            <div style={{ position: "absolute", left: 160, top: 120, width: 960, height: 860, borderRadius: 40, background: "#fff", boxShadow: "0 50px 120px rgba(13,22,48,0.16)", opacity: lesson, transform: `scale(${0.86 + 0.14 * lesson})`, fontFamily: UI, overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 50, top: 46, right: 50, display: "flex", alignItems: "center", gap: 22 }}>
                <Cross s={34} c="#afafaf" />
                <div style={{ flex: 1, height: 22, borderRadius: 11, background: SWAN }}><div style={{ width: `${lin(f, OPEN + 20, CHECK + 20, 30, checked ? 62 : 45)}%`, height: "100%", borderRadius: 11, background: GREEN, boxShadow: "inset 0 -6px 0 rgba(0,0,0,0.1)" }} /></div>
                <Img src={staticFile("real/heart-red.webp")} style={{ width: 40 }} />
                <div style={{ fontWeight: 900, fontSize: 28, color: RED }}>5</div>
              </div>
              <div style={{ position: "absolute", left: 60, top: 140, display: "flex", alignItems: "flex-end", gap: 20, opacity: lin(f, OPEN + 4, OPEN + 20) }}>
                <Img src={staticFile("v4/owl-q.png")} style={{ width: 150 }} />
                <div style={{ marginBottom: 40, padding: "20px 26px", borderRadius: 22, border: `3px solid ${SWAN}`, fontWeight: 800, fontSize: 32, color: INK }}>Кто принимает законы?</div>
              </div>
              {OPTS.map((o, i) => {
                const s = sp(OPEN + 10 + i * 6, 14, 190);
                const sel = i === 1 && picked;
                const good = i === 1 && checked;
                const bc = good ? GREEN : sel ? BLUE : SWAN;
                return (
                  <div key={o} style={{ position: "absolute", left: 60, right: 60, top: 400 + i * 116, height: 92, borderRadius: 20, border: `3px solid ${bc}`, background: good ? "#d7ffb8" : sel ? "#ddf4ff" : "#fff", boxShadow: `0 ${5 - (i === 1 ? press(f, PICK) * 5 : 0)}px 0 ${bc}`, display: "flex", alignItems: "center", gap: 22, padding: "0 28px", fontWeight: 800, fontSize: 30, color: good ? GLIP : sel ? DEEP : INK, transform: `scale(${s}) translateY(${i === 1 ? press(f, PICK) * 5 : 0}px)`, opacity: s }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, border: `3px solid ${bc}`, background: sel || good ? bc : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>{sel || good ? <Check s={22} /> : null}</div>
                    {o}
                  </div>
                );
              })}
              {/* bottom action / result bar */}
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 150, borderTop: `2px solid ${SWAN}`, background: checked ? "#d7ffb8" : "#fff" }}>
                {checked ? (
                  <div style={{ position: "absolute", left: 50, top: 34, display: "flex", alignItems: "center", gap: 18, transform: `translateY(${(1 - bar) * 40}px)`, opacity: bar }}>
                    <div style={{ width: 70, height: 70, borderRadius: 35, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><Check s={40} c={GREEN} /></div>
                    <div style={{ fontWeight: 900, fontSize: 36, color: GLIP }}>Круто!</div>
                  </div>
                ) : null}
                <div style={{ position: "absolute", right: 50, top: 36, width: 300, height: 78, borderRadius: 18, background: picked ? GREEN : SWAN, boxShadow: `0 ${6 - press(f, CHECK) * 6}px 0 ${picked ? GLIP : "#cfcfcf"}`, transform: `translateY(${press(f, CHECK) * 6}px)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 26, letterSpacing: "0.05em", color: picked ? "#fff" : "#afafaf" }}>{checked ? "ПРОДОЛЖИТЬ" : "ПРОВЕРИТЬ"}</div>
              </div>
            </div>
          ) : null}
          {f >= 90 && f < 440 ? <Pointer x={ptr.x} y={ptr.y} down={down} op={lin(f, 90, 102) * (1 - lin(f, 426, 440))} /> : null}
        </div>
      </AbsoluteFill>
      {toast > 0.01 ? (
        <div style={{ position: "absolute", left: 120, top: 700, width: 600, height: 110, borderRadius: 28, background: "#fff", boxShadow: "0 24px 60px rgba(13,22,48,0.18)", display: "flex", alignItems: "center", gap: 22, padding: "0 30px", boxSizing: "border-box", fontFamily: UI, transform: `translateY(${(1 - toast) * 60}px)`, opacity: Math.min(1, toast * 1.5), zIndex: 90 }}>
          <div style={{ width: 62, height: 62, borderRadius: 31, background: GREEN, display: "flex", alignItems: "center", justifyContent: "center" }}><Check s={36} /></div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 32, color: INK }}>Урок пройден</div>
            <div style={{ fontWeight: 800, fontSize: 24, color: "#e0a800" }}>+15 XP</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, fontWeight: 900, fontSize: 40, color: "#ff9600" }}>
            <Img src={staticFile("real/key-fire.webp")} style={{ width: 48, transform: `scale(${1 + press(f, DONE + 34) * 0.35})` }} />
            {fire}
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ====================== S6 five games, each with its own motion ======================
const GD = 120;
const GAMES = ["Найди миф", "Верно или неверно", "Собери фразу", "Истории", "Работа над ошибками"];
const card: React.CSSProperties = { position: "absolute", borderRadius: 28, background: "#fff", border: `3px solid ${SWAN}`, boxShadow: `0 6px 0 ${SWAN}, 0 24px 50px rgba(13,22,48,0.08)`, fontFamily: UI, fontWeight: 800, color: INK, boxSizing: "border-box" };
const G1: React.FC<{ lf: number }> = ({ lf }) => {
  const { fps } = useVideoConfig();
  const sp = (at: number, d = 12, s = 180) => spring({ frame: lf - at, fps, config: { damping: d, stiffness: s } });
  const S = ["Закон обязателен для всех", "Незнание закона освобождает от ответственности", "Законы публикуют, чтобы их знали"];
  const hit = 46;
  const scan = lin(lf, 18, hit, 0, 1, IOE);
  return (
    <AbsoluteFill>
      {S.map((t, i) => {
        const s = sp(2 + i * 5, 14, 190);
        const bad = i === 1 && lf >= hit;
        const ok = i !== 1 && lf >= hit + 18 + i * 4;
        const shake = i === 1 && lf >= hit && lf < hit + 16 ? Math.sin((lf - hit) * 2.2) * 10 * (1 - (lf - hit) / 16) : 0;
        return (
          <div key={t} style={{ ...card, left: 560 + shake, top: 300 + i * 150, width: 800, height: 120, display: "flex", alignItems: "center", padding: "0 34px", fontSize: 32, border: `3px solid ${bad ? RED : ok ? GREEN : SWAN}`, background: bad ? "#ffe3e3" : ok ? "#e7ffd6" : "#fff", transform: `translateY(${(1 - s) * 60}px)`, opacity: s }}>
            {t}
            {ok ? <div style={{ marginLeft: "auto" }}><Check s={36} c={GREEN} /></div> : null}
          </div>
        );
      })}
      {/* magnifier sweeps the list */}
      <div style={{ position: "absolute", left: 1290, top: 260 + scan * 150, opacity: lin(lf, 10, 20) * (1 - lin(lf, hit + 6, hit + 16)) }}>
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2.4" strokeLinecap="round"><circle cx="10" cy="10" r="6.5" fill="rgba(28,176,246,0.15)" /><path d="M15 15l6 6" /></svg>
      </div>
      <div style={{ position: "absolute", left: 1210, top: 418, padding: "6px 22px", border: `6px solid ${RED}`, borderRadius: 16, fontFamily: HEAD, fontWeight: 900, fontSize: 54, color: RED, background: "#fff", transform: `rotate(-12deg) scale(${2.3 - 1.3 * sp(hit + 2, 9, 230)})`, opacity: lf >= hit + 2 ? Math.min(1, sp(hit + 2, 9, 230) * 2) : 0 }}>МИФ</div>
    </AbsoluteFill>
  );
};
const G2: React.FC<{ lf: number }> = ({ lf }) => {
  const T = ["Конституция: главный закон страны", "Закон можно не соблюдать, если не согласен", "Права человека защищает государство"];
  const go = [16, 48, 80];
  const dir = [1, -1, 1];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 360, top: 520, fontFamily: HEAD, fontWeight: 800, fontSize: 34, color: RED, zIndex: 0 }}>← Неверно</div>
      <div style={{ position: "absolute", left: 1330, top: 520, fontFamily: HEAD, fontWeight: 800, fontSize: 34, color: GLIP }}>Верно →</div>
      {T.map((t, i) => {
        const fly = lin(lf, go[i], go[i] + 22, 0, 1, Easing.bezier(0.5, 0, 0.9, 0.6));
        const lean = lin(lf, go[i] - 12, go[i], 0, 1);
        const depth = Math.max(0, i - (lf >= go[0] + 10 ? 1 : 0) - (lf >= go[1] + 10 ? 1 : 0));
        const good = dir[i] > 0;
        return (
          <div key={t} style={{ ...card, left: 960 - 300, top: 330, width: 600, height: 400, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 50, fontSize: 38, lineHeight: 1.3, zIndex: 20 - i, border: `3px solid ${lean > 0.3 ? (good ? GREEN : RED) : SWAN}`, background: lean > 0.3 ? (good ? "#e7ffd6" : "#ffe3e3") : "#fff", transform: `translate(${dir[i] * (lean * 70 + fly * 1200)}px, ${depth * 26 - fly * 60}px) rotate(${dir[i] * (lean * 7 + fly * 18)}deg) scale(${1 - depth * 0.05})`, opacity: 1 - fly * 0.4 }}>
            {t}
            {lean > 0.3 ? <div style={{ position: "absolute", left: good ? 30 : undefined, right: good ? undefined : 30, top: 24, padding: "4px 16px", border: `5px solid ${good ? GREEN : RED}`, borderRadius: 12, fontFamily: HEAD, fontWeight: 900, fontSize: 30, color: good ? GLIP : RED, transform: `rotate(${good ? -8 : 8}deg)` }}>{good ? "ВЕРНО" : "НЕВЕРНО"}</div> : null}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
const G3: React.FC<{ lf: number }> = ({ lf }) => {
  const { fps } = useVideoConfig();
  const W = ["Закон", "один", "для", "всех"];
  const slotX = [600, 790, 960, 1110];
  const scat: [number, number, number][] = [[1240, 720, 14], [520, 760, -12], [1000, 820, 9], [760, 690, -7]];
  const extra: [string, number, number, number][] = [["только", 1380, 620, -10], ["богатых", 440, 640, 12]];
  const done = lf >= 14 + 3 * 12 + 16;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 560, right: 560, top: 420, height: 4, borderRadius: 2, background: done ? GREEN : SWAN }} />
      <div style={{ position: "absolute", left: 560, right: 560, top: 516, height: 4, borderRadius: 2, background: SWAN, opacity: 0.6 }} />
      {extra.map(([t, x, y, r]) => <div key={t} style={{ ...card, left: x, top: y + Math.sin(lf / 14 + x) * 6, padding: "18px 28px", fontSize: 34, transform: `rotate(${r}deg)`, opacity: 0.85 }}>{t}</div>)}
      {W.map((w, i) => {
        const s = spring({ frame: lf - 14 - i * 12, fps, config: { damping: 13, stiffness: 190 } });
        const [sx, sy, r] = scat[i];
        const x = sx + (slotX[i] - sx) * s, y = sy + (330 - sy) * s + Math.sin(lf / 14 + i) * 6 * (1 - s);
        return <div key={w} style={{ ...card, left: x, top: y, padding: "18px 28px", fontSize: 34, transform: `rotate(${r * (1 - s)}deg)`, border: `3px solid ${done ? GREEN : SWAN}`, background: done ? "#e7ffd6" : "#fff", color: done ? GLIP : INK }}>{w}</div>;
      })}
    </AbsoluteFill>
  );
};
const G4: React.FC<{ lf: number }> = ({ lf }) => {
  const { fps } = useVideoConfig();
  const sp = (at: number) => spring({ frame: lf - at, fps, config: { damping: 15, stiffness: 180 } });
  const PICK = 70;
  const ok = lf >= PICK;
  return (
    <AbsoluteFill style={{ fontFamily: UI }}>
      <Img src={staticFile("av/p1.svg")} style={{ position: "absolute", left: 470, top: 270, width: 130, height: 130, borderRadius: 65, transform: `scale(${sp(0)})` }} />
      <div style={{ position: "absolute", left: 630, top: 270, width: 620, padding: "26px 30px", borderRadius: "30px 30px 30px 8px", background: "#fff", border: `3px solid ${SWAN}`, fontWeight: 700, fontSize: 32, lineHeight: 1.35, color: INK, transformOrigin: "0 100%", transform: `scale(${sp(8)})` }}>Шахзод купил телефон, через неделю он сломался. Продавец говорит: «Сам виноват». Что делать?</div>
      {["Смириться", "Требовать ремонт или возврат"].map((o, i) => {
        const good = i === 1 && ok;
        const s = sp(34 + i * 8);
        return <div key={o} style={{ ...card, left: 630 + i * 290, top: 560, padding: "22px 30px", fontSize: 30, border: `3px solid ${good ? GREEN : SWAN}`, background: good ? "#e7ffd6" : "#fff", color: good ? GLIP : INK, transform: `scale(${s * (1 - press(lf, PICK) * 0.05)})`, opacity: i === 0 && ok ? 0.45 : s }}>{o}</div>;
      })}
      {ok ? <div style={{ position: "absolute", left: 630, top: 700, width: 760, padding: "22px 28px", borderRadius: 24, background: GREEN, color: "#fff", fontWeight: 800, fontSize: 28, lineHeight: 1.35, transformOrigin: "0 0", transform: `scale(${sp(PICK + 8)})` }}>Верно. Закон защищает покупателя: можно требовать ремонт или возврат денег.</div> : null}
    </AbsoluteFill>
  );
};
const G5: React.FC<{ lf: number }> = ({ lf }) => {
  const { fps } = useVideoConfig();
  const sp = (at: number, d = 13, s = 180) => spring({ frame: lf - at, fps, config: { damping: d, stiffness: s } });
  const WRONG = 10, LOOP = 34, FIX = 76;
  const hearts = lf >= WRONG + 4 ? 4 : 5;
  const heartShake = lf >= WRONG + 4 && lf < WRONG + 20 ? Math.sin((lf - WRONG) * 2) * 8 : 0;
  const loop = lin(lf, LOOP, FIX - 4, 0, 1, IOE);
  const ang = loop * Math.PI * 2;
  const fixed = lf >= FIX;
  return (
    <AbsoluteFill style={{ fontFamily: UI }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 290, textAlign: "center", fontWeight: 900, fontSize: 44, color: INK, opacity: lin(lf, 0, 10) }}>Кто принимает законы?</div>
      <div style={{ position: "absolute", left: 1250, top: 230, display: "flex", alignItems: "center", gap: 10, fontWeight: 900, fontSize: 40, color: RED, transform: `translateX(${heartShake}px)` }}>
        <Img src={staticFile("real/heart-red.webp")} style={{ width: 52 }} />{hearts}
      </div>
      <svg style={{ position: "absolute", left: 960 - 230, top: 600 - 230, opacity: lin(lf, LOOP - 6, LOOP + 4) * (1 - lin(lf, FIX, FIX + 10)) }} width="460" height="460" viewBox="0 0 460 460"><circle cx="230" cy="230" r="200" fill="none" stroke={SWAN} strokeWidth="8" strokeDasharray="6 18" /></svg>
      <div style={{ ...card, left: 960 - 360 + Math.sin(ang) * 200 * Math.sin(loop * Math.PI), top: 600 - 110 - Math.sin(loop * Math.PI) * 120, width: 720, height: 220, display: "flex", alignItems: "center", gap: 22, padding: "0 30px", fontSize: 32, border: `3px solid ${fixed ? GREEN : RED}`, background: fixed ? "#e7ffd6" : "#ffe3e3", color: fixed ? GLIP : RED, transform: `scale(${(1 - Math.sin(loop * Math.PI) * 0.25) * (fixed ? 1 + (1 - sp(FIX, 9, 220)) * 0.1 : 1)})` }}>
        <div style={{ width: 70, height: 70, borderRadius: 35, background: fixed ? GREEN : RED, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{fixed ? <Check s={40} /> : <Cross s={36} />}</div>
        <div><div style={{ fontWeight: 900, fontSize: 44 }}>{fixed ? "Исправлено" : "Ошибка"}</div><div style={{ fontWeight: 700, fontSize: 30, color: fixed ? GLIP : "#c23a3a" }}>{fixed ? "Теперь запомнил" : loop > 0.05 ? "Повторим ещё раз" : "Правильно: Олий Мажлис"}</div></div>
      </div>
    </AbsoluteFill>
  );
};
export const S6b: React.FC = () => {
  const f = useCurrentFrame();
  const sp = useSp();
  const idx = Math.min(4, Math.floor(f / GD));
  const lf = f - idx * GD;
  const END = GD * 5;
  // whip between games: the layout leaves left in 10 frames, the next arrives from the right
  const outT = idx < 4 ? lin(lf, GD - 10, GD, 0, 1, Easing.in(Easing.cubic)) : 0;
  const inT = idx > 0 ? lin(lf, 0, 12, 0, 1, Easing.out(Easing.cubic)) : 1;
  const row = lin(f, END, END + 36, 0, 1, OUTE);
  const Game = [G1, G2, G3, G4, G5][idx];
  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <Chrome label="02  Уроки · игры" />
      {row < 1 ? (
        <>
          <div style={{ position: "absolute", left: 120, top: 110, display: "flex", alignItems: "baseline", gap: 26 }}>
            <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 30, color: GREY }}>{idx + 1}/5</div>
            <Cap key={idx} text={GAMES[idx]} at={idx * GD + 2} size={72} />
          </div>
          <AbsoluteFill style={{ transform: `translateX(${(1 - inT) * 900 - outT * 900}px)`, filter: outT + (1 - inT) > 0.05 ? `blur(${(outT + 1 - inT) * 10}px)` : undefined, opacity: 1 - row }}>
            <Game lf={lf} />
          </AbsoluteFill>
        </>
      ) : null}
      {row > 0 ? (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 230, display: "flex", justifyContent: "center" }}><Cap text="Одна тема. Пять способов запомнить." at={END + 4} size={68} accent="запомнить." /></div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 440, display: "flex", justifyContent: "center", gap: 26 }}>
            {GAMES.map((g, i) => {
              const s = sp(END + 8 + i * 5, 13, 190);
              const col = [RED, GREEN, YEL, BLUE, "#ce82ff"][i];
              const icon = ["M10 10m-6 0a6 6 0 1 0 12 0a6 6 0 1 0 -12 0M15 15l6 6", "M5 12.5l4.5 4.5L19 7.5", "M4 6h7v5H4zM13 6h7v5h-7zM4 13h10v5H4z", "M4 5h16v11H8l-4 4z", "M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4"][i];
              return (
                <div key={g} style={{ width: 300, height: 320, borderRadius: 34, background: "#fff", boxShadow: "0 24px 60px rgba(13,22,48,0.12)", padding: 28, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between", transform: `translateY(${(1 - s) * 90}px) rotate(${(1 - s) * (i - 2) * 6}deg)`, opacity: s }}>
                  <div style={{ width: 84, height: 84, borderRadius: 24, background: col, boxShadow: "0 6px 0 rgba(0,0,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d={icon} /></svg></div>
                  <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 32, lineHeight: 1.15, color: NAVY }}>{g}</div>
                </div>
              );
            })}
          </div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};

// ====================== S7 league table climbs on +15 XP ======================
const PEOPLE: [string, string, number][] = [["Азиз", "p0", 147], ["Малика", "p2", 133], ["Тимур", "p3", 118], ["Дильноза", "p4", 102], ["Санжар", "p5", 88]];
export const S7b: React.FC = () => {
  const f = useCurrentFrame();
  const sp = useSp();
  const T0 = 60;
  const gainT = (k: number) => lin(f, T0 + k * B, T0 + k * B + 16, 0, 1, OUTE);
  let mineXp = 65;
  for (let k = 0; k < 6; k++) mineXp += 15 * gainT(k);
  const mine = Math.round(mineXp);
  // ordering: rank = number of others with more XP (smooth through mineXp)
    const ROWH = 104;
  const silver = sp(T0 + 6 * B + 10, 12, 160);
  return (
    <AbsoluteFill style={{ background: BG }}>
      <TopLine a="+15 XP за урок." b="Поднимайся в лиге." at={0} size={66} accentColor={BLUE} />
      {/* league badges like the site */}
      <div style={{ position: "absolute", left: 960 - 380, top: 170, display: "flex", alignItems: "center", gap: 22 }}>
        <Img src={staticFile("real/bronze.webp")} style={{ width: 110, transform: `scale(${sp(4, 12, 170)})` }} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ position: "relative", width: 76, height: 86, transform: `scale(${sp(8 + i * 3, 12, 170)})` }}>
            <svg width="76" height="86" viewBox="0 0 76 86"><path d="M38 2 L72 14 V44 C72 64 56 78 38 84 C20 78 4 64 4 44 V14 Z" fill={i === 0 ? `rgb(${200 + 30 * silver},${204 + 26 * silver},${212 + 22 * silver})` : "#e3e5e9"} stroke={i === 0 && silver > 0.5 ? "#9aa3b0" : "#d2d5db"} strokeWidth="3" /></svg>
            {i === 0 && silver > 0.5 ? <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><Check s={34} c="#6d7684" /></div> : null}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 960 - 380, top: 290, fontFamily: UI, fontWeight: 900, fontSize: 40, color: INK }}>{silver > 0.5 ? "Серебряная лига" : "Бронзовая лига"}</div>
      {/* table */}
      <div style={{ position: "absolute", left: 960 - 380, top: 360, width: 760, height: ROWH * 6 + 30, borderRadius: 34, background: "#fff", boxShadow: "0 30px 80px rgba(13,22,48,0.12)", opacity: sp(0, 14, 150), transform: `translateY(${(1 - sp(0, 14, 150)) * 60}px)` }}>
        {(() => {
          const cs = PEOPLE.map((p) => Math.min(1, Math.max(0, (p[2] - mineXp) / 8 + 0.5)));
          // the "Ты" row glides: its place is averaged over +-20 frames so each climb is one soft move
          const xpAt = (ff: number) => { let v = 65; for (let k = 0; k < 6; k++) v += 15 * lin(ff, T0 + k * B, T0 + k * B + 16, 0, 1, OUTE); return v; };
          const placeAt = (ff: number) => { const x = xpAt(ff); return PEOPLE.reduce((a, p) => a + Math.min(1, Math.max(0, (p[2] - x) / 8 + 0.5)), 0); };
          let exact = 0; for (let d = -20; d <= 20; d++) exact += placeAt(f + d); exact /= 41;
          const csSm = PEOPLE.map((p) => { let a = 0; for (let d = -20; d <= 20; d++) a += Math.min(1, Math.max(0, (p[2] - xpAt(f + d)) / 8 + 0.5)); return a / 41; });
          const myRank = PEOPLE.filter((p) => p[2] > mine).length + 1;
          const rowTop = (r: number) => 15 + r * ROWH;
          const flash = Array.from({ length: 6 }, (_, k) => press(f, T0 + k * B)).reduce((x, y) => Math.max(x, y), 0);
          return (
            <>
              {PEOPLE.map(([name, av, xp], idx) => {
                const c = csSm[idx];
                const r = idx + (1 - c);
                const rank = idx + (mine > xp ? 1 : 0) + 1;
                return (
                  <div key={name} style={{ position: "absolute", left: 20, right: 20, top: rowTop(r), height: ROWH - 10, display: "flex", alignItems: "center", gap: 20, padding: "0 20px", fontFamily: UI }}>
                    <div style={{ width: 40, fontWeight: 900, fontSize: 28, color: GREY }}>{rank}</div>
                    <Img src={staticFile(`av/${av}.svg`)} style={{ width: 66, height: 66, borderRadius: 33, background: "#eef1f5" }} />
                    <div style={{ fontWeight: 800, fontSize: 30, color: INK }}>{name}</div>
                    <div style={{ marginLeft: "auto", fontWeight: 800, fontSize: 28, color: GREY }}>{xp} XP</div>
                  </div>
                );
              })}
              <div style={{ position: "absolute", left: 20, right: 20, top: rowTop(exact), height: ROWH - 10, borderRadius: 22, border: `4px solid ${BLUE}`, background: "#fff", display: "flex", alignItems: "center", gap: 20, padding: "0 16px", fontFamily: UI, boxShadow: "0 12px 30px rgba(28,176,246,0.25)", zIndex: 5, boxSizing: "border-box" }}>
                <div style={{ width: 40, fontWeight: 900, fontSize: 28, color: myRank === 1 ? "#e0a800" : DEEP }}>{myRank}</div>
                <Img src={staticFile("av/p1.svg")} style={{ width: 66, height: 66, borderRadius: 33, background: "#fff" }} />
                <div style={{ fontWeight: 900, fontSize: 30, color: DEEP }}>Ты</div>
                {myRank === 1 ? <Img src={staticFile("av/medal-1.webp")} style={{ width: 46 }} /> : null}
                <div style={{ marginLeft: "auto", fontWeight: 900, fontSize: 32, color: flash > 0.2 ? "#e0a800" : DEEP, transform: `scale(${1 + flash * 0.18})`, fontVariantNumeric: "tabular-nums" }}>{mine} XP</div>
              </div>
              {/* +15 chips fly from the lesson side into the "Ты" row */}
              {Array.from({ length: 6 }, (_, k) => {
                const land = T0 + k * B;
                if (f < land - 18 || f > land + 2) return null;
                const t = lin(f, land - 18, land, 0, 1, Easing.bezier(0.5, 0, 0.7, 1));
                const ty = rowTop(exact) + 22;
                const sx = 800, sy = -200;
                return <div key={k} style={{ position: "absolute", left: sx + (560 - sx) * t, top: sy + (ty - sy) * t - Math.sin(t * Math.PI) * 160, padding: "10px 22px", borderRadius: 20, background: YEL, color: "#fff", fontFamily: UI, fontWeight: 900, fontSize: 32, boxShadow: "0 6px 0 #d19a00, 0 14px 30px rgba(0,0,0,0.15)", transform: `scale(${1.15 - t * 0.35})`, opacity: 1 - lin(f, land - 5, land + 1), zIndex: 9, whiteSpace: "nowrap" }}>+15 XP</div>;
              })}
            </>
          );
        })()}
      </div>
    </AbsoluteFill>
  );
};

// ====================== S8 laws on a phone: notes first, then AI ======================
const COLORS = ["#ffd43b", "#ff922b", "#ff6b6b", "#f783ac", "#cc5de8", "#4dabf7", "#51cf66"];
const typed = (text: string, at: number, f: number, sp = 3) => text.slice(0, Math.max(0, Math.min(text.length, Math.floor((f - at) / sp))));
export const S8b: React.FC = () => {
  const f = useCurrentFrame();
  const sp = useSp();
  const a = sp(0, 14, 170);
  const m1 = lin(f, 26, 52, 0, 1, OUTE);
  const m2 = lin(f, 56, 92, 0, 1, OUTE);
  const W = 240 + (460 - 240) * m2, H = 240 + (900 - 240) * m2, R = 120 - 70 * m1;
  const PX = 1180, PY = 560;
  // notes timeline
  const SEL0 = 120, SEL1 = 168, YEL_ = 186, NOTE = 214, TYPE = 240, SAVE = 316, PIN = 330;
  const sel = lin(f, SEL0, SEL1, 0, 1, Easing.bezier(0.45, 0, 0.55, 1));
  const pal = lin(f, SEL1 + 4, SEL1 + 18, 0, 1, OUTE) * (1 - lin(f, NOTE + 2, NOTE + 12));
  const yellow = f >= YEL_ + 2;
  const sheet = sp(NOTE + 6, 16, 160) * (1 - lin(f, SAVE + 6, SAVE + 20));
  const pin = sp(PIN, 10, 220);
  // AI timeline
  const AI = 420, TAP = AI + 30;
  const aiOn = f >= AI;
  const tap = press(f, TAP);
  const ripple = lin(f, TAP, TAP + 26);
  const CARDS: [string, string, number, number][] = [
    ["Коротко", "Узбекистан: суверенное правовое государство.", 1480, 200],
    ["Простыми словами", "Страна сама решает, а всё держится на законе.", 1480, 450],
    ["Пример из жизни", "Чиновник нарушил закон? Его решение можно обжаловать.", 1480, 700],
  ];
  const leave = lin(f, 640, 676, 0, 1, IOE);
  const ptr = usePath([[100, 1500, 1000], [SEL0 - 4, 980, 452], [SEL1, 1340, 452], [YEL_ - 6, 1050, 528], [YEL_ + 10, 1060, 540], [NOTE - 6, 1290, 600], [NOTE + 16, 1300, 640], [SAVE - 8, 1300, 958], [SAVE + 20, 1400, 1000], [TAP - 10, 1340, 940], [TAP + 20, 1400, 980]]);
  const down = Math.max(press(f, SEL0), press(f, YEL_), press(f, NOTE), press(f, SAVE), tap);
  const dragging = f >= SEL0 && f < SEL1 + 2;
  const LINES = ["Узбекистан: суверенное,", "демократическое, правовое,", "социальное и светское", "государство.", "Названия «Республика", "Узбекистан» и «Узбекистан»", "равнозначны."];
  return (
    <AbsoluteFill style={{ background: GREEN }}>
      <Chrome label="04  Законы" dark />
      <div style={{ position: "absolute", left: 110, top: 330, opacity: 1 - leave }}>
        {!aiOn ? (
          <>
            <Cap text="Выделяй." at={10} size={72} color="#fff" out={AI - 20} />
            <Cap text="Пиши заметки." at={18} size={72} color="#fff" out={AI - 19} />
            <Cap text="Прямо в законе." at={26} size={72} color={NAVY} out={AI - 18} />
          </>
        ) : (
          <>
            <Cap text="Непонятно?" at={AI + 2} size={72} color="#fff" />
            <Cap text="ИИ объяснит" at={AI + 10} size={72} color="#fff" />
            <Cap text="простыми словами." at={AI + 18} size={72} color={NAVY} />
          </>
        )}
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - leave, transform: `translateY(${leave * -60}px)` }}>
        {aiOn ? (
          <svg style={{ position: "absolute", left: 0, top: 0 }} width="1920" height="1080">
            {CARDS.map(([, , x, y], i) => {
              const t = lin(f, TAP + 18 + i * B, TAP + 38 + i * B);
              const ex = x, ey = y + 70;
              return <line key={i} x1={PX + 230} y1={PY} x2={PX + 230 + (ex - PX - 230) * t} y2={PY + (ey - PY) * t} stroke="#fff" strokeWidth="4" strokeDasharray="4 14" strokeLinecap="round" />;
            })}
          </svg>
        ) : null}
        <div style={{ position: "absolute", left: PX - W / 2, top: PY - H / 2, width: W, height: H, borderRadius: R, background: "#fff", boxShadow: "0 40px 90px rgba(20,60,0,0.3)", transform: `scale(${a})`, overflow: "hidden", fontFamily: UI }}>
          {m2 > 0.6 ? (
            <div style={{ position: "absolute", inset: 0, opacity: lin(f, 86, 104) }}>
              <div style={{ width: 130, height: 12, borderRadius: 6, background: "#e8eaee", margin: "22px auto 0" }} />
              <div style={{ padding: "26px 34px 0" }}>
                <div style={{ fontWeight: 700, fontSize: 19, color: BLUE }}>Конституция Республики Узбекистан</div>
                <div style={{ marginTop: 6, fontWeight: 900, fontSize: 40, color: INK }}>Статья 1.</div>
                <div style={{ marginTop: 18, fontWeight: 700, fontSize: 27, lineHeight: 1.55, color: "#4b4b4b" }}>
                  {LINES.map((l, i) => {
                    const hot = i >= 4;
                    const k = hot ? Math.min(1, Math.max(0, sel * 3 - (i - 4))) : 0;
                    return (
                      <div key={i} style={{ position: "relative", whiteSpace: "nowrap" }}>
                        <span style={{ backgroundImage: `linear-gradient(${yellow ? "rgba(255,212,59,0.85)" : "rgba(28,176,246,0.25)"}, ${yellow ? "rgba(255,212,59,0.85)" : "rgba(28,176,246,0.25)"})`, backgroundRepeat: "no-repeat", backgroundSize: `${k * 100}% 100%`, padding: "2px 0" }}>{l}</span>
                        {i === 6 && pin > 0.02 ? <span style={{ display: "inline-flex", marginLeft: 12, width: 40, height: 40, borderRadius: 12, background: "#fff4c2", border: "2px solid #ffd43b", alignItems: "center", justifyContent: "center", verticalAlign: "middle", transform: `scale(${pin})` }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b58900" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h11l3 3v13H5zM8 10h8M8 14h6" /></svg></span> : null}
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* colour palette + actions pop under the selection */}
              {pal > 0.01 ? (
                <div style={{ position: "absolute", left: 24, right: 24, top: 600, borderRadius: 22, background: "#fff", border: `3px solid ${BLUE}`, boxShadow: "0 18px 40px rgba(13,22,48,0.18)", padding: "16px 18px", transform: `scale(${0.9 + 0.1 * pal})`, opacity: pal, transformOrigin: "50% 0" }}>
                  <div style={{ display: "flex", gap: 12 }}>{COLORS.map((c, i) => <div key={c} style={{ width: 40, height: 40, borderRadius: 20, background: c, boxShadow: i === 0 && yellow ? `0 0 0 4px #fff, 0 0 0 7px ${c}` : undefined, transform: `scale(${i === 0 ? 1 - press(f, YEL_) * 0.2 : 1})` }} />)}</div>
                  <div style={{ display: "flex", gap: 14, marginTop: 14, fontWeight: 800, fontSize: 22, color: BLUE }}>
                    <span>Копия</span><span style={{ padding: "2px 10px", borderRadius: 10, background: f > NOTE - 14 ? "#ddf4ff" : "transparent" }}>Заметка</span><span>Тест</span><span>Ссылка</span>
                  </div>
                </div>
              ) : null}
              {/* note sheet */}
              {sheet > 0.01 ? (
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 420, borderRadius: "34px 34px 0 0", background: "#fff", boxShadow: "0 -20px 50px rgba(13,22,48,0.2)", padding: "26px 28px", boxSizing: "border-box", transform: `translateY(${(1 - sheet) * 440}px)` }}>
                  <div style={{ fontWeight: 900, fontSize: 30, color: INK }}>Заметка к выделенному</div>
                  <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 12, background: "#fff8d6", borderLeft: "6px solid #ffd43b", fontSize: 20, fontWeight: 700, color: "#6b7785" }}>Названия «Республика Узбекистан» и «Узбекистан» равнозначны.</div>
                  <div style={{ marginTop: 16, minHeight: 90, borderRadius: 20, border: `3px solid ${BLUE}`, background: "#f7fbff", padding: "16px 18px", boxSizing: "border-box", fontWeight: 800, fontSize: 28, color: INK }}>
                    {f < TYPE ? <span style={{ color: "#a7b1bc", fontWeight: 600, fontSize: 24 }}>Что вы думаете об этом?</span> : <>{typed("Спросят на экзамене", TYPE, f)}<span style={{ display: "inline-block", width: 3, height: 30, background: BLUE, marginLeft: 2, verticalAlign: "middle", opacity: Math.floor(f / 14) % 2 ? 1 : 0.2 }} /></>}
                  </div>
                  <div style={{ marginTop: 18, display: "flex", alignItems: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: GREY }}>Видите только вы</div>
                    <div style={{ marginLeft: "auto", padding: "16px 30px", borderRadius: 16, background: GREEN, boxShadow: `0 ${5 - press(f, SAVE) * 5}px 0 ${GLIP}`, transform: `translateY(${press(f, SAVE) * 5}px)`, color: "#fff", fontWeight: 900, fontSize: 22, letterSpacing: "0.05em" }}>СОХРАНИТЬ</div>
                  </div>
                </div>
              ) : null}
              {/* robot button for the AI part */}
              <div style={{ position: "absolute", right: 30, bottom: 34, width: 92, height: 92, borderRadius: 28, background: BLUE, boxShadow: `0 ${6 - tap * 6}px 0 ${DEEP}`, transform: `translateY(${tap * 6}px) scale(${aiOn ? 1 + Math.sin(f / 8) * 0.04 : 0.9})`, opacity: lin(f, AI - 20, AI), display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="7" width="16" height="12" rx="3" /><path d="M12 3v4M9 12h.01M15 12h.01M9.5 15.5h5M2 12v3M22 12v3" /></svg>
              </div>
              <div style={{ position: "absolute", right: 76 - 110, bottom: 80 - 110, width: 220, height: 220, borderRadius: "50%", border: `5px solid ${BLUE}`, transform: `scale(${0.3 + ripple})`, opacity: f >= TAP ? 1 - ripple : 0 }} />
            </div>
          ) : null}
        </div>
        {/* toast */}
        {f >= SAVE + 8 && f < AI ? <div style={{ position: "absolute", left: PX - 220, top: 70, width: 440, height: 76, borderRadius: 22, background: NAVY, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 14, fontFamily: UI, fontWeight: 800, fontSize: 28, transform: `translateY(${(1 - sp(SAVE + 8, 15, 170)) * -120}px)`, opacity: 1 - lin(f, AI - 24, AI - 8) }}><Check s={28} c={GREEN} />Заметка сохранена</div> : null}
        {aiOn ? CARDS.map(([t, d, x, y], i) => {
          const s = sp(TAP + 28 + i * B, 13, 180);
          return (
            <div key={t} style={{ position: "absolute", left: x, top: y, width: 380, padding: "22px 24px", borderRadius: 28, background: "#fff", boxShadow: "0 24px 60px rgba(20,60,0,0.25)", fontFamily: UI, transformOrigin: "0 50%", transform: `scale(${s})`, opacity: Math.min(1, s * 1.5) }}>
              <div style={{ fontFamily: HEAD, fontWeight: 900, fontSize: 30, color: [NAVY, BLUE, GLIP][i] }}>{t}</div>
              <div style={{ marginTop: 10, fontWeight: 700, fontSize: 25, lineHeight: 1.35, color: "#3b4250" }}>{d}</div>
            </div>
          );
        }) : null}
        {f >= 100 && f < TAP + 40 ? <Pointer x={ptr.x} y={ptr.y} down={down} op={(dragging ? 0 : 1) * lin(f, 100, 112) * (1 - lin(f, TAP + 24, TAP + 40))} /> : null}
        {dragging ? <div style={{ position: "absolute", left: ptr.x - 4, top: ptr.y - 30, width: 6, height: 50, borderRadius: 3, background: BLUE }} /> : null}
      </div>
      {leave > 0 ? <StepperB at={650} /> : null}
    </AbsoluteFill>
  );
};
const StepperB: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const sp = useSp();
  const L = [["Найди", "поиск по 1 608 законам"], ["Пойми", "объяснение ИИ"], ["Запомни", "заметки и тест"]];
  const X = [560, 960, 1360];
  const travel = interpolate(f, [at + 30, at + 30 + B, at + 30 + B * 2, at + 30 + B * 3], [0, 1, 1, 2], { ...cl, easing: IOE });
  const dotX = X[0] + (X[2] - X[0]) * (travel / 2);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 220, display: "flex", justifyContent: "center" }}><Cap text="Найди. Пойми. Запомни." at={at + 4} size={72} color="#fff" accent="Запомни." accentColor={NAVY} /></div>
      <div style={{ position: "absolute", left: X[0], top: 560 - 3, width: (X[2] - X[0]) * lin(f, at + 6, at + 36), height: 6, borderRadius: 3, background: "rgba(255,255,255,0.6)" }} />
      {L.map(([t, d], i) => {
        const s = sp(at + 6 + i * 8, 12, 200);
        const lit = travel >= i - 0.05;
        return (
          <div key={t} style={{ position: "absolute", left: X[i] - 60, top: 560 - 60, width: 120, height: 120, borderRadius: 60, background: lit ? NAVY : "#fff", color: lit ? "#fff" : NAVY, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HEAD, fontWeight: 900, fontSize: 52, transform: `scale(${s})` }}>
            {i + 1}
            <div style={{ position: "absolute", top: 150, width: 420, left: -150, textAlign: "center", fontFamily: HEAD }}>
              <div style={{ fontWeight: 900, fontSize: 46, color: "#fff" }}>{t}</div>
              <div style={{ fontWeight: 600, fontSize: 34, color: "rgba(255,255,255,0.95)", marginTop: 6 }}>{d}</div>
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: dotX - 18, top: 560 - 108, width: 36, height: 36, borderRadius: 18, background: YEL, boxShadow: "0 8px 20px rgba(0,0,0,0.2)", opacity: lin(f, at + 26, at + 34) }} />
    </AbsoluteFill>
  );
};
export { fit as _fit, random as _r };
