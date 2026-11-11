import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { fit, textWidth } from "./Kit7";
import { ART } from "./Laws7";
import { BG, NAVY, BLUE, GREEN, GLIP, YEL, RED, GREY, SWAN, INK, HEAD, UI, OUTE, IOE, lin, press, useSp, Cap, Pointer } from "./Scenes9";

// v11 parts: intro mosaic, wall of screens, live counter, real-screenshot law scenes, languages, word-bank game.
const LOGO = "#3db7f4";
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const WALL = ["l-home", "l-reader", "article", "c2", "l-select", "m-ok", "home", "on-0", "l-marked", "mem-end", "laws-search", "c0", "on-5", "reader", "on-2"];
const W = (n: string) => staticFile(`wall/${n}.jpg`);
const Top: React.FC<{ dark?: boolean }> = ({ dark }) => (
  <>
    <Img src={staticFile("brand/veoskill.webp")} style={{ position: "absolute", left: 56, top: 42, height: 30, filter: dark ? "brightness(0) invert(1)" : undefined, zIndex: 50 }} />
    <div style={{ position: "absolute", right: 56, top: 48, fontFamily: HEAD, fontWeight: 500, fontSize: 18, color: dark ? "rgba(255,255,255,0.78)" : "#6f7682", zIndex: 50 }}>veoskill.uz</div>
  </>
);

// ================= intro: a tilted mosaic of real screens, then the logo =================
export const IntroMosaic: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const veil = lin(f, 96, 140, 0, 1, IOE);
  const zoom = 1.25 - 0.2 * lin(f, 0, 140, 0, 1, Easing.out(Easing.quad));
  const sub = lin(f, 168, 190, 0, 1, OUTE);
  const rows = [0, 1, 2, 3, 4];
  const TW = 520, TH = 325, GAP = 26;
  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <AbsoluteFill style={{ perspective: 1800, filter: veil > 0 ? `blur(${veil * 14}px)` : undefined, opacity: 1 - veil * 0.85 }}>
        <div style={{ position: "absolute", left: 960, top: 540, transformStyle: "preserve-3d", transform: `rotateX(22deg) rotateZ(-14deg) scale(${zoom})` }}>
          {rows.map((r) => {
            const dir = r % 2 ? 1 : -1;
            const shift = dir * f * 3.2 + (r % 2 ? -300 : 0);
            return Array.from({ length: 7 }, (_, c) => {
              const n = WALL[(r * 7 + c * 3) % WALL.length];
              const x = (c - 3) * (TW + GAP) + shift;
              const y = (r - 2) * (TH + GAP);
              const pop = spring({ frame: f - 2 - ((r * 3 + c) % 9) * 2, fps, config: { damping: 15, stiffness: 120 } });
              return (
                <div key={`${r}-${c}`} style={{ position: "absolute", left: x - TW / 2, top: y - TH / 2, width: TW, height: TH, borderRadius: 18, overflow: "hidden", boxShadow: "0 24px 50px rgba(13,22,48,0.18)", transform: `translateZ(${(1 - pop) * -600}px)`, opacity: pop, background: "#fff" }}>
                  <Img src={W(n)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top left" }} />
                </div>
              );
            });
          })}
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 360, height: 260, overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "flex-end" }}>
        {"veoskill".split("").map((ch, i) => {
          const s = spring({ frame: f - 112 - i * 3, fps, config: { damping: 12, stiffness: 170 } });
          return <span key={i} style={{ display: "inline-block", fontFamily: UI, fontWeight: 900, fontSize: 240, lineHeight: 0.92, letterSpacing: "-0.01em", color: LOGO, transform: `translateY(${(1 - s) * 110}%)` }}>{ch}</span>;
        })}
      </div>
      <div style={{ position: "absolute", top: 660, width: "100%", textAlign: "center", fontFamily: HEAD, fontWeight: 600, fontSize: 42, color: "#555c68", opacity: sub, transform: `translateY(${(1 - sub) * 20}px)` }}>Самый живой способ учиться</div>
    </AbsoluteFill>
  );
};

