import React from "react";
import { AbsoluteFill, Easing, Img, Sequence, interpolate, random, staticFile, useCurrentFrame , Freeze } from "remotion";
import { RichBg } from "./Bg";
import { PathBeat } from "./PathBeat";
import { LessonLoad, Theory } from "./V4";
import { useFonts7, Line, PainCard, StrikeCard, Benefit, Chapter, UI, BLUE, LIP, INK, clamp, SOFT, lin } from "./Kit7";
import { DemoSearch, DemoAI, DemoNotes, DemoTest, DemoSave, DemoLang } from "./Laws7";
import { GameMyth, GameSwipe, GameScramble, GameStory, GameMistakes } from "./Games7";

// veoskill v7 — laws and games, explained function by function. 60 fps, 1920×1080, silent.
export const SHOTS = ["cabinet", "laws", "article", "c2", "l-note2", "stats", "m-ok", "laws-search"];
export const DENSE = "Названия государства «Республика Узбекистан» и «Узбекистан» равнозначны. Статья 2. Государство выражает волю народа, служит его интересам. Государственные органы и должностные лица ответственны перед обществом и гражданами. Статья 3. Республика Узбекистан определяет своё национально-государственное и административно-территориальное устройство, структуру органов государственной власти и управления, проводит внутреннюю и внешнюю политику. ";

