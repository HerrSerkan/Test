"""Tonspur für "Welcher Geburtsmonat gewinnt? – Das Zauberschul-Rennen": Hintergrundmusik + Soundeffekte, keine Stimme.

Musik: build/music.mp3 (ElevenLabs Music), sonst build/music_synth.wav (tools/synth_music.py).
"""
import json
import os
import wave

import numpy as np
from scipy.signal import butter, lfilter

HERE = os.path.dirname(os.path.abspath(__file__))
B = os.path.join(HERE, "build")
SR = 44100
EV = json.load(open(os.path.join(B, "events.json")))
DUR = EV["duration"]
N = int(DUR * SR)
rng = np.random.default_rng(4)
out = np.zeros((N, 2), np.float32)


def band(x, lo, hi):
    b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], "band")
    return lfilter(b, a, x)


def low(x, f):
    b, a = butter(2, f / (SR / 2))
    return lfilter(b, a, x)


def place(t0, sig, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N or i + len(sig) <= 0:
        return
    j = min(N, i + len(sig))
    s = sig[: j - i] * gain
    out[i:j, 0] += s * (1 - max(0, pan))
    out[i:j, 1] += s * (1 + min(0, pan))


def env(n, a, d):
    x = np.arange(n) / SR
    return np.minimum(1, x / max(a, 1e-4)) * np.exp(-x * d)


def stone(f=1.0):
    """Ziegel wird abgesetzt: kurzes Klacken + dumpfer Körper"""
    n = int(0.25 * SR)
    x = np.arange(n) / SR
    s = band(rng.normal(0, 1, n), 700 * f, 3200 * f) * env(n, 0.0008, 70)
    s += np.sin(2 * np.pi * 140 * f * x) * env(n, 0.001, 32) * 0.7
    s += band(rng.normal(0, 1, n), 150, 600) * env(n, 0.001, 40) * 0.6
    return s.astype(np.float32)


def tap(f=4200):
    n = int(0.05 * SR)
    return (band(rng.normal(0, 1, n), f * 0.7, min(f * 1.4, 20000)) * env(n, 0.0005, 160)).astype(np.float32)


def thud(f=1.0, L=0.45):
    n = int(L * SR)
    x = np.arange(n) / SR
    s = np.sin(2 * np.pi * np.cumsum((50 + 80 * np.exp(-x * 18)) * f) / SR) * env(n, 0.002, 10)
    s += low(rng.normal(0, 1, n), 700) * env(n, 0.001, 35) * 0.5
    return s.astype(np.float32)


def rustle(L=0.35, lo=1200, hi=6000):
    n = int(L * SR)
    x = np.arange(n) / SR
    am = 0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 13 * x + rng.uniform(0, 3)))
    return (band(rng.normal(0, 1, n), lo, hi) * np.sin(np.pi * x / L) ** 2 * am).astype(np.float32)


def whoosh(L, lo, hi, rise=False):
    n = int(L * SR)
    x = np.arange(n) / SR
    s = band(rng.normal(0, 1, n), lo, hi) * np.sin(np.pi * x / L) ** 2
    if rise:
        s = s * (x / L) ** 0.5 + band(rng.normal(0, 1, n), hi, min(hi * 2.5, 18000)) * (x / L) ** 2 * np.sin(np.pi * x / L) * 0.5
    return (s * 1.6).astype(np.float32)


def bell(f, L=1.8):
    n = int(L * SR)
    x = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * m * x) * np.exp(-x * d) * gg for m, d, gg in
            [(1, 2.2, 0.6), (2.0, 3.5, 0.2), (3.01, 5, 0.12), (5.4, 7, 0.06)])
    return (s * np.minimum(1, x / 0.003)).astype(np.float32)


def breath(L=0.9):
    n = int(L * SR)
    x = np.arange(n) / SR
    e = np.sin(np.pi * x / L) ** 1.5 * np.exp(-x * 1.2)
    return (band(rng.normal(0, 1, n), 350, 2200) * e).astype(np.float32)



