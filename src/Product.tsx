import React from "react";
import {
  AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { C, FONT, OUT, useFonts, pop, MaskWords, Wipe, CardIcon, Dot } from "./Intro";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const IO = Easing.bezier(0.65, 0, 0.35, 1);

// ---------- Камера по скриншоту ----------
type Cam = { f: number; cx: number; cy: number; s: number };
const useCam = (cam: Cam[]) => {
  const frame = useCurrentFrame();
  const fs = cam.map((c) => c.f);
  const get = (k: "cx" | "cy" | "s") => interpolate(frame, fs, cam.map((c) => c[k]), { easing: IO, ...clamp });
  return { s: get("s"), cx: get("cx"), cy: get("cy") };
};

export type KF = { f: number; x: number; y: number };
export const Cursor: React.FC<{ path: KF[]; clicks: number[]; inv: number }> = ({ path, clicks, inv }) => {
  const frame = useCurrentFrame();
  const fs = path.map((p) => p.f);
  const x = interpolate(frame, fs, path.map((p) => p.x), { easing: IO, ...clamp });
  const y = interpolate(frame, fs, path.map((p) => p.y), { easing: IO, ...clamp });
  const vis = interpolate(frame, [fs[0] - 8, fs[0]], [0, 1], clamp);
  const press = Math.max(0, ...clicks.map((c) => 1 - Math.min(1, Math.abs(frame - c - 2) / 5)));
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: vis, pointerEvents: "none" }}>
      {clicks.map((c, i) => {
        const t = interpolate(frame, [c, c + 16], [0, 1], clamp);
        return t > 0 && t < 1 ? (
          <div key={i} style={{ position: "absolute", left: -40 * inv, top: -40 * inv, width: 80 * inv, height: 80 * inv, borderRadius: "50%",
            border: `${5 * inv}px solid ${C.blue}`, opacity: 1 - t, transform: `scale(${0.3 + t})` }} />
        ) : null;
      })}
      <svg width={44 * inv} height={44 * inv} viewBox="0 0 44 44" style={{ transform: `scale(${1 - press * 0.15})`, transformOrigin: "4px 4px", filter: "drop-shadow(0 4px 6px rgba(0,0,0,.3))" }}>
        <path d="M4 3 L4 33 L12 26 L18 40 L24 37 L18 24 L29 24 Z" fill="#fff" stroke="#2c2e2a" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

export const Ring: React.FC<{ x: number; y: number; w: number; h: number; at: number; until?: number; inv: number }> = ({ x, y, w, h, at, until = 9999, inv }) => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [at, at + 10, until - 8, until], [0, 1, 1, 0], clamp);
  const pulse = 1 + Math.sin((frame - at) / 7) * 0.012;
  if (a <= 0) return null;
  return <div style={{ position: "absolute", left: x - 8, top: y - 8, width: w + 16, height: h + 16, borderRadius: 28, border: `${5 * inv}px solid ${C.blue}`,
    boxShadow: `0 0 0 ${10 * inv}px rgba(28,176,246,.18)`, opacity: a, transform: `scale(${pulse})` }} />;
};

export const Shot: React.FC<{ img: string; cam: Cam[]; children?: (inv: number) => React.ReactNode }> = ({ img, cam, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { s, cx, cy } = useCam(cam);
  const tx = 720 - cx * s;
  const ty = 450 - cy * s;
  const enter = pop(frame, fps, 0, 14);
  return (
    <div style={{ position: "absolute", left: 240, top: 30, width: 1440, height: 900, borderRadius: 30, overflow: "hidden", background: "#fff",
      boxShadow: `0 30px 80px rgba(24,153,214,.28), 0 0 0 6px ${C.blue}`, transform: `translateY(${(1 - enter) * 180}px) scale(${0.9 + enter * 0.1})`, opacity: Math.min(1, enter * 2) }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1440, height: 900, transformOrigin: "0 0", transform: `translate(${tx}px,${ty}px) scale(${s})` }}>
        <Img src={staticFile(img)} style={{ width: 1440, height: 900, display: "block" }} />
        {children?.(1 / s)}
      </div>
    </div>
  );
};

