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
/** Brand mark, top left. zIndex 39: a TopCap band (40) covers it while a caption is on screen, so the logo shows only once the caption has gone. */
const Top: React.FC<{ dark?: boolean }> = ({ dark }) => (
  <>
    {dark ? null : <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: 170, background: "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.85) 45%, rgba(255,255,255,0) 100%)", zIndex: 38 }} />}
    <Img src={staticFile("brand/veoskill.webp")} style={{ position: "absolute", left: 60, top: 40, height: 46, filter: dark ? "brightness(0) invert(1)" : undefined, zIndex: 39 }} />
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
/** Caption at the top: big (for older viewers), holds ~3.5 s, then glides up and fades; the logo under its band shows after. */
const TopCap: React.FC<{ lines: [string, string?]; at: number; accent?: string; hold?: number }> = ({ lines, at, accent, hold = 210 }) => {
  const f = useCurrentFrame();
  const out = lin(f, at + hold, at + hold + 26, 0, 1, Easing.bezier(0.5, 0, 0.75, 0));
  if (out >= 1) return null;
  return (
    <>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(243,242,238,1) 0%, rgba(243,242,238,1) 25%, rgba(243,242,238,0) 38%)", zIndex: 40, opacity: 1 - out }} />
      <div style={{ position: "absolute", left: 100, right: 100, top: 70, zIndex: 45, display: "flex", flexWrap: "wrap", columnGap: 22, rowGap: 0, alignItems: "baseline", opacity: 1 - out, transform: `translateY(${-out * 70}px)` }}>
        <Cap text={lines[0]} at={at} size={78} />
        {lines[1] ? <Cap text={lines[1]} at={at + 10} size={78} accent={accent} /> : null}
      </div>
    </>
  );
};
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
/** Hints: click the green bulb ("Подсказки" popover), then hover a dotted term and its explanation pops up (as on veoskill.uz). */
const HintBox: React.FC<{ x: number; y: number; w: number; title: string; text: string; o: number; arrowX: number; read?: number }> = ({ x, y, w, title, text, o, arrowX, read = 1 }) => {
  const n = Math.round(text.length * read);
  return (
  <div style={{ position: "absolute", left: x, top: y, width: w, opacity: o, transform: `translateY(${(1 - o) * 10}px)`, fontFamily: UI }}>
    <div style={{ position: "absolute", left: arrowX - 12, top: -11, width: 22, height: 22, background: "#fff", borderLeft: "3px solid #1cb0f6", borderTop: "3px solid #1cb0f6", transform: "rotate(45deg)", borderRadius: "4px 0 0 0" }} />
    <div style={{ background: "#fff", border: "3px solid #1cb0f6", borderRadius: 16, padding: "16px 22px 18px", boxShadow: "0 18px 40px rgba(13,22,48,0.16)" }}>
      <div style={{ fontWeight: 800, fontSize: 21, color: "#3c3c3c" }}>{title}</div>
      <div style={{ marginTop: 8, fontWeight: 600, fontSize: 18, lineHeight: 1.5, color: "#a3a9b2" }}><span style={{ color: "#3c3c3c" }}>{text.slice(0, n)}</span>{text.slice(n)}</div>
    </div>
  </div>
  );
};
export const Hints: React.FC = () => {
  const f = useCurrentFrame();
  const BULB = 46, POP = 52, HOVER = 176, TIP = 184;
  // starts exactly where Reader's camera ends (so the cross-dissolve is seamless), glides to the bulb,
  // then moves in close on each hint while it is on screen
  // close-ups "read" the hint: the camera drifts along the text while the read words darken
  const keys: CK[] = [{ at: 0, x: 1150, y: 580, s: 1.0 }, { at: 40, x: 1350, y: 300, s: 1.25 }, { at: 56, x: 1350, y: 300, s: 1.25 }, { at: 84, x: 1560, y: 262, s: 1.75 }, { at: 134, x: 1680, y: 312, s: 1.75 }, { at: 172, x: 1080, y: 740, s: 1.35 }, { at: 188, x: 1080, y: 740, s: 1.35 }, { at: 214, x: 1060, y: 812, s: 1.85 }, { at: 288, x: 1250, y: 872, s: 1.85 }];
  const readA = lin(f, 80, 132, 0, 1, Easing.linear), readB = lin(f, 208, 282, 0, 1, Easing.linear);
  const kx = [14, BULB - 6, 132, HOVER - 4];
  const px = interpolate(f, kx, [1500, 1590, 1760, 1080], { ...cl, easing: IOE });
  const py = interpolate(f, kx, [560, 168, 150, 738], { ...cl, easing: IOE });
  const pop = lin(f, POP, POP + 12) * (1 - lin(f, 136, 152));
  const tip = lin(f, TIP, TIP + 12);
  const ul = lin(f, HOVER - 2, HOVER + 6);
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Plane keys={keys} layers={[{ src: "l-reader", from: 0 }]} cy={640}>
        {/* bulb pressed: dark ring like on the site */}
        <div style={{ position: "absolute", left: 1551, top: 134, width: 68, height: 60, borderRadius: 14, border: "3px solid #1f5d2a", boxSizing: "border-box", opacity: lin(f, BULB + 2, BULB + 6) }} />
        <HintBox x={1430} y={214} w={380} o={pop} read={readA} arrowX={155} title="Подсказки" text="Подсказки к юридическим терминам: наведите на выделенное слово, и появится пояснение." />
        {/* hovered term: dotted underline becomes solid */}
        <div style={{ position: "absolute", left: 971, top: 742, width: 206, height: 3, borderRadius: 2, background: "#1cb0f6", opacity: ul }} />
        <HintBox x={930} y={772} w={440} o={tip} read={readB} arrowX={140} title="Юридическая ответственность" text="Обязанность лица претерпеть неблагоприятные последствия за нарушение закона: штраф, возмещение вреда, лишение свободы." />
        {f >= 14 ? <Pointer x={px} y={py} down={press(f, BULB)} op={lin(f, 14, 26)} /> : null}
      </Plane>
      <TopCap lines={["Непонятный термин?", "Наведи и узнай."]} at={8} accent="Наведи и узнай." />
      <Top />
    </AbsoluteFill>
  );
};
/** Article actions: heart -> "В избранное" with the folder picker; "⋯" -> the article menu (as on veoskill.uz). */
const FOLDERS: [string, string][] = [["Экзамен", "#1cb0f6"], ["Курсовая работа", "#ffc800"], ["Повторить", GREEN]];
const ART_P = { fontFamily: UI, fontWeight: 500, fontSize: 25, lineHeight: 1.36, color: "#2b2b2b", textAlign: "justify" as const, textIndent: 80 };
const Heart: React.FC<{ on: number; size?: number }> = ({ on, size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-9.2-9.3C1.6 7.8 3.8 4.5 7.2 4.5c2 0 3.6 1.1 4.8 2.8 1.2-1.7 2.8-2.8 4.8-2.8 3.4 0 5.6 3.3 4.4 6.7-1.7 4.7-9.2 9.3-9.2 9.3z" fill={on > 0.5 ? "#ff4b4b" : "none"} stroke={on > 0.5 ? "#ff4b4b" : "#9aa1ab"} strokeWidth="2" strokeLinejoin="round" /></svg>
);
const MI = (d: React.ReactNode) => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1cb0f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{d}</svg>;
const MENU: [React.ReactNode, string][] = [
  [MI(<><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" /></>), "Копировать статью"],
  [MI(<path d="M7 17c-2 0-3-1.5-3-3.5C4 10 6 7.5 9 7M17 17c-2 0-3-1.5-3-3.5 0-3.5 2-6 5-6.5" />), "Скопировать источник"],
  [MI(<><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></>), "Кто ссылается на статью"],
  [MI(<><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 9h8M8 13h8M8 17h5" /></>), "Заметка к статье"],
  [MI(<path d="M10 6h10M10 12h10M10 18h10M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2" />), "Тест по статье"],
];
export const ArticleActions: React.FC = () => {
  const f = useCurrentFrame();
  const sp = useSp();
  const HEART = 56, POP = 62, DOTS = 164, MENU_AT = 170, F1 = 86, F2 = 108;
  const keys: CK[] = [{ at: 0, x: 1200, y: 600, s: 1.0 }, { at: 40, x: 980, y: 560, s: 1.3 }, { at: 70, x: 980, y: 560, s: 1.3 }, { at: 96, x: 800, y: 600, s: 1.6 }, { at: 136, x: 820, y: 610, s: 1.6 }, { at: 168, x: 1560, y: 560, s: 1.35 }, { at: 196, x: 1600, y: 640, s: 1.62 }, { at: 288, x: 1610, y: 660, s: 1.62 }];
  // the cursor stops on every target for the click and the ripple, then moves on
  const kx = [12, HEART - 6, HEART + 8, F1 - 6, F1 + 8, F2 - 6, F2 + 10, 140, DOTS - 6, DOTS + 8, MENU_AT + 22, 278];
  const px = interpolate(f, kx, [1300, 636, 636, 966, 966, 966, 966, 1100, 1826, 1826, 1700, 1700], { ...cl, easing: IOE });
  const py = interpolate(f, kx, [760, 466, 466, 644, 644, 745, 745, 380, 466, 466, 548, 548 + 4 * 62], { ...cl, easing: IOE });
  const heart = sp(HEART + 2, 9, 260);
  const pop = lin(f, POP, POP + 10) * (1 - lin(f, 140, 152));
  const menu = sp(MENU_AT, 15, 200);
  const hover = lin(f, MENU_AT + 22, 278, 0, 4, Easing.linear);
  const Y3 = 440;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Plane keys={keys} layers={[{ src: "l-reader", from: 0 }]} cy={640}>
        <div style={{ position: "absolute", left: 573, top: 218, width: 1282, height: 990, background: "#fff", padding: "14px 60px 0 48px", boxSizing: "border-box", overflow: "hidden" }}>
          <div style={ART_P}>Названия государства «Республика Узбекистан» и «Узбекистан» равнозначны.</div>
          {[["2", ["Государство выражает волю народа, служит его интересам. Государственные органы и должностные лица ответственны перед обществом и гражданами."]],
            ["3", ["Республика Узбекистан определяет национально-государственное и административно-территориальное устройство, систему органов государственной власти и управления, проводит свою внутреннюю и внешнюю политику.", "Государственная граница и территория Узбекистана неприкосновенны и неделимы."]],
            ["4", ["Государственным языком Республики Узбекистан является узбекский язык.", "Республика Узбекистан обеспечивает уважительное отношение к языкам, обычаям и традициям наций и народностей, проживающих на ее территории, создает условия для их развития."]],
            ["5", ["Республика Узбекистан имеет свои государственные символы — флаг, герб, гимн, утверждаемые законом.", "Государственные символы находятся под защитой государства."]]].map(([n, ps]) => (
            <div key={n as string} style={{ marginTop: 14 }}>
              <div style={{ height: 48, display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ transform: n === "3" ? `scale(${1 + 0.35 * Math.sin(Math.min(1, heart) * Math.PI)})` : undefined }}><Heart on={n === "3" ? heart : 0} /></div>
                <div style={{ fontFamily: UI, fontWeight: 900, fontSize: 29, color: "#1a237e" }}>Статья {n}.</div>
                {n === "3" ? (
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 18 }}>
                    <AiIcon size={30} color="#8a8f98" />
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="#6f7682"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
                  </div>
                ) : null}
              </div>
              {(ps as string[]).map((t, i) => <div key={i} style={{ ...ART_P, marginTop: 8 }}>{t}</div>)}
            </div>
          ))}
        </div>
        {/* favourites: folder picker */}
        <div style={{ position: "absolute", left: 606, top: Y3 + 58, width: 390, opacity: pop, transform: `translateY(${(1 - pop) * 10}px)`, fontFamily: UI }}>
          <div style={{ background: "#fff", borderRadius: 18, boxShadow: "0 22px 50px rgba(13,22,48,0.2)", border: "1px solid #eef0f3", padding: "16px 16px 10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ padding: "6px 10px", borderRadius: 8, background: "#3c3c3c", color: "#fff", fontWeight: 800, fontSize: 16 }}>В избранное</div>
              <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: "0.08em", color: "#6f7682" }}>В ПАПКУ</div>
            </div>
            <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
              <div style={{ flex: 1, height: 44, borderRadius: 12, border: "2px solid #e6e9ee", display: "flex", alignItems: "center", padding: "0 14px", color: "#9aa1ab", fontWeight: 600, fontSize: 17 }}>Найти папку</div>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#1cb0f6", boxShadow: "0 3px 0 #1899d6", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg></div>
            </div>
            {FOLDERS.map(([name, c], i) => {
              const on = i === 0 ? sp(F1, 10, 260) * (f >= F1 ? 1 : 0) : i === 2 ? sp(F2, 10, 260) * (f >= F2 ? 1 : 0) : 0;
              return (
                <div key={name} style={{ height: 50, display: "flex", alignItems: "center", gap: 12, borderTop: i ? "1px solid #f0f1f4" : undefined, marginTop: i ? 0 : 10, borderRadius: 10, background: `rgba(28,176,246,${0.07 * Math.min(1, on)})`, padding: "0 4px" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24"><path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2h8.5A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" fill={c} /></svg>
                  <div style={{ flex: 1, fontWeight: 700, fontSize: 18, color: "#3c3c3c", whiteSpace: "nowrap" }}>{name}</div>
                  <Tick on={on} size={26} />
                </div>
              );
            })}
            <div style={{ height: 34, display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 16, color: GLIP, opacity: lin(f, F2 + 8, F2 + 16) }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GLIP} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>Сохранено в 2 папки
            </div>
          </div>
        </div>
        {/* article menu */}
        {f >= MENU_AT ? (
          <div style={{ position: "absolute", left: 1450, top: Y3 + 54, width: 400, background: "#fff", borderRadius: 16, boxShadow: "0 22px 50px rgba(13,22,48,0.2)", border: "1px solid #eef0f3", overflow: "hidden", fontFamily: UI, opacity: Math.min(1, menu * 1.4), transform: `scale(${0.92 + 0.08 * menu})`, transformOrigin: "100% 0" }}>
            {MENU.map(([ic, t], i) => {
              const e = lin(f, MENU_AT + 2 + i * 3, MENU_AT + 10 + i * 3);
              const h = Math.max(0, 1 - Math.abs(hover - i)) * lin(f, MENU_AT + 18, MENU_AT + 24);
              return (
                <div key={t} style={{ height: 62, display: "flex", alignItems: "center", gap: 16, padding: "0 20px", borderTop: i ? "1px solid #f0f1f4" : undefined, background: `rgba(227,244,253,${h})`, fontWeight: 700, fontSize: 21, color: "#3c3c3c", whiteSpace: "nowrap", opacity: e, transform: `translateX(${(1 - e) * 10}px)` }}>{ic}{t}</div>
              );
            })}
          </div>
        ) : null}
        {f >= 12 ? <Pointer x={px} y={py} down={Math.max(press(f, HEART), press(f, F1), press(f, F2), press(f, DOTS))} op={lin(f, 12, 22)} /> : null}
      </Plane>
      <TopCap lines={["Сохраняй статьи.", "Всё под рукой."]} at={8} accent="Всё под рукой." />
      <Top />
    </AbsoluteFill>
  );
};
/** Collection: tick several articles, download them as one file (format picker as on the site), share one link; a friend opens it on a phone. */
const COL_ARTS: [string, string[]][] = [
  ["2", ["Государство выражает волю народа, служит его интересам. Государственные органы и должностные лица ответственны перед обществом и гражданами."]],
  ["3", ["Республика Узбекистан определяет национально-государственное и административно-территориальное устройство, систему органов государственной власти и управления, проводит свою внутреннюю и внешнюю политику.", "Государственная граница и территория Узбекистана неприкосновенны и неделимы."]],
  ["4", ["Государственным языком Республики Узбекистан является узбекский язык.", "Республика Узбекистан обеспечивает уважительное отношение к языкам, обычаям и традициям наций и народностей, проживающих на ее территории, создает условия для их развития."]],
  ["5", ["Республика Узбекистан имеет свои государственные символы — флаг, герб, гимн, утверждаемые законом.", "Государственные символы находятся под защитой государства."]],
];
const Tick: React.FC<{ on: number; size?: number }> = ({ on, size = 30 }) => (
  <div style={{ width: size, height: size, borderRadius: 8, border: `2.5px solid ${on > 0.5 ? "#1cb0f6" : "#b9bec6"}`, background: on > 0.5 ? "#1cb0f6" : "#fff", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 + 0.25 * Math.sin(Math.min(1, on) * Math.PI)})` }}>
    {on > 0.5 ? <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg> : null}
  </div>
);
const PlaneIc: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><path d="M21.5 3.2L2.8 10.4c-.9.4-.9 1.6 0 1.9l4.6 1.6 1.8 5.6c.3.8 1.3 1 1.9.4l2.6-2.5 4.6 3.4c.7.5 1.7.1 1.9-.7l3-15.2c.2-1-.8-1.8-1.7-1.5z" fill="#1cb0f6" /><path d="M7.4 13.9l11-7.4-8.6 8.7-.3 4.1" fill="#0d8fd0" /></svg>
);
const FileIc: React.FC<{ label: string; c: string }> = ({ label, c }) => (
  <svg width="40" height="46" viewBox="0 0 40 46"><path d="M4 3h22l10 10v30H4z" fill="#f4f5f7" stroke="#d5d9df" strokeWidth="1.5" /><path d="M26 3v10h10" fill="#e6e9ee" /><rect x="1" y="22" width="30" height="13" rx="3" fill={c} /><text x="16" y="31.5" textAnchor="middle" fontFamily="Arial" fontWeight="700" fontSize="8.5" fill="#fff">{label}</text></svg>
);
const FORMATS: [string, string, string, string][] = [["DOC", "#2f6fe0", "Word (.docx)", "для правки и отправки"], ["PDF", "#e5322d", "PDF (.pdf)", "готовый файл для чтения и печати"], ["TXT", "#f08a24", "Текст (.txt)", "без оформления"], ["HTML", "#22a35a", "Веб-страница (.html)", "откроется в любом браузере"]];
export const Collect: React.FC = () => {
  const f = useCurrentFrame();
  const sp = useSp();
  const T = [40, 64, 88]; // ticks: articles 2, 3, 4
  const DL = 122, PDF = 160, GO = 196, SH = 272, COPY = 318, PHONE = 362;
  const cam = { x: 1214, y: 560, s: 0.9 };
  const camS = cam.s + 0.06 * lin(f, 0, 110, 0, 1, Easing.linear);
  const keys: CK[] = [{ at: 0, x: cam.x, y: cam.y, s: camS }];
  // screen positions of the ticks (world x 636, y 304 / 442 / 656)
  const scr = (wx: number, wy: number, ff: number) => { const s = cam.s + 0.06 * lin(ff, 0, 110, 0, 1, Easing.linear); return [960 + s * (wx - cam.x), 640 + s * (wy - cam.y)]; };
  const [t1x, t1y] = scr(636, 304, T[0]), [t2x, t2y] = scr(636, 442, T[1]), [t3x, t3y] = scr(636, 656, T[2]);
  const BAR_Y = 958, DLX = 924, SHX = 1232;
  const pk = [10, T[0] - 6, T[1] - 6, T[2] - 6, DL - 6, PDF - 6, GO - 6, 240, SH - 6, COPY - 6, 346];
  const pxs = [1300, t1x, t2x, t3x, DLX, 808, 1110, 1300, SHX, 1210, 1500];
  const pys = [800, t1y, t2y, t3y, BAR_Y, 518, 760, 900, BAR_Y, 600, 860];
  const px = interpolate(f, pk, pxs, { ...cl, easing: IOE }), py = interpolate(f, pk, pys, { ...cl, easing: IOE });
  const down = Math.max(...T.map((t) => press(f, t)), press(f, DL), press(f, PDF), press(f, GO), press(f, SH), press(f, COPY));
  const nSel = T.filter((t) => f >= t + 2).length;
  const bar = sp(T[0] + 4, 15, 170) * (1 - lin(f, PHONE - 20, PHONE - 6));
  const dl = sp(DL + 6, 15, 190) * (1 - lin(f, 236, 248));
  const fmt = f < PDF + 2 ? 0 : 1;
  const done = lin(f, GO + 6, GO + 12);
  const sh = sp(SH + 6, 15, 190) * (1 - lin(f, PHONE - 20, PHONE - 6));
  const copied = lin(f, COPY + 4, COPY + 10);
  const sceneOut = lin(f, PHONE - 24, PHONE + 4);
  const phone = sp(PHONE - 6, 16, 120);
  const cap = f < DL ? 0 : f < SH - 6 ? 1 : 2;
  const modal = (o: number, w: number, children: React.ReactNode) => (
    <AbsoluteFill style={{ background: `rgba(30,34,42,${0.32 * o})`, alignItems: "center", justifyContent: "center", zIndex: 30 }}>
      <div style={{ width: w, background: "#fff", borderRadius: 26, boxShadow: "0 40px 100px rgba(13,22,48,0.3)", padding: "34px 38px", boxSizing: "border-box", fontFamily: UI, opacity: Math.min(1, o * 1.4), transform: `translateY(${(1 - o) * 30}px) scale(${0.94 + 0.06 * o})` }}>{children}</div>
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <AbsoluteFill style={{ opacity: 1 - sceneOut, transform: `scale(${1 - 0.06 * sceneOut})`, filter: sceneOut > 0.01 ? `blur(${sceneOut * 8}px)` : undefined }}>
        <Plane keys={keys} layers={[{ src: "l-reader", from: 0 }]} cy={640}>
          <div style={{ position: "absolute", left: 573, top: 218, width: 1282, height: 990, background: "#fff", padding: "14px 60px 0 48px", boxSizing: "border-box", overflow: "hidden" }}>
            <div style={ART_P}>Названия государства «Республика Узбекистан» и «Узбекистан» равнозначны.</div>
            {COL_ARTS.map(([n, ps], i) => {
              const on = i < 3 ? sp(T[i], 10, 260) * (f >= T[i] ? 1 : 0) : 0;
              const e = lin(f, 8 + i * 4, 20 + i * 4);
              return (
                <div key={n} style={{ marginTop: 14, position: "relative" }}>
                  <div style={{ position: "relative", height: 48, display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ opacity: e, transform: `scale(${0.6 + 0.4 * e})` }}><Tick on={on} /></div>
                    <div style={{ fontFamily: UI, fontWeight: 900, fontSize: 29, color: "#1a237e" }}>Статья {n}.</div>
                  </div>
                  {ps.map((t, k) => <div key={k} style={{ ...ART_P, position: "relative", marginTop: 8 }}>{t}</div>)}
                </div>
              );
            })}
          </div>
        </Plane>
        {/* selection bar */}
        <div style={{ position: "absolute", left: 960 - 470, top: BAR_Y - 46, width: 940, height: 92, borderRadius: 24, background: "#fff", boxShadow: "0 24px 60px rgba(13,22,48,0.22)", display: "flex", alignItems: "center", gap: 18, padding: "0 20px 0 30px", boxSizing: "border-box", fontFamily: UI, opacity: Math.min(1, bar * 1.4), transform: `translateY(${(1 - bar) * 80}px)`, zIndex: 20 }}>
          <Tick on={1} size={30} />
          <div style={{ fontWeight: 900, fontSize: 26, color: INK, flex: 1, whiteSpace: "nowrap" }}>Выбрано: {Math.max(1, nSel)} {nSel >= 2 ? "статьи" : "статья"}</div>
          <div style={{ height: 58, padding: "0 24px", borderRadius: 16, border: "2.5px solid #1cb0f6", color: "#1cb0f6", display: "flex", alignItems: "center", gap: 10, fontWeight: 900, fontSize: 22, letterSpacing: "0.04em", boxSizing: "border-box" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1cb0f6" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>СКАЧАТЬ
          </div>
          <div style={{ height: 58, padding: "0 24px", borderRadius: 16, background: "#1cb0f6", boxShadow: "0 4px 0 #1899d6", color: "#fff", display: "flex", alignItems: "center", gap: 10, fontWeight: 900, fontSize: 22, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg>ПОДЕЛИТЬСЯ ССЫЛКОЙ
          </div>
        </div>
        {/* download: format picker */}
        {dl > 0.01 ? modal(dl, 640, <>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 900, fontSize: 32, color: INK }}>Скачать подборку</div><div style={{ marginTop: 4, fontWeight: 700, fontSize: 20, color: "#8a8f98" }}>3 статьи в одном файле</div></div>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "#1cb0f6", boxShadow: "0 4px 0 #1899d6", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg></div>
          </div>
          {FORMATS.map(([lb, c, name, sub], i) => (
            <div key={lb} style={{ marginTop: i ? 14 : 26, display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ width: 32, height: 32, borderRadius: 16, border: `2.5px solid ${i === fmt ? "#1cb0f6" : "#b9bec6"}`, background: i === fmt ? "#1cb0f6" : "#fff", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center" }}>{i === fmt ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg> : null}</div>
              <FileIc label={lb} c={c} />
              <div style={{ fontSize: 23, color: "#3c3c3c", lineHeight: 1.3 }}><b style={{ fontWeight: 800 }}>{name}</b> <span style={{ fontWeight: 600, color: "#6f7682" }}>{sub}</span></div>
            </div>
          ))}
          <div style={{ marginTop: 30, display: "flex", justifyContent: "flex-end" }}>
            <div style={{ height: 66, padding: "0 46px", borderRadius: 18, background: GREEN, boxShadow: `0 5px 0 ${GLIP}`, color: "#fff", display: "flex", alignItems: "center", gap: 12, fontWeight: 900, fontSize: 24, letterSpacing: "0.06em", transform: `scale(${1 - press(f, GO) * 0.05})` }}>
              {done > 0.5 ? <><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>ФАЙЛ СКАЧАН</> : "СКАЧАТЬ"}
            </div>
          </div>
        </>) : null}
        {/* share: one link */}
        {sh > 0.01 ? modal(sh, 660, <>
          <div style={{ fontWeight: 900, fontSize: 32, color: INK }}>Ссылка на подборку</div>
          <div style={{ marginTop: 4, fontWeight: 700, fontSize: 20, color: "#8a8f98" }}>Друг или студент откроет все 3 статьи в одном месте</div>
          <div style={{ marginTop: 26, display: "flex", gap: 12 }}>
            <div style={{ flex: 1, height: 64, borderRadius: 16, border: `2.5px solid ${copied > 0.5 ? GREEN : "#e6e9ee"}`, display: "flex", alignItems: "center", gap: 12, padding: "0 18px", fontWeight: 800, fontSize: 24, color: "#1cb0f6", boxSizing: "border-box" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1cb0f6" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg>veoskill.uz/s/k7Qm2
            </div>
            <div style={{ height: 64, padding: "0 26px", borderRadius: 16, background: copied > 0.5 ? GREEN : "#1cb0f6", boxShadow: `0 4px 0 ${copied > 0.5 ? GLIP : "#1899d6"}`, color: "#fff", display: "flex", alignItems: "center", fontWeight: 900, fontSize: 21, letterSpacing: "0.04em", whiteSpace: "nowrap", transform: `scale(${1 - press(f, COPY) * 0.05})` }}>{copied > 0.5 ? "СКОПИРОВАНО" : "КОПИРОВАТЬ"}</div>
          </div>
        </>) : null}
        {f >= 12 && f < PHONE - 10 ? <div style={{ position: "absolute", inset: 0, zIndex: 40 }}><Pointer x={px} y={py} down={down} op={lin(f, 12, 22)} /></div> : null}
        <div style={{ position: "absolute", inset: 0, zIndex: 45 }}>
          {cap === 0 ? <TopCap key="c0" lines={["Выдели нужные статьи."]} at={8} /> : cap === 1 ? <TopCap key="c1" lines={["Скачай одним файлом:", "Word, PDF, TXT, HTML."]} at={DL} accent="Word, PDF, TXT, HTML." /> : <TopCap key="c2" lines={["Отправь", "одной ссылкой."]} at={SH - 4} accent="одной ссылкой." />}
          <Top />
        </div>
      </AbsoluteFill>
      {/* the friend opens the link on a phone */}
      {f >= PHONE - 10 ? (
        <AbsoluteFill style={{ background: "#ffffff" }}>
          <Top />
          {/* after the collection has opened, move in on the phone so the articles can be read */}
          <AbsoluteFill style={{ transformOrigin: "1415px 120px", transform: `translateX(${-455 * lin(f, PHONE + 96, PHONE + 140)}px) scale(${1 + 0.62 * lin(f, PHONE + 96, PHONE + 140)})` }}>
          <div style={{ position: "absolute", left: 150, top: 380, opacity: 1 - lin(f, PHONE + 96, PHONE + 120) }}>
            <Cap text="Друг откроет" at={PHONE + 4} size={84} />
            <Cap text="всё в одном месте." at={PHONE + 14} size={84} accent="всё в одном месте." />
            <div style={{ marginTop: 16, fontFamily: HEAD, fontWeight: 600, fontSize: 34, color: "#6f7682", opacity: lin(f, PHONE + 30, PHONE + 46) }}>Удобно для учёбы и преподавателей.</div>
          </div>
          {/* paper plane: the link flies from the text to the phone */}
          {(() => {
            const t = lin(f, PHONE + 8, PHONE + 44, 0, 1, Easing.bezier(0.45, 0, 0.3, 1));
            if (t <= 0 || t >= 1) return null;
            const x = 560 + (1300 - 560) * t, y = 760 - Math.sin(t * Math.PI) * 260 - 240 * t;
            return <div style={{ position: "absolute", left: x - 34, top: y - 34, transform: `rotate(${-20 + 30 * t}deg) scale(${1 - 0.3 * t})`, opacity: 1 - lin(t, 0.85, 1) }}><PlaneIc size={68} /></div>;
          })()}
          <div style={{ position: "absolute", left: 1180, top: 60, width: 470, height: 960, borderRadius: 64, background: "#0d1630", padding: 14, boxSizing: "border-box", boxShadow: "0 50px 120px rgba(13,22,48,0.3)", transform: `translateY(${(1 - phone) * 300}px) rotate(${(1 - phone) * 6}deg)`, opacity: Math.min(1, phone * 1.5) }}>
            <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 52, background: "#fff", overflow: "hidden", fontFamily: UI }}>
              <div style={{ height: 40, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 30px", fontWeight: 800, fontSize: 16, color: INK }}><span>9:41</span><span style={{ width: 110, height: 28, borderRadius: 14, background: "#0d1630" }} /><span>5G</span></div>
              {/* site header, mobile layout */}
              <div style={{ margin: "4px 6px 0", background: "#1cb0f6", color: "#fff" }}>
                <div style={{ padding: "10px 14px", display: "flex", alignItems: "center" }}>
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 10, letterSpacing: "0.12em", opacity: 0.85 }}>ПОДБОРКА СТАТЕЙ</div><div style={{ fontWeight: 900, fontSize: 15 }}>Конституция Республики Узбекистан</div></div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
                </div>
                <div style={{ display: "flex", borderTop: "1px solid rgba(255,255,255,0.35)" }}>
                  <div style={{ flex: 1, padding: "8px 14px", borderRight: "1px solid rgba(255,255,255,0.35)" }}><div style={{ fontWeight: 800, fontSize: 10, letterSpacing: "0.12em", opacity: 0.85 }}>ВЫБРАНО</div><div style={{ fontWeight: 900, fontSize: 15 }}>3 СТАТЬИ</div></div>
                  {["flag", "doc", "filter", "heart", "set"].map((k) => (
                    <div key={k} style={{ width: 44, display: "flex", alignItems: "center", justifyContent: "center", borderRight: k === "set" ? undefined : "1px solid rgba(255,255,255,0.35)" }}>
                      {k === "flag" ? <Img src={staticFile("flags/c-ru.svg")} style={{ width: 22, height: 22, borderRadius: 11, border: "1.5px solid #fff" }} /> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">{k === "doc" ? <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6" /></> : k === "filter" ? <path d="M3 4h18l-7 8v7l-4 2v-9z" /> : k === "heart" ? <path d="M12 20s-7-4.4-8.6-8.8C2.3 8 4.4 5 7.6 5c1.9 0 3.4 1 4.4 2.6C13 6 14.5 5 16.4 5c3.2 0 5.3 3 4.2 6.2C19 15.6 12 20 12 20z" /> : <path d="M4 7h10M18 7h2M4 17h4M12 17h8M14 5v4M8 15v4" />}</svg>}
                    </div>
                  ))}
                </div>
                <div style={{ padding: "8px 10px 10px" }}><div style={{ height: 34, background: "#fff", display: "flex", alignItems: "center", gap: 8, padding: "0 10px", color: "#9aa1ab", fontWeight: 600, fontSize: 13 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1cb0f6" strokeWidth="2.8" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>Поиск по всей базе законов</div></div>
              </div>
              {/* "sent to you" strip with the paper plane */}
              <div style={{ margin: "10px 10px 0", borderRadius: 12, background: "#e3f4fd", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", fontWeight: 800, fontSize: 14, color: "#0d6fa3", opacity: lin(f, PHONE + 40, PHONE + 50), transform: `translateY(${(1 - lin(f, PHONE + 40, PHONE + 52)) * -10}px)` }}>
                <PlaneIc size={22} />Вам отправили подборку · 3 статьи
              </div>
              <div style={{ padding: "8px 12px 0" }}>
                {COL_ARTS.slice(0, 3).map(([n, ps], i) => {
                  const e = sp(PHONE + 48 + i * 10, 15, 170);
                  return (
                    <div key={n} style={{ marginTop: 6, opacity: Math.min(1, e * 1.4), transform: `translateY(${(1 - e) * 24}px)` }}>
                      <div style={{ height: 34, display: "flex", alignItems: "center", gap: 8 }}><Heart on={0} size={19} /><div style={{ fontWeight: 900, fontSize: 18, color: "#1a237e" }}>Статья {n}.</div></div>
                      {ps.map((t, k) => <div key={k} style={{ marginTop: 3, fontWeight: 500, fontSize: 15.5, lineHeight: 1.5, color: "#2b2b2b", textAlign: "justify", textIndent: 22 }}>{t}</div>)}
                    </div>
                  );
                })}
              </div>
              {/* bottom tab bar as on the site */}
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 74, background: "#fff", borderTop: "1px solid #eef0f3", display: "flex", alignItems: "center", justifyContent: "space-around", paddingBottom: 8 }}>
                {[["icons_hub_home.webp", "Кабинет"], ["stickers_module.webp", "Модули"], ["icons_duel_scales.webp", "Законы"], ["icons_hub_forum.webp", "Форум"], ["", "Ещё"]].map(([ic, t]) => (
                  <div key={t} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, fontWeight: t === "Законы" ? 900 : 600, fontSize: 11, color: t === "Законы" ? INK : "#9aa1ab" }}>
                    {ic ? <Img src={staticFile(`site/${ic}`)} style={{ width: 30, height: 30, objectFit: "contain" }} /> : <div style={{ width: 28, height: 28, borderRadius: 14, background: "#c86cf0", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M5 7h14M5 12h14M5 17h14" /></svg></div>}
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}
      {/* toast after copy */}
      {f >= COPY + 6 && f < PHONE - 10 ? <Toast text="Ссылка скопирована" at={COPY + 6} /> : null}
    </AbsoluteFill>
  );
};
/** Search: "ФИЛЬТР" opens "Фильтр и поиск", type a word, "НАЙТИ", loading, then the results list (as on veoskill.uz/laws/search). */
const SB = "#1f6fb5"; // the search page's darker blue
const RESULTS: [string, string][] = [
  ["О внесении изменений и дополнений в некоторые законодательные акты Республики Узбекистан в связи с принятием закона Республики Узбекистан «О судебной экспертизе»", "«Эксперт имеет право: знакомиться с материалами дела, относящимися к предмету экспертизы, выписывать из них необходимые сведения и…"],
  ["Бюджетный кодекс Республики Узбекистан", "принимает нормативно-правовые акты по вопросам, входящим в ее полномочия."],
  ["Водный кодекс Республики Узбекистан", "…цию и техническое обслуживание водохозяйственных объектов, наделенное правом забора и доставки воды водопользователям на договорной основе;"],
  ["Воздушный кодекс Республики Узбекистан", "…е, общественные и иные негосударственные организации и граждане имеют право принимать участие в разработке и осуществлении мероприятий…"],
  ["Гражданский кодекс Республики Узбекистан", "…право собственности на имущество, приобретенное по основаниям, не запрещенным законом…"],
  ["Земельный кодекс Республики Узбекистан", "…право постоянного владения и пользования земельным участком…"],
];
const markWord = (t: string, w: string) => {
  const parts = t.split(new RegExp(`(${w}[а-яё]*)`, "gi"));
  return parts.map((p, i) => (i % 2 ? <mark key={i} style={{ background: "rgba(255,212,59,0.55)", color: "inherit", borderRadius: 4, padding: "0 2px" }}>{p}</mark> : p));
};
const Sel: React.FC<{ label: string; value: string; ph?: boolean; w?: number; active?: number }> = ({ label, value, ph, active = 0 }) => (
  <div style={{ flex: 1 }}>
    <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: "0.1em", color: "#5d6470" }}>{label}</div>
    <div style={{ marginTop: 8, height: 50, border: `2px solid ${active > 0.5 ? SB : "#cfd8e3"}`, display: "flex", alignItems: "center", padding: "0 16px", fontWeight: 600, fontSize: 19, color: ph ? "#9aa1ab" : "#2b2b2b", boxSizing: "border-box" }}>
      <span style={{ flex: 1 }}>{value}</span>
      {ph ? null : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2b2b2b" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>}
    </div>
  </div>
);
export const Search: React.FC = () => {
  const f = useCurrentFrame();
  const sp = useSp();
  const FILT = 40, TYPE0 = 62, FIND = 112, LOAD = 128, RES = 176, ALL = 196;
  const WORD = "право";
  const typed = WORD.slice(0, Math.max(0, Math.min(WORD.length, Math.floor((f - TYPE0) / 4))));
  const keys: CK[] = [{ at: 0, x: 1300, y: 300, s: 1.2 }];
  const modal = sp(FILT + 6, 15, 190) * (1 - lin(f, FIND + 6, FIND + 16));
  const page = lin(f, LOAD - 4, LOAD + 10);
  const res = lin(f, RES, RES + 12);
  const scroll = lin(f, 228, 334, 0, 520, Easing.bezier(0.45, 0, 0.35, 1));
  // pointer (screen space): ФИЛЬТР in the toolbar, the word field, НАЙТИ, then ВЫБРАТЬ ВСЕ
  const pk = [10, FILT - 6, FILT + 8, TYPE0 - 8, FIND - 6, FIND + 8, RES + 4, ALL - 6, ALL + 10, 260];
  const pxs = [1500, 1355, 1355, 900, 1150, 1150, 1500, 1572, 1572, 1760];
  const pys = [560, 368, 368, 330, 840, 840, 700, 632, 632, 760];
  const px = interpolate(f, pk, pxs, { ...cl, easing: IOE }), py = interpolate(f, pk, pys, { ...cl, easing: IOE });
  const down = Math.max(press(f, FILT), press(f, FIND), press(f, ALL));
  const caret = Math.floor(f / 8) % 2 === 0;
  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      {/* reader with the toolbar, dimmed under the modal */}
      <AbsoluteFill style={{ opacity: 1 - page }}>
        <Plane keys={keys} layers={[{ src: "l-reader", from: 0 }]} cy={640} />
        <AbsoluteFill style={{ background: `rgba(30,34,42,${0.4 * Math.min(1, modal * 1.2)})` }} />
      </AbsoluteFill>
      {modal > 0.01 ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 800, background: "#fff", padding: "30px 30px 34px", boxSizing: "border-box", fontFamily: UI, boxShadow: "0 40px 100px rgba(13,22,48,0.3)", opacity: Math.min(1, modal * 1.4), transform: `translateY(${(1 - modal) * 30}px) scale(${0.95 + 0.05 * modal})` }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ flex: 1, fontWeight: 900, fontSize: 36, color: INK }}>Фильтр и поиск</div>
              <div style={{ width: 58, height: 58, background: SB, display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg></div>
            </div>
            <div style={{ marginTop: 14, fontWeight: 800, fontSize: 15, letterSpacing: "0.1em", color: "#5d6470" }}>СЛОВО ИЛИ ФРАЗА В ТЕКСТЕ</div>
            <div style={{ marginTop: 8, height: 54, border: `2px solid ${f >= TYPE0 - 6 ? SB : "#cfd8e3"}`, display: "flex", alignItems: "center", padding: "0 18px", fontWeight: 700, fontSize: 24, color: "#2b2b2b", boxSizing: "border-box" }}>
              {typed}{f >= TYPE0 - 6 && f < FIND ? <span style={{ display: "inline-block", width: 2, height: 28, marginLeft: 2, background: caret ? SB : "transparent" }} /> : null}
            </div>
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10, fontWeight: 600, fontSize: 16, color: "#3c3c3c" }}><div style={{ width: 22, height: 22, borderRadius: 11, border: "2px solid #9aa1ab" }} />Точное соответствие</div>
            <div style={{ marginTop: 16, display: "flex", gap: 18 }}><Sel label="НОМЕР АКТА" value="Например, ЗРУ-588" ph /><Sel label="ВИД АКТА" value="Все виды" /></div>
            <div style={{ marginTop: 14, display: "flex", gap: 18 }}><Sel label="ГДЕ ИСКАТЬ СЛОВО" value="Везде в тексте" /><Sel label="СТАТУС" value="Действует" /></div>
            <div style={{ marginTop: 14, display: "flex", gap: 18 }}><Sel label="ЯЗЫК АКТА" value="Русский" /><Sel label="СОРТИРОВКА" value="По названию" /></div>
            <div style={{ marginTop: 22, display: "flex", gap: 16 }}>
              <div style={{ flex: 1, height: 60, background: "#f2b3ab", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 20, letterSpacing: "0.08em" }}>ОЧИСТИТЬ</div>
              <div style={{ flex: 1, height: 60, background: SB, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 20, letterSpacing: "0.08em", transform: `scale(${1 - press(f, FIND) * 0.04})` }}>НАЙТИ</div>
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
      {/* results page */}
      {page > 0.01 ? (
        <AbsoluteFill style={{ background: "#fff", opacity: page, fontFamily: UI }}>
          <div style={{ position: "absolute", left: 240, right: 240, top: 380 - scroll }}>
            <div style={{ fontWeight: 900, fontSize: 21, letterSpacing: "0.06em", color: SB }}>УТОЧНИТЬ РЕЗУЛЬТАТЫ ПО:</div>
            <div style={{ marginTop: 14, display: "flex", gap: 18 }}>{["По годам", "По месяцам", "По видам", "По статусу"].map((t) => <div key={t} style={{ flex: 1 }}><Sel label="" value={t} /></div>)}</div>
            <div style={{ marginTop: 14, height: 52, border: "2px solid #cfd8e3", display: "flex", alignItems: "center", padding: "0 18px", fontWeight: 600, fontSize: 19, color: "#9aa1ab" }}>Слово в названии акта</div>
            <div style={{ marginTop: 26, height: 2, background: "#e6e9ee" }} />
            {f < RES ? (
              <div style={{ marginTop: 28 }}>
                <div style={{ fontWeight: 800, fontSize: 24, color: SB }}>Ищем в базе законов{".".repeat(1 + (Math.floor(f / 8) % 3))}</div>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ marginTop: 30 }}>
                    {[0.66, 0.5, 0.83].map((w, k) => <div key={k} style={{ marginTop: 12, width: `${w * 100}%`, height: 18, borderRadius: 9, background: `linear-gradient(90deg, #e8f1fa, #f6f9fd ${(f * 3 + i * 20) % 100}%, #e8f1fa)` }} />)}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ opacity: res }}>
                <div style={{ marginTop: 26, display: "flex", alignItems: "center" }}>
                  <div style={{ flex: 1, fontWeight: 800, fontSize: 27, color: SB }}>По запросу «право» найдено 40 документов</div>
                  <div style={{ height: 60, padding: "0 28px", background: SB, color: "#fff", display: "flex", alignItems: "center", fontWeight: 900, fontSize: 20, letterSpacing: "0.06em", transform: `scale(${1 - press(f, ALL) * 0.05})` }}>ВЫБРАТЬ ВСЕ</div>
                </div>
                <div style={{ marginTop: 10, fontWeight: 600, fontSize: 18, color: "#6f7682" }}>Показаны первые 40 документов. Уточните условия, чтобы увидеть остальные.</div>
                {RESULTS.map(([title, snip], i) => {
                  const e = lin(f, RES + 4 + i * 4, RES + 14 + i * 4);
                  const on = f >= ALL + 4 + i * 3 ? sp(ALL + 4 + i * 3, 10, 260) : 0;
                  return (
                    <div key={i} style={{ marginTop: 18, paddingTop: 22, borderTop: "2px solid #eef0f3", display: "flex", gap: 22, opacity: e, transform: `translateY(${(1 - e) * 16}px)` }}>
                      <div style={{ width: 26, fontWeight: 700, fontSize: 22, color: "#3c3c3c", paddingTop: 4 }}>{i + 1}</div>
                      <div style={{ width: 34, height: 34, borderRadius: 17, border: `2.5px solid ${on > 0.5 ? "#2f7be6" : "#9aa1ab"}`, background: on > 0.5 ? "#2f7be6" : "#fff", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transform: `scale(${1 + 0.25 * Math.sin(Math.min(1, on) * Math.PI)})` }}>{on > 0.5 ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg> : null}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 24, lineHeight: 1.35, color: SB }}>{title}</div>
                        <div style={{ marginTop: 8, fontWeight: 500, fontSize: 19, lineHeight: 1.6, color: "#2b2b2b" }}>{markWord(snip, "прав")}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 18, paddingTop: 2 }}>
                        <div style={{ fontWeight: 800, fontSize: 19, color: "#2e9d3a", paddingTop: 4 }}>Действует</div>
                        <FileIc label="PDF" c="#e5322d" />
                        <div style={{ width: 34, height: 34, borderRadius: 6, background: "#1f4e9c", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18, fontFamily: "Arial" }}>W</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <TopCap lines={["Найди закон по слову.", "Сразу по всей базе."]} at={LOAD} accent="Сразу по всей базе." />
          <Top />
        </AbsoluteFill>
      ) : null}
      {f >= 10 && f < 262 ? <Pointer x={px} y={py} down={down} op={lin(f, 10, 20) * (1 - lin(f, 248, 262))} /> : null}
      {page < 0.5 ? <Top /> : null}
    </AbsoluteFill>
  );
};
/** AI: the site's "Объяснение статьи" window (same layout as veoskill.uz): loading, then three blocks written in. */
const EXPL: [string, string, string, boolean][] = [
  ["target.svg", "КОРОТКО", "Первая статья определяет главные основы государства. Узбекистан признается независимой страной с выборной властью, подчинением закону и заботой о гражданах, а его короткое и полное названия имеют равную силу.", true],
  ["document.svg", "ПРОСТЫМИ СЛОВАМИ", "Эта статья закрепляет главные правила жизни страны. Узбекистан полностью независим во внутренних делах и внешней политике, а его руководство избирается гражданами на определенный срок. Государство действует строго по закону, ставит интересы человека на первое место и заботится о нуждающихся. Вы можете использовать названия Узбекистан и Республика Узбекистан как абсолютно равные.", false],
  ["customer-file.svg", "ПРИМЕР ИЗ ЖИЗНИ", "Дилшод заполняет документы для открытия мастерской в Ташкенте. В одном бланке он написал «Узбекистан», а в другом «Республика Узбекистан». Специалист центра государственных услуг без замечаний принял оба документа: закон гарантирует, что оба названия равнозначны.", false],
];
/** AI mark: a friendly robot head (antenna, eyes that blink, smile); `spin` tilts it a little. */
export const AiIcon: React.FC<{ size: number; color?: string; spin?: number; blink?: number }> = ({ size, color = "#1cb0f6", spin = 0, blink = 0 }) => {
  const face = color === "#fff" ? "#1cb0f6" : "#fff";
  const eyeH = 7 * (1 - 0.85 * blink);
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ transform: `rotate(${spin}deg)` }}>
      <line x1="24" y1="4.5" x2="24" y2="11" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="24" cy="4.5" r="3.2" fill={color} />
      <rect x="2.5" y="21" width="5" height="11" rx="2.5" fill={color} />
      <rect x="40.5" y="21" width="5" height="11" rx="2.5" fill={color} />
      <rect x="7" y="11" width="34" height="30" rx="10" fill={color} />
      <rect x="11.5" y="16" width="25" height="16" rx="6" fill={face} />
      <rect x="16" y={24 - eyeH / 2} width="5" height={eyeH} rx="2.5" fill={color} />
      <rect x="27" y={24 - eyeH / 2} width="5" height={eyeH} rx="2.5" fill={color} />
      <path d="M19 36.5c2.8 2 7.2 2 10 0" stroke={face} strokeWidth="2.4" strokeLinecap="round" fill="none" />
    </svg>
  );
};
/** blink pulse: 1 for a few frames every ~1.6 s */
export const blinkAt = (f: number) => { const m = f % 96; return m < 6 ? Math.sin((m / 6) * Math.PI) : 0; };
export const AIReal: React.FC = () => {
  const f = useCurrentFrame();
  const sp = useSp();
  const MX = 400, MY = 290, MW = 1120;
  // camera follows the answer as it types: close in on each block and glide down with the typed line,
  // then pull back to the whole window. The path is piecewise linear and then averaged over +-16 frames,
  // so the move never stops and starts between keys.
  const P: [number, number, number][] = [[0, 470, 0.96], [66, 480, 0.96], [100, 470, 1.14], [146, 575, 1.14], [156, 680, 1.14], [198, 860, 1.14], [210, 990, 1.14], [252, 1110, 1.14], [270, 1110, 1.14], [298, 760, 0.86]];
  const path = (t: number, k: 1 | 2) => interpolate(t, P.map((p) => p[0]), P.map((p) => p[k]), cl);
  const avg = (k: 1 | 2) => { let a = 0; for (let d = -16; d <= 16; d++) a += path(f + d, k); return a / 33; };
  const c = { x: 960, y: avg(1), s: avg(2) };
  const open = sp(4, 15, 170);
  const load = lin(f, 14, 26) * (1 - lin(f, 88, 98));
  const BL = [100, 152, 206];
  const capOut = lin(f, 80, 102);
  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      {/* the reader behind, dimmed like the site overlay, slower parallax than the window */}
      <AbsoluteFill style={{ transformOrigin: "50% 0", transform: `translateY(${-(c.y - 640) * 0.12}px) scale(${1.06 + (c.s - 1) * 0.3})` }}>
        <Img src={SHOT("l-reader")} style={{ width: 1920, height: 1200, objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "rgba(60,64,72,0.38)" }} />
      <AbsoluteFill style={{ transformOrigin: "0 0", transform: `translate(${960 - c.s * c.x}px, ${560 - c.s * c.y}px) scale(${c.s})` }}>
        <div style={{ position: "absolute", left: MX, top: MY, width: MW, minHeight: 820, borderRadius: 24, background: "#fff", boxShadow: "0 40px 120px rgba(13,22,48,0.35)", padding: "36px 44px 40px", boxSizing: "border-box", fontFamily: UI, color: "#3c3c3c", opacity: Math.min(1, open * 1.5), transform: `translateY(${(1 - open) * 60}px) scale(${0.94 + 0.06 * open})` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ fontWeight: 800, fontSize: 36, letterSpacing: "-0.01em" }}>Объяснение статьи (Статья 1)</div>
              <AiIcon size={44} blink={blinkAt(f)} />
            </div>
            <div style={{ display: "flex", gap: 14 }}>
              <div style={{ width: 54, height: 54, borderRadius: 14, background: "#ddf4ff", color: "#1cb0f6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 28 }}>?</div>
              <div style={{ width: 54, height: 54, borderRadius: 14, background: "#1cb0f6", boxShadow: "0 4px 0 #1899d6", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg></div>
            </div>
          </div>
          {load > 0.01 ? (
            <div style={{ position: "absolute", left: 0, right: 0, top: 250, display: "flex", flexDirection: "column", alignItems: "center", opacity: load }}>
              <div style={{ width: 150, height: 150, borderRadius: "50%", background: `radial-gradient(closest-side, rgba(28,176,246,${0.18 + 0.1 * Math.sin(f / 7)}), transparent)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AiIcon size={110} spin={Math.sin(f / 9) * 6} blink={blinkAt(f + 40)} />
              </div>
              <div style={{ marginTop: 14, fontWeight: 800, fontSize: 30 }}>Искусственный интеллект разбирает статью{".".repeat(1 + (Math.floor(f / 8) % 3))}</div>
              <div style={{ marginTop: 8, fontWeight: 600, fontSize: 22, color: "#8a8f98" }}>Ответ генерируется</div>
            </div>
          ) : null}
          <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 34 }}>
            {EXPL.map(([ic, title, text, bold], i) => {
              const at = BL[i];
              const e = sp(at, 15, 170);
              const line = lin(f, at + 6, at + 40, 0, 1, OUTE);
              return (
                <div key={title} style={{ display: "flex", gap: 22, opacity: f >= at ? 1 : 0 }}>
                  <div style={{ width: 44, display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    <Img src={staticFile(`site/${ic}`)} style={{ width: 44, height: 44, transform: `scale(${e})` }} />
                    <div style={{ marginTop: 10, width: 3, flex: 1, borderRadius: 2, background: "rgba(28,176,246,0.25)", transformOrigin: "50% 0", transform: `scaleY(${line})` }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 44, display: "flex", alignItems: "center", fontWeight: 800, fontSize: 18, letterSpacing: "0.08em", color: "#8a8f98", opacity: e, transform: `translateX(${(1 - e) * 20}px)` }}>{title}</div>
                    <div style={{ marginTop: 8, fontWeight: bold ? 700 : 600, fontSize: 24, lineHeight: 1.62, textAlign: "justify", hyphens: "auto" }} lang="ru">
                      {(() => {
                        const n = Math.round(lin(f, at + 4, at + 44, 0, text.length, Easing.linear));
                        const typing = f >= at + 4 && f < at + 54;
                        return (<>
                          {text.slice(0, n)}
                          {typing ? <span style={{ display: "inline-block", width: 12, height: 26, marginLeft: 3, verticalAlign: "-4px", borderRadius: 3, background: "#1cb0f6", opacity: Math.floor(f / 8) % 2 === 0 ? 1 : 0.25 }} /> : null}
                          <span style={{ color: "transparent" }}>{text.slice(n)}</span>
                        </>);
                      })()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
      <TopCap lines={["Непонятная статья?", "Объяснит искусственный интеллект."]} at={8} hold={78} accent="искусственный интеллект." />
      <Top />
    </AbsoluteFill>
  );
};

// ================= languages =================
const LANGS: [string, string, "ru" | "uz" | "en"][] = [["Русский", "v4/flag-ru.svg", "ru"], ["O‘zbekcha", "v4/flag-uz.svg", "uz"], ["English", "v4/flag-en.svg", "en"]];
// languages: the site's law reader page (blue toolbar, breadcrumbs with home, A4 sheet); left a list of all
// languages scrolling inside, the article runs quickly and smoothly through 15 languages
const FL = (c: string) => staticFile(`flags/${c}.svg`);
type LDoc = { c: string; n: string; code: string; doc: string; st: string; arts: [string, string][]; rtl?: boolean };
const LD: LDoc[] = [
  { c: "ru", n: "Русский", code: "RU", doc: "КОНСТИТУЦИЯ РЕСПУБЛИКИ УЗБЕКИСТАН", st: "Документ действует, актуальная редакция", arts: [["Статья 1.", `${ART.ru.p1} ${ART.ru.p2}`], ["Статья 2.", "Государство выражает волю народа и служит его интересам. Государственные органы и должностные лица ответственны перед обществом и гражданами."], ["Статья 3.", "Республика Узбекистан определяет своё административно-территориальное устройство, систему органов государственной власти и управления, проводит внутреннюю и внешнюю политику. Государственная граница и территория Узбекистана неприкосновенны и неделимы."], ["Статья 4.", "Государственным языком Республики Узбекистан является узбекский язык. Республика Узбекистан обеспечивает уважительное отношение к языкам, обычаям и традициям наций и народностей, проживающих на её территории, и создаёт условия для их развития."], ["Статья 5.", "Республика Узбекистан имеет государственные символы: Флаг, Герб и Гимн, утверждаемые законом."], ["Статья 6.", "Столицей Республики Узбекистан является город Ташкент."], ["Статья 7.", "Народ является единственным источником государственной власти."], ["Статья 8.", "Народ Узбекистана составляют граждане Республики Узбекистан независимо от их национальности."], ["Статья 9.", "Наиболее важные вопросы общественной и государственной жизни выносятся на обсуждение народа и ставятся на всенародное голосование (референдум)."], ["Статья 10.", "От имени народа Узбекистана могут выступать только избранные им Олий Мажлис и Президент Республики."]] },
  { c: "uz", n: "O‘zbekcha", code: "UZ", doc: "O‘ZBEKISTON RESPUBLIKASI KONSTITUTSIYASI", st: "Hujjat amalda, amaldagi tahrir", arts: [["1-modda.", `${ART.uz.p1} ${ART.uz.p2}`], ["2-modda.", "Davlat xalq irodasini ifoda etib, uning manfaatlariga xizmat qiladi. Davlat organlari va mansabdor shaxslar jamiyat va fuqarolar oldida mas’uldirlar."], ["3-modda.", "O‘zbekiston Respublikasi o‘zining ma’muriy-hududiy tuzilishini, davlat hokimiyati va boshqaruv organlari tizimini belgilaydi, ichki va tashqi siyosatini amalga oshiradi. O‘zbekistonning davlat chegarasi va hududi daxlsiz va bo‘linmasdir."], ["4-modda.", "O‘zbekiston Respublikasining davlat tili o‘zbek tilidir. O‘zbekiston Respublikasi o‘z hududida istiqomat qiluvchi millat va elatlarning tillari, urf-odatlari va an’analari hurmat qilinishini ta’minlaydi, ularning rivojlanishi uchun sharoit yaratadi."], ["5-modda.", "O‘zbekiston Respublikasi qonun bilan tasdiqlanadigan davlat ramzlariga ega: Bayroq, Gerb va Madhiya."], ["6-modda.", "O‘zbekiston Respublikasining poytaxti Toshkent shahridir."], ["7-modda.", "Xalq davlat hokimiyatining birdan bir manbaidir."], ["8-modda.", "O‘zbekiston xalqini millatidan qat’i nazar, O‘zbekiston Respublikasining fuqarolari tashkil etadi."], ["9-modda.", "Jamiyat va davlat hayotining eng muhim masalalari xalq muhokamasiga taqdim etiladi, umumiy ovozga (referendumga) qo‘yiladi."], ["10-modda.", "O‘zbekiston xalqi nomidan faqat u saylagan Oliy Majlis va Respublika Prezidenti ish olib borishi mumkin."]] },
  { c: "gb", n: "English", code: "EN", doc: "CONSTITUTION OF THE REPUBLIC OF UZBEKISTAN", st: "Document in force, current version", arts: [["Article 1.", `${ART.en.p1} ${ART.en.p2}`], ["Article 2.", "The State expresses the will of the people and serves their interests. State bodies and officials are accountable to society and citizens."], ["Article 3.", "The Republic of Uzbekistan determines its administrative and territorial structure and the system of state authorities and administration, and conducts its domestic and foreign policy. The state border and territory of Uzbekistan are inviolable and indivisible."], ["Article 4.", "The state language of the Republic of Uzbekistan is Uzbek. The Republic of Uzbekistan ensures respect for the languages, customs and traditions of the nations and peoples living on its territory and creates conditions for their development."], ["Article 5.", "The Republic of Uzbekistan has state symbols approved by law: the Flag, the Emblem and the Anthem."], ["Article 6.", "The capital of the Republic of Uzbekistan is the city of Tashkent."], ["Article 7.", "The people are the sole source of state power."], ["Article 8.", "The people of Uzbekistan are made up of the citizens of the Republic of Uzbekistan, regardless of their nationality."], ["Article 9.", "The most important matters of public and state life are submitted for public discussion and put to a nationwide vote (referendum)."], ["Article 10.", "Only the Oliy Majlis and the President of the Republic, elected by the people, may act on behalf of the people of Uzbekistan."]] },
  { c: "kz", n: "Қазақша", code: "KZ", doc: "ӨЗБЕКСТАН РЕСПУБЛИКАСЫНЫҢ КОНСТИТУЦИЯСЫ", st: "Құжат күшінде", arts: [["1-бап.", "Өзбекстан республикалық басқару нысанындағы егемен, демократиялық, құқықтық, әлеуметтік және зайырлы мемлекет. «Өзбекстан Республикасы» және «Өзбекстан» атаулары бірдей мағыналы."], ["2-бап.", "Мемлекет халықтың еркін білдіреді және оның мүддесіне қызмет етеді. Мемлекеттік органдар мен лауазымды адамдар қоғам мен азаматтар алдында жауапты."], ["3-бап.", "Өзбекстан Республикасы өзінің әкімшілік-аумақтық құрылысын, мемлекеттік билік және басқару органдарының жүйесін айқындайды, ішкі және сыртқы саясатты жүргізеді. Өзбекстанның мемлекеттік шекарасы мен аумағы қол сұғылмайды және бөлінбейді."], ["4-бап.", "Өзбекстан Республикасының мемлекеттік тілі өзбек тілі болып табылады. Өзбекстан Республикасы өз аумағында тұратын ұлттар мен ұлыстардың тілдеріне, әдет-ғұрыптары мен дәстүрлеріне құрметпен қарауды қамтамасыз етеді және олардың дамуына жағдай жасайды."], ["5-бап.", "Өзбекстан Республикасының заңмен бекітілетін мемлекеттік рәміздері бар: Ту, Елтаңба және Әнұран."], ["6-бап.", "Өзбекстан Республикасының астанасы Ташкент қаласы болып табылады."], ["7-бап.", "Халық мемлекеттік биліктің бірден-бір қайнар көзі болып табылады."], ["8-бап.", "Өзбекстан халқын ұлтына қарамастан Өзбекстан Республикасының азаматтары құрайды."], ["9-бап.", "Қоғамдық және мемлекеттік өмірдің аса маңызды мәселелері халықтың талқылауына шығарылады және жалпыхалықтық дауыс беруге (референдумға) қойылады."], ["10-бап.", "Өзбекстан халқының атынан тек ол сайлаған Олий Мажлис пен Республика Президенті ғана сөйлей алады."]] },
  { c: "tr", n: "Türkçe", code: "TR", doc: "ÖZBEKİSTAN CUMHURİYETİ ANAYASASI", st: "Belge yürürlükte", arts: [["Madde 1.", "Özbekistan, cumhuriyet yönetim biçimine sahip egemen, demokratik, hukuk, sosyal ve laik bir devlettir. “Özbekistan Cumhuriyeti” ve “Özbekistan” adları eş anlamlıdır."], ["Madde 2.", "Devlet, halkın iradesini ifade eder ve onun çıkarlarına hizmet eder. Devlet organları ve görevliler topluma ve vatandaşlara karşı sorumludur."], ["Madde 3.", "Özbekistan Cumhuriyeti idari-bölgesel yapısını, devlet iktidarı ve yönetim organları sistemini belirler, iç ve dış politikasını yürütür. Özbekistan’ın devlet sınırı ve toprakları dokunulmaz ve bölünmezdir."], ["Madde 4.", "Özbekistan Cumhuriyeti’nin devlet dili Özbekçedir. Özbekistan Cumhuriyeti, topraklarında yaşayan millet ve halkların dillerine, örf, adet ve geleneklerine saygı gösterilmesini sağlar ve gelişmeleri için koşullar yaratır."], ["Madde 5.", "Özbekistan Cumhuriyeti’nin kanunla onaylanan devlet sembolleri vardır: Bayrak, Arma ve Marş."], ["Madde 6.", "Özbekistan Cumhuriyeti’nin başkenti Taşkent şehridir."], ["Madde 7.", "Halk, devlet iktidarının tek kaynağıdır."], ["Madde 8.", "Özbekistan halkını, milliyetlerine bakılmaksızın Özbekistan Cumhuriyeti vatandaşları oluşturur."], ["Madde 9.", "Toplumsal ve devlet hayatının en önemli meseleleri halkın tartışmasına sunulur ve halk oylamasına (referandum) götürülür."], ["Madde 10.", "Özbekistan halkı adına yalnızca onun seçtiği Oliy Meclis ve Cumhurbaşkanı hareket edebilir."]] },
  { c: "de", n: "Deutsch", code: "DE", doc: "VERFASSUNG DER REPUBLIK USBEKISTAN", st: "Dokument in Kraft", arts: [["Artikel 1.", "Usbekistan ist ein souveräner, demokratischer, sozialer und säkularer Rechtsstaat mit republikanischer Regierungsform. Die Bezeichnungen „Republik Usbekistan“ und „Usbekistan“ sind gleichbedeutend."], ["Artikel 2.", "Der Staat bringt den Willen des Volkes zum Ausdruck und dient seinen Interessen. Die staatlichen Organe und Amtsträger sind der Gesellschaft und den Bürgern gegenüber verantwortlich."], ["Artikel 3.", "Die Republik Usbekistan bestimmt ihre administrativ-territoriale Gliederung und das System der Organe der Staatsgewalt und Verwaltung und führt ihre Innen- und Außenpolitik. Die Staatsgrenze und das Staatsgebiet Usbekistans sind unverletzlich und unteilbar."], ["Artikel 4.", "Staatssprache der Republik Usbekistan ist Usbekisch. Die Republik Usbekistan gewährleistet die Achtung der Sprachen, Sitten und Traditionen der auf ihrem Gebiet lebenden Nationen und Völker und schafft Bedingungen für ihre Entwicklung."], ["Artikel 5.", "Die Republik Usbekistan hat durch Gesetz bestätigte Staatssymbole: Flagge, Wappen und Hymne."], ["Artikel 6.", "Hauptstadt der Republik Usbekistan ist die Stadt Taschkent."], ["Artikel 7.", "Das Volk ist die einzige Quelle der Staatsgewalt."], ["Artikel 8.", "Das Volk Usbekistans bilden die Bürger der Republik Usbekistan unabhängig von ihrer Nationalität."], ["Artikel 9.", "Die wichtigsten Fragen des gesellschaftlichen und staatlichen Lebens werden dem Volk zur Diskussion vorgelegt und einer Volksabstimmung (Referendum) unterzogen."], ["Artikel 10.", "Im Namen des Volkes Usbekistans dürfen nur der von ihm gewählte Olij Madschlis und der Präsident der Republik auftreten."]] },
  { c: "cn", n: "中文", code: "ZH", doc: "乌兹别克斯坦共和国宪法", st: "文件现行有效", arts: [["第一条", "乌兹别克斯坦是实行共和政体的主权、民主、法治、社会和世俗国家。“乌兹别克斯坦共和国”和“乌兹别克斯坦”两个名称具有同等意义。"], ["第二条", "国家表达人民的意志，服务于人民的利益。国家机关和公职人员对社会和公民负责。"], ["第三条", "乌兹别克斯坦共和国确定本国的行政区划结构以及国家权力和管理机关体系，实行对内和对外政策。乌兹别克斯坦的国界和领土不可侵犯、不可分割。"], ["第四条", "乌兹别克斯坦共和国的国语是乌兹别克语。乌兹别克斯坦共和国保障尊重居住在其境内的各民族的语言、习俗和传统，并为其发展创造条件。"], ["第五条", "乌兹别克斯坦共和国拥有由法律确认的国家象征：国旗、国徽和国歌。"], ["第六条", "乌兹别克斯坦共和国的首都是塔什干市。"], ["第七条", "人民是国家权力的唯一来源。"], ["第八条", "乌兹别克斯坦人民由乌兹别克斯坦共和国公民组成，不分民族。"], ["第九条", "社会和国家生活中最重要的问题提交人民讨论，并交付全民投票（全民公决）。"], ["第十条", "只有人民选举产生的最高会议和共和国总统才能代表乌兹别克斯坦人民。"]] },
  { c: "sa", n: "العربية", code: "AR", doc: "دستور جمهورية أوزبكستان", st: "الوثيقة سارية المفعول", rtl: true, arts: [["المادة 1.", "أوزبكستان دولة ذات سيادة، ديمقراطية، قانونية، اجتماعية وعلمانية، ذات شكل جمهوري للحكم. وتسميتا «جمهورية أوزبكستان» و«أوزبكستان» متساويتان في المعنى."], ["المادة 2.", "تعبّر الدولة عن إرادة الشعب وتخدم مصالحه. وتكون أجهزة الدولة والمسؤولون مسؤولين أمام المجتمع والمواطنين."], ["المادة 3.", "تحدد جمهورية أوزبكستان تقسيمها الإداري والإقليمي ونظام أجهزة سلطة الدولة والإدارة، وتنتهج سياستها الداخلية والخارجية. حدود أوزبكستان وأراضيها مصونة وغير قابلة للتجزئة."], ["المادة 4.", "اللغة الرسمية لجمهورية أوزبكستان هي اللغة الأوزبكية. وتضمن جمهورية أوزبكستان احترام لغات وعادات وتقاليد الأمم والشعوب المقيمة على أراضيها وتهيئ الظروف لتطويرها."], ["المادة 5.", "لجمهورية أوزبكستان رموز وطنية يقرها القانون: العلم والشعار والنشيد الوطني."], ["المادة 6.", "عاصمة جمهورية أوزبكستان هي مدينة طشقند."], ["المادة 7.", "الشعب هو المصدر الوحيد لسلطة الدولة."], ["المادة 8.", "يتكون شعب أوزبكستان من مواطني جمهورية أوزبكستان بغض النظر عن قوميتهم."], ["المادة 9.", "تُطرح أهم قضايا الحياة العامة وحياة الدولة للنقاش العام وتُعرض على التصويت الشعبي (الاستفتاء)."], ["المادة 10.", "لا يحق التحدث باسم شعب أوزبكستان إلا للمجلس الأعلى ورئيس الجمهورية المنتخبين من قبله."]] },
];
const MORE_L: [string, string][] = [["kg", "Кыргызча"], ["tj", "Тоҷикӣ"], ["fr", "Français"], ["es", "Español"], ["it", "Italiano"], ["jp", "日本語"], ["kr", "한국어"], ["in", "हिन्दी"], ["pt", "Português"], ["pl", "Polski"], ["ua", "Українська"], ["tm", "Türkmençe"], ["az", "Azərbaycanca"], ["id", "Bahasa"]];
const L_FIRST = 44, L_STEP = 26; // first switch, then one language every ~0.43 s
const BAR = "linear-gradient(90deg, #1cb0f6, #3db7f4)";
const Chev: React.FC<{ c?: string }> = ({ c = "#fff" }) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>;
export const Langs: React.FC = () => {
  const f = useCurrentFrame();
  const sp = useSp();
  const page = sp(2, 15, 140);
  const sw = (k: number) => L_FIRST + (k - 1) * L_STEP;
  const cur = Math.max(0, Math.min(LD.length - 1, Math.floor((f - L_FIRST) / L_STEP) + 1));
  const near = Math.abs(f - sw(Math.max(1, Math.min(LD.length - 1, Math.round((f - L_FIRST) / L_STEP) + 1))));
  const veil = f < L_FIRST - 8 ? 0 : Math.max(0, 1 - near / 8);
  const d = LD[cur];
  const ROW = 66;
  const selY = LD.slice(1).reduce((acc, _, k) => acc + lin(f, sw(k + 1) - 4, sw(k + 1) + 4), 0);
  const scroll = Math.max(0, (selY - 4) * ROW);
  const ico = (p: React.ReactNode, bg = "#1cb0f6") => <div style={{ width: 62, height: 54, borderRadius: 14, background: bg, boxShadow: "0 4px 0 rgba(13,111,163,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">{p}</svg></div>;
  return (
    <AbsoluteFill style={{ background: "#ffffff", overflow: "hidden" }}>
      <AbsoluteFill style={{ padding: "40px 48px", boxSizing: "border-box", fontFamily: UI, opacity: Math.min(1, page * 1.4), transform: `translateY(${(1 - page) * 50}px) scale(${0.96 + 0.04 * page})` }}>
        {/* toolbar */}
        <div style={{ height: 88, borderRadius: 22, background: BAR, display: "flex", alignItems: "stretch", color: "#fff", overflow: "hidden" }}>
          <div style={{ width: 470, padding: "0 26px", display: "flex", alignItems: "center", gap: 14, borderRight: "2px solid rgba(255,255,255,0.35)" }}>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 15, letterSpacing: "0.12em", opacity: 0.85 }}>ВЫБЕРИТЕ ЗАКОН</div><div style={{ fontWeight: 900, fontSize: 23, whiteSpace: "nowrap" }}>Конституция Республики</div></div><Chev />
          </div>
          <div style={{ width: 300, padding: "0 24px", display: "flex", alignItems: "center", gap: 14, borderRight: "2px solid rgba(255,255,255,0.35)" }}>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 15, letterSpacing: "0.12em", opacity: 0.85 }}>ЧАСТЬ 1 ИЗ 10</div><div style={{ fontWeight: 900, fontSize: 23 }}>СТАТЬИ 1-10</div></div><Chev />
          </div>
          <div style={{ width: 150, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, borderRight: "2px solid rgba(255,255,255,0.35)", background: f >= L_FIRST - 4 ? "rgba(255,255,255,0.16)" : "transparent" }}>
            <Img src={FL(d.c)} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: "2px solid #fff" }} />
            <div style={{ fontWeight: 900, fontSize: 25 }}>{d.code}</div>
          </div>
          <div style={{ flex: 1, padding: "12px 14px", display: "flex" }}>
            <div style={{ flex: 1, borderRadius: 14, background: "#fff", display: "flex", alignItems: "center", gap: 14, padding: "0 22px", color: "#9aa1ab", fontWeight: 600, fontSize: 22 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1cb0f6" strokeWidth="2.6" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>Поиск по всей базе законов
            </div>
          </div>
          <div style={{ width: 170, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, borderLeft: "2px solid rgba(255,255,255,0.35)", fontWeight: 900, fontSize: 22, letterSpacing: "0.06em" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round"><path d="M3 4h18l-7 8v7l-4 2v-9z" /></svg>ФИЛЬТР
          </div>
        </div>
        {/* breadcrumbs */}
        <div style={{ height: 96, display: "flex", alignItems: "center", gap: 18, padding: "0 8px", fontSize: 26, fontWeight: 700 }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1cb0f6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /></svg>
          <span style={{ color: "#9aa1ab" }}>›</span><span style={{ color: "#6f7682" }}>Основные законы</span><span style={{ color: "#9aa1ab" }}>›</span><span style={{ color: "#1a237e", fontWeight: 900 }}>Конституция Республики Узбекистан</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 14 }}>
            {ico(<path d="M12 5v14M5 12h14" />)}
            {ico(<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" /></>)}
            {ico(<path d="M20 12l-8 8-9-9V3h8z" />)}
            {ico(<><circle cx="6" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="18" cy="12" r="1" /></>)}
          </div>
        </div>
        <div style={{ display: "flex", gap: 32, height: 1080 - 80 - 88 - 96 }}>
          {/* languages */}
          <div style={{ width: 420, borderRadius: 20, border: "2px solid #e6e9ee", background: "#fff", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ height: 78, background: BAR, display: "flex", alignItems: "center", gap: 16, padding: "0 26px", color: "#fff", fontFamily: HEAD, fontWeight: 900, fontSize: 30, whiteSpace: "nowrap" }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" /></svg>
              99+ языков
            </div>
            <div style={{ flex: 1, overflow: "hidden", padding: "10px 14px", WebkitMaskImage: "linear-gradient(180deg, #000 82%, transparent)", maskImage: "linear-gradient(180deg, #000 82%, transparent)" }}>
              <div style={{ position: "relative", transform: `translateY(${-scroll}px)` }}>
                <div style={{ position: "absolute", left: 0, right: 0, top: selY * ROW + 5, height: ROW - 10, borderRadius: 14, border: "2.5px solid #1cb0f6", boxSizing: "border-box" }} />
                {[...LD.map((l) => [l.c, l.n] as [string, string]), ...MORE_L].map(([c, n], i) => {
                  const on = i === cur;
                  return (
                    <div key={c} style={{ height: ROW, display: "flex", alignItems: "center", gap: 18, padding: "0 16px", fontWeight: on ? 900 : 800, fontSize: 28, color: on ? "#0d6fa3" : "#4b4b4b", opacity: sp(6 + Math.min(i, 8) * 3, 14, 180) }}>
                      <Img src={FL(c)} style={{ width: 46, height: 34, borderRadius: 6, objectFit: "cover", boxShadow: "0 0 0 1px rgba(0,0,0,0.08)" }} />{n}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {/* A4 sheet */}
          <div style={{ flex: 1, borderRadius: 8, border: "2px solid #e6e9ee", background: "#fff", boxShadow: "0 24px 60px rgba(13,22,48,0.08)", padding: "34px 64px", boxSizing: "border-box", overflow: "hidden", WebkitMaskImage: "linear-gradient(180deg, #000 88%, transparent 99%)", maskImage: "linear-gradient(180deg, #000 88%, transparent 99%)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, color: "#c3c8cf" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M9 14L4 9l5-5M4 9h11a5 5 0 0 1 0 10h-2" /></svg>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M15 14l5-5-5-5M20 9H9a5 5 0 0 0 0 10h2" /></svg>
            </div>
            <div style={{ opacity: 1 - veil * 0.95, filter: `blur(${veil * 2}px)`, direction: d.rtl ? "rtl" : "ltr" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "flex-end", marginTop: -30, fontWeight: 800, fontSize: 22, color: "#2e9d3a", direction: "ltr" }}>
                <svg width="26" height="26" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#2e9d3a" /><path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {d.st}
              </div>
              <div style={{ marginTop: 26, textAlign: "center", fontWeight: 900, fontSize: 32, color: "#1a237e", lineHeight: 1.25 }}>{d.doc}</div>
              <div style={{ marginTop: 8, textAlign: "center", fontWeight: 600, fontSize: 24, color: "#5d6470" }}>30.04.2023</div>
              {d.arts.map(([h, t], i) => (
                <div key={i} style={{ marginTop: i === 0 ? 26 : 10, fontWeight: 500, fontSize: 25, lineHeight: 1.48, color: "#2b2b2b", textAlign: "justify", textIndent: 56 }}><span style={{ fontWeight: 900, color: "#1a237e" }}>{h}</span> {t}</div>
              ))}
            </div>
          </div>
        </div>
      </AbsoluteFill>
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
