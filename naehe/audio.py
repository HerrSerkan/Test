"""Tonspur für "Wenn ängstlich vermeidend liebt": Hintergrundmusik + Soundeffekte, keine Stimme.

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
# leise Schritte (beide laufen die ganze Zeit)
tt = 0.05
k = 0
while tt < DUR - 0.2:
    place(tt, thud(2.6, 0.1), 0.05, pan=-0.3 if k % 2 else 0.3)
    tt += 0.39
    k += 1
for th in EV["hearts"]:
    place(th, tone(1046.5, 1568, 0.18, 14, (1, 0.3)), 0.07, -0.3)
    place(th + 0.06, bell(2093, 0.8), 0.03, -0.3)
q = EV["question"]
place(q, tone(300, 600, 0.25, 6, (1, 0.4)), 0.08, -0.3)
# Pfeifen (Vermeidend schaut weg)
melody = [(0, 880, 0.22), (0.25, 988, 0.22), (0.5, 880, 0.2), (0.75, 784, 0.4), (1.25, 880, 0.22), (1.5, 1047, 0.3), (1.85, 988, 0.5)]
t0 = EV["notes"][0]
for dt, f, L in melody:
    place(t0 + dt, whistle(f, L), 0.06, 0.35)
for tr in EV["reach"]:
    place(tr, rustle(0.25, 1500, 6000), 0.08, -0.2)
for td in EV["dodge"]:
    place(td, whoosh(0.35, 800, 5000), 0.1, 0.3)
place(EV["hug"], whoosh(0.5, 500, 4000), 0.12)
place(EV["shock"] + 0.05, tone(700, 1200, 0.12, 20, (1, 0.2)), 0.06, 0.3)
place(EV["switch"] - 0.1, whoosh(0.4, 600, 6000), 0.1)
place(EV["switch"], bell(1318.5, 1.4), 0.06)
place(EV["switch"] + 0.08, bell(1975.5, 1.4), 0.04)

t_ = np.arange(N) / SR
END_ENV = np.clip((DUR - t_) / 0.3, 0, 1).astype(np.float32) * np.minimum(1, t_ / 0.05).astype(np.float32)
MUSIC_ENV = np.ones(N, np.float32)
MUSIC_LUFS = -17.0

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