/** The calm wordmark: comes out of blur, a feathered wipe opens it left→right, one soft sheen. No bounce. */
export const Wordmark: React.FC<{ at: number; size?: number }> = ({ at, size = 230 }) => {
  const f = useCurrentFrame();
  const t = lin(f, at, at + 84, 0, 1, Easing.bezier(0.16, 1, 0.3, 1));
  const wipe = lin(f, at + 6, at + 66, -20, 120, Easing.bezier(0.4, 0, 0.2, 1));
  const sheen = lin(f, at + 70, at + 118, -30, 130, Easing.bezier(0.45, 0, 0.55, 1));
  if (f < at) return null;
  const mask = `linear-gradient(90deg, #000 ${wipe - 20}%, transparent ${wipe + 10}%)`;
  return (
    <div style={{ position: "relative", display: "inline-block", fontFamily: UI, fontWeight: 900, fontSize: size, lineHeight: 1, color: BLUE, letterSpacing: "-0.01em", textShadow: `0 6px 0 ${LIP}, 0 18px 40px rgba(15,111,191,0.25)`, filter: `blur(${(1 - t) * 12}px)`, transform: `scale(${0.97 + 0.03 * t})`, opacity: t, WebkitMaskImage: mask, maskImage: mask }}>
      veoskill
      <span style={{ position: "absolute", inset: 0, background: `linear-gradient(100deg, transparent ${sheen - 12}%, rgba(255,255,255,0.55) ${sheen}%, transparent ${sheen + 12}%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", textShadow: "none" }}>veoskill</span>
    </div>
  );
};

/** Real screens floating in depth; the camera glides forward. */
const Space: React.FC<{ glide: number; arrange?: number; fade?: number; front?: React.ReactNode }> = ({ glide, arrange = 0, fade = 1, front }) => (
  <AbsoluteFill style={{ perspective: 1600 }}>
    {SHOTS.map((n, i) => {
      const r1 = random(`x${i}`), r2 = random(`y${i}`), r3 = random(`z${i}`);
      const x0 = (i % 4 - 1.5) * 560 + (r1 - 0.5) * 140, y0 = (Math.floor(i / 4) - 0.5) * 460 + (r2 - 0.5) * 120;
      const z0 = -700 - r3 * 1400 + glide;
      const ry0 = (i % 4 - 1.5) * -9 + (r1 - 0.5) * 8, rz0 = (r2 - 0.5) * 6;
      // arranged: one calm arc at one depth
      const xa = (i - (SHOTS.length - 1) / 2) * 300, ya = Math.abs(i - (SHOTS.length - 1) / 2) * 26, za = -900, rya = (i - (SHOTS.length - 1) / 2) * -6;
      const x = x0 + (xa - x0) * arrange, y = y0 + (ya - y0) * arrange, z = z0 + (za - z0) * arrange;
      const ry = ry0 + (rya - ry0) * arrange, rz = rz0 * (1 - arrange);
      const depthBlur = Math.min(10, Math.abs(z + 600) / 140) * (1 - arrange * 0.7);
      const vis = interpolate(z, [-2600, -1900, 300, 700], [0, 1, 1, 0], clamp);
      return (
        <div key={n} style={{ position: "absolute", left: 960 - 330 + x, top: 540 - 206 + y, width: 660, height: 412, borderRadius: 20, overflow: "hidden", transform: `translateZ(${z}px) rotateY(${ry}deg) rotateZ(${rz}deg)`, opacity: vis * fade, boxShadow: "0 40px 90px rgba(10,40,90,0.22)", filter: `blur(${depthBlur}px) brightness(1.06) saturate(1.12)` }}>
          <Img src={staticFile(`hack/hd/${n}.png`)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
        </div>
      );
    })}
    {front}
  </AbsoluteFill>
);

const Hook7: React.FC = () => {
  const f = useCurrentFrame();
  const glide = f * 2.7;
  // the dense law page comes forward out of the space and straightens
  const page = lin(f, 290, 390, 0, 1, Easing.bezier(0.3, 0, 0.2, 1));
  const pageOut = lin(f, 800, 850, 0, 1, Easing.bezier(0.5, 0, 0.6, 1));
  const hl = lin(f, 650, 710, 0, 1, Easing.bezier(0.45, 0, 0.3, 1));
  const ai = lin(f, 690, 740, 0, 1, SOFT);
  return (
    <AbsoluteFill>
      <RichBg />
      <Space glide={glide} fade={1 - lin(f, 310, 390, 0, 0.75) - lin(f, 760, 840, 0, 0.25)} />
      {/* soft light pool behind the words */}
      <AbsoluteFill style={{ background: "radial-gradient(48% 34% at 50% 50%, rgba(247,250,254,0.92), rgba(247,250,254,0) 100%)" }} />
      <AbsoluteFill style={{ opacity: 1 - lin(f, 280, 320, 0, 1), background: "radial-gradient(60% 26% at 50% 52%, rgba(247,250,254,0.97), rgba(247,250,254,0.7) 55%, rgba(247,250,254,0) 100%)", backdropFilter: "blur(6px)", WebkitMaskImage: "radial-gradient(60% 30% at 50% 52%, #000 40%, transparent 100%)" }} />
      {page > 0 ? (
        <AbsoluteFill style={{ perspective: 1800 }}>
          <div style={{ position: "absolute", left: 960 - 560, top: 120, width: 1120, height: 840, borderRadius: 26, background: "#fff", boxShadow: "0 50px 120px rgba(10,40,90,0.25)", overflow: "hidden", transform: `translateZ(${(1 - page) * -1600 + pageOut * -400}px) rotateY(${(1 - page) * 18}deg) rotateX(${(1 - page) * 6}deg)`, opacity: Math.min(1, page * 2) * (1 - pageOut), filter: pageOut > 0 ? `blur(${pageOut * 10}px)` : undefined }}>
            <div style={{ padding: "60px 70px", fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 25, lineHeight: 1.5, color: "#3a3a3a", textAlign: "justify" }}>
              <b>Статья 1.</b>{" "}<span style={{ backgroundImage: "linear-gradient(rgba(255,212,59,0.85), rgba(255,212,59,0.85))", backgroundRepeat: "no-repeat", backgroundSize: `${hl * 100}% 100%` }}>Узбекистан — суверенное, демократическое, правовое, социальное и светское государство с республиканской формой правления.</span>{" "}
              {DENSE.repeat(3)}
            </div>
          </div>
          {/* the plain-words answer surfaces in depth */}
          <div style={{ position: "absolute", left: 1180, top: 560, width: 620, borderRadius: 26, background: "#fff", border: "3px solid #9fdcf9", boxShadow: "0 40px 90px rgba(28,176,246,0.25)", padding: "26px 30px", fontFamily: UI, transform: `translateZ(${(1 - ai) * -500 + 120}px) translateY(${(1 - ai) * 40}px)`, opacity: ai * (1 - pageOut), filter: `blur(${(1 - ai) * 8 + pageOut * 10}px)` }}>
            <div style={{ fontWeight: 900, fontSize: 30, color: "#4b4b4b" }}>Простыми словами</div>
            <div style={{ marginTop: 10, fontWeight: 700, fontSize: 24, lineHeight: 1.45, color: "#4b4b4b" }}>Узбекистан — независимое государство, где всё решает закон.</div>
          </div>
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{ justifyContent: "center" }}>
        {f < 300 ? <><div style={{ position: "absolute", top: 470, width: "100%" }}><Line text="Завтра экзамен." at={12} out={150} size={96} /></div><div style={{ position: "absolute", top: 470, width: "100%" }}><Line text="А статья — как шифр." at={166} out={290} size={96} /></div></> : null}
        {f >= 300 && f < 640 ? <div style={{ position: "absolute", top: 40, width: "100%" }}><Line text="Конспекты, вкладки, закладки…" at={330} out={470} size={72} /><div style={{ marginTop: -110 }}><Line text="…а понятнее не стало." at={486} out={625} size={72} /></div></div> : null}
        {f >= 640 && f < 850 ? <div style={{ position: "absolute", top: 40, width: "100%" }}><Line text="А если объяснить закон простыми словами?" at={650} out={810} size={66} accent="простыми словами" /></div> : null}
      </AbsoluteFill>
      {f >= 826 ? <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}><Wordmark at={830} /></AbsoluteFill> : null}
    </AbsoluteFill>
  );
};

const Finale7: React.FC = () => {
  const f = useCurrentFrame();
  const arrange = lin(f, 0, 150, 0, 1, Easing.bezier(0.4, 0, 0.2, 1));
  const recede = lin(f, 250, 330, 0, 1, Easing.bezier(0.5, 0, 0.5, 1));
  const URL = "veoskill.uz";
  const T0 = 430;
  const n = Math.max(0, Math.min(URL.length, Math.floor((f - T0) / 5)));
  const caret = f < T0 + URL.length * 5 + 6 || Math.floor(f / 16) % 2 === 0;
  const field = lin(f, 400, 430, 0, 1, SOFT);
  return (
    <AbsoluteFill>
      <RichBg />
      <AbsoluteFill style={{ transform: `translateZ(0) scale(${1 - recede * 0.2})`, opacity: 1 - recede, filter: recede > 0 ? `blur(${recede * 12}px)` : undefined }}>
        <Space glide={600 - arrange * 600} arrange={arrange} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(48% 34% at 50% 50%, rgba(247,250,254,0.9), rgba(247,250,254,0) 100%)" }} />
      {f < 260 ? (
        <>
          <div style={{ position: "absolute", top: 120, width: "100%" }}><Line text="Тот же закон." at={8} out={130} size={100} /></div>
          <div style={{ position: "absolute", top: 120, width: "100%" }}><Line text="Теперь — понятный." at={146} out={250} size={100} accent="понятный" /></div>
        </>
      ) : null}
      {f >= 270 ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ marginTop: -120 }}><Wordmark at={280} size={210} /></div>
          <div style={{ position: "absolute", top: 650, width: "100%" }}><Line text="Право — простыми словами." at={350} size={56} weight={600} color="#3d4b5c" /></div>
          <div style={{ position: "absolute", left: 960 - 330, top: 780, width: 660, height: 96, borderRadius: 48, background: "#fff", border: `3px solid ${BLUE}`, boxShadow: "0 6px 0 #84d8ff, 0 30px 60px rgba(10,40,90,0.15)", display: "flex", alignItems: "center", gap: 20, padding: "0 34px", boxSizing: "border-box", opacity: field, transform: `translateY(${(1 - field) * 30}px)` }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.6" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
            <span style={{ fontFamily: UI, fontWeight: 900, fontSize: 44, color: INK }}>{URL.slice(0, n)}<span style={{ display: "inline-block", width: 4, height: 46, background: BLUE, marginLeft: 3, verticalAlign: "text-bottom", opacity: caret ? 1 : 0 }} /></span>
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------- timeline ----------------
// loader beat sped up after the match-cut: first 46 frames real-time, then ×1.6
const LessonLoadFast: React.FC = () => {
  const f = useCurrentFrame();
  const m = f < 46 ? f : Math.min(213, Math.round(46 + (f - 46) * 1.6));
  return <Freeze frame={m}><LessonLoad /></Freeze>;
};
const card = (a: string, b: string, accent?: string, tone?: "light" | "dark"): React.FC => () => <PainCard a={a} b={b} accent={accent} tone={tone} />;
const strike = (a: string, b: string, accent?: string): React.FC => () => <StrikeCard a={a} b={b} accent={accent} />;
const ben = (t: string, accent?: string): React.FC => () => <Benefit text={t} accent={accent} />;
const chap = (n: string, t: string, s: string): React.FC => () => <Chapter n={n} title={t} sub={s} />;

type Sc = { C: React.FC; d: number; cut?: boolean };
const SCENES: Sc[] = [
  { C: Hook7, d: 1030 },
  { C: chap("01", "Законы", "1 608 законов · 21 кодекс · 3 языка"), d: 170 },
  { C: card("Нужная статья — где-то в 1 608 законах?", "Одна строка поиска.", "Одна строка"), d: 244 },
  { C: DemoSearch, d: 380 },
  { C: strike("Прочитал статью трижды — и ничего?", "Одна кнопка — и статья понятна.", "статья понятна"), d: 262 },
  { C: DemoAI, d: 700 },
  { C: ben("Юридический язык — на человеческий.", "на человеческий"), d: 160 },
  { C: card("Пометки теряются в тетрадях?", "Пиши прямо в законе.", "прямо в законе", "dark"), d: 250 },
  { C: DemoNotes, d: 540 },
  { C: DemoTest, d: 360 },
  { C: strike("Опять потерял нужную статью?", "Сохрани — и открой даже без интернета.", "без интернета"), d: 272 },
  { C: DemoSave, d: 480 },
  { C: DemoLang, d: 250 },
  { C: ben("Закон можно не зубрить. Его можно понять.", "понять"), d: 180 },
  { C: chap("02", "Уроки и игры", "50 уроков · 1 254 задания"), d: 170 },
  { C: PathBeat, d: 172 },
  { C: LessonLoadFast, d: 152, cut: true },
  { C: Theory, d: 300 },
  { C: card("Зазубренное вылетает из головы?", "Мини-игры вместо зубрёжки.", "вместо зубрёжки"), d: 250 },
  { C: GameMyth, d: 330 },
  { C: GameSwipe, d: 236 },
  { C: GameScramble, d: 270 },
  { C: GameStory, d: 250 },
  { C: strike("Ошибки повторяются?", "Повторим, пока не запомнишь.", "пока не запомнишь"), d: 262 },
  { C: GameMistakes, d: 650 },
  { C: Finale7, d: 760 },
];
const T = 36;
const starts: number[] = [];
let acc = 0;
SCENES.forEach((s, i) => { starts.push(acc); const nx = SCENES[i + 1]; acc += s.d - (nx ? (nx.cut ? 0 : T) : 0); });
export const V7_FRAMES = acc;
export const V7_STARTS = starts;

const ease = Easing.bezier(0.45, 0, 0.25, 1);
const Scene: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const sc = SCENES[i];
  const nx = SCENES[i + 1];
  const C = sc.C;
  const e = i === 0 || sc.cut ? 1 : interpolate(f, [0, T], [0, 1], { ...clamp, easing: ease });
  const l = nx && !nx.cut ? interpolate(f, [sc.d - T, sc.d], [0, 1], { ...clamp, easing: ease }) : 0;
  return (
    <AbsoluteFill style={{ transform: `scale(${(1 + (1 - e) * 0.05) * (1 - l * 0.03)})`, filter: e < 1 || l > 0 ? `blur(${(1 - e) * 10 + l * 8}px)` : undefined, opacity: Math.min(e, 1 - l * 0.999) }}>
      <C />
    </AbsoluteFill>
  );
};
export const V7: React.FC = () => {
  useFonts7();
  return (
    <AbsoluteFill style={{ background: "#f4f8fc" }}>
      {SCENES.map((s, i) => (
        <Sequence key={i} from={starts[i]} durationInFrames={s.d}>
          <Scene i={i} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
