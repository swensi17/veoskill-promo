import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";

// One living background for every beat: real veoskill screens drifting far behind, out of focus, under soft light.
const SHOTS = ["cabinet", "laws", "c2", "article", "m-ok", "stats", "on-5", "laws-search", "l-note2"];
export const RichBg: React.FC<{ seed?: number }> = ({ seed = 0 }) => {
  const f = useCurrentFrame() + seed * 37;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(160deg, #eaf4fd 0%, #f5f9fd 45%, #f3faea 100%)", overflow: "hidden" }}>
      <AbsoluteFill style={{ perspective: 1600 }}>
        <div style={{ position: "absolute", left: 960, top: 540, transformStyle: "preserve-3d", transform: `translate(-50%,-50%) translateZ(-900px) rotateX(18deg) rotateZ(-8deg) translateX(${-f * 0.6}px)`, display: "grid", gridTemplateColumns: "repeat(5, 820px)", gap: 70 }}>
          {[...SHOTS, ...SHOTS.slice(0, 6)].map((n, i) => (
            <Img key={i} src={staticFile(`hack/hd/${n}.png`)} style={{ width: 820, height: 512, borderRadius: 30, boxShadow: "0 30px 80px rgba(10,40,90,0.25)", transform: `translateY(${Math.sin(f / 90 + i) * 18}px)` }} />
          ))}
        </div>
      </AbsoluteFill>
      {/* depth of field + light: keep the background a soft, readable texture */}
      <AbsoluteFill style={{ backdropFilter: "blur(14px)", background: "rgba(246,250,254,0.62)" }} />
      <div style={{ position: "absolute", left: -260 + Math.sin(f / 120) * 80, top: -380, width: 1200, height: 1200, borderRadius: "50%", background: "radial-gradient(circle, rgba(28,176,246,0.16), transparent 62%)" }} />
      <div style={{ position: "absolute", right: -300, bottom: -460 + Math.cos(f / 140) * 60, width: 1200, height: 1200, borderRadius: "50%", background: "radial-gradient(circle, rgba(88,204,2,0.13), transparent 62%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(70% 60% at 50% 50%, rgba(255,255,255,0.55), transparent 70%)" }} />
    </AbsoluteFill>
  );
};

/** Text that rolls into place like a counter: each word slides up out of a mask, no bounce, no blur. */
export const Roll: React.FC<{ text: string; at: number; out?: number; size: number; color?: string; weight?: number; lipC?: string; gap?: number; stagger?: number; align?: "center" | "flex-start"; style?: React.CSSProperties; f: number }> = ({ text, at, out, size, color = "#1f2a37", weight = 900, lipC, gap, stagger = 0, align = "center", style, f }) => {
  const ease = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 4);
  const easeIn = (t: number) => Math.pow(Math.min(1, Math.max(0, t)), 3);
  const words = text.split(" ");
  const lipShadow = lipC ? [...Array.from({ length: Math.round(size / 16) }, (_, i) => `0 ${i + 1}px 0 ${lipC}`), `0 ${Math.round(size / 16) + 8}px 22px rgba(10,40,90,0.18)`].join(",") : undefined;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: align, columnGap: gap ?? size * 0.26, fontFamily: "NunitoC, Nunito, sans-serif", fontWeight: weight, fontSize: size, lineHeight: 1.12, ...style }}>
      {words.map((w, i) => {
        const tin = ease((f - at - i * stagger) / 22);
        const tout = out !== undefined ? easeIn((f - out - i * stagger * 0.6) / 16) : 0;
        if (f < at + i * stagger) return <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingBottom: size * 0.18, marginBottom: -size * 0.18 }}><span style={{ display: "inline-block", visibility: "hidden" }}>{w}</span></span>;
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingBottom: size * 0.18, marginBottom: -size * 0.18, paddingTop: size * 0.06 }}>
            <span style={{ display: "inline-block", color, textShadow: lipShadow, transform: `translateY(${-(1 - tin) * 110 + tout * 110}%)`, whiteSpace: "nowrap" }}>{w}</span>
          </span>
        );
      })}
    </div>
  );
};