def tone(f0, f1, L, d=8, harm=(1, 0.2)):
    n = int(L * SR)
    ph = 2 * np.pi * np.cumsum(np.geomspace(f0, f1, n)) / SR
    return (sum(g * np.sin(ph * (k + 1)) for k, g in enumerate(harm)) * env(n, 0.003, d)).astype(np.float32)


def whistle(f, L):
    n = int(L * SR)
    x = np.arange(n) / SR
    fr = f * (1 + 0.012 * np.sin(2 * np.pi * 6 * x))
    s = np.sin(2 * np.pi * np.cumsum(fr) / SR) + band(rng.normal(0, 1, n), f * 0.8, f * 1.3) * 0.08
    return (s * np.minimum(1, x / 0.04) * np.clip((L - x) / 0.08, 0, 1)).astype(np.float32)


# ---------------------------------------------------------------- Effekte
r0, r1 = EV["race"]
tt = r0
k = 0
while tt < r1:
    if not any(a <= tt < b for a, b in ((20.0, 22.6), (43.4, 46.0))):
        place(tt, thud(rng.uniform(2.6, 3.4), 0.08), 0.05, pan=rng.uniform(-0.5, 0.5))
    tt += 0.11
    k += 1
place(EV["broom0"], whoosh(0.9, 500, 5000), 0.18)
place(EV["start"], thud(0.8, 0.6), 0.35)
place(EV["start"], tap(2000), 0.2)


def boing(f=1.0):
    n = int(0.6 * SR)
    x = np.arange(n) / SR
    fr = (220 + 180 * np.sin(2 * np.pi * 9 * x) * np.exp(-x * 4)) * f
    return (np.sin(2 * np.pi * np.cumsum(fr) / SR) * env(n, 0.002, 4)).astype(np.float32)


for o in EV["outs"]:
    t0, kind = o["t"], o["kind"]
    if kind == "book":
        for d in (0.0, 0.12, 0.24):
            place(t0 + d, tap(1600), 0.35)
            place(t0 + d, thud(1.8, 0.15), 0.15)
    elif kind == "cauldron":
        for d in range(6):
            place(t0 + d * 0.08, tone(300 + d * 60, 200 + d * 40, 0.12, 14, (1, 0.3)), 0.07)
        place(t0, whoosh(0.5, 200, 1500), 0.12)
    elif kind == "owl":
        for d in range(8):
            place(t0 - 0.5 + d * 0.13, whoosh(0.12, 300, 2500), 0.12, pan=0.3)
        place(t0 + 0.2, tone(420, 380, 0.35, 5, (1, 0.2)), 0.06)
        place(t0 + 0.65, tone(400, 360, 0.5, 4, (1, 0.2)), 0.06)
    elif kind == "ghost":
        n = int(0.9 * SR)
        x = np.arange(n) / SR
        g = np.sin(2 * np.pi * np.cumsum(260 + 60 * np.sin(2 * np.pi * 5 * x)) / SR) * np.sin(np.pi * x / 0.9)
        place(t0, g.astype(np.float32), 0.07)
        place(t0 + 0.1, whoosh(0.6, 800, 5000), 0.12, pan=-0.6)
    elif kind == "ball":
        place(t0 - 0.5, whoosh(0.5, 600, 5000), 0.12, pan=0.6)
        place(t0, thud(1.2, 0.4), 0.35)
        place(t0, tap(900), 0.25)
    elif kind == "stairs":
        for d in range(6):
            place(t0 - 0.6 + d * 0.3, tone(140, 120, 0.25, 6, (1, 0.6, 0.3)), 0.05)
    elif kind == "broom":
        place(t0 - 0.3, whoosh(0.6, 1500, 8000), 0.25)
        place(t0, thud(1.4, 0.3), 0.2)
    elif kind == "hat":
        place(t0, boing(), 0.18)
        place(t0 + 0.05, whoosh(0.7, 800, 6000), 0.12)
    elif kind == "magic":
        for f, d in ((1046.5, 0), (1318.5, 0.08), (1568, 0.16), (2093, 0.24)):
            place(t0 + d, bell(f, 1.0), 0.05)
        place(t0, whoosh(0.6, 300, 3000), 0.12)
    elif kind == "poof":
        place(t0, whoosh(0.5, 200, 2500), 0.3)
        place(t0, thud(1.0, 0.4), 0.15)
