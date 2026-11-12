import React from "react";
import { tr } from "./i18n";
import { AbsoluteFill, Easing, Img, interpolate, interpolateColors, staticFile } from "remotion";
import { UI, IOE, lin, press, useSp, useFrame, Pointer, TopLine } from "./Scenes9";

// Forum, Reddit-style thread (no side menu). Like the lesson path at the start: a drone camera flies low
// over the tilted thread from the bottom up, rises and flattens on the post; the learner up-votes it, opens
// a reply under the top comment, types, adds a GIF, sends; the reply lands in the thread and collects votes.
// No "Дуэли"/"Профиль"/"NEOLEX" in frame (docs/RULES.md).
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const AV = (n: string) => staticFile(`av/${n}.svg`);
const INK = "#1a1a1b", META = "#6a7681", LINE = "#e3e7eb", BLUE = "#1cb0f6", UP = "#58cc02";
export const FORUM_FRAMES = 864;

const T = { LAND: 118, VOTE: 172, DOWN0: 196, REPLY: 262, TYPE0: 312, GIFBTN: 424, PICK: 466, SEND: 508, VOTE2: 596, MYV: 626, SCROLL: 690 };
const X0 = 410, W = 1100;                 // thread column (page coordinates = screen coordinates when flat)

/** Number that rolls up when it changes at `at`. */
const Roll: React.FC<{ from: number; to: number; at: number; f: number; color: string }> = ({ from, to, at, f, color }) => {
  const u = lin(f, at, at + 10, 0, 1, Easing.bezier(0.3, 0, 0.2, 1));
  return (
    <span style={{ position: "relative", display: "inline-block", height: "1.2em", lineHeight: "1.2em", overflow: "hidden", verticalAlign: "middle", minWidth: "1.3em", textAlign: "center", color }}>
      <span style={{ display: "block", transform: `translateY(${-u * 100}%)`, opacity: 1 - u }}>{from}</span>
      <span style={{ display: "block", transform: `translateY(${-u * 100}%)`, opacity: u }}>{to}</span>
    </span>
  );
};
const Arrow: React.FC<{ up?: boolean; c?: string; fill?: number; s?: number; k?: number }> = ({ up = true, c = "#7c8893", fill = 0, s = 26, k = 1 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={`rgba(88,204,2,${fill})`} stroke={c} strokeWidth="2.2" strokeLinejoin="round" style={{ transform: `${up ? "" : "rotate(180deg) "}scale(${k})` }}><path d="M12 3.5l7.5 8.5H15v8.5H9V12H4.5z" /></svg>
);
/** Vote pill: ▲ n ▼ (n rolls when the learner votes at `at`). */
const Votes: React.FC<{ n: number; at?: number; f: number; big?: boolean; pop?: number }> = ({ n, at, f, big, pop = 0 }) => {
  // pressed: no fill, the arrow, the number and a thin outline turn green smoothly
  const u = at !== undefined ? lin(f, at - 2, at + 12, 0, 1, Easing.bezier(0.3, 0, 0.2, 1)) : 0;
  const c = interpolateColors(u, [0, 1], ["#7c8893", UP]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, height: big ? 52 : 40, padding: "0 12px", borderRadius: 26, border: `2px solid ${interpolateColors(u, [0, 1], [big ? "#e3e7eb" : "rgba(88,204,2,0)", UP])}`, boxSizing: "border-box", fontWeight: 800, fontSize: big ? 22 : 19, transform: `scale(${1 + 0.06 * pop})` }}>
      <Arrow c={c} fill={u} k={1 + 0.22 * Math.sin(u * Math.PI)} s={big ? 26 : 22} />
      {at !== undefined ? <Roll from={n} to={n + 1} at={at} f={f} color={interpolateColors(u, [0, 1], [INK, "#3f9a00"])} /> : <span style={{ color: INK }}>{n}</span>}
      <Arrow up={false} s={big ? 26 : 22} />
    </div>
  );
};
const Gif: React.FC<{ src: string; f: number; w: number }> = ({ src, f, w }) => (
  <div style={{ position: "relative", width: w, height: w * 0.62, borderRadius: 14, overflow: "hidden", background: "linear-gradient(160deg, #f3f8fc, #e3eef7)", border: `1.5px solid ${LINE}` }}>
    <Img src={staticFile(src)} style={{ position: "absolute", left: "50%", top: "52%", height: w * 0.52, objectFit: "contain", transform: `translate(-50%, -50%) translateY(${Math.sin(f / 7) * 4}px) rotate(${Math.sin(f / 10) * 4}deg)` }} />
    <div style={{ position: "absolute", right: 8, bottom: 8, padding: "1px 8px", borderRadius: 6, background: "rgba(26,26,27,0.7)", color: "#fff", fontWeight: 800, fontSize: 13, letterSpacing: "0.06em" }}>GIF</div>
  </div>
);
/** A comment: avatar, name · time, text, actions. */
const Comment: React.FC<{ x: number; y: number; av: string; name: string; when: string; me?: boolean; votes: React.ReactNode; e?: number; glow?: number; children: React.ReactNode }> = ({ x, y, av, name, when, me, votes, e = 1, glow = 0, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: X0 + W - x, opacity: Math.min(1, e * 1.6), transform: `translateY(${(1 - e) * 16}px)` }}>
    {glow > 0.01 ? <div style={{ position: "absolute", left: -16, top: -10, right: 0, bottom: -10, borderRadius: 16, background: `rgba(28,176,246,${0.10 * glow})`, boxShadow: `inset 3px 0 0 rgba(28,176,246,${glow})` }} /> : null}
    <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
      <Img src={AV(av)} style={{ width: 40, height: 40, borderRadius: 20, background: me ? "#ffd5cc" : "#eef1f5" }} />
      <div style={{ fontWeight: 800, fontSize: 21, color: me ? BLUE : INK }}>{name}</div>
      <div style={{ fontWeight: 600, fontSize: 19, color: META }}>· {when}</div>
    </div>
    <div style={{ position: "relative", marginLeft: 52, marginTop: 6, fontWeight: 500, fontSize: 23, lineHeight: 1.45, color: INK }}>{children}</div>
    <div style={{ position: "relative", marginLeft: 40, marginTop: 4, display: "flex", alignItems: "center", gap: 14, fontWeight: 800, fontSize: 18, color: META }}>
      {votes}<span>{tr("Ответить")}</span><span>{tr("Поделиться")}</span>
    </div>
  </div>
);

