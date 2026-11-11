import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from "remotion";
import { PathBeat, PathWords } from "./PathBeat";
import { Theory } from "./V4";
import { useFonts7, Line, UI, BLUE, INK, clamp, SOFT, lin } from "./Kit7";
import { DemoSearch, DemoAI, DemoNotes, DemoTest, DemoSave, DemoLang } from "./Laws7";
import { GameMyth, GameSwipe, GameScramble, GameStory, GameMistakes } from "./Games7";
import { Wordmark } from "./V7";
import { GradBg, TypeHead, PillHead, SplitAct, Step, actLength, LessonLoadFast, GameStack, CompareLaws, Chap8, FlyField, LayerStack } from "./Kit8";

// veoskill v8 — lessons first, laws second; reference-led: tilted UI panels with explanation, one bright background,
// pushes instead of dissolves, typed headline with a glowing accent, pill highlights, 3D card stack, honest comparison.

const Hook8: React.FC = () => {
  const f = useCurrentFrame();
  const recede = lin(f, 470, 560, 0, 1, Easing.bezier(0.5, 0, 0.5, 1));
  const calm = lin(f, 168, 204, 0, 1, SOFT);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: (1 - recede) * (1 - calm * 0.45), filter: recede + calm > 0 ? `blur(${recede * 14 + calm * 7}px)` : undefined, transform: `scale(${1 + recede * 0.15})` }}>
        <FlyField speed={7.2} />
      </AbsoluteFill>
      {/* calm light pool keeps the words readable over the screens */}
      <AbsoluteFill style={{ background: "radial-gradient(70% 40% at 50% 50%, rgba(246,250,255,0.96), rgba(246,250,255,0.75) 50%, rgba(246,250,255,0) 100%)", opacity: 1 - recede * 0.5 }} />
      <AbsoluteFill>
        <div style={{ position: "absolute", top: 470, width: "100%" }}><TypeHead text="Учить право — скучно?" accent="скучно?" at={24} out={150} size={100} /></div>
        <div style={{ position: "absolute", top: 490, width: "100%" }}><Line text="Толстые учебники. Сухие лекции. Непонятные законы." at={196} out={330} size={56} weight={700} /></div>
        {f >= 340 && f < 520 ? <PillHead pre="А если учить" pill="играя?" at={350} out={480} size={104} /> : null}
      </AbsoluteFill>
      {f >= 520 ? <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}><Wordmark at={530} /></AbsoluteFill> : null}
    </AbsoluteFill>
  );
};

