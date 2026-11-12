"""Deterministic soundtrack for VeoskillV9: one licensed track edited on bar lines + a few real UI sounds on picture frames.
Everything here is placement/levels/fades of real recordings (Mixkit free licence); nothing is generated."""
import subprocess, sys, os
import numpy as np, soundfile as sf
from scipy.signal import resample_poly

ROOT = os.path.dirname(os.path.abspath(__file__))
SR = 48000
FPS = 60
import json
_SJ = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../out/scenes.json")
# scene durations come from src/V11.tsx via scripts/build.mjs (out/scenes.json); the list is a fallback
DURS = json.load(open(_SJ)) if os.path.exists(_SJ) else [240,180,300,420,160,410,300,390,228,110,360,300,90,330,240,80,200,420,300,240,240,360]
STARTS = [sum(DURS[:i]) for i in range(len(DURS))]
_KJ = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../out/slow.json")
K = json.load(open(_KJ)) if os.path.exists(_KJ) else [1] * len(DURS)
_NM = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../out/names.json")
NAMES = json.load(open(_NM)) if os.path.exists(_NM) else []
def N(name): return NAMES.index(name) if name in NAMES else -1   # cues refer to scenes by name; a removed scene is skipped
def _lessonmap(lf): return lf if lf < 150 else (150 + (lf - 150) * 1.75 if lf < 390 else lf + 180)
def F(sc, lf):
    if sc < 0: return -1e9
    if NAMES and NAMES[sc] == "LessonSlow": lf = _lessonmap(lf)
    return STARTS[sc] + lf * K[sc]   # lf is in the scene's own (unstretched) frames
STING = STARTS[-1] / FPS + 2.33
DUR = sum(DURS) / FPS

def load(path):
    if path.endswith('.mp3'):
        wav = path[:-4] + '.decoded.wav'
        if not os.path.exists(wav):
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', path, '-ar', str(SR), '-ac', '2', wav], check=True)
        path = wav
    x, sr = sf.read(path, always_2d=True)
    if x.shape[1] == 1: x = np.repeat(x, 2, axis=1)
    if sr != SR: x = resample_poly(x, SR, sr, axis=0)
    return x.astype(np.float64)

def db(v): return 10 ** (v / 20)
def fade(x, a, b):
    n = len(x)
    if a: k = min(n, int(a * SR)); x[:k] *= np.linspace(0, 1, k)[:, None]
    if b: k = min(n, int(b * SR)); x[n - k:] *= np.linspace(1, 0, k)[:, None]
    return x

out = np.zeros((int(DUR * SR) + SR, 2))
def put(x, t, g=0.0):
    if t < 0: return
    i = int(round(t * SR)); j = min(len(out), i + len(x))
    out[i:j] += x[: j - i] * db(g)

# ---- music: Mixkit 1303 (125 BPM, beats at 0.0188 + k*0.48 s in the source).
# Scene lengths in src/V11.tsx are snapped to the film beat grid: frame 2.8 + k*28.8 (t = 0.0467 + k*0.48 s),
# so every scene cut lands on a beat. The track is placed 0.0279 s late to match that grid.
M = load(os.path.join(ROOT, "assets/music/mk-1303.mp3"))
MUS_OFF = 0.0467 - 0.0188
def seg(src_from, src_to, at, fi=0.01, fo=0.012, g=0.0):
    a, b = int(src_from * SR), int(src_to * SR)
    x = fade(M[a:b].copy(), fi, fo)
    put(x, at, g)
    return x