export const Forum: React.FC = () => {
  const f = useFrame();
  const sp = useSp();
  // ---------- thread layout (page coordinates)
  const POST_Y = 120, C_Y = 730;
  const MSG = tr("Согласен! Я бы добавил ещё статью про самоуправство 😂");
  const boxOpen = sp(T.REPLY + 4, 18, 170) * (1 - lin(f, T.SEND + 2, T.SEND + 16, 0, 1, IOE));
  const sent = f >= T.SEND + 4;
  const mine = sent ? sp(T.SEND + 6, 16, 170) : 0;
  const slot = Math.max(250 * boxOpen, 250 * mine);   // the reply box, then the sent reply, under the top comment
  const yC1 = C_Y, yKids = C_Y + 176;
  const yTim = yKids + slot + (slot > 1 ? 18 : 0);
  const yC2 = yTim + 262, yC2a = yC2 + 134, yC3 = yC2a + 160;
  const yC4 = yC3 + 176, yC4a = yC4 + 176, yC4b = yC4a + 134, yC5 = yC4b + 262, yC5a = yC5 + 134, yC6 = yC5a + 134, END_Y = yC6 + 150;
  const CH = Array.from(MSG); // by characters, so the emoji never shows half-typed
  const typed = CH.slice(0, Math.max(0, Math.min(CH.length, Math.floor((f - T.TYPE0) * CH.length / (T.GIFBTN - 14 - T.TYPE0))))).join("");
  const tray = sp(T.GIFBTN + 4, 16, 190) * (1 - lin(f, T.PICK + 6, T.PICK + 18));
  const gifIn = f >= T.PICK + 4;
  const myVotes = Math.round(lin(f, T.MYV, T.MYV + 90, 1, 14, Easing.out(Easing.cubic)));
  // ---------- camera: drone flight from the bottom of the thread up to the post, then it lands and works
  type Cam = [number, number, number]; // focus y, scale, tilt
  const keys: [number, Cam][] = [
    [0, [1900, 1.7, 56]], [T.LAND, [POST_Y + 330, 1.0, 0]], [T.DOWN0, [POST_Y + 330, 1.0, 0]], [T.DOWN0 + 46, [C_Y + 240, 1.0, 0]],
    [T.REPLY + 6, [C_Y + 240, 1.0, 0]], [T.REPLY + 44, [yKids + 120, 1.32, 0]], [T.SEND + 8, [yKids + 120, 1.32, 0]], [T.SEND + 52, [yKids + 200, 1.05, 0]],
    [T.VOTE2 - 34, [yKids + 260, 1.0, 0]], [T.VOTE2 + 20, [yKids + 260, 1.0, 0]], [T.MYV + 8, [yKids + 140, 1.1, 0]], [T.SCROLL, [yKids + 140, 1.1, 0]], [FORUM_FRAMES, [END_Y - 420, 1.0, 0]],
  ];
  let cam: Cam = keys[keys.length - 1][1];
  for (let k = 0; k < keys.length - 1; k++) {
    const [t0, c0] = keys[k], [t1, c1] = keys[k + 1];
    if (f >= t0 && f < t1) {
      const u = (k === 0 ? Easing.bezier(0.35, 0, 0.2, 1) : Easing.bezier(0.65, 0, 0.35, 1))((f - t0) / Math.max(1, t1 - t0));
      cam = [c0[0] + (c1[0] - c0[0]) * u, c0[1] + (c1[1] - c0[1]) * u, c0[2] + (c1[2] - c0[2]) * u];
      break;
    }
  }
  const [cy, sc, rx] = cam;
  const fog = rx / 56;
  const scr = (x: number, y: number) => [960 + (x - 960) * sc, 560 + (y - cy) * sc];
  // ---------- cursor (all clicks happen with the page flat)
  const clicks: [number, number, number][] = [
    [T.VOTE, X0 + 26, POST_Y + 367], [T.REPLY, X0 + 200, yC1 + 133], [T.GIFBTN, X0 + 112, yKids + 196], [T.PICK, X0 + 112 + 160 + 60, yKids + 300],
    [T.SEND, X0 + W - 80, yKids + 196], [T.VOTE2, X0 + 63, yC2 + 100],
  ];
  const pk = [T.LAND - 20, ...clicks.flatMap(([t]) => [t - 16, t + 8]), T.VOTE2 + 50];
  const pts = clicks.map(([, x, y]) => scr(x, y));
  const px = interpolate(f, pk, [1500, ...pts.flatMap(([x]) => [x, x]), 1500], { ...cl, easing: IOE });
  const py = interpolate(f, pk, [1000, ...pts.flatMap(([, y]) => [y, y]), 1000], { ...cl, easing: IOE });
  const down = Math.max(...clicks.map(([t]) => press(f, t)));
  const caps: [number, string, string][] = [[0, tr("Форум"), tr("для тех, кто учит право.")], [T.REPLY - 10, tr("Отвечай"), tr("и делись гифками.")], [T.VOTE2 - 30, tr("Голосуй"), tr("за лучшие ответы.")], [T.SCROLL, tr("Общайся"), tr("с теми, кто учит право.")]];
  let ci = 0; caps.forEach(([t], i) => { if (f >= t) ci = i; });
  const votePop = Math.sin(lin(f, T.VOTE, T.VOTE + 18) * Math.PI);
  return (
    <AbsoluteFill style={{ background: "#f6f7f8", overflow: "hidden", fontFamily: UI }}>
      <AbsoluteFill style={{ perspective: 1100 }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 3200, transformOrigin: "0 0", transform: `translate(960px, 560px) rotateX(${rx}deg) scale(${sc}) translate(-960px, ${-cy}px)` }}>
          {/* dot grid under the thread, only while flying */}
          <div style={{ position: "absolute", left: -900, top: -400, width: 3720, height: 4000, backgroundImage: "radial-gradient(rgba(20,60,110,0.16) 2.4px, transparent 2.8px)", backgroundSize: "48px 48px", opacity: fog }} />
          {/* thread column */}
          <div style={{ position: "absolute", left: X0 - 40, top: POST_Y - 40, width: W + 80, height: END_Y + 120 - POST_Y, borderRadius: 30, background: "#fff", boxShadow: "0 30px 80px rgba(13,22,48,0.08)" }} />
          {/* ===== post */}
          <div style={{ position: "absolute", left: X0, top: POST_Y, width: W }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 26, background: "#e3f4fe", display: "flex", alignItems: "center", justifyContent: "center" }}><Img src={staticFile("site/icons_duel_scales.webp")} style={{ width: 38, height: 38, objectFit: "contain" }} /></div>
              <div style={{ fontWeight: 900, fontSize: 22, color: INK }}>{tr("Уголовное право")}</div>
              <div style={{ fontWeight: 600, fontSize: 20, color: META }}>· {tr("Азиз")} · {tr("2 нед. назад")}</div>
            </div>
            <div style={{ marginTop: 22, fontWeight: 900, fontSize: 44, lineHeight: 1.18, color: INK }}>{tr("Какая статья Уголовного кодекса самая странная на ваш взгляд?")}</div>
            <div style={{ marginTop: 14, display: "inline-block", padding: "4px 14px", borderRadius: 14, background: "#e3f4fe", color: "#1789c4", fontWeight: 800, fontSize: 18 }}>{tr("Обсуждение")}</div>
            <div style={{ marginTop: 16, fontWeight: 500, fontSize: 25, lineHeight: 1.5, color: "#30363d" }}>{tr("Не обязательно самая страшная. Может, самая смешная или та, которую невозможно понять. Пишите номер и почему.")}</div>
            <div style={{ marginTop: 26, display: "flex", alignItems: "center", gap: 14 }}>
              <Votes n={41} at={T.VOTE + 2} f={f} big pop={votePop} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, height: 52, padding: "0 18px", borderRadius: 26, background: "#eef1f4", fontWeight: 800, fontSize: 21, color: INK }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c8893" strokeWidth="2.2" strokeLinejoin="round"><path d="M4 5h16v11H10l-5 4v-4H4z" /></svg>{18 + (sent ? 1 : 0)}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, height: 52, padding: "0 18px", borderRadius: 26, background: "#eef1f4", fontWeight: 800, fontSize: 21, color: INK }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c8893" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 5l6 6-6 6M20 11H9a5 5 0 00-5 5v3" /></svg>{tr("Поделиться")}
              </div>
            </div>
          </div>
          {/* add-a-comment field */}
          <div style={{ position: "absolute", left: X0, top: C_Y - 110, width: W, height: 64, borderRadius: 32, border: `2px solid ${LINE}`, display: "flex", alignItems: "center", paddingLeft: 26, boxSizing: "border-box", fontWeight: 600, fontSize: 21, color: META }}>{tr("Добавить комментарий")}</div>
          {/* thread lines */}
          <div style={{ position: "absolute", left: X0 + 19, top: yC1 + 46, width: 2, height: yTim + 30 - (yC1 + 46), background: LINE }} />
          <div style={{ position: "absolute", left: X0 + 19, top: yC2 + 46, width: 2, height: yC2a + 30 - (yC2 + 46), background: LINE }} />
          {/* ===== comments */}
          <Comment x={X0} y={yC1} av="p4" name={tr("Малика")} when={tr("3 ч")} votes={<Votes n={24} f={f} />}>{tr("По-моему, статья про мелкое хулиганство. Там столько условий, что без юриста не разберёшься.")}</Comment>
          {/* reply box under the top comment */}
          {boxOpen > 0.01 ? (
            <div style={{ position: "absolute", left: X0 + 56, top: yKids, width: W - 56, height: 230 * boxOpen, overflow: "hidden", opacity: Math.min(1, boxOpen * 1.5) }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: 22, border: `2px solid ${BLUE}`, boxShadow: "0 0 0 5px rgba(28,176,246,0.12)", background: "#fff" }} />
              <div style={{ position: "absolute", left: 24, top: 18, right: 24, fontWeight: 500, fontSize: 24, lineHeight: 1.45, color: typed ? INK : META }}>
                {typed || `${tr("Ответ для")} ${tr("Малика")}`}{f >= T.TYPE0 - 10 && f < T.GIFBTN && Math.floor(f / 14) % 2 ? <span style={{ color: BLUE }}>|</span> : null}
              </div>
              {gifIn ? <div style={{ position: "absolute", left: 24, top: 64, transform: `scale(${sp(T.PICK + 4, 14, 220)})`, transformOrigin: "0 0" }}><Gif src="v4/owl-read.png" f={f} w={140} /></div> : null}
              <div style={{ position: "absolute", left: 22, bottom: 16, display: "flex", gap: 12 }}>
                <div style={{ height: 36, padding: "0 12px", borderRadius: 10, border: `2px solid ${f >= T.GIFBTN ? BLUE : "#c3ccd5"}`, color: f >= T.GIFBTN ? BLUE : META, display: "flex", alignItems: "center", fontWeight: 900, fontSize: 15 }}>GIF</div>
              </div>
              <div style={{ position: "absolute", right: 22, bottom: 14, height: 42, padding: "0 22px", borderRadius: 21, background: typed.length > 3 ? BLUE : "#c9d3dc", color: "#fff", display: "flex", alignItems: "center", fontWeight: 800, fontSize: 19, transform: `scale(${1 - 0.05 * press(f, T.SEND)})` }}>{tr("Ответить")}</div>
            </div>
          ) : null}
          {/* GIF tray */}
          {tray > 0.01 ? (
            <div style={{ position: "absolute", left: X0 + 100, top: yKids + 236, display: "flex", gap: 12, padding: 14, borderRadius: 20, background: "#fff", boxShadow: "0 24px 60px rgba(13,22,48,0.18)", border: `1.5px solid ${LINE}`, opacity: Math.min(1, tray * 1.5), transform: `translateY(${(1 - tray) * -14}px)`, zIndex: 5 }}>
              {["v4/owl-q.png", "v4/owl-read.png", "real/mascot1.webp", "site/stickers_key-fire.webp"].map((g, i) => <div key={g} style={{ borderRadius: 16, outline: i === 1 && f >= T.PICK - 4 ? `3px solid ${BLUE}` : "none", outlineOffset: 2 }}><Gif src={g} f={f + i * 9} w={140} /></div>)}
            </div>
          ) : null}
          {/* the learner's reply */}
          {sent ? (
            <Comment x={X0 + 56} y={yKids} av="p1" name={tr("Ты")} when={tr("только что")} me e={mine} glow={1 - lin(f, T.SEND + 60, T.SEND + 120)} votes={<Votes n={myVotes} f={f} pop={Math.sin(lin(f, T.MYV, T.MYV + 14) * Math.PI)} />}>
              {MSG}<div style={{ marginTop: 10 }}><Gif src="v4/owl-read.png" f={f} w={190} /></div>
            </Comment>
          ) : null}
          <Comment x={X0 + 56} y={yTim} av="p5" name={tr("Тимур")} when={tr("2 ч")} votes={<Votes n={9} f={f} />}>
            {tr("Каждый раз, когда открываю этот кодекс:")}<div style={{ marginTop: 10 }}><Gif src="v4/owl-q.png" f={f} w={190} /></div>
          </Comment>
          <Comment x={X0} y={yC2} av="p2" name={tr("Сардор")} when={tr("2 ч")} votes={<Votes n={15} at={T.VOTE2 + 2} f={f} pop={Math.sin(lin(f, T.VOTE2, T.VOTE2 + 18) * Math.PI)} />}>{tr("Статья про самоуправство. Читал три раза, так и не понял, где граница.")}</Comment>
          <Comment x={X0 + 56} y={yC2a} av="p3" name={tr("Дильноза")} when={tr("1 ч")} votes={<Votes n={4} f={f} />}>{tr("Согласна, без примера там вообще никак.")}</Comment>
          <Comment x={X0} y={yC3} av="p0" name={tr("Санжар")} when={tr("40 мин")} votes={<Votes n={7} f={f} />}>{tr("А мне нравится, как в кодексе описан «крайний случай». Звучит как название фильма.")}</Comment>
          {/* more of the conversation, seen while the camera scrolls down */}
          <div style={{ position: "absolute", left: X0 + 19, top: yC4 + 46, width: 2, height: yC4b + 30 - (yC4 + 46), background: LINE }} />
          <div style={{ position: "absolute", left: X0 + 19, top: yC5 + 46, width: 2, height: yC5a + 30 - (yC5 + 46), background: LINE }} />
          <Comment x={X0} y={yC4} av="me3" name={tr("Нодира")} when={tr("35 мин")} votes={<Votes n={11} f={f} />}>{tr("Для экзамена советую разбирать такие статьи на примерах. Тогда запоминаются сами.")}</Comment>
          <Comment x={X0 + 56} y={yC4a} av="me5" name={tr("Жасур")} when={tr("30 мин")} votes={<Votes n={6} f={f} />}>{tr("Плюс. Я так и учу: статья, пример, тест.")}</Comment>
          <Comment x={X0 + 56} y={yC4b} av="me1" name={tr("Камола")} when={tr("25 мин")} votes={<Votes n={3} f={f} />}>{tr("А у кого есть подборка по Уголовному кодексу? Скиньте ссылку 🙏")}<div style={{ marginTop: 10 }}><Gif src="real/mascot1.webp" f={f} w={190} /></div></Comment>
          <Comment x={X0} y={yC5} av="me6" name={tr("Бехруз")} when={tr("15 мин")} votes={<Votes n={8} f={f} />}>{tr("Мне кажется, самая странная та, где три исключения в одном предложении.")}</Comment>
          <Comment x={X0 + 56} y={yC5a} av="me2" name={tr("Азиз")} when={tr("10 мин")} votes={<Votes n={5} f={f} />}>{tr("Точно, читаешь и теряешь нить на середине 😄")}</Comment>
          <Comment x={X0} y={yC6} av="me7" name={tr("Лола")} when={tr("2 мин")} votes={<Votes n={2} f={f} />}>{tr("Сохранила ветку, перечитаю перед сессией.")}</Comment>
        </div>
      </AbsoluteFill>
      {/* soft fog at the top while the camera flies low */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(246,247,248,1) 0%, rgba(246,247,248,0) 45%)", opacity: fog }} />
      <TopLine key={caps[ci][0]} a={caps[ci][1]} b={caps[ci][2]} at={caps[ci][0]} size={66} />
      <div style={{ position: "absolute", inset: 0, zIndex: 50 }}><Pointer x={px} y={py} down={down} op={lin(f, T.LAND - 20, T.LAND) * (1 - lin(f, T.VOTE2 + 30, T.VOTE2 + 50))} /></div>
    </AbsoluteFill>
  );
};