for tb in EV["banners"]:
    place(tb, tone(880, 880, 0.16, 12, (1, 0.3)), 0.06)
    place(tb + 0.1, tone(660, 660, 0.25, 8, (1, 0.3)), 0.05)
    place(tb + 0.25, tap(2400), 0.08)
place(EV["wand"], bell(2093, 1.0), 0.05)
for d in range(6):
    place(EV["wand"] + 0.1 + d * 0.06, tap(5000), 0.04)
place(EV["zoom"], whoosh(0.8, 800, 7000), 0.25)
for tc in EV["cuts"]:
    place(tc - 0.1, whoosh(0.35, 700, 6000), 0.08)
place(EV["spit"], tone(500, 1200, 0.15, 14, (1, 0.3)), 0.12)
place(EV["hey"], tone(600, 900, 0.18, 10, (1, 0.4)), 0.07)
for f, d in ((523.3, 0), (659.3, 0.12), (784, 0.24), (1046.5, 0.36), (1318.5, 0.5)):
    place(EV["win"] + d, bell(f, 1.6), 0.07)
for d in range(14):
    place(EV["win"] + 0.2 + d * rng.uniform(0.05, 0.12), tap(rng.uniform(3000, 6000)), 0.04, pan=rng.uniform(-0.7, 0.7))
place(EV["second"], tone(500, 380, 0.5, 4, (1, 0.3)), 0.06)
place(EV["send"], bell(1318.5, 1.4), 0.06)

t_ = np.arange(N) / SR
END_ENV = np.clip((DUR - t_) / 0.4, 0, 1).astype(np.float32) * np.minimum(1, t_ / 0.05).astype(np.float32)
MUSIC_ENV = np.ones(N, np.float32)
MUSIC_LUFS = -16.0

# ---------------------------------------------------------------- Ausgabe: Effekte + Hintergrundmusik
import re
import subprocess
from scipy.ndimage import maximum_filter1d, minimum_filter1d

t = np.arange(N) / SR
TMP = os.path.join(B, "audio_tmp.wav")


def write(path, x):
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())


def lufs(x):
    write(TMP, x)
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", TMP, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r)[-1])


def limit(x, ceil=0.8):
    pk = maximum_filter1d(np.abs(x).max(1), int(0.006 * SR))
    g = minimum_filter1d(np.minimum(1, ceil / (pk + 1e-9)), int(0.006 * SR))
    g = lfilter([0.004], [1, -0.996], g - 1) + 1
    return x * np.minimum(g, np.minimum(1, ceil / (pk + 1e-9)))[:, None]


def to_lufs(x, target, lim=True):
    gdb = 0.0
    for _ in range(4):
        y = x * 10 ** (gdb / 20)
        gdb += target - lufs(limit(y) if lim else y)
    y = x * 10 ** (gdb / 20)
    return limit(y) if lim else y


# Effekte allein auf -16 LUFS
sfx = out / (np.abs(out).max() + 1e-6)
sfx = to_lufs(sfx, -16.0)
# Hintergrundmusik (ElevenLabs Music, build/music.mp3) etwas leiser darunter
MUSIC = os.path.join(B, "music.mp3")
if not os.path.exists(MUSIC):
    MUSIC = os.path.join(B, "music_synth.wav")
music = np.zeros((N, 2), np.float32)
if os.path.exists(MUSIC):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", MUSIC, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    m = np.frombuffer(raw, np.float32).reshape(-1, 2)[:N]
    music[: len(m)] = m
    music *= MUSIC_ENV[:, None]
    music = to_lufs(music, MUSIC_LUFS, lim=False)
mix = sfx + music
mix *= END_ENV[:, None]
mix = to_lufs(mix, -14.0)                  # gesamt exakt -14 LUFS (EBU R128), Spitzen unter -2 dBFS
os.remove(TMP)
write(os.path.join(B, "audio.wav"), mix)
print("audio.wav geschrieben:", DUR, "s")
