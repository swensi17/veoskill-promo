# -*- coding: utf-8 -*-
"""Voiceover cut list: one ElevenLabs take -> sentence groups placed on scenes.
Input: out/audio/vo-asr.json (faster-whisper word timings of audio/assets/vo/vo-roger-ru.mp3).
Prints VO_CUTS rows for audio/mix.py: (source from, source to, film time)."""
import json
import numpy as np
import soundfile as sf

X, XSR = sf.read("out/audio/vo-probe.wav")  # mono 16 kHz decode of the take


def snap(t, r=0.3):
    """Move a cut to the quietest 20 ms inside +-r s (so no syllable is clipped)."""
    w = int(0.02 * XSR)
    a, b = max(0, int((t - r) * XSR)), min(len(X) - w, int((t + r) * XSR))
    e = [np.sqrt((X[i:i + w] ** 2).mean()) for i in range(a, b, w // 2)]
    return (a + int(np.argmin(e)) * (w // 2) + w // 2) / XSR

import sys as _s
RU = not (len(_s.argv) > 1 and _s.argv[1] == "uz")
S = json.load(open("out/audio/vo-asr.json"))
W = [w for s in S for w in s["w"]]


def idx(t, first):
    for s in S:
        if first and abs(s["s"] - t) < 0.05:
            return W.index(s["w"][0])
        if not first and abs(s["e"] - t) < 0.05:
            return W.index(s["w"][-1])
    raise SystemExit("no segment at %s" % t)


# (first segment start, last segment end, film time, label)
G = [
    (0.00, 5.10, 0.5, "intro: boring books"),
    (5.60, 13.72, 8.0, "meet veoskill, directions"),
    (14.18, 20.90, 20.0, "short lessons, path"),
    (21.32, 42.70, 30.5, "lesson: theory, constitution, games"),
    (43.16, 53.20, 55.5, "find the term, case"),
    (53.20, 55.56, 70.4, "true or false"),
    (55.56, 62.60, 74.1, "play, remember, league"),
    (63.10, 71.44, 83.3, "competitions"),
    (71.90, 74.66, 97.4, "all in one place"),
    (75.32, 82.12, 101.9, "and now laws, base"),
    (82.48, 89.86, 112.6, "usual law vs ours"),
    (90.24, 94.12, 123.1, "usual site: no highlight"),
    (94.32, 98.42, 127.3, "here: highlight and notes"),
    (98.78, 101.80, 135.5, "unclear term"),
    (102.10, 104.20, 139.0, "hover the word"),
    (104.60, 107.78, 145.0, "save to folders"),
    (108.06, 117.58, 153.9, "download, send a link"),
    (117.96, 121.76, 169.6, "search"),
    (122.14, 129.66, 177.8, "artificial intelligence"),
    (130.04, 132.92, 191.3, "99 languages"),
    (133.32, 146.72, 195.2, "library and reader"),
    (147.14, 155.00, 217.2, "your page"),
    (155.60, 161.54, 231.1, "premium"),
    (161.86, 164.02, 238.8, "why it is easier"),
    (164.38, 170.70, 243.6, "QR, learn by playing"),
]
for a, b, at, name in (G if RU else []):
    i0, i1 = idx(a, True), idx(b, False)
    st, en = W[i0][0], W[i1][1]
    prev = W[i0 - 1][1] if i0 > 0 else 0.0
    nxt = W[i1 + 1][0] if i1 + 1 < len(W) else en + 0.5
    s0 = max(prev + (st - prev) * 0.5, st - 0.12)
    e0 = min(en + (nxt - en) * 0.5, en + 0.18)
    s0 = 0.0 if s0 < 0.05 else snap(s0)
    e0 = snap(e0)
    print("    (%7.3f, %7.3f, %6.1f),  # %s" % (s0, e0, at, name))


# ---- Uzbek take (audio/assets/vo/vo-roger-uz.mp3): cuts given as pause midpoints between sentence groups,
# read off out/audio/vo-asr-uz.json, then snapped to the quietest point. Run: python tools/vo/cut-vo.py uz
import sys
if len(sys.argv) > 1 and sys.argv[1] == "uz":
    X, XSR = sf.read("out/audio/vo-probe-uz.wav")
    B = [0.0, 6.89, 16.05, 23.34, 46.77, 57.38, 60.55, 69.61, 78.71, 82.30, 90.5, 98.89, 103.72, 109.77, 113.23,
         116.51, 120.49, 133.33, 138.32, 147.5, 150.89, 165.58, 175.08, 181.84, 184.56, len(X) / XSR - 0.05]
    AT = [0.5, 8.0, 20.0, 30.5, 55.5, 70.4, 74.1, 83.3, 97.4, 101.9, 112.6, 123.1, 127.9, 135.5, 139.0, 145.0, 153.9,
          169.6, 177.8, 191.3, 195.2, 217.2, 231.1, 238.8, 243.6]
    # cut in the middle of the longest silent run (< max-40 dB, 10 ms frames) near each pause
    w = int(0.01 * XSR)
    d = np.array([20 * np.log10(np.sqrt((X[i:i + w] ** 2).mean()) + 1e-9) for i in range(0, len(X) - w, w)])
    sil, runs, st = d < d.max() - 40, [], None
    for i, v in enumerate(sil):
        if v and st is None: st = i
        if not v and st is not None: runs.append((st * 0.01, i * 0.01)); st = None
    def mid(b):
        c = [r for r in runs if abs((r[0] + r[1]) / 2 - b) < 0.6]
        r = max(c, key=lambda r: r[1] - r[0]); return (r[0] + r[1]) / 2
    C = [B[0]] + [mid(b) for b in B[1:-1]] + [B[-1]]
    print("VO_CUTS_UZ")
    for i, at in enumerate(AT):
        print("    (%7.3f, %7.3f, %6.1f)," % (C[i], C[i + 1], at))