// ================= wall of screens (everything in one place) =================
const WALL_HI: [number, string][] = [[6, "Уроки"], [1, "Законы"], [7, "Игры"], [3, "Тесты"]];
export const Wall: React.FC = () => {
  const f = useCurrentFrame();
  const cols = 5, rws = 3, TW = 470, TH = 294, GAP = 30;
  const items = Array.from({ length: cols * rws }, (_, i) => ["l-home", "l-reader", "article", "c2", "on-2", "laws-search", "c0", "m-ok", "reader", "on-0", "l-marked", "mem-end", "home", "on-5", "l-select"][i]);
  // highlights cross-fade: each one rises and settles back while the next rises (no hard switches)
  const HS = WALL_HI.map((_, k) => 70 + k * 46);
  const hiOf = (i: number) => WALL_HI.reduce((m, [idx], k) => (idx !== i ? m : Math.max(m, lin(f, HS[k], HS[k] + 18, 0, 1, OUTE) * (1 - lin(f, HS[k] + 40, HS[k] + 62, 0, 1, IOE)))), 0);
  const drift = lin(f, 0, 300, 0, 1, Easing.linear) * 260;
  const out = lin(f, 272, 300, 0, 1, Easing.in(Easing.cubic));
  const sweep = lin(f, 26, 120, -0.3, 1.3, Easing.bezier(0.4, 0, 0.3, 1));
  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <AbsoluteFill style={{ perspective: 2000, opacity: 1 - out, filter: out > 0.02 ? `blur(${out * 14}px)` : undefined }}>
        <div style={{ position: "absolute", left: 960, top: 420, transformStyle: "preserve-3d", transform: `translateZ(${lin(f, 0, 300, -140, 60, Easing.linear) + out * 260}px) rotateX(${26 - 4 * lin(f, 0, 300)}deg) rotateY(${-7 + lin(f, 0, 300, 0, 5)}deg) translateX(${-drift + 130}px)` }}>
          {items.map((n, i) => {
            const c = i % cols, r = Math.floor(i / cols);
            const x = (c - 2) * (TW + GAP), y = (r - 1) * (TH + GAP);
            const e = lin(f, (c + r) * 4, (c + r) * 4 + 40, 0, 1, Easing.bezier(0.2, 0.7, 0.2, 1));
            const lift = hiOf(i);
            const anyHi = Math.max(...WALL_HI.map(([idx]) => hiOf(idx)));
            return (
              <div key={i} style={{ position: "absolute", left: x - TW / 2, top: y - TH / 2, width: TW, height: TH, transform: `translateZ(${(1 - e) * -700 + lift * 110}px) scale(${1 + lift * 0.05})`, opacity: e, zIndex: lift > 0.01 ? 10 : 1 }}>
                <div style={{ position: "absolute", inset: 0, borderRadius: 18, overflow: "hidden", background: "#fff", boxShadow: `0 0 0 ${5 * lift}px rgba(28,176,246,${lift}), 0 ${20 + 20 * lift}px ${40 + 40 * lift}px rgba(13,22,48,${0.14 + 0.12 * lift})`, filter: lift < 0.5 ? `saturate(${1 - 0.3 * anyHi * (1 - lift)}) brightness(${1 - 0.05 * anyHi * (1 - lift)})` : undefined }}>
                  <Img src={W(n)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top left" }} />
                  <div style={{ position: "absolute", inset: 0, background: `linear-gradient(115deg, rgba(255,255,255,0) ${(sweep - 0.15) * 100 + (c - r) * 6}%, rgba(255,255,255,0.45) ${sweep * 100 + (c - r) * 6}%, rgba(255,255,255,0) ${(sweep + 0.15) * 100 + (c - r) * 6}%)` }} />
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(243,242,238,0) 58%, rgba(243,242,238,0.96) 78%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 830, display: "flex", flexDirection: "column", alignItems: "center", opacity: 1 - out }}>
        <Cap text="Уроки, игры и законы." at={14} size={64} />
        <Cap text="Всё в одном месте." at={26} size={64} accent="в одном месте." />
      </div>
    </AbsoluteFill>
  );
};

// ================= live counter: 1 608 laws (dark, cinematic) =================
const Digit: React.FC<{ d: number; size: number; color: string; dim: boolean; blur: number; k: string }> = ({ d, size, color, dim, blur, k }) => {
  return (
    <div style={{ width: size * 0.6, textAlign: "center", color, display: dim ? "none" : "inline-block", filter: blur > 0.4 ? `blur(${blur}px)` : undefined, }}>{d}</div>
  );
};
export const Counter: React.FC = () => {
  const f = useCurrentFrame();
  const sp = useSp();
  const TARGET = 1608;
  // part 1: "Сегодня в базе" with screens flashing behind
  const p1 = f < 92;
  const flash = WALL[Math.floor(f / 6) % WALL.length];
  const t1 = lin(f, 0, 20, 0, 1, OUTE), t2 = lin(f, 16, 38, 0, 1, OUTE);
  const out1 = lin(f, 80, 92, 0, 1);
  // part 2: odometer
  const c = lin(f, 92, 250, 0, 1, Easing.bezier(0.2, 0.6, 0.25, 1));
  const v = TARGET * c;
  const done = f >= 250;
  const burst = lin(f, 250, 300, 0, 1, OUTE);
  const SIZE = 230;
  const vi = Math.round(v);
  const vPrev = TARGET * lin(f - 1, 92, 250, 0, 1, Easing.bezier(0.2, 0.6, 0.25, 1));
  const speed = Math.abs(v - vPrev);
  const dg = String(vi).padStart(4, "0").split("").map(Number);
  const lead = (k: number) => vi < [1000, 100, 10, 1][k] && !done && k < 3;
  const bl = (k: number) => Math.min(9, speed / [1000, 100, 10, 1][k] * 6);
  const chart = Array.from({ length: 40 }, (_, i) => {
    const x = i / 39;
    const y = Math.pow(x, 2.2) * 0.85 + (random(`ch${i}`) - 0.5) * 0.05 * x;
    return [80 + x * 1500, 1040 - y * 360] as [number, number];
  });
  const shown = Math.max(2, Math.round(c * chart.length));
  const path = chart.slice(0, shown).map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const tip = chart[shown - 1];
  return (
    <AbsoluteFill style={{ background: "#07090f", overflow: "hidden" }}>
      {p1 ? (
        <>
          <AbsoluteFill style={{ opacity: 0.22 * lin(f, 4, 14) * (1 - out1) }}>
            <Img src={W(flash)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(2px)" }} />
          </AbsoluteFill>
          <AbsoluteFill style={{ background: "radial-gradient(60% 50% at 50% 50%, rgba(7,9,15,0.2), rgba(7,9,15,0.9))" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 440, display: "flex", justifyContent: "center", alignItems: "baseline", gap: 26, opacity: 1 - out1, filter: out1 > 0 ? `blur(${out1 * 8}px)` : undefined }}>
            <span style={{ fontFamily: HEAD, fontWeight: 300, fontSize: 130, letterSpacing: "-0.03em", color: LOGO, opacity: t1, transform: `translateY(${(1 - t1) * 30}px)`, display: "inline-block" }}>Сегодня</span>
            <span style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 130, letterSpacing: "-0.03em", color: "#fff", opacity: t2, transform: `translateY(${(1 - t2) * 30}px)`, display: "inline-block" }}>в базе</span>
          </div>
        </>
      ) : (
        <>
          <svg style={{ position: "absolute", left: 0, top: 0 }} width="1920" height="1080">
            <defs><linearGradient id="cg" x1="0" x2="1"><stop offset="0" stopColor="#84d8ff" /><stop offset="1" stopColor={LOGO} /></linearGradient></defs>
            <path d={`${path} L${tip[0]} 1080 L80 1080 Z`} fill="url(#cg)" opacity={0.12} />
            <path d={path} fill="none" stroke="url(#cg)" strokeWidth="4" />
            <circle cx={tip[0]} cy={tip[1]} r={9} fill="#fff" opacity={0.9} />
          </svg>
          <div style={{ position: "absolute", left: 0, right: 0, top: 250, display: "flex", justifyContent: "center", opacity: lin(f, 92, 110, 0, 1, OUTE), transform: `translateY(${(1 - lin(f, 92, 116, 0, 1, OUTE)) * 18}px)` }}>
            <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 34, letterSpacing: "0.16em", color: "#fff" }}>ЗАКОНЫ И КОДЕКСЫ</div>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 330, display: "flex", justifyContent: "center", fontFamily: HEAD, fontWeight: 800, fontSize: SIZE, letterSpacing: "-0.04em", transform: `scale(${1 + burst * 0.04})` }}>
            <div style={{ display: "flex", filter: `drop-shadow(0 0 ${done ? 34 * (1 - burst * 0.4) : 14}px rgba(61,183,244,0.5))` }}>
              <Digit k="a" d={dg[0]} size={SIZE} color={LOGO} dim={lead(0)} blur={bl(0)} />
              {vi >= 1000 ? <div style={{ width: SIZE * 0.22 }} /> : null}
              <Digit k="bb" d={dg[1]} size={SIZE} color={LOGO} dim={lead(1)} blur={bl(1)} />
              <Digit k="ccc" d={dg[2]} size={SIZE} color={LOGO} dim={lead(2)} blur={bl(2)} />
              <Digit k="dddd" d={dg[3]} size={SIZE} color={LOGO} dim={false} blur={bl(3)} />
            </div>
          </div>
          {done ? (
            <>
              <div style={{ position: "absolute", left: 960 - 420, top: 450 - 420, width: 840, height: 840, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.25)", transform: `scale(${0.4 + burst * 0.7})`, opacity: 1 - burst }} />
              {Array.from({ length: 46 }, (_, k) => {
                const a = random(`b${k}`) * Math.PI * 2, d = (120 + random(`d${k}`) * 520) * burst;
                return <div key={k} style={{ position: "absolute", left: 960 + Math.cos(a) * d, top: 470 + Math.sin(a) * d * 0.7 + burst * burst * 120, width: 10, height: 6 + random(`h${k}`) * 10, borderRadius: 2, background: [LOGO, "#84d8ff", "#fff", LOGO][k % 4], opacity: 1 - lin(f, 280, 320), transform: `rotate(${k * 37 + f * 4}deg)` }} />;
              })}
            </>
          ) : null}
          <div style={{ position: "absolute", left: 0, right: 0, top: 610, display: "flex", justifyContent: "center", opacity: sp(254, 15, 150), transform: `translateY(${(1 - sp(254, 15, 150)) * 24}px)` }}>
            <span style={{ fontFamily: HEAD, fontWeight: 600, fontSize: 52, color: "rgba(255,255,255,0.85)" }}>законов и кодексов <span style={{ color: LOGO }}>в одном месте</span></span>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};

// ================= real screenshots under a moving camera =================
type CK = { at: number; x: number; y: number; s: number; rx?: number; ry?: number };
const useCam = (keys: CK[]) => {
  const f = useCurrentFrame();
  const at = keys.map((k) => k.at);
  const g = (p: (k: CK) => number) => (keys.length < 2 ? p(keys[0]) : interpolate(f, at, keys.map(p), { ...cl, easing: IOE }));
  return { x: g((k) => k.x), y: g((k) => k.y), s: g((k) => k.s), rx: g((k) => k.rx ?? 0), ry: g((k) => k.ry ?? 0) };
};
const SHOT = (n: string) => staticFile(`hack/hd/${n}.png`);
type Layer = { src: string; from: number; fade?: number };
const Plane: React.FC<{ keys: CK[]; layers: Layer[]; cy?: number; children?: React.ReactNode }> = ({ keys, layers, cy = 620, children }) => {
  const f = useCurrentFrame();
  const c = useCam(keys);
  return (
    <AbsoluteFill style={{ perspective: 2400, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1200, transformOrigin: "0 0", transform: `translate(960px, ${cy}px) rotateX(${c.rx}deg) rotateY(${c.ry}deg) scale(${c.s}) translate(${-c.x}px, ${-c.y}px)` }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 26, overflow: "hidden", background: "#fff", boxShadow: "0 60px 140px rgba(13,22,48,0.25)" }}>
          {layers.map((l, i) => (f >= l.from ? <Img key={i} src={SHOT(l.src)} style={{ position: "absolute", inset: 0, width: 1920, height: 1200, opacity: i === 0 ? 1 : lin(f, l.from, l.from + (l.fade ?? 12)) }} /> : null))}
          {children}
        </div>
      </div>
    </AbsoluteFill>
  );
};
const TopCap: React.FC<{ lines: [string, string?]; at: number; accent?: string }> = ({ lines, at, accent }) => (
  <>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(243,242,238,1) 0%, rgba(243,242,238,1) 22%, rgba(243,242,238,0) 34%)", zIndex: 40 }} />
    <div style={{ position: "absolute", left: 110, top: 96, zIndex: 45, display: "flex", gap: 18, alignItems: "baseline" }}>
      <Cap text={lines[0]} at={at} size={60} />
      {lines[1] ? <Cap text={lines[1]} at={at + 10} size={60} accent={accent} /> : null}
    </div>
  </>
);
const Toast: React.FC<{ text: string; at: number }> = ({ text, at }) => {
  const sp = useSp();
  const s = sp(at, 15, 170);
  const f = useCurrentFrame();
  if (f < at) return null;
  return (
    <div style={{ position: "absolute", left: 960 - 230, bottom: 70, width: 460, height: 78, borderRadius: 24, background: NAVY, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 14, fontFamily: UI, fontWeight: 800, fontSize: 28, transform: `translateY(${(1 - s) * 140}px)`, zIndex: 60 }}>
      <div style={{ width: 36, height: 36, borderRadius: 18, background: GREEN, display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></div>
      {text}
    </div>
  );
};
/** Laws home: glide over the real code covers, click Constitution, push into it. */
export const LawsHome: React.FC = () => {
  const f = useCurrentFrame();
  const CLICK = 132;
  const keys: CK[] = [{ at: 0, x: 1100, y: 520, s: 1.12, rx: 8, ry: -6 }, { at: 100, x: 1000, y: 480, s: 1.05, rx: 3 }, { at: CLICK + 4, x: 960, y: 470, s: 1.05 }, { at: CLICK + 34, x: 617, y: 387, s: 1.7 }, { at: 200, x: 575, y: 405, s: 6.5 }];
  const px = interpolate(f, [60, CLICK - 4, CLICK + 30], [1300, 600, 610], { ...cl, easing: IOE });
  const py = interpolate(f, [60, CLICK - 4, CLICK + 30], [700, 372, 380], { ...cl, easing: IOE });
  const ring = lin(f, CLICK, CLICK + 24);
  const white = lin(f, 184, 200);
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Plane keys={keys} layers={[{ src: "l-home", from: 0 }]} cy={600}>
        {/* menu patch: no duels/profile rows and no plan card, Материалы and Форум move up */}
        <div style={{ position: "absolute", left: 0, top: 499, width: 362, height: 701, background: "linear-gradient(180deg, rgb(237,244,252), rgb(243,247,252) 40%)" }} />
        <div style={{ position: "absolute", left: 0, top: 499, width: 362, height: 135, overflow: "hidden" }}>
          <Img src={SHOT("l-home")} style={{ position: "absolute", left: 0, top: -566, width: 1920, height: 1200 }} />
        </div>
        <div style={{ position: "absolute", left: 452, top: 292, width: 330, height: 190, borderRadius: 20, border: `5px solid ${BLUE}`, opacity: f >= CLICK ? 1 - ring * 0.6 : 0, transform: `scale(${1 + ring * 0.04})` }} />
        {f >= 60 && f < 175 ? <Pointer x={px} y={py} down={press(f, CLICK)} op={lin(f, 60, 72)} /> : null}
      </Plane>
      <AbsoluteFill style={{ background: "#fff", opacity: white }} />
      <TopCap lines={["Любой кодекс.", "В один клик."]} at={10} accent="В один клик." />
      <Top />
    </AbsoluteFill>
  );
};
/** Reader: select a line, pick yellow, write a note, save. All on the real reader screens. */
const NOTE = "Повторить перед экзаменом";
export const Reader: React.FC = () => {
  const f = useCurrentFrame();
  const D0 = 64, D1 = 112, SEL = 122, YELC = 162, NOTEC = 204, T0 = 236, SAVE = 330, MARK = 344;
  const keys: CK[] = [{ at: 0, x: 1000, y: 520, s: 1.3 }, { at: 60, x: 1040, y: 560, s: 1.12 }, { at: SEL, x: 1020, y: 530, s: 1.15 }, { at: NOTEC + 6, x: 1020, y: 530, s: 1.15 }, { at: NOTEC + 40, x: 960, y: 520, s: 1.08 }, { at: SAVE + 6, x: 960, y: 520, s: 1.08 }, { at: MARK + 40, x: 1150, y: 580, s: 1.0 }];
  const sel = lin(f, D0, D1, 0, 1, Easing.bezier(0.45, 0, 0.55, 1));
  const n = Math.max(0, Math.min(NOTE.length, Math.floor((f - T0) / 2.6)));
  const kx = [30, D0 - 4, D1, YELC - 6, YELC + 8, NOTEC - 6, NOTEC + 14, SAVE - 8, SAVE + 30];
  const ky = kx;
  const px = interpolate(f, kx, [1500, 708, 1400, 790, 792, 820, 826, 1090, 1180], { ...cl, easing: IOE });
  const py = interpolate(f, ky, [900, 542, 542, 412, 414, 473, 478, 800, 860], { ...cl, easing: IOE });
  const down = Math.max(press(f, D0), press(f, YELC), press(f, NOTEC), press(f, SAVE));
  const layers: Layer[] = [{ src: "l-reader", from: 0 }, { src: "l-select", from: SEL, fade: 10 }, { src: "l-note", from: NOTEC + 6, fade: 14 }, { src: "l-note2", from: T0 + NOTE.length * 2.6 + 6, fade: 8 }, { src: "l-marked", from: MARK, fade: 8 }];
  const capA = f < NOTEC + 10;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Plane keys={keys} layers={layers} cy={640}>
        {f >= D0 && f < SEL + 10 ? <div style={{ position: "absolute", left: 708, top: 526, width: 692 * sel, height: 32, background: "rgba(28,176,246,0.25)" }} /> : null}
        {f >= YELC + 2 && f < NOTEC + 16 ? <div style={{ position: "absolute", left: 708, top: 526, width: 692, height: 32, background: "rgba(255,212,59,0.55)", mixBlendMode: "multiply", opacity: lin(f, YELC + 2, YELC + 10) }} /> : null}
        {f >= NOTEC + 6 && f < MARK + 8 ? <div style={{ position: "absolute", left: 716, top: 452, width: 488, height: 38, background: "rgb(239,239,239)", display: "flex", alignItems: "center", padding: "0 18px", boxSizing: "border-box", fontFamily: UI, fontWeight: 600, fontSize: 17, color: "#6b7785", whiteSpace: "nowrap", overflow: "hidden" }}>торжественно провозглашая свою приверженность</div> : null}
        {f >= T0 - 6 && f < T0 + NOTE.length * 2.6 + 14 ? (
          <div style={{ position: "absolute", left: 716, top: 500, width: 488, height: 206, background: "#fff", padding: "16px 18px", boxSizing: "border-box", fontFamily: UI, fontWeight: 600, fontSize: 23, color: "#4b4b4b" }}>
            {NOTE.slice(0, n)}<span style={{ display: "inline-block", width: 2, height: 24, marginLeft: 2, verticalAlign: "-4px", background: BLUE }} />
          </div>
        ) : null}
        {f >= 30 && f < SAVE + 34 ? <Pointer x={px} y={py} down={down} op={lin(f, 30, 42) * (1 - lin(f, SAVE + 20, SAVE + 34))} /> : null}
      </Plane>
      <Toast text="Заметка сохранена" at={MARK + 4} />
      {capA ? <TopCap key="a" lines={["Выделяй цветом.", "Пиши заметки."]} at={8} accent="Пиши заметки." /> : <TopCap key="b" lines={["Заметки остаются", "прямо в законе."]} at={NOTEC + 12} accent="прямо в законе." />}
      <Top />
    </AbsoluteFill>
  );
};
/** AI: the site's "Объяснение статьи" window (same layout as veoskill.uz): loading, then three blocks written in. */
const EXPL: [string, string, string, boolean][] = [
  ["target.svg", "КОРОТКО", "Первая статья определяет главные основы государства. Узбекистан признается независимой страной с выборной властью, подчинением закону и заботой о гражданах, а его короткое и полное названия имеют равную силу.", true],
  ["document.svg", "ПРОСТЫМИ СЛОВАМИ", "Эта статья закрепляет главные правила жизни страны. Узбекистан полностью независим во внутренних делах и внешней политике, а его руководство избирается гражданами на определенный срок. Государство действует строго по закону, ставит интересы человека на первое место и заботится о нуждающихся. Вы можете использовать названия Узбекистан и Республика Узбекистан как абсолютно равные.", false],
  ["customer-file.svg", "ПРИМЕР ИЗ ЖИЗНИ", "Дилшод заполняет документы для открытия мастерской в Ташкенте. В одном бланке он написал «Узбекистан», а в другом «Республика Узбекистан». Специалист центра государственных услуг без замечаний принял оба документа: закон гарантирует, что оба названия равнозначны.", false],
];
export const AIReal: React.FC = () => {
  const f = useCurrentFrame();
  const sp = useSp();
  const MX = 400, MY = 290, MW = 1120;
  const keys: CK[] = [{ at: 0, x: 960, y: 470, s: 0.96 }, { at: 70, x: 960, y: 480, s: 1.0 }, { at: 112, x: 960, y: 600, s: 1.1 }, { at: 160, x: 960, y: 730, s: 1.12 }, { at: 220, x: 960, y: 880, s: 1.12 }, { at: 300, x: 960, y: 830, s: 1.0 }];
  const c = useCam(keys);
  const open = sp(4, 15, 170);
  const load = lin(f, 14, 26) * (1 - lin(f, 62, 74));
  const BL = [76, 112, 160];
  const capOut = lin(f, 80, 102);
  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      {/* the reader behind, dimmed like the site overlay, slower parallax than the window */}
      <AbsoluteFill style={{ transform: `translateY(${-(c.y - 640) * 0.25}px) scale(${1.04 + (c.s - 1) * 0.3})` }}>
        <Img src={SHOT("l-reader")} style={{ width: 1920, height: 1200, objectFit: "cover" }} />
        <AbsoluteFill style={{ background: "rgba(60,64,72,0.38)" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ transformOrigin: "0 0", transform: `translate(${960 - c.s * c.x}px, ${560 - c.s * c.y}px) scale(${c.s})` }}>
        <div style={{ position: "absolute", left: MX, top: MY, width: MW, minHeight: 820, borderRadius: 24, background: "#fff", boxShadow: "0 40px 120px rgba(13,22,48,0.35)", padding: "36px 44px 40px", boxSizing: "border-box", fontFamily: UI, color: "#3c3c3c", opacity: Math.min(1, open * 1.5), transform: `translateY(${(1 - open) * 60}px) scale(${0.94 + 0.06 * open})` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontWeight: 800, fontSize: 36, letterSpacing: "-0.01em" }}>Объяснение статьи (Статья 1)</div>
            <div style={{ display: "flex", gap: 14 }}>
              <div style={{ width: 54, height: 54, borderRadius: 14, background: "#ddf4ff", color: "#1cb0f6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 28 }}>?</div>
              <div style={{ width: 54, height: 54, borderRadius: 14, background: "#1cb0f6", boxShadow: "0 4px 0 #1899d6", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg></div>
            </div>
          </div>
          {load > 0.01 ? (
            <div style={{ position: "absolute", left: 0, right: 0, top: 250, display: "flex", flexDirection: "column", alignItems: "center", opacity: load }}>
              <Img src={staticFile("site/document.svg")} style={{ width: 120, height: 120, opacity: 0.55 + 0.45 * Math.abs(Math.sin(f / 12)), transform: `scale(${0.96 + 0.04 * Math.sin(f / 12)})` }} />
              <div style={{ marginTop: 18, fontWeight: 800, fontSize: 30 }}>Разбираю статью</div>
              <div style={{ marginTop: 8, fontWeight: 600, fontSize: 22, color: "#8a8f98" }}>Это займёт несколько секунд</div>
            </div>
          ) : null}
          <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 34 }}>
            {EXPL.map(([ic, title, text, bold], i) => {
              const at = BL[i];
              const e = sp(at, 15, 170);
              const line = lin(f, at + 6, at + 40, 0, 1, OUTE);
              const reveal = lin(f, at + 4, at + 46, 0, 1, Easing.bezier(0.3, 0, 0.3, 1));
              return (
                <div key={title} style={{ display: "flex", gap: 22, opacity: f >= at ? 1 : 0 }}>
                  <div style={{ width: 44, display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    <Img src={staticFile(`site/${ic}`)} style={{ width: 44, height: 44, transform: `scale(${e})` }} />
                    <div style={{ marginTop: 10, width: 3, flex: 1, borderRadius: 2, background: "rgba(28,176,246,0.25)", transformOrigin: "50% 0", transform: `scaleY(${line})` }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 44, display: "flex", alignItems: "center", fontWeight: 800, fontSize: 18, letterSpacing: "0.08em", color: "#8a8f98", opacity: e, transform: `translateX(${(1 - e) * 20}px)` }}>{title}</div>
                    <div style={{ marginTop: 8, fontWeight: bold ? 700 : 600, fontSize: 24, lineHeight: 1.62, textAlign: "justify", hyphens: "auto", WebkitMaskImage: `linear-gradient(180deg, #000 ${reveal * 100}%, transparent ${reveal * 100 + 14}%)`, maskImage: `linear-gradient(180deg, #000 ${reveal * 100}%, transparent ${reveal * 100 + 14}%)` }} lang="ru">{text}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
      <div style={{ opacity: 1 - capOut }}>
        <TopCap lines={["Непонятная статья?", "ИИ объяснит простыми словами."]} at={8} accent="простыми словами." />
      </div>
      <div style={{ opacity: 1 - capOut }}><Top /></div>
    </AbsoluteFill>
  );
};

// ================= languages =================
const LANGS: [string, string, "ru" | "uz" | "en"][] = [["Русский", "v4/flag-ru.svg", "ru"], ["O‘zbekcha", "v4/flag-uz.svg", "uz"], ["English", "v4/flag-en.svg", "en"]];
// "Law" in other languages, orbiting the headline (Google-style: calm white, items floating around one line of text)
const ORBIT = ["Gesetz", "Loi", "Ley", "Legge", "Lei", "Kanun", "Prawo", "Νόμος", "قانون", "法律", "कानून", "Hukum", "Wet", "Lag", "Закон", "Luật", "법률", "Törvény"];
export const Langs: React.FC = () => {
  const f = useCurrentFrame();
  const sp = useSp();
  const big = Math.max(1, Math.round(lin(f, 4, 50, 1, 99, Easing.out(Easing.cubic))));
  const plus = sp(50, 10, 220);
  const head = sp(2, 14, 150);
  // ring: 3 main languages with flags + 18 smaller words, slowly turning on an ellipse
  const items: { label: string; flag?: string; main: boolean; a0: number }[] = [
    ...LANGS.map(([name, flag], i) => ({ label: name, flag, main: true, a0: [2.3, -2.1, -0.45][i] })), // kept clear of the button below the headline
    ...ORBIT.map((w, i) => ({ label: w, main: false, a0: (i / ORBIT.length) * Math.PI * 2 + 0.17 })),
  ];
  const turn = f * 0.0045;
  const BTN_AT = 112, CLICK = 158;
  const btn = sp(BTN_AT, 13, 190);
  const pr = press(f, CLICK);
  const done = lin(f, CLICK + 4, CLICK + 14);
  const curIn = lin(f, BTN_AT + 10, CLICK - 2, 0, 1, Easing.bezier(0.25, 0.1, 0.25, 1));
  const cx = 1240 - 300 * curIn, cy = 960 - 170 * curIn;
  return (
    <AbsoluteFill style={{ background: "#ffffff", overflow: "hidden" }}>
      <Top />
      {items.map((it, i) => {
        const a = it.a0 + turn;
        const rx = it.main ? 640 : 780, ry = it.main ? 330 : 400;
        const depth = (Math.sin(a) + 1) / 2; // 0 back (top), 1 front (bottom)
        const s = sp(it.main ? 2 + i * 6 : 6 + i * 2, 15, 120);
        const k = 1.8 - 0.8 * s;
        const x = 960 + Math.cos(a) * rx * k, y = 540 + Math.sin(a) * ry * k + Math.sin(f / 40 + i) * 6;
        const sc = (it.main ? 1 : 0.78 + 0.22 * depth) * (0.7 + 0.3 * s);
        const op = Math.min(1, s * 1.4) * (it.main ? 1 : 0.45 + 0.4 * depth);
        return (
          <div key={it.label} style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${sc})`, opacity: op, zIndex: it.main ? 3 : 1, display: "flex", alignItems: "center", gap: 14, padding: it.main ? "18px 28px" : "12px 22px", borderRadius: 999, background: "#fff", border: `2px solid ${it.main ? "rgba(61,183,244,0.45)" : "#eceef2"}`, boxShadow: it.main ? "0 18px 44px rgba(28,120,246,0.16)" : "0 10px 26px rgba(13,22,48,0.07)", fontFamily: UI, fontWeight: it.main ? 900 : 800, fontSize: it.main ? 32 : 28, color: it.main ? INK : "#6f7682", whiteSpace: "nowrap" }}>
            {it.flag ? <Img src={staticFile(it.flag)} style={{ width: 42, height: 30, borderRadius: 6, objectFit: "cover" }} /> : null}{it.label}
          </div>
        );
      })}
      <div style={{ position: "absolute", top: 300, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", zIndex: 5 }}>
        <div style={{ display: "flex", alignItems: "flex-start", fontFamily: HEAD, fontWeight: 900, fontSize: 230, lineHeight: 0.9, letterSpacing: "-0.05em", color: LOGO, transform: `scale(${0.85 + 0.15 * head})`, opacity: Math.min(1, head * 1.5), fontVariantNumeric: "tabular-nums" }}>{big}<span style={{ display: "inline-block", marginLeft: 4, fontSize: 160, opacity: Math.min(1, plus * 1.5), transform: `scale(${plus})`, transformOrigin: "0 60%" }}>+</span></div>
        <div style={{ marginTop: 18 }}><Cap text="языков законов." at={40} size={64} /></div>
      </div>
      <div style={{ position: "absolute", left: 960, top: 760, zIndex: 6, transform: `translate(-50%, -50%) scale(${(0.8 + 0.2 * btn) * (1 - pr * 0.05)})`, opacity: Math.min(1, btn * 1.4) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "22px 40px", borderRadius: 999, background: done > 0.5 ? LOGO : "#e3f4fd", color: done > 0.5 ? "#fff" : "#0d6fa3", fontFamily: UI, fontWeight: 900, fontSize: 34, boxShadow: `0 16px 40px rgba(28,120,246,${0.12 + 0.18 * done})`, whiteSpace: "nowrap" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.2 6.6L21 11l-6.8 2.4L12 20l-2.2-6.6L3 11l6.8-2.4z" /></svg>
          {done > 0.5 ? "Статья на O‘zbekcha" : "Перевести статью"}
        </div>
      </div>
      {f > BTN_AT + 8 ? <Pointer x={cx} y={cy} down={pr} op={lin(f, BTN_AT + 8, BTN_AT + 18) * (1 - lin(f, CLICK + 30, CLICK + 44))} /> : null}
    </AbsoluteFill>
  );
};

// ================= game: build the phrase from a word bank =================
const CARD: React.CSSProperties = { position: "absolute", borderRadius: 22, background: "#fff", border: `3px solid ${SWAN}`, boxShadow: `0 6px 0 ${SWAN}`, fontFamily: UI, fontWeight: 800, color: INK, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 };
const BANK = ["всех", "богатых", "Закон", "иногда", "для", "только", "один"];
const ANSWER = ["Закон", "один", "для", "всех"];
export const PhraseBank: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const iris = 1 - lin(f, 0, 30, 0, 1, Easing.bezier(0.3, 0, 0.3, 1));
  const H = 92, GAP = 22;
  const wOf = (t: string) => Math.round(textWidth(t, "800 40px NunitoC") + 64);
  const bankW = BANK.map(wOf), totalB = bankW.reduce((a, b) => a + b, 0) + GAP * (BANK.length - 1);
  const bankX = bankW.map((_, i) => 960 - totalB / 2 + bankW.slice(0, i).reduce((a, b) => a + b, 0) + GAP * i);
  const ansW = ANSWER.map(wOf), totalA = ansW.reduce((a, b) => a + b, 0) + GAP * 3;
  const ansX = ansW.map((_, i) => 960 - totalA / 2 + ansW.slice(0, i).reduce((a, b) => a + b, 0) + GAP * i);
  const LINE_Y = 420, BANK_Y = 700;
  const moveAt = (k: number) => 84 + k * 28;
  const DONE = moveAt(3) + 30;
  const glow = lin(f, DONE, DONE + 24, 0, 1, OUTE);
  const shake = f >= DONE + 6 && f < DONE + 30 ? Math.sin((f - DONE) * 1.6) * 9 * (1 - (f - DONE - 6) / 24) : 0;
  const drop = lin(f, DONE + 30, DONE + 56, 0, 1, Easing.in(Easing.quad));
  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <Top />
      <div style={{ position: "absolute", left: 110, top: 110 }}><Cap text="Собери фразу" at={8} size={76} /></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily: HEAD, fontWeight: 600, fontSize: 34, color: "#5d6470", opacity: lin(f, 14, 30) }}>Что гласит закон о равенстве?</div>
      {/* answer line */}
      <div style={{ position: "absolute", left: 960 - (totalA + 80) / 2, width: (totalA + 80) * lin(f, 8, 34, 0, 1, OUTE), top: LINE_Y + H + 18, height: 6, borderRadius: 3, background: f >= DONE ? GREEN : "#d6d9de", boxShadow: f >= DONE ? `0 0 ${28 * glow}px rgba(88,204,2,0.7)` : undefined }} />
      {/* bank tray */}
      <div style={{ position: "absolute", left: 960 - totalB / 2 - 30, top: BANK_Y - 24, width: totalB + 60, height: H + 48, borderRadius: 30, background: "rgba(13,22,48,0.035)", opacity: lin(f, 10, 26) * (1 - drop) }} />
      {BANK.map((t, i) => {
        const ai = ANSWER.indexOf(t);
        const appear = spring({ frame: f - 14 - i * 4, fps, config: { damping: 13, stiffness: 190 } });
        if (ai >= 0) {
          // gap placeholder stays in the bank
          const m = spring({ frame: f - moveAt(ai), fps, config: { damping: 14, stiffness: 130 } });
          const x = bankX[i] + (ansX[ai] - bankX[i]) * m;
          const y = BANK_Y + (LINE_Y - BANK_Y) * m - Math.sin(Math.min(1, m) * Math.PI) * 120;
          const ok = f >= DONE;
          return (
            <React.Fragment key={t}>
              {f >= moveAt(ai) ? <div style={{ position: "absolute", left: bankX[i], top: BANK_Y, width: bankW[i], height: H, borderRadius: 22, background: "#e8eaee", opacity: 1 - drop }} /> : null}
              <div style={{ ...CARD, left: x, top: y, width: bankW[i], height: H, transform: `scale(${appear * (1 + Math.sin(Math.min(1, m) * Math.PI) * 0.1)}) rotate(${Math.sin(Math.min(1, m) * Math.PI) * -4}deg)`, border: `3px solid ${ok ? GREEN : SWAN}`, background: ok ? "#e7ffd6" : "#fff", color: ok ? GLIP : INK, boxShadow: ok ? `0 6px 0 ${GLIP}, 0 16px 40px rgba(88,204,2,${0.3 * glow})` : CARD.boxShadow, zIndex: 5 }}>{t}</div>
            </React.Fragment>
          );
        }
        const bad = f >= DONE + 6;
        return <div key={t} style={{ ...CARD, left: bankX[i] + shake, top: BANK_Y + drop * 260, width: bankW[i], height: H, transform: `scale(${appear}) rotate(${drop * (i % 2 ? 14 : -14)}deg)`, border: `3px solid ${bad ? "#ffb3b3" : SWAN}`, background: bad ? "#fff1f1" : "#fff", color: bad ? "#d64545" : INK, opacity: 1 - drop }}>{t}</div>;
      })}
      {f >= DONE ? (
        <div style={{ position: "absolute", left: 960 + totalA / 2 + 40, top: LINE_Y + 10, width: 72, height: 72, borderRadius: 36, background: GREEN, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 0 ${GLIP}`, transform: `scale(${spring({ frame: f - DONE - 4, fps, config: { damping: 10, stiffness: 220 } })})` }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        </div>
      ) : null}
      {iris > 0 ? <div style={{ position: "absolute", left: 960, top: 540, width: 10, height: 10, marginLeft: -5, marginTop: -5, borderRadius: "50%", background: GREEN, transform: `scale(${iris * 460})`, zIndex: 80 }} /> : null}
    </AbsoluteFill>
  );
};
export { RED as _red, GREY as _grey, fit as _fit };