BEAT = 0.48
HIT = 96.019                                # the track's final hit (source seconds, on a downbeat)
JUMP = STARTS[-1] / FPS                     # cut on the beat at the start of S11
# The track is ~101 s, the film ~255 s: after the first pass the body (beats 32..192, 160 beats) is looped on
# phrase lines as many times as needed, then the ending is cut in so the final hit lands ~7 s into S11.
E = 0.006
BODY0 = 0.0188 + 32 * BEAT
BODY1 = 0.0188 + 192 * BEAT
seg(0.0, BODY1 + E, MUS_OFF, fi=0.02, fo=E)
_film = MUS_OFF + BODY1
_src_jump = None
while True:
    if _film + (BODY1 - BODY0) >= JUMP:
        _src_jump = BODY0 + (JUMP - _film)
        seg(BODY0, _src_jump + E, _film, fi=E, fo=E)
        break
    seg(BODY0, BODY1 + E, _film, fi=E, fo=E)
    _film += BODY1 - BODY0
if JUMP < MUS_OFF + BODY1: _src_jump = JUMP - MUS_OFF
# from S11 on, jump by a whole number of beats so the final hit lands ~7 s into S11 and its tail rings to the very end
_shift = round((HIT - _src_jump - 7.0) / BEAT) * BEAT
seg(_src_jump + _shift, 101.0, JUMP, fi=E, fo=1.6)
# opening: low-pass sweep that opens up until the first word cut (S2), a "reveal" feel
from scipy.signal import butter, sosfilt, sosfilt_zi
_open = STARTS[1] / FPS
_n = int(_open * SR); _blk = 256
_zi = None
for _i in range(0, _n, _blk):
    _t = _i / _n
    _fc = 350 * (18000 / 350) ** (_t ** 1.6)
    _sos = butter(2, min(_fc, SR / 2 - 100), 'low', fs=SR, output='sos')
    if _zi is None: _zi = np.stack([sosfilt_zi(_sos) * out[0, c] for c in range(2)], axis=-1)
    for c in range(2):
        out[_i:_i + _blk, c], _zi[..., c] = sosfilt(_sos, out[_i:_i + _blk, c], zi=_zi[..., c])
out[: _n] *= np.linspace(db(-3), 1, _n)[:, None]
# ---- UI sounds on picture frames (absolute frame numbers of VeoskillV9)
CL = fade(load(os.path.join(ROOT, 'assets/ui/mk-1117.wav')), 0, 0.02)
POP = fade(load(os.path.join(ROOT, 'assets/ui/mk-2356.wav')), 0, 0.05)
CH = fade(load(os.path.join(ROOT, 'assets/ui/mk-951.wav')), 0, 0.3)
WH = fade(load(os.path.join(ROOT, 'assets/motion/mk-1491.wav')), 0, 0.05)
def onset(x):
    e = np.abs(x).max(axis=1); return int(np.argmax(e > e.max() * 0.3))
def sh(fr): return fr
def at(x, frame, g, lead=0.0):
    frame = sh(frame)
    put(x, frame / FPS - onset(x) / SR - lead, g)
