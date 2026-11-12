import React from "react";
import { tr, uzt } from "./i18n";
import { AbsoluteFill, Easing, Img, interpolate, staticFile } from "remotion";
import { NAVY, GREEN, UI, OUTE, IOE, lin, press, useSp, useFrame, Pointer, TopLine } from "./Scenes9";

// Forum (veoskill.uz/hub/forum): the page rises from below, the threads come in, the cursor opens a hot thread,
// replies and a GIF arrive, the learner types a message, picks a GIF and sends it, likes count up, someone answers.
// Menu has no "Дуэли"/"Профиль" and no "NEOLEX" author (docs/RULES.md).
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const S = (n: string) => staticFile(`site/${n}`);
const AV = (n: string) => staticFile(`av/${n}.svg`);
const BLUE = "#1cb0f6";
const LINE = "#e5e9ef";
export const FORUM_FRAMES = 864;

// timeline (scene frames)
const T = { HOVER: 118, OPEN: 142, R1: 214, R2: 262, VOTE: 300, FOCUS: 336, TYPE0: 350, GIFBTN: 470, PICK: 520, SEND: 560, LIKE: 600, TYPING: 640, R3: 744 };

const NAV: [string, string][] = [["icons_hub_home.webp", tr("КАБИНЕТ")], ["stickers_module.webp", tr("МОДУЛИ")], ["icons_duel_scales.webp", tr("ЗАКОНЫ")], ["icons_hub_stats.webp", tr("СТАТИСТИКА")], ["icons_hub_achievements.webp", tr("ДОСТИЖЕНИЯ")], ["icons_hub_store.webp", tr("МАГАЗИН")], ["icons_hub_forum.webp", tr("ФОРУМ")]];
// threads: title, text, picture, hot, author avatar, author, when, up, down, replies
type Th = [string, string, string, boolean, string, string, string, number, number, number];
const THREADS: Th[] = [
  [tr("Сессия через две недели, а вы уже на какой странице?"), tr("Пишите честно, сколько страниц конспекта прочитали и как учите статьи."), "stickers_key-book.webp", true, "p2", tr("Сардор"), tr("6 дн. назад"), 6, 1, 3],
  [uzt("Sessiyaga ikki hafta qoldi, siz qayerdasiz?"), uzt("Konspektning nechinchi betidasiz, halol yozing. Moddalarni qanday yodlaysiz?"), "stickers_key-fire.webp", true, "p4", tr("Малика"), tr("6 дн. назад"), 5, 1, 6],
  [tr("Какая статья Уголовного кодекса самая странная на ваш взгляд?"), tr("Не обязательно самая страшная. Может, самая смешная или та, которую невозможно понять."), "icons_duel_scales.webp", false, "p0", tr("Азиз"), tr("2 нед. назад"), 0, 1, 1],
  ["Worst law exam question you ever got", "Tell us the question and what you wrote. Funny answers are welcome.", "stickers_heart-pro.webp", false, "p5", tr("Тимур"), tr("2 нед. назад"), 1, 0, 0],
  [uzt("Qaysi kodeksni o'qish eng qiyin?"), uzt("Fuqarolik kodeksimi, Jinoyat kodeksimi yoki Mehnat kodeksi? Nima uchun?"), "stickers_module.webp", false, "p3", tr("Дильноза"), tr("2 нед. назад"), 0, 1, 0],
  ["How do you actually memorize articles of the law?", "Flashcards or just reading it ten times? Share what works for you.", "icons_hub_achievements.webp", false, "p2", tr("Санжар"), tr("2 нед. назад"), 0, 1, 0],
];
const OPENED = 2;
const GIFS = ["v4/owl-q.png", "v4/owl-read.png", "real/mascot1.webp", "site/stickers_key-fire.webp", "site/stickers_heart-pro.webp", "site/icons_hub_achievements.webp"];
const GIF_PICK = 1;

const Up: React.FC<{ on?: boolean; n: number; c?: string }> = ({ on, n, c = "#5d6470" }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 800, fontSize: 24, color: on ? "#58cc02" : c }}>
    <svg width="26" height="26" viewBox="0 0 24 24" fill={on ? "#58cc02" : "none"} stroke={on ? "#58cc02" : "#9aa3b0"} strokeWidth="2.4" strokeLinejoin="round"><path d="M12 3l8 9h-5v9H9v-9H4z" /></svg>{n}
  </div>
);
const Down: React.FC<{ n: number }> = ({ n }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 800, fontSize: 24, color: "#5d6470" }}>
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#9aa3b0" strokeWidth="2.4" strokeLinejoin="round"><path d="M12 21l8-9h-5V3H9v9H4z" /></svg>{n}
  </div>
);
const Bubble: React.FC<{ n: number }> = ({ n }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 800, fontSize: 24, color: "#5d6470" }}>
    <svg width="28" height="26" viewBox="0 0 24 22" fill="none" stroke="#9aa3b0" strokeWidth="2.2" strokeLinejoin="round"><path d="M3 4h18v12H9l-5 4v-4H3z" /></svg>{n}
  </div>
);

