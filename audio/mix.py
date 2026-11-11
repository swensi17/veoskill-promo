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
def F(sc, lf): return STARTS[sc] + lf
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
# the film may be longer than the track before its ending: then one 32-beat phrase in the middle is played twice
PHRASE = 32 * BEAT
LOOP_SRC = 0.0188 + 96 * BEAT                # a phrase boundary (beat 96, ~46 s)
_room = 95.0                                 # source time the first pass may reach before the ending starts
_back = 0.0
while JUMP - MUS_OFF - _back > _room: _back += PHRASE
if _back:
    seg(0.0, LOOP_SRC + 0.006, MUS_OFF, fi=0.02, fo=0.006)
    seg(LOOP_SRC - _back, JUMP - MUS_OFF - _back + 0.006, LOOP_SRC + MUS_OFF, fi=0.006, fo=0.006)
else:
    seg(0.0, JUMP - MUS_OFF + 0.006, MUS_OFF, fi=0.02, fo=0.006)
_src_jump = JUMP - MUS_OFF - _back
# from S11 on, jump by a whole number of beats (back = repeat, forward = skip) so the final hit lands ~2.4 s into S11 (logo + QR)
_shift = round((HIT - _src_jump - 2.4) / BEAT) * BEAT
seg(_src_jump + _shift, 101.0, JUMP, fi=0.006, fo=1.6)
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
clicks = [(5,300),(5,356),(7,238),(16,132),(17,64),(17,162),(17,204),(17,330)]
clicks += [(3, 30 * k) for k in range(1, 10)]   # S4 carousel steps
clicks += [(8,114),(21,50)]                     # G3 "wrong" stamp, Langs start of the language run
for sc, lf in clicks: at(CL, F(sc, lf), -16)
pops = [(0,112),(5,303),(6,100),(6,128),(6,156),(6,184),(11,70),(11,116),(11,162),(11,208),(17,348),(20,100),(20,152),(20,206),(21,2),(21,8),(21,14),(21,20),(23,10),(23,60)]
pops += [(10, 60 + 30 * k) for k in range(6)]
# Table: 8 rows on half-beats (see rowAt in V11.tsx)
pops += [(22, round(28.8 + 14.4 * k)) for k in range(8)]
# LexScene: 5 red points, then they flip to green (see LexRow in V11.tsx)
pops += [(14, round(86.4 + 14.4 * k)) for k in range(5)]
# kinetic word cuts, on the beat grid (Words per= in V11.tsx)
pops += [(1, round(57.6 * k)) for k in range(4)] + [(4, round(57.6 * k)) for k in range(4)]
pops += [(9, 0), (9, 58), (12, 58), (15, 0), (15, 58)]
# Hints: bulb click, "Подсказки" popover, term tooltip
clicks2 = [(18, 46)]
for sc, lf in clicks2: at(CL, F(sc, lf), -16)
pops += [(18, 52), (18, 184)]
# AI word cut (AiWords): "А ТЕПЕРЬ", then the AI card
pops += [(19, 0), (19, 58)]
# other entrances found in the scene code
pops += [(2,180),(6,16),(7,4),(7,18),(7,202),(8,12),(8,216),(10,6),(17,122),(20,4)]
for sc, lf in pops: at(POP, F(sc, lf), -15)
for sc, lf in [(6,198),(7,238),(13,250),(17,348),(8,63),(8,170),(10,250),(14,202)]: at(CH, F(sc, lf), -17)
for sc, lf in [(5,6),(5,200),(5,370),(7,378),(8,190),(12,0),(13,0),(14,0),(16,0),(16,180),(2,0),(3,300),(11,0),(14,50)]:
    i = np.argmax(np.abs(WH).max(axis=1)); put(WH, F(sc, lf) / FPS - i / SR + 0.03, -18)

# soft whooshes for G3 card swipes
for sc, lf in [(8,74),(8,124)]:
    i = np.argmax(np.abs(WH).max(axis=1)); put(WH, F(sc, lf) / FPS - i / SR + 0.03, -23)

out = out[: int(DUR * SR)]
sf.write(os.path.join(ROOT, '../out/audio/premaster.wav'), out.astype(np.float32), SR, subtype='FLOAT')
print('premaster written', out.shape[0] / SR, 's, peak', np.abs(out).max())