export const Callout: React.FC<{ x: number; y: number; text: string; sub?: string; color?: string; dark?: string; at: number; until?: number }> = ({ x, y, text, sub, color = C.green, dark = C.greenDark, at, until = 9999 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, at, 10);
  const out = interpolate(frame, [until - 8, until], [1, 0], clamp);
  if (frame < at) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${s}) rotate(${(1 - s) * -4}deg) translateY(${(1 - out) * 20}px)`, opacity: out,
      background: color, color: "#fff", borderRadius: 36, padding: sub ? "20px 48px 22px" : "22px 52px", boxShadow: `0 10px 0 ${dark}, 0 24px 40px rgba(0,0,0,.18)`, textAlign: "center" }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 52, lineHeight: 1.1, whiteSpace: "nowrap" }}>{text}</div>
      {sub ? <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 30, marginTop: 8, opacity: 0.95, whiteSpace: "nowrap" }}>{sub}</div> : null}
    </div>
  );
};

// ---------- Сцены ----------
const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = interpolate(frame, [0, 10, 54, 66], [0, 1, 1, 0], clamp);
  const strike = interpolate(frame, [34, 50], [0, 100], { easing: OUT, ...clamp });
  const logo = pop(frame, fps, 66, 9);
  const dots: [number, number, number, string][] = [[330, 260, 46, C.blue], [1560, 230, 34, C.green], [260, 800, 30, C.orange], [1650, 760, 54, C.violet], [520, 140, 22, C.coral], [1380, 900, 26, C.yellow]];
  return (
    <AbsoluteFill style={{ background: C.white }}>
      {frame > 60 && dots.map(([x, y, r, c], i) => <Dot key={i} x={x} y={y} r={r} color={c} delay={64 + i * 3} drift={i} />)}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: q }}>
        <div style={{ position: "relative" }}>
          <MaskWords text="Законы — это сложно?" size={120} color={C.ink} delay={0} />
          <div style={{ position: "absolute", left: 0, top: "52%", height: 14, borderRadius: 7, background: C.coral, width: `${strike}%` }} />
        </div>
      </AbsoluteFill>
      {frame >= 60 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 36 }}>
          <Img src={staticFile("img/logo.png")} style={{ width: 1000, transform: `scale(${logo})` }} />
          <MaskWords text="Право Узбекистана — понятно и бесплатно" size={62} color={C.ink} delay={86} weight={800} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

const Badge: React.FC<{ i: number; t: string; c: string; d: string; icon: React.ReactNode }> = ({ i, t, c, d, icon }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, 24 + i * 12, 10);
  const bob = Math.sin((frame + i * 20) / 20) * 8;
  return (
    <div style={{ width: 500, height: 540, borderRadius: 56, background: c, boxShadow: `0 18px 0 ${d}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 36,
      transform: `translateY(${bob + (1 - s) * 200}px) scale(${s}) rotate(${(1 - s) * (i - 1) * 12}deg)` }}>
      {icon}
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 70, color: "#fff", textAlign: "center", lineHeight: 1.05 }}>{t}</div>
    </div>
  );
};

const SceneValues: React.FC = () => (
  <AbsoluteFill style={{ background: C.mist }}>
    <div style={{ position: "absolute", top: 90, width: "100%" }}><MaskWords text="Всё, что нужно — в одном месте" size={84} color={C.ink} delay={4} /></div>
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 60, paddingTop: 150 }}>
      <Badge i={0} t="Бесплатно" c={C.blue} d={C.blueDark} icon={<svg width="170" height="170" viewBox="0 0 100 100"><circle cx="50" cy="50" r="38" fill="#fff" /><text x="50" y="66" textAnchor="middle" fontFamily={FONT} fontWeight="900" fontSize="46" fill={C.blueDark}>0</text></svg>} />
      <Badge i={1} t="Без регистрации" c={C.green} d={C.greenDark} icon={<svg width="170" height="170" viewBox="0 0 100 100"><circle cx="50" cy="36" r="18" fill="#fff" /><path d="M16 88c2-24 16-34 34-34s32 10 34 34z" fill="#fff" /><path d="M20 14l60 72" stroke={C.coral} strokeWidth="9" strokeLinecap="round" /></svg>} />
      <Badge i={2} t="RU · EN · UZ" c={C.orange} d={C.orangeDark} icon={<svg width="170" height="170" viewBox="0 0 100 100"><circle cx="50" cy="50" r="38" fill="#fff" /><ellipse cx="50" cy="50" rx="16" ry="38" fill="none" stroke={C.orange} strokeWidth="5" /><path d="M12 50h76M20 30h60M20 70h60" stroke={C.orange} strokeWidth="5" fill="none" /></svg>} />
    </AbsoluteFill>
  </AbsoluteFill>
);