clicks = [(N("LessonPath"),300),(N("LessonPath"),356),(N("G2"),238),(N("LawsHome"),132),(N("Reader"),64),(N("Reader"),162),(N("Reader"),204),(N("Reader"),330)]
clicks += [(N("S4"), 30 * k) for k in range(1, 10)]   # S4 carousel steps
clicks += [(N("G3"),114),(N("Langs"),50)]                     # G3 "wrong" stamp, Langs start of the language run
for sc, lf in clicks: at(CL, F(sc, lf), -16)
pops = [(N("IntroMosaic"),112),(N("LessonPath"),303),(N("PhraseBank"),100),(N("PhraseBank"),128),(N("PhraseBank"),156),(N("PhraseBank"),184),(N("Wall"),70),(N("Wall"),116),(N("Wall"),162),(N("Wall"),208),(N("Reader"),348),(N("AIReal"),100),(N("AIReal"),152),(N("AIReal"),206),(N("Langs"),2),(N("Langs"),8),(N("Langs"),14),(N("Langs"),20),(N("S11"),10),(N("S11"),60)]
pops += [(N("S7b"), 60 + 30 * k) for k in range(6)]
# Table: 8 rows on half-beats (see rowAt in V11.tsx)
pops += [(N("Table"), round(72 + 14.4 * k)) for k in range(11)]
# LexScene: 5 red points, then they flip to green (see LexRow in V11.tsx)
pops += [(N("LexScene"), round(86.4 + 14.4 * k)) for k in range(5)]
# kinetic word cuts, on the beat grid (Words per= in V11.tsx)
pops += [(N("S2"), round(57.6 * k)) for k in range(4)] + [(N("LessonWords"), round(57.6 * k)) for k in range(4)]
pops += [(N("S7"), 0), (N("S7"), 58), (N("S9"), 58), (N("OurWords"), 0), (N("OurWords"), 58)]
# Hints: bulb click, "Подсказки" popover, term tooltip
clicks2 = [(N("Hints"), 46)]
for sc, lf in clicks2: at(CL, F(sc, lf), -16)
pops += [(N("Hints"), 52), (N("Hints"), 184)]
# Article actions: heart click + folder picker, "⋯" click + menu
for sc, lf in [(N("ArticleActions"), 56), (N("ArticleActions"), 86), (N("ArticleActions"), 108), (N("ArticleActions"), 164)]: at(CL, F(sc, lf), -16)
pops += [(N("ArticleActions"), 62), (N("ArticleActions"), 170)]
# Collect: 3 ticks, download (format, go), share (copy); entrances of bar, modals, phone
for sc, lf in [(N("Collect"), 40), (N("Collect"), 64), (N("Collect"), 88), (N("Collect"), 122), (N("Collect"), 160), (N("Collect"), 196), (N("Collect"), 272), (N("Collect"), 318)]: at(CL, F(sc, lf), -16)
pops += [(N("Collect"), 44), (N("Collect"), 128), (N("Collect"), 278), (N("Collect"), 324), (N("Collect"), 380), (N("Collect"), 388), (N("Collect"), 396)]
for sc, lf in [(N("Collect"), 202)]: at(CH, F(sc, lf), -17)
for sc, lf in [(N("Collect"), 350)]:
    i = np.argmax(np.abs(WH).max(axis=1)); put(WH, F(sc, lf) / FPS - i / SR + 0.03, -19)
# Search: ФИЛЬТР, НАЙТИ, ВЫБРАТЬ ВСЕ; modal and results appear
for sc, lf in [(N("Search"), 40), (N("Search"), 112), (N("Search"), 196)]: at(CL, F(sc, lf), -16)
pops += [(N("Search"), 46), (N("Search"), 176)]
# AiPick: hover tooltip, click on the robot
for sc, lf in [(N("AiPick"), 128)]: at(CL, F(sc, lf), -16)
pops += [(N("AiPick"), 92)]
# Lesson (the real lesson page): every click, then correct / wrong chimes
for lf in [110, 186, 214, 322, 364, 384, 430, 520, 600, 622, 644, 666, 692, 745, 790, 810, 840, 860, 890, 910, 940, 992, 1012, 1066, 1086, 1250, 1275]: at(CL, F(N("LessonSlow"), lf), -16)
pops += [(N("LessonSlow"), 14), (N("LessonSlow"), 24), (N("LessonSlow"), 34), (N("LessonSlow"), 326), (N("LessonSlow"), 744 + 2)]
for sc, lf in [(N("LessonSlow"), 522), (N("LessonSlow"), 694), (N("LessonSlow"), 942), (N("LessonSlow"), 1088), (N("LessonSlow"), 1277)]: at(CH, F(sc, lf), -17)
# LessonMore: term pick, check, next, answer field, check; AI check and success
for lf in [110, 142, 192, 268, 680]: at(CL, F(N("LessonMore"), lf), -16)
for lf in [144, 690]: at(CH, F(N("LessonMore"), lf), -17)
pops += [(N("LessonMore"), 606), (N("LessonMore"), 620), (N("LessonMore"), 634)]
# Duel: opponent found, answer click, reveal, win card
pops += [(N("Duel"), 128), (N("Duel"), 214), (N("Duel"), 470)]
at(CL, F(N("Duel"), 330), -16)
for lf in [352, 472]: at(CH, F(N("Duel"), lf), -17)
# Books: open a book, select (popup), colour, share, next page, gear, sepia, size, close; phone in
for lf in [196, 268, 318, 600, 642, 744, 800, 860, 908, 956]: at(CL, F(N("Books"), lf), -16)
pops += [(N("Books"), 6), (N("Books"), 206), (N("Books"), 270), (N("Books"), 542), (N("Books"), 646), (N("Books"), 804)]
for lf in [386, 990]:
    i = np.argmax(np.abs(WH).max(axis=1)); put(WH, F(N("Books"), lf) / FPS - i / SR + 0.03, -20)
