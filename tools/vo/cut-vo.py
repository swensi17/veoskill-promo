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
for a, b, at, name in G:
    i0, i1 = idx(a, True), idx(b, False)
    st, en = W[i0][0], W[i1][1]
    prev = W[i0 - 1][1] if i0 > 0 else 0.0
    nxt = W[i1 + 1][0] if i1 + 1 < len(W) else en + 0.5
    s0 = max(prev + (st - prev) * 0.5, st - 0.12)
    e0 = min(en + (nxt - en) * 0.5, en + 0.18)
    s0 = 0.0 if s0 < 0.05 else snap(s0)
    e0 = snap(e0)
    print("    (%7.3f, %7.3f, %6.1f),  # %s" % (s0, e0, at, name))