const SceneLibrary: React.FC = () => (
  <AbsoluteFill style={{ background: C.mist }}>
    <Shot img="shots/laws-desk.png" cam={[
      { f: 0, cx: 720, cy: 450, s: 1 }, { f: 36, cx: 720, cy: 450, s: 1 }, { f: 90, cx: 700, cy: 125, s: 1.7 }, { f: 150, cx: 700, cy: 125, s: 1.7 },
      { f: 190, cx: 780, cy: 60, s: 1.9 }, { f: 255, cx: 780, cy: 60, s: 1.9 }, { f: 300, cx: 520, cy: 330, s: 1.25 }, { f: 400, cx: 520, cy: 330, s: 1.25 }, { f: 450, cx: 720, cy: 450, s: 1 },
    ]}>
      {(inv) => (
        <>
          <Ring x={70} y={104} w={1340} h={42} at={96} until={170} inv={inv} />
          <Ring x={602} y={28} w={450} h={48} at={196} until={262} inv={inv} />
          <Ring x={24} y={176} w={336} h={206} at={318} until={420} inv={inv} />
          <Cursor inv={inv} clicks={[352]} path={[
            { f: 80, x: 120, y: 190 }, { f: 100, x: 150, y: 125 }, { f: 130, x: 560, y: 125 }, { f: 160, x: 1100, y: 125 },
            { f: 195, x: 700, y: 60 }, { f: 250, x: 660, y: 54 }, { f: 300, x: 700, y: 300 }, { f: 340, x: 190, y: 320 }, { f: 380, x: 190, y: 320 },
          ]} />
        </>
      )}
    </Shot>
    <Callout x={960} y={985} text="Для любой профессии" sub="Медики, педагоги, предприниматели, программисты" at={100} until={178} />
    <Callout x={960} y={985} text="Поиск по всей базе законов" color={C.blue} dark={C.blueDark} at={204} until={268} />
    <Callout x={960} y={985} text="Конституция, кодексы, законы" sub="21 кодекс и сотни законов — до 2026 года" color={C.orange} dark={C.orangeDark} at={314} until={440} />
  </AbsoluteFill>
);

const SceneArticle: React.FC = () => (
  <AbsoluteFill style={{ background: C.mist }}>
    <Shot img="shots/article-desk.png" cam={[
      { f: 0, cx: 720, cy: 450, s: 1 }, { f: 30, cx: 720, cy: 450, s: 1 }, { f: 80, cx: 720, cy: 470, s: 1.3 }, { f: 190, cx: 720, cy: 470, s: 1.3 },
      { f: 240, cx: 600, cy: 700, s: 1.5 }, { f: 350, cx: 600, cy: 700, s: 1.5 }, { f: 400, cx: 620, cy: 790, s: 1.6 }, { f: 450, cx: 620, cy: 790, s: 1.6 },
    ]}>
      {(inv) => (
        <>
          <Ring x={346} y={278} w={750} h={402} at={70} until={210} inv={inv} />
          <Ring x={344} y={703} w={202} h={50} at={282} until={380} inv={inv} />
          <Ring x={484} y={878} w={290} h={26} at={406} until={450} inv={inv} />
          <Cursor inv={inv} clicks={[318]} path={[
            { f: 60, x: 1000, y: 200 }, { f: 100, x: 700, y: 380 }, { f: 180, x: 760, y: 560 }, { f: 260, x: 520, y: 720 }, { f: 312, x: 455, y: 727 }, { f: 400, x: 700, y: 880 }, { f: 430, x: 710, y: 890 },
          ]} />
        </>
      )}
    </Shot>
    <Callout x={960} y={985} text="«Простыми словами»" sub="Пояснение к статье — понятным языком" at={76} until={200} />
    <Callout x={960} y={985} text="Пояснение ИИ проверено фильтром" sub="Это не юридическая консультация — как и сказано на сайте" color={C.violet} dark={C.violetDark} at={206} until={270} />
    <Callout x={960} y={985} text="Читалка" sub="Цвет, заметки, поиск и тест по выделенному" color={C.blue} dark={C.blueDark} at={322} until={398} />
    <Callout x={960} y={985} text="Русский · English · Oʻzbekcha" sub="Статья на разных языках" color={C.orange} dark={C.orangeDark} at={410} until={450} />
  </AbsoluteFill>
);