# section word cuts
for nm in ["DuelWords", "LibWords"]: pops += [(N(nm), 0), (N(nm), 58)]
pops += [(N("S7"), 115)]
# Counter: word cut, tiles
pops += [(N("Counter"), 4), (N("Counter"), 14), (N("Counter"), 100)] + [(N("Counter"), 372 + 6 * i) for i in range(5)]
for lf in [330]:
    i = np.argmax(np.abs(WH).max(axis=1)); put(WH, F(N("Counter"), lf) / FPS - i / SR + 0.03, -20)
# Profile and Premium
for nm in ["ProfWords", "PremWords"]: pops += [(N(nm), 0), (N(nm), 58)]
for lf in [60, 96, 120, 150, 172, 205, 260, 396, 430, 470, 494]: at(CL, F(N("Profile"), lf), -16)
pops += [(N("Profile"), 66), (N("Profile"), 266), (N("Profile"), 436)]
for lf in [213, 338]: at(CH, F(N("Profile"), lf), -17)
at(CL, F(N("Premium"), 150), -16)
pops += [(N("Premium"), 14), (N("Premium"), 20), (N("Premium"), 26)] + [(N("Premium"), 246 + 10 * i) for i in range(6)]
# lex.uz inserts: red cross
for nm in ["LexTrySelect", "LexTryHover", "LexTrySearch", "LexTryCollect", "LexTryAi"]:
    at(CL, F(N(nm), 100), -16); pops += [(N(nm), 106)]
# AI word cut (AiWords): "А ТЕПЕРЬ", then the AI card
pops += [(N("AiWords"), 0), (N("AiWords"), 58)]
# other entrances found in the scene code
pops += [(N("S3"),180),(N("PhraseBank"),16),(N("G2"),4),(N("G2"),18),(N("G2"),202),(N("G3"),12),(N("G3"),216),(N("S7b"),6),(N("Reader"),122),(N("AIReal"),4)]
for sc, lf in pops: at(POP, F(sc, lf), -15)
for sc, lf in [(N("PhraseBank"),198),(N("G2"),238),(N("Counter"),250),(N("Reader"),348),(N("G3"),63),(N("G3"),170),(N("S7b"),250),(N("LexScene"),202)]: at(CH, F(sc, lf), -17)
for sc, lf in [(N("LessonPath"),6),(N("LessonPath"),200),(N("LessonPath"),370),(N("G2"),378),(N("G3"),190),(N("S9"),0),(N("Counter"),0),(N("LexScene"),0),(N("LawsHome"),0),(N("LawsHome"),180),(N("S3"),0),(N("S4"),300),(N("Wall"),0),(N("LexScene"),50)]:
    i = np.argmax(np.abs(WH).max(axis=1)); put(WH, F(sc, lf) / FPS - i / SR + 0.03, -18)

# soft whooshes for G3 card swipes
for sc, lf in [(N("G3"),74),(N("G3"),124)]:
    i = np.argmax(np.abs(WH).max(axis=1)); put(WH, F(sc, lf) / FPS - i / SR + 0.03, -23)

out = out[: int(DUR * SR)]
sf.write(os.path.join(ROOT, '../out/audio/premaster.wav'), out.astype(np.float32), SR, subtype='FLOAT')
print('premaster written', out.shape[0] / SR, 's, peak', np.abs(out).max())
