import { Composition } from "remotion";
import { Intro } from "./Intro";
import { Product } from "./Product";
import { Launch } from "./Launch";
import { Launch2 } from "./Launch2";
import { Glass40 } from "./Glass";
import { Hack15 } from "./Hack";
import { Explainer30 } from "./Explainer";
import { Promo30 } from "./Promo";
import { Directions, GameRing, Counters } from "./Bits";
import { PathBeat } from "./PathBeat";
import { Master, MASTER_FRAMES } from "./Master";
import { V4, V4_FRAMES } from "./V4";
import { V6, V6_FRAMES } from "./V6";
import { V7, V7_FRAMES } from "./V7";
import { V8, V8_FRAMES } from "./V8";
import { V9, V9_FRAMES } from "./V9";
import { V10, V10_FRAMES } from "./V10";
import { V11, V11_FRAMES } from "./V11";
import { LessonPath } from "./V12Path";
import { useFonts7 } from "./Kit7";
const LP: React.FC = () => { useFonts7(); return <LessonPath />; };
import { LawsWall, LangCube, Minutes, MistakeLoop, SaveRemember, LeagueClimb, Profile } from "./Bits2";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="NeolexIntro" component={Intro} durationInFrames={450} fps={30} width={1920} height={1080} />
      <Composition id="NeolexProduct" component={Product} durationInFrames={2550} fps={30} width={1920} height={1080} />
      <Composition id="NeolexLaunch" component={Launch} durationInFrames={1800} fps={30} width={1920} height={1080} />
      <Composition id="NeolexLaunch2" component={Launch2} durationInFrames={1800} fps={30} width={1920} height={1080} />
      <Composition id="NeolexGlass" component={Glass40} durationInFrames={2400} fps={60} width={1920} height={1080} />
      <Composition id="NeolexHack15" component={Hack15} durationInFrames={900} fps={60} width={1920} height={1080} />
      <Composition id="NeolexExplainer" component={Explainer30} durationInFrames={1860} fps={60} width={1920} height={1080} />
      <Composition id="NeolexPromo" component={Promo30} durationInFrames={1800} fps={60} width={1920} height={1080} />
      <Composition id="BitDirections" component={Directions} durationInFrames={300} fps={60} width={1920} height={1080} />
      <Composition id="BitGames" component={GameRing} durationInFrames={250} fps={60} width={1920} height={1080} />
      <Composition id="BitCounters" component={Counters} durationInFrames={200} fps={60} width={1920} height={1080} />
      <Composition id="BitPath" component={PathBeat} durationInFrames={330} fps={60} width={1920} height={1080} />
      <Composition id="Veoskill" component={Master} durationInFrames={MASTER_FRAMES} fps={60} width={1920} height={1080} />
      <Composition id="VeoskillV4" component={V4} durationInFrames={V4_FRAMES} fps={60} width={1920} height={1080} />
      <Composition id="VeoskillV6" component={V6} durationInFrames={V6_FRAMES} fps={60} width={1920} height={1080} />
      <Composition id="VeoskillV11" component={V11} durationInFrames={V11_FRAMES} fps={60} width={1920} height={1080} />
      <Composition id="TLP" component={LP} durationInFrames={420} fps={60} width={1920} height={1080} />
      <Composition id="VeoskillV10" component={V10} durationInFrames={V10_FRAMES} fps={60} width={1920} height={1080} />
      <Composition id="VeoskillV9" component={V9} durationInFrames={V9_FRAMES} fps={60} width={1920} height={1080} />
      <Composition id="VeoskillV8" component={V8} durationInFrames={V8_FRAMES} fps={60} width={1920} height={1080} />
      <Composition id="VeoskillV7" component={V7} durationInFrames={V7_FRAMES} fps={60} width={1920} height={1080} />
      <Composition id="BitLaws" component={LawsWall} durationInFrames={240} fps={60} width={1920} height={1080} />
      <Composition id="BitLangs" component={LangCube} durationInFrames={200} fps={60} width={1920} height={1080} />
      <Composition id="BitMinutes" component={Minutes} durationInFrames={260} fps={60} width={1920} height={1080} />
      <Composition id="BitMistakes" component={MistakeLoop} durationInFrames={240} fps={60} width={1920} height={1080} />
      <Composition id="BitSave" component={SaveRemember} durationInFrames={160} fps={60} width={1920} height={1080} />
      <Composition id="BitLeague" component={LeagueClimb} durationInFrames={290} fps={60} width={1920} height={1080} />
      <Composition id="BitProfile" component={Profile} durationInFrames={260} fps={60} width={1920} height={1080} />
    </>
  );
};