const Finale8: React.FC = () => {
  const f = useCurrentFrame();
  const rise = lin(f, 0, 90, 0, 1, Easing.bezier(0.16, 1, 0.3, 1));
  const out = lin(f, 236, 300, 0, 1, Easing.bezier(0.5, 0, 0.5, 1));
  const URL = "veoskill.uz";
  const T0 = 420;
  const n = Math.max(0, Math.min(URL.length, Math.floor((f - T0) / 5)));
  const caret = f < T0 + URL.length * 5 + 6 || Math.floor(f / 16) % 2 === 0;
  const field = lin(f, 390, 420, 0, 1, SOFT);
  return (
    <AbsoluteFill>
      <LayerStack rise={rise} out={out} />
      {f < 300 ? (
        <div style={{ position: "absolute", left: 110, top: 400, width: 680 }}>
          <Line text="Уроки, игры и законы —" at={20} out={226} size={64} weight={800} maxW={680} style={{ justifyContent: "flex-start" }} />
          <Line text="в одном месте." at={34} out={230} size={64} weight={800} maxW={680} accent="в одном месте" style={{ justifyContent: "flex-start" }} />
        </div>
      ) : null}
      {f >= 262 ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ marginTop: -130 }}><Wordmark at={268} size={210} /></div>
          <div style={{ position: "absolute", top: 640, width: "100%" }}><TypeHead text="Право — простыми словами." accent="простыми словами." at={350} size={58} speed={1.8} /></div>
          <div style={{ position: "absolute", left: 960 - 330, top: 790, width: 660, height: 96, borderRadius: 48, background: "#fff", border: `3px solid ${BLUE}`, boxShadow: "0 6px 0 #84d8ff, 0 30px 60px rgba(10,40,90,0.15)", display: "flex", alignItems: "center", gap: 20, padding: "0 34px", boxSizing: "border-box", opacity: field, transform: `translateY(${(1 - field) * 30}px)` }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2.6" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
            <span style={{ fontFamily: UI, fontWeight: 900, fontSize: 44, color: INK }}>{URL.slice(0, n)}<span style={{ display: "inline-block", width: 4, height: 46, background: BLUE, marginLeft: 3, verticalAlign: "text-bottom", opacity: caret ? 1 : 0 }} /></span>
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------- acts ----------------
const PathNoWords: React.FC = () => <PathWords.Provider value={false}><PathBeat /></PathWords.Provider>;
const LoadNoWords: React.FC = () => <PathWords.Provider value={false}><LessonLoadFast /></PathWords.Provider>;
const LESSON: Step[] = [
  { C: PathNoWords, d: 172, copy: { k: "УРОКИ", lines: ["Короткий урок —", "каждый день"], accent: "каждый день", sub: "50 уроков: шаг за шагом" } },
  { C: LoadNoWords, d: 152 },
];
const GAMES: Step[] = [
  { C: GameMyth, d: 330, copy: { k: "НАЙДИ МИФ", lines: ["Отличай правду", "от заблуждений"], accent: "от заблуждений" } },
  { C: GameSwipe, d: 236, copy: { k: "ВЕРНО ИЛИ НЕВЕРНО", lines: ["Решай", "за секунду"], accent: "за секунду" } },
  { C: GameScramble, d: 270, copy: { k: "СОБЕРИ ФРАЗУ", lines: ["Запоминай", "точную формулировку"], accent: "точную формулировку" } },
  { C: GameStory, d: 250, copy: { k: "ИСТОРИИ", lines: ["Право —", "на жизненных", "примерах"], accent: "примерах" } },
  { C: GameMistakes, d: 650, copy: { k: "РАБОТА НАД ОШИБКАМИ", lines: ["Ошибся?", "Повторим, пока", "не запомнишь"], accent: "не запомнишь" }, then: { at: 424, copy: { k: "НАГРАДЫ", lines: ["XP и лиги —", "за каждый урок"], accent: "за каждый урок" } } },
];
const LAWS: Step[] = [
  { C: DemoSearch, d: 380, copy: { k: "ПОИСК", lines: ["Нужная статья —", "в одну строку"], accent: "в одну строку", sub: "1 608 законов и 21 кодекс" } },
  { C: DemoAI, d: 700, copy: { k: "ИИ-ОБЪЯСНЕНИЕ", lines: ["Непонятная статья?", "Нажми на робота"], accent: "Нажми на робота" }, then: { at: 230, copy: { k: "ИИ-ОБЪЯСНЕНИЕ", lines: ["Коротко,", "простыми словами,", "с примером"], accent: "простыми словами," } } },
  { C: DemoNotes, d: 540, copy: { k: "ЗАМЕТКИ", lines: ["Пометки —", "прямо в законе"], accent: "прямо в законе", sub: "Выделяй цветом и пиши заметки" } },
  { C: DemoTest, d: 360, copy: { k: "ТЕСТ", lines: ["Проверь,", "понял ли ты"], accent: "понял ли ты", sub: "Вопрос по выделенному тексту" } },
  { C: DemoSave, d: 480, copy: { k: "ИЗБРАННОЕ", lines: ["Сохрани —", "читай без интернета"], accent: "без интернета" } },
  { C: DemoLang, d: 250, copy: { k: "3 ЯЗЫКА", lines: ["Русский,", "узбекский,", "английский"], accent: "английский" } },
];
const LessonAct: React.FC = () => <SplitAct steps={LESSON} pose={{ x: 740, y: 170, s: 0.72, ry: -9 }} />;
const GamesAct: React.FC = () => <SplitAct steps={GAMES} pose={{ x: 720, y: 170, s: 0.72, ry: -9 }} />;
const LawsAct: React.FC = () => <SplitAct steps={LAWS} pose={{ x: 740, y: 170, s: 0.72, ry: -9 }} />;
const TheoryAct: React.FC = () => (
  <AbsoluteFill>
    <Theory />
  </AbsoluteFill>
);
const Ch1: React.FC = () => <Chap8 k="01 · УРОКИ" pre="Право" pill="шаг за шагом" sub="50 уроков · 1 254 задания" />;
const Ch2: React.FC = () => <Chap8 k="02 · ЗАКОНЫ" pre="Закон" pill="без мучений" sub="1 608 законов · 21 кодекс · 3 языка" />;

type Act = { C: React.FC; d: number; tr?: "slide" | "zoom" };
const ACTS: Act[] = [
  { C: Hook8, d: 700 },
  { C: Ch1, d: 170, tr: "zoom" },
  { C: LessonAct, d: actLength(LESSON), tr: "slide" },
  { C: TheoryAct, d: 300, tr: "zoom" },
  { C: GameStack, d: 290, tr: "slide" },
  { C: GamesAct, d: actLength(GAMES), tr: "slide" },
  { C: Ch2, d: 170, tr: "zoom" },
  { C: CompareLaws, d: 450, tr: "slide" },
  { C: LawsAct, d: actLength(LAWS), tr: "slide" },
  { C: Finale8, d: 640, tr: "zoom" },
];
const T = 30;
const starts: number[] = [];
let acc = 0;
ACTS.forEach((a, i) => { starts.push(acc); acc += a.d - (i < ACTS.length - 1 ? T : 0); });
export const V8_FRAMES = acc;
export const V8_STARTS = starts;

const ActWrap: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const a = ACTS[i];
  const nx = ACTS[i + 1];
  const C = a.C;
  // sequential push: the outgoing act leaves in the first half of the overlap, the incoming arrives in the second half — never two half-transparent layouts
  const inT = i === 0 ? 1 : lin(f, T / 2 - 2, T + 4, 0, 1, Easing.bezier(0.16, 1, 0.3, 1));
  const outT = nx ? lin(f, a.d - T, a.d - T + 13, 0, 1, Easing.bezier(0.55, 0, 0.9, 0.5)) : 0;
  const zin = a.tr === "zoom", zout = nx?.tr === "zoom";
  const x = (zin ? 0 : (1 - inT) * 420) - (zout ? 0 : outT * 520);
  const s = (zin ? 0.9 + 0.1 * inT : 1) * (zout ? 1 + outT * 0.2 : 1);
  const blur = (1 - inT) * 10 + outT * 12;
  return (
    <AbsoluteFill style={{ opacity: inT * (1 - outT), transform: `translateX(${x}px) scale(${s})`, filter: blur > 0.2 ? `blur(${blur}px)` : undefined }}>
      <C />
    </AbsoluteFill>
  );
};

export const V8: React.FC = () => {
  useFonts7();
  return (
    <AbsoluteFill>
      <GradBg />
      {ACTS.map((a, i) => (
        <Sequence key={i} from={starts[i]} durationInFrames={a.d}>
          <ActWrap i={i} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
export { interpolate as _i, clamp as _c };