const SceneLearn: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cards = [
    { t: "Уроки", c: C.blue, d: C.blueDark, k: 0 },
    { t: "Тесты", c: C.green, d: C.greenDark, k: 1 },
    { t: "Игры", c: C.orange, d: C.orangeDark, k: 2 },
  ];
  const cap = interpolate(frame, [96, 116], [0, 1], { easing: OUT, ...clamp });
  return (
    <AbsoluteFill style={{ background: C.white }}>
      <div style={{ position: "absolute", top: 100, width: "100%" }}><MaskWords text="Не просто читать — учиться" size={92} color={C.ink} delay={4} /></div>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 70, paddingTop: 100 }}>
        {cards.map((c, i) => {
          const s = pop(frame, fps, 24 + i * 10, 10);
          const bob = Math.sin((frame + i * 14) / 18) * 8;
          return (
            <div key={i} style={{ width: 440, height: 500, borderRadius: 52, background: c.c, boxShadow: `0 16px 0 ${c.d}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30,
              transform: `translateY(${bob + (1 - s) * 160}px) scale(${s}) rotate(${(1 - s) * (i - 1) * 10}deg)` }}>
              <CardIcon kind={c.k} />
              <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 84, color: "#fff" }}>{c.t}</div>
            </div>
          );
        })}
      </AbsoluteFill>
      <div style={{ position: "absolute", bottom: 90, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 48, color: C.blueDark, opacity: cap, transform: `translateY(${(1 - cap) * 30}px)` }}>
        Тесты по выбранным фрагментам, уроки и игры
      </div>
    </AbsoluteFill>
  );
};

const SceneForum: React.FC = () => (
  <AbsoluteFill style={{ background: C.mist }}>
    <Shot img="shots/forum-desk.png" cam={[
      { f: 0, cx: 720, cy: 450, s: 1 }, { f: 36, cx: 720, cy: 450, s: 1 }, { f: 100, cx: 720, cy: 250, s: 1.45 }, { f: 200, cx: 720, cy: 250, s: 1.45 }, { f: 260, cx: 720, cy: 560, s: 1.3 }, { f: 330, cx: 720, cy: 560, s: 1.3 },
    ]}>
      {(inv) => (
        <>
          <Ring x={344} y={138} w={752} h={108} at={110} until={190} inv={inv} />
          <Cursor inv={inv} clicks={[170]} path={[
            { f: 70, x: 1200, y: 100 }, { f: 120, x: 900, y: 190 }, { f: 165, x: 700, y: 195 }, { f: 230, x: 700, y: 440 }, { f: 280, x: 760, y: 700 }, { f: 320, x: 780, y: 720 },
          ]} />
        </>
      )}
    </Shot>
    <Callout x={960} y={985} text="Форум" sub="Обсуждения права, учёбы и законов Узбекистана" at={104} until={206} />
    <Callout x={960} y={985} text="Темы на русском, узбекском и английском" sub="Читать можно без регистрации" color={C.blue} dark={C.blueDark} at={236} until={330} />
  </AbsoluteFill>
);

const Chip: React.FC<{ i: number; t: string; sub: string; c: string; d: string }> = ({ i, t, sub, c, d }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, 30 + i * 14, 12);
  return (
    <div style={{ width: 1100, background: "#fff", border: `5px solid ${c}`, borderRadius: 50, boxShadow: `0 12px 0 ${c}`, padding: "18px 56px", transform: `translateX(${(1 - s) * -700}px)`, opacity: Math.min(1, s * 1.6) }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 54, color: c === C.green ? C.greenDark : C.blueDark }}>{t}</div>
      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 32, color: C.ink, marginTop: 2 }}>{sub}</div>
    </div>
  );
};

const SceneDev: React.FC = () => (
  <AbsoluteFill style={{ background: C.white }}>
    <div style={{ position: "absolute", top: 80, width: "100%" }}><MaskWords text="Открыто и удобно" size={96} color={C.ink} delay={4} /></div>
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 30, paddingTop: 230 }}>
      <Chip i={0} t="Постоянная ссылка" sub="у каждой статьи — ссылайтесь и делитесь" c={C.blue} d={C.blueDark} />
      <Chip i={1} t="Открытый API" sub="JSON, только чтение" c={C.green} d={C.greenDark} />
      <Chip i={2} t="Выделения, заметки, избранное" sub="своя подборка статей" c={C.orange} d={C.orangeDark} />
    </AbsoluteFill>
  </AbsoluteFill>
);

const SceneOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = pop(frame, fps, 4, 10);
  const btn = pop(frame, fps, 40, 9);
  const press = interpolate(frame, [110, 114, 120], [0, 1, 0], clamp);
  const url = interpolate(frame, [130, 150], [0, 1], { easing: OUT, ...clamp });
  const note = interpolate(frame, [160, 180], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: C.white }}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 140 }}>
        <Img src={staticFile("img/logo.png")} style={{ width: 800, transform: `scale(${logo})` }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: 250 }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 72, letterSpacing: 3, color: "#fff", background: C.green, borderRadius: 42, padding: "46px 120px",
          boxShadow: `0 ${14 - press * 10}px 0 ${C.greenDark}`, transform: `scale(${btn * (1 - press * 0.03)}) translateY(${press * 10}px)` }}>НАЧАТЬ УЧИТЬСЯ</div>
        <div style={{ marginTop: 60, fontFamily: FONT, fontWeight: 900, fontSize: 70, color: C.blueDark, opacity: url, transform: `translateY(${(1 - url) * 30}px)` }}>neolex.uz</div>
        <div style={{ marginTop: 40, fontFamily: FONT, fontWeight: 700, fontSize: 30, color: "#777", opacity: note }}>Тексты законов — из базы lex.uz · образовательный и справочный проект</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const TL = { hook: 0, values: 150, lib: 360, art: 840, learn: 1290, forum: 1620, dev: 1950, outro: 2250, end: 2550 };

export const Product: React.FC = () => {
  useFonts();
  const seq: [number, number, React.FC][] = [
    [TL.hook, TL.values - TL.hook, SceneHook], [TL.values, TL.lib - TL.values, SceneValues], [TL.lib, TL.art - TL.lib, SceneLibrary],
    [TL.art, TL.learn - TL.art, SceneArticle], [TL.learn, TL.forum - TL.learn, SceneLearn], [TL.forum, TL.dev - TL.forum, SceneForum],
    [TL.dev, TL.outro - TL.dev, SceneDev], [TL.outro, TL.end - TL.outro, SceneOutro],
  ];
  const wipes: [number, string][] = [[TL.values, C.blue], [TL.lib, C.green], [TL.art, C.orange], [TL.learn, C.blue], [TL.forum, C.green], [TL.dev, C.orange], [TL.outro, C.blue]];
  return (
    <AbsoluteFill style={{ background: C.white }}>
      {seq.map(([from, dur, Comp], i) => <Sequence key={i} from={from} durationInFrames={dur}><Comp /></Sequence>)}
      <Audio src={staticFile("audio/product-mix.wav")} />
      {wipes.map(([at, col], i) => <Wipe key={i} at={at} color={col} />)}
    </AbsoluteFill>
  );
};