/** One thread card like the site: speech-bubble card (hot ones in yellow), meta row underneath. */
const Card: React.FC<{ t: Th; x: number; y: number; e: number; hover: number }> = ({ t, x, y, e, hover }) => {
  const [title, text, pic, hot, av, author, when, up, down, rep] = t;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 500, opacity: Math.min(1, e * 1.5), transform: `translateY(${(1 - e) * 80 - hover * 10}px) scale(${1 + hover * 0.03})` }}>
      <div style={{ position: "relative", height: 178, borderRadius: 26, background: "#fff", border: `4px solid ${hot ? "#ffc800" : LINE}`, boxShadow: hot ? "0 7px 0 #ffc800" : `0 7px 0 ${LINE}${hover > 0.1 ? ", 0 24px 50px rgba(28,176,246,0.25)" : ""}`, boxSizing: "border-box", padding: "18px 22px 0 92px" }}>
        <Img src={S(pic)} style={{ position: "absolute", left: 18, top: 50, width: 60, height: 60, objectFit: "contain" }} />
        {hot ? <div style={{ fontWeight: 900, fontSize: 15, letterSpacing: "0.12em", color: "#ff9600", marginBottom: 4 }}>🔥 {tr("ГОРЯЧЕЕ")}</div> : <div style={{ height: 10 }} />}
        <div style={{ fontWeight: 900, fontSize: 23, lineHeight: 1.22, color: "#3c3c3c", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{title}</div>
        <div style={{ marginTop: 8, fontWeight: 600, fontSize: 18, lineHeight: 1.35, color: "#77808c", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{text}</div>
        <div style={{ position: "absolute", left: 40, bottom: -18, width: 24, height: 24, background: "#fff", borderRight: `4px solid ${hot ? "#ffc800" : LINE}`, borderBottom: `4px solid ${hot ? "#ffc800" : LINE}`, transform: "rotate(45deg)" }} />
      </div>
      <div style={{ marginTop: 26, display: "flex", alignItems: "center", gap: 12, paddingLeft: 16 }}>
        <Img src={AV(av)} style={{ width: 40, height: 40, borderRadius: 20, background: "#eef1f5" }} />
        <div style={{ fontWeight: 900, fontSize: 21, color: "#4b4b4b" }}>{author}</div>
        <div style={{ fontWeight: 600, fontSize: 17, color: "#9aa3b0" }}>{when}</div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 16 }}><Up on={hot && up > 5} n={up} /><Down n={down} /><Bubble n={rep} /></div>
      </div>
    </div>
  );
};

/** A message in the thread. */
const Msg: React.FC<{ av: string; name: string; when: string; e: number; me?: boolean; children: React.ReactNode; likes?: number; likeOn?: boolean }> = ({ av, name, when, e, me, children, likes = 0, likeOn }) => (
  <div style={{ display: "flex", gap: 18, opacity: Math.min(1, e * 1.6), transform: `translateY(${(1 - e) * -30}px) scale(${0.96 + 0.04 * e})`, transformOrigin: "0 0" }}>
    <Img src={AV(av)} style={{ width: 56, height: 56, borderRadius: 28, background: me ? "#ffd5cc" : "#eef1f5", flexShrink: 0 }} />
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <div style={{ fontWeight: 900, fontSize: 22, color: me ? BLUE : "#3c3c3c" }}>{name}</div>
        <div style={{ fontWeight: 600, fontSize: 17, color: "#9aa3b0" }}>{when}</div>
      </div>
      <div style={{ marginTop: 6, display: "inline-block", maxWidth: 1000, padding: "14px 20px", borderRadius: "6px 22px 22px 22px", background: me ? "#e8f6fe" : "#f4f6f9", fontWeight: 600, fontSize: 23, lineHeight: 1.4, color: "#2b2b2b" }}>{children}</div>
      <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 800, fontSize: 19, color: likeOn ? "#ff4b4b" : "#9aa3b0" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill={likeOn ? "#ff4b4b" : "none"} stroke={likeOn ? "#ff4b4b" : "#9aa3b0"} strokeWidth="2.2"><path d="M12 21s-7-4.4-9.3-8.6C1 9 3 5 6.8 5c2.2 0 3.6 1.3 5.2 3 1.6-1.7 3-3 5.2-3C21 5 23 9 21.3 12.4 19 16.6 12 21 12 21z" /></svg>{likes}
        </div>
        <div style={{ fontWeight: 800, fontSize: 18, color: "#9aa3b0" }}>{tr("Ответить")}</div>
      </div>
    </div>
  </div>
);

