import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from "remotion";
import { GameRing, Counters } from "./Bits";
import { LawsWall, Minutes, MistakeLoop, SaveRemember, LeagueClimb } from "./Bits2";
import { PathBeat } from "./PathBeat";
import { Hook, TitleCard, PickDirection, LessonLoad, Theory, Choice, Pairs, Finale, End4 } from "./V4";
import { RoundSearch, RoundRead, RoundLang, RoundNotes, Score } from "./Compare";
import { useFonts } from "./Master";

// veoskill v6 — "why it is easier": ordinary law database vs veoskill, then learning. Every transition is the same soft move.
const GREEN = "#58cc02";
const GLIP = "#58a700";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.45, 0, 0.25, 1);

const Hook6: React.FC = () => <Hook lines={["Ищешь нужный закон?", "Открываешь обычную базу законов…", "…и тонешь в документах"]} tag="Законы — понятно" />;
const TC = (q: string, a: string, color?: string, lipC?: string): React.FC => () => <TitleCard q={q} a={a} color={color} lipC={lipC} />;
const TC_CMP = TC("Чем veoskill удобнее?", "Сравним на деле");
const TC_LEARN = TC("Хочешь не просто читать, а понять?", "Учись играя", GREEN, GLIP);

type Sc = { C: React.FC; d: number; pre?: number; cut?: boolean };
const SCENES: Sc[] = [
  { C: Hook6, d: 360 },
  { C: TC_CMP, d: 150 },
  { C: RoundSearch, d: 540 },
  { C: RoundRead, d: 420 },
  { C: RoundLang, d: 460 },
  { C: RoundNotes, d: 540 },
  { C: Score, d: 330 },
  { C: LawsWall, d: 230, pre: 14 },
  { C: TC_LEARN, d: 150 },
  { C: PickDirection, d: 300 },
  { C: Minutes, d: 250, pre: 14 },
  { C: PathBeat, d: 190 },
  { C: LessonLoad, d: 214, cut: true },
  { C: Theory, d: 300 },
  { C: Choice, d: 340 },
  { C: Pairs, d: 300 },
  { C: GameRing, d: 430, pre: 14 },
  { C: Counters, d: 200, pre: 14 },
  { C: SaveRemember, d: 170, pre: 14 },
  { C: MistakeLoop, d: 230, pre: 14 },
  { C: LeagueClimb, d: 280, pre: 14 },
  { C: Finale, d: 230 },
  { C: End4, d: 280 },
];
const T = 34;
const starts: number[] = [];
let acc = 0;
SCENES.forEach((s, i) => { starts.push(acc); const nx = SCENES[i + 1]; acc += s.d - (nx ? (nx.cut ? 0 : T) : 0); });
export const V6_FRAMES = acc;
export const V6_STARTS = starts;

/** One soft move for every cut: the old shot recedes and defocuses while the new one settles in from slightly closer. */
const Scene: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const sc = SCENES[i];
  const nx = SCENES[i + 1];
  const C = sc.C;
  const e = i === 0 || sc.cut ? 1 : interpolate(f, [0, T], [0, 1], { ...clamp, easing: ease });
  const l = nx && !nx.cut ? interpolate(f, [sc.d - T, sc.d], [0, 1], { ...clamp, easing: ease }) : 0;
  const style: React.CSSProperties = {
    transform: `scale(${(1 + (1 - e) * 0.06) * (1 - l * 0.04)})`,
    filter: e < 1 || l > 0 ? `blur(${(1 - e) * 12 + l * 10}px)` : undefined,
    opacity: Math.min(e, 1 - l * 0.999),
  };
  return (
    <AbsoluteFill style={style}>
      <Sequence from={-(sc.pre ?? 0)}>
        <C />
      </Sequence>
    </AbsoluteFill>
  );
};

export const V6: React.FC = () => {
  useFonts();
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
