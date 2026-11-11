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
STING = STARTS[21] / FPS + 2.33
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

# ---- music: Mixkit 371 (tech house, 130 BPM, downbeats at 0.012 + k*1.84615 s), edited on bar lines
M = load(os.path.join(ROOT, "assets/music/mk-371.mp3"))
def seg(src_from, src_to, at, fi=0.01, fo=0.012, g=0.0):
    a, b = int(src_from * SR), int(src_to * SR)
    put(fade(M[a:b].copy(), fi, fo), at, g)
seg(19.228, 29.551, 0.0, fi=0.3, g=-1.5)   # lighter build under the intro
seg(29.551, 59.089, 10.323)                # drop 1
seg(42.474, 59.089, 39.861)                # drop 1 again from bar 23
seg(72.012, 87.705, 56.476)                # build, 9 bars
seg(88.628, 118.0, 72.169, fo=1.6)         # drop 2 into the ending hit (film ~95.25)
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
for sc, lf in clicks: at(CL, F(sc, lf), -16)
pops = [(0,112),(5,303),(6,100),(6,128),(6,156),(6,184),(11,70),(11,116),(11,162),(11,208),(17,348),(18,76),(18,112),(18,160),(19,2),(19,8),(19,14),(19,20),(19,50),(21,10),(21,60)]
pops += [(10, 60 + 30 * k) for k in range(6)] + [(20, 24 + 30 * k) for k in range(4)]
for sc, lf in pops: at(POP, F(sc, lf), -15)
for sc, lf in [(6,198),(7,238),(13,250),(17,348)]: at(CH, F(sc, lf), -17)
for sc, lf in [(5,6),(5,200),(5,370),(7,378),(8,190),(12,0),(13,0),(14,0),(16,0),(16,180)]:
    i = np.argmax(np.abs(WH).max(axis=1)); put(WH, F(sc, lf) / FPS - i / SR + 0.03, -18)

out = out[: int(DUR * SR)]
sf.write(os.path.join(ROOT, '../out/audio/premaster.wav'), out.astype(np.float32), SR, subtype='FLOAT')
print('premaster written', out.shape[0] / SR, 's, peak', np.abs(out).max())