const Gif: React.FC<{ src: string; f: number; w?: number }> = ({ src, f, w = 260 }) => (
  <div style={{ position: "relative", width: w, height: w * 0.75, borderRadius: 16, overflow: "hidden", background: "linear-gradient(160deg, #fff3c4, #ffe1b8)" }}>
    <Img src={staticFile(src)} style={{ position: "absolute", left: "50%", top: "50%", width: w * 0.62, height: w * 0.62, objectFit: "contain", transform: `translate(-50%, -50%) translateY(${Math.sin(f / 6) * 6}px) rotate(${Math.sin(f / 9) * 6}deg)` }} />
    <div style={{ position: "absolute", left: 10, bottom: 10, padding: "2px 10px", borderRadius: 8, background: "rgba(0,0,0,0.55)", color: "#fff", fontWeight: 900, fontSize: 15, letterSpacing: "0.08em" }}>GIF</div>
  </div>
);

export const Forum: React.FC = () => {
  const f = useFrame();
  const sp = useSp();
  // page rises from below with a slight 3D tilt
  const rise = lin(f, 0, 42, 0, 1, Easing.bezier(0.2, 0.8, 0.2, 1));
  const open = lin(f, T.OPEN, T.OPEN + 30, 0, 1, Easing.bezier(0.65, 0, 0.35, 1));
  const hover = lin(f, T.HOVER - 12, T.HOVER, 0, 1, OUTE) * (1 - open);
  // typing
  const MSG = tr("Согласен! А ещё статья про самоуправство, тоже странная 😂");
  const typed = MSG.slice(0, Math.max(0, Math.min(MSG.length, Math.floor((f - T.TYPE0) * MSG.length / (T.GIFBTN - 16 - T.TYPE0)))));
  const sent = f >= T.SEND + 4;
  const draft = sent ? "" : typed;
  const picker = sp(T.GIFBTN + 4, 15, 190) * (1 - lin(f, T.PICK + 6, T.PICK + 18));
  const gifIn = f >= T.PICK + 4 && !sent;
  const votes = Math.round(lin(f, T.VOTE, T.VOTE + 30, 0, 5, Easing.out(Easing.cubic)));
  const myLikes = Math.round(lin(f, T.LIKE, T.LIKE + 80, 0, 12, Easing.out(Easing.cubic)));
  const nMsg = 1 + (f >= T.R1 ? 1 : 0) + (f >= T.R2 ? 1 : 0) + (sent ? 1 : 0) + (f >= T.R3 ? 1 : 0);
  // layout (inside the scaled page, 1920 x 1220)
  const MX = 360;
  const COMP = { x: MX, y: 380, w: 1520, h: 210 };
  const BTN = { gif: [MX + 110, COMP.y + 166], send: [MX + 1460, COMP.y + 166] };
  const cardPos = (i: number) => [MX + (i % 3) * 530, 190 + Math.floor(i / 3) * 290];
  const [ocx, ocy] = cardPos(OPENED);
  // page -> screen (scale 0.89, origin top centre, 110 px down)
  // camera: after the thread opens it moves a little closer to the conversation
  const cam = lin(f, T.OPEN + 20, T.OPEN + 70, 0, 1, Easing.bezier(0.65, 0, 0.35, 1));
  const K = 0.89 + 0.17 * cam, CX = -150 * cam, CY = -60 * cam;
  const scr = (x: number, y: number) => [960 + (x - 960) * K + CX, 110 + CY + y * K];
  const clicks: [number, number, number][] = [
    [T.OPEN, ocx + 250, ocy + 90], [T.FOCUS, MX + 700, COMP.y + 70], [T.GIFBTN, BTN.gif[0], BTN.gif[1]],
    [T.PICK, MX + 100 + (GIF_PICK % 3) * 150 + 65, COMP.y + 250 + Math.floor(GIF_PICK / 3) * 130 + 60], [T.SEND, BTN.send[0], BTN.send[1]],
  ];
  const pk = [40, ...clicks.flatMap(([t]) => [t - 16, t + 8]), T.SEND + 60];
  const pts = clicks.map(([, x, y]) => scr(x, y));
  const px = interpolate(f, pk, [1500, ...pts.flatMap(([x]) => [x, x]), 1500], { ...cl, easing: IOE });
  const py = interpolate(f, pk, [1000, ...pts.flatMap(([, y]) => [y, y]), 1000], { ...cl, easing: IOE });
  const down = Math.max(...clicks.map(([t]) => press(f, t)));
  const caps: [number, string, string][] = [[0, tr("Форум"), tr("для тех, кто учит право.")], [T.R1 - 20, tr("Спрашивай"), tr("и обсуждай.")], [T.FOCUS, tr("Пиши сообщения"), tr("и отправляй гифки.")]];
  let ci = 0; caps.forEach(([t], i) => { if (f >= t) ci = i; });
  const th = THREADS[OPENED];
  return (
    <AbsoluteFill style={{ background: "#fff", fontFamily: UI, overflow: "hidden", perspective: 2000 }}>
      <AbsoluteFill style={{ transformOrigin: "50% 0", transform: `translate(${CX}px, ${110 + CY + (1 - rise) * 900}px) rotateX(${(1 - rise) * 14}deg) scale(${K})`, opacity: Math.min(1, rise * 2) }}>
        {/* sidebar */}
        <div style={{ position: "absolute", left: 0, top: 0, width: 300, height: 1220, background: "linear-gradient(180deg, #eaf6ff, #f6fbff)" }}>
          <Img src={staticFile("brand/veoskill.webp")} style={{ position: "absolute", left: 60, top: 30, height: 46 }} />
          {NAV.map(([ic, t], i) => {
            const on = i === NAV.length - 1;
            return (
              <div key={t} style={{ position: "absolute", left: 18, top: 110 + i * 70, width: 264, height: 58, borderRadius: 16, border: on ? `3px solid ${BLUE}` : "3px solid transparent", background: on ? "#e3f4fe" : "transparent", display: "flex", alignItems: "center", gap: 16, paddingLeft: 12, boxSizing: "border-box", fontWeight: 800, fontSize: 19, letterSpacing: "0.08em", color: on ? BLUE : "#5d6470" }}>
                <Img src={S(ic)} style={{ width: 40, height: 40, objectFit: "contain" }} />{t}
              </div>
            );
          })}
          <div style={{ position: "absolute", left: 14, top: 760, width: 272, height: 150, borderRadius: 20, background: "linear-gradient(135deg, #1cb0f6, #3db7f4)", color: "#fff", padding: "18px 20px", boxSizing: "border-box" }}>
            <div style={{ fontWeight: 700, fontSize: 15, opacity: 0.85 }}>{tr("Текущий план")}</div>
            <div style={{ fontWeight: 900, fontSize: 26 }}>Premium</div>
            <div style={{ marginTop: 6, fontWeight: 600, fontSize: 14, opacity: 0.9 }}>{tr("Полный доступ открыт. Энергия и возможности без лимитов.")}</div>
          </div>
        </div>

        {/* ===== list of threads */}
        {open < 1 ? (
          <div style={{ position: "absolute", inset: 0, opacity: 1 - open, transform: `translateX(${-open * 200}px)` }}>
            <div style={{ position: "absolute", left: MX, top: 50, fontWeight: 900, fontSize: 56, color: "#3c3c3c" }}>{tr("Форум")}</div>
            <div style={{ position: "absolute", left: 1080, top: 52, width: 380, height: 66, borderRadius: 16, border: `3px solid ${LINE}`, display: "flex", alignItems: "center", gap: 14, paddingLeft: 22, boxSizing: "border-box", fontWeight: 600, fontSize: 22, color: "#9aa3b0" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.8" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>{tr("Поиск по веткам")}
            </div>
            <div style={{ position: "absolute", left: 1480, top: 52, width: 190, height: 66, borderRadius: 16, border: `3px solid ${LINE}`, boxShadow: `0 4px 0 ${LINE}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxSizing: "border-box", fontWeight: 900, fontSize: 22, color: "#4b4b4b" }}>{tr("Фильтр")}</div>
            <div style={{ position: "absolute", left: 1690, top: 52, width: 66, height: 66, borderRadius: 16, border: `3px solid ${LINE}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4b4b4b" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></svg></div>
            <div style={{ position: "absolute", left: 1776, top: 50, width: 70, height: 70, borderRadius: 16, background: GREEN, boxShadow: "0 5px 0 #46a302", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="30" height="30" viewBox="0 0 24 24" fill="#fff"><path d="M3 17.3V21h3.7L18 9.7 14.3 6zM20.7 7a1 1 0 000-1.4l-2.3-2.3a1 1 0 00-1.4 0L15.2 5 19 8.8z" /></svg></div>
            {THREADS.map((t, i) => { const [x, y] = cardPos(i); return <Card key={i} t={t} x={x} y={y} e={sp(18 + i * 6, 15, 170)} hover={i === OPENED ? hover : 0} />; })}
          </div>
        ) : null}

        {/* ===== opened thread */}
        {open > 0 ? (
          <div style={{ position: "absolute", inset: 0, opacity: open, transform: `translateX(${(1 - open) * 260}px)` }}>
            <div style={{ position: "absolute", left: MX, top: 40, display: "flex", alignItems: "center", gap: 18, fontWeight: 800, fontSize: 24, color: "#77808c" }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.4" strokeLinejoin="round"><path d="M3 11l9-8 9 8v10h-6v-6H9v6H3z" /></svg>›<span>{tr("Форум")}</span>›<span style={{ color: "#3c3c3c" }}>{th[0]}</span>
            </div>
            <div style={{ position: "absolute", left: MX, top: 100, display: "flex", alignItems: "center", gap: 22 }}>
              <Img src={S(th[2])} style={{ width: 80, height: 80, objectFit: "contain" }} />
              <div style={{ fontWeight: 900, fontSize: 40, color: "#3c3c3c", maxWidth: 1380 }}>{th[0]}</div>
            </div>
            <div style={{ position: "absolute", left: MX, top: 200, fontWeight: 600, fontSize: 25, color: "#4b4b4b" }}>{th[1]}</div>
            <div style={{ position: "absolute", left: MX, top: 256, display: "flex", alignItems: "center", gap: 14 }}>
              <Img src={AV(th[4])} style={{ width: 40, height: 40, borderRadius: 20, background: "#eef1f5" }} />
              <div style={{ fontWeight: 800, fontSize: 21, color: "#4b4b4b" }}>{th[5]}</div>
              <div style={{ fontWeight: 600, fontSize: 19, color: "#9aa3b0" }}>· {th[6]}</div>
              <div style={{ marginLeft: 30, padding: "4px 14px", borderRadius: 14, border: "3px solid #58cc02", transform: `scale(${1 + 0.15 * Math.sin(lin(f, T.VOTE, T.VOTE + 20) * Math.PI)})` }}><Up on={votes > 0} n={votes} /></div>
              <div style={{ padding: "4px 14px", borderRadius: 14, border: "3px solid #ff8a8a" }}><Down n={1} /></div>
              <div style={{ fontWeight: 800, fontSize: 21, color: "#4b4b4b" }}>{nMsg} {tr("сообщ.")}</div>
            </div>
            {/* composer */}
            <div style={{ position: "absolute", left: COMP.x, top: COMP.y, width: COMP.w, height: COMP.h, borderRadius: 22, border: `3px solid ${f >= T.FOCUS ? BLUE : "#bfe9ff"}`, boxShadow: f >= T.FOCUS && !sent ? "0 0 0 6px rgba(28,176,246,0.12)" : "none", background: "#fff", boxSizing: "border-box" }}>
              <div style={{ position: "absolute", left: 26, top: 22, right: 26, fontWeight: 600, fontSize: 25, color: draft ? "#2b2b2b" : "#9aa3b0" }}>
                {draft || tr("Вступить в беседу")}{draft && !gifIn && f < T.GIFBTN && Math.floor(f / 15) % 2 ? <span style={{ color: BLUE }}>|</span> : null}
              </div>
              {gifIn ? <div style={{ position: "absolute", left: 26, top: 70, transform: `scale(${sp(T.PICK + 4, 14, 220)})`, transformOrigin: "0 0" }}><Gif src={GIFS[GIF_PICK]} f={f} w={110} /></div> : null}
              <div style={{ position: "absolute", left: 26, bottom: 18, display: "flex", gap: 24, alignItems: "center" }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#5d6470" strokeWidth="2"><circle cx="12" cy="12" r="4" /><path d="M16 12v1.5a2.5 2.5 0 005 0V12a9 9 0 10-3.5 7.1" /></svg>
                <div style={{ width: 52, height: 36, borderRadius: 10, border: `2.5px solid ${f >= T.GIFBTN && !sent ? BLUE : "#5d6470"}`, color: f >= T.GIFBTN && !sent ? BLUE : "#5d6470", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16, boxSizing: "border-box" }}>GIF</div>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#5d6470" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9.5h.01M15 9.5h.01" strokeLinecap="round" /></svg>
              </div>
              <div style={{ position: "absolute", right: 120, bottom: 14, padding: "10px 22px", borderRadius: 14, background: "#f4f6f9", fontWeight: 800, fontSize: 21, color: "#4b4b4b" }}>{tr("Отмена")}</div>
              <div style={{ position: "absolute", right: 30, bottom: 12, width: 60, height: 52, display: "flex", alignItems: "center", justifyContent: "center", transform: `translateX(${press(f, T.SEND) * 8}px)` }}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill={typed.length > 3 ? BLUE : "#c4c9d1"}><path d="M3 20.5l18-8.5L3 3.5v6.6l12 1.9-12 1.9z" /></svg>
              </div>
              {/* GIF picker */}
              {picker > 0.01 ? (
                <div style={{ position: "absolute", left: 70, top: 230, width: 500, padding: 20, borderRadius: 22, background: "#fff", boxShadow: "0 30px 70px rgba(13,22,48,0.22)", border: `2px solid ${LINE}`, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, opacity: Math.min(1, picker * 1.5), transform: `translateY(${(1 - picker) * -20}px) scale(${0.9 + 0.1 * picker})`, transformOrigin: "20% 0", zIndex: 30 }}>
                  {GIFS.map((g, i) => <div key={g} style={{ borderRadius: 18, outline: i === GIF_PICK && f >= T.PICK - 4 ? `4px solid ${BLUE}` : "none" }}><Gif src={g} f={f + i * 7} w={145} /></div>)}
                </div>
              ) : null}
            </div>
            {/* messages, newest on top */}
            <div style={{ position: "absolute", left: MX, top: 630, width: 1500, display: "flex", flexDirection: "column", gap: 26 }}>
              {f >= T.TYPING && f < T.R3 ? <div style={{ display: "flex", alignItems: "center", gap: 14, fontWeight: 700, fontSize: 20, color: "#9aa3b0", opacity: lin(f, T.TYPING, T.TYPING + 10) }}><Img src={AV("p3")} style={{ width: 40, height: 40, borderRadius: 20, background: "#d9d6ff" }} />{tr("Наргиза печатает")}{[0, 1, 2].map((k) => <span key={k} style={{ display: "inline-block", width: 9, height: 9, borderRadius: 5, background: "#9aa3b0", transform: `translateY(${Math.sin(f / 5 - k) * 4}px)` }} />)}</div> : null}
              {f >= T.R3 ? <Msg av="p3" name={tr("Наргиза")} when={tr("только что")} e={sp(T.R3, 14, 200)}>{tr("Ахаха, точно! Там столько оговорок 🔥")}</Msg> : null}
              {sent ? <Msg av="p1" name={tr("Ты")} when={tr("только что")} e={sp(T.SEND + 4, 13, 200)} me likes={myLikes} likeOn={myLikes > 0}>{MSG}<div style={{ marginTop: 10 }}><Gif src={GIFS[GIF_PICK]} f={f} w={200} /></div></Msg> : null}
              {f >= T.R2 ? <Msg av="p5" name={tr("Тимур")} when={tr("2 мин. назад")} e={sp(T.R2, 14, 200)} likes={3}><Gif src={GIFS[0]} f={f} w={220} /></Msg> : null}
              {f >= T.R1 ? <Msg av="p4" name={tr("Малика")} when={tr("5 мин. назад")} e={sp(T.R1, 14, 200)} likes={4}>{tr("Мне кажется, статья про мелкое хулиганство. Там столько условий 😅")}</Msg> : null}
            </div>
          </div>
        ) : null}
      </AbsoluteFill>
      <TopLine key={caps[ci][0]} a={caps[ci][1]} b={caps[ci][2]} at={caps[ci][0]} size={66} />
      <div style={{ position: "absolute", inset: 0, zIndex: 50 }}><Pointer x={px} y={py} down={down} op={lin(f, 40, 56) * (1 - lin(f, T.SEND + 40, T.SEND + 60))} /></div>
    </AbsoluteFill>
  );
};
