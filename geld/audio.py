"""Tonspur für "Warum Geld sich bewegt": Stimme + Soundeffekte (synthetisch), keine Musik.

Liest build/voice.wav (script.py) und build/events.json (render.js --events) -> build/audio.wav (Stereo, -14 LUFS).
"""
import json
import os
import re
import subprocess
import wave

import numpy as np
from scipy.ndimage import maximum_filter1d, minimum_filter1d
from scipy.signal import butter, lfilter

HERE = os.path.dirname(os.path.abspath(__file__))
B = os.path.join(HERE, "build")
SR = 44100
EV = json.load(open(os.path.join(B, "events.json")))
DUR = EV["duration"]
N = int(DUR * SR)
rng = np.random.default_rng(31)
sfx = np.zeros((N, 2), np.float32)


def band(x, lo, hi):
    b, a = butter(2, [lo / (SR / 2), min(hi, SR / 2 - 100) / (SR / 2)], "band")
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
    sfx[i:j, 0] += s * (1 - max(0, pan))
    sfx[i:j, 1] += s * (1 + min(0, pan))


def env(n, a, d):
    x = np.arange(n) / SR
    return np.minimum(1, x / max(a, 1e-4)) * np.exp(-x * d)


def tone(f0, f1, L, d=8, harm=(1, 0.2)):
    n = int(L * SR)
    ph = 2 * np.pi * np.cumsum(np.geomspace(f0, f1, n)) / SR
    return (sum(g * np.sin(ph * (k + 1)) for k, g in enumerate(harm)) * env(n, 0.003, d)).astype(np.float32)


def bell(f, L=1.6, d=2.6):
    n = int(L * SR)
    x = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * m * x) * np.exp(-x * d * k) * g for m, k, g in [(1, 1, 0.6), (2.01, 1.6, 0.2), (3.0, 2.4, 0.1), (4.2, 3, 0.05)])
    return (s * np.minimum(1, x / 0.004)).astype(np.float32)


def whoosh(L, lo, hi):
    n = int(L * SR)
    x = np.arange(n) / SR
    return (band(rng.normal(0, 1, n), lo, hi) * np.sin(np.pi * x / L) ** 2 * 1.4).astype(np.float32)


def sweep(L, f0, f1):
    n = int(L * SR)
    x = np.arange(n) / SR
    noise = rng.normal(0, 1, n)
    out = np.zeros(n)
    for k in range(8):                       # Bandpass, der wandert
        a, b = k * n // 8, (k + 1) * n // 8
        fc = f0 * (f1 / f0) ** ((k + 0.5) / 8)
        out[a:b] = band(noise, fc * 0.7, fc * 1.4)[a:b]
    return (out * np.sin(np.pi * x / L) ** 2).astype(np.float32)


def thump(f=1.0, L=0.6):
    n = int(L * SR)
    x = np.arange(n) / SR
    s = np.sin(2 * np.pi * np.cumsum((45 + 70 * np.exp(-x * 14)) * f) / SR) * env(n, 0.002, 7)
    return s.astype(np.float32)


def click(f=3000):
    n = int(0.03 * SR)
    return (band(rng.normal(0, 1, n), f * 0.6, f * 1.6) * env(n, 0.0003, 220)).astype(np.float32)


def coin_clink(f=1.0):
    n = int(0.5 * SR)
    x = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * fr * f * x) * np.exp(-x * d) * g for fr, d, g in [(2650, 9, 0.5), (4120, 13, 0.3), (5980, 18, 0.2)])
    return (s * np.minimum(1, x / 0.001)).astype(np.float32)


def pop():
    return tone(700, 1250, 0.09, 30, (1, 0.25))


def buzz():
    n = int(0.22 * SR)
    x = np.arange(n) / SR
    s = np.sign(np.sin(2 * np.pi * 110 * x)) * 0.5 + np.sin(2 * np.pi * 220 * x) * 0.3
    return (low(s, 1400) * env(n, 0.004, 9)).astype(np.float32)


# ---------------------------------------------------------------- Effekte
for ts in EV["scenes"]:
    place(ts - 0.2, whoosh(0.55, 600, 5000), 0.05, rng.uniform(-0.3, 0.3))

r0, r1 = EV["run"]
place(r0, whoosh(r1 - r0 + 0.3, 1500, 8000), 0.06)
tt = r0 + 0.1
while tt < r1:
    place(tt, thump(2.2, 0.12), 0.08, -0.2)
    tt += 0.14
place(r0 + 0.2, bell(2093, 1.0, 4), 0.03, 0.3)
for k in range(10):
    place(EV["chaos"] + rng.uniform(0, 0.8), coin_clink(rng.uniform(0.8, 1.3)), 0.03, rng.uniform(-0.6, 0.6))
place(EV["focus"], thump(0.8), 0.18)
place(EV["focus"] + 0.05, click(2400), 0.08)
for k in range(5):
    place(EV["blueprint"] + 0.2 + k * 0.12, click(4500), 0.05, rng.uniform(-0.4, 0.4))

c0, c1 = EV["count"]
for k in range(34):
    u = k / 33
    place(c0 + (c1 - c0) * u ** 0.6, click(3500 + 1500 * u), 0.06)
place(c1, bell(1318.5), 0.06)

i0, i1 = EV["iceberg"]
place(i0, whoosh(1.2, 120, 900), 0.12)
place(i1, bell(659.3, 2.0, 1.8), 0.07)

for p in EV["presses"]:
    place(p, click(1800), 0.14)
    place(p + 0.04, buzz(), 0.05)

place(EV["gift"], pop(), 0.1, 0.3)
place(EV["tip"], thump(1.4, 0.4), 0.15, 0.2)
place(EV["tip"] + 0.15, pop(), 0.09)

g0, g1 = EV["glasses"]
place(g0, whoosh(g1 - g0 + 0.2, 400, 4000), 0.1)
place(g1 + 0.05, click(2600), 0.1)
place(g1 + 0.05, bell(1760, 1.2, 3.5), 0.03)

b = EV["building"]
place(b[0], whoosh(0.8, 80, 600), 0.18)
for k in range(6):
    place(b[1] + k * 0.07, tone(1200 + k * 120, 1300 + k * 120, 0.08, 30), 0.03)
for k in range(8):
    place(b[2] + k * 0.28, thump(2.4, 0.1), 0.05, rng.uniform(-0.5, 0.5))
place(b[3], pop(), 0.1)
for k in range(3):
    place(b[3] + k * 0.55, tone(520, 520, 1.2, 3, (1, 0.1)), 0.025)
for k in range(6):
    place(b[4] + 0.6 + k * 0.12, coin_clink(rng.uniform(0.9, 1.2)), 0.04, rng.uniform(-0.4, 0.4))

for k, tn in enumerate(EV["nodes"]):
    place(tn, tone(660 * 1.12 ** k, 880 * 1.12 ** k, 0.12, 20, (1, 0.3)), 0.06, [-0.4, 0.4, 0.4, -0.4][k])
place(EV["bars"][0], whoosh(0.5, 500, 4000), 0.07)
place(EV["bars"][1], tone(180, 520, 0.8, 3, (1, 0.4, 0.2)), 0.06, 0.3)

place(EV["effort"], tone(300, 700, 0.6, 4, (1, 0.3)), 0.05)
place(EV["value"] + 0.1, tone(400, 1000, 0.7, 4, (1, 0.3)), 0.05)
place(EV["outcome"], bell(1046.5, 1.6, 2.4), 0.06)
place(EV["buyer"][0], pop(), 0.08, 0.3)
for k in range(5):
    place(EV["buyer"][1] + 0.5 + k * 0.16, coin_clink(rng.uniform(0.9, 1.15)), 0.045, 0.1)

place(EV["advantage"], pop(), 0.1)
place(EV["scan"] + 0.2, sweep(1.6, 400, 4000), 0.08)
for k, tv in enumerate(EV["venn"]):
    place(tv, tone(523.3 * [1, 1.26, 1.5][k], 523.3 * [1, 1.26, 1.5][k], 0.5, 6, (1, 0.2)), 0.05, [0, -0.4, 0.4][k])
place(EV["merge"], whoosh(0.8, 300, 3000), 0.08)
place(EV["plus"], bell(1567.98, 1.8, 2.2), 0.06)
place(EV["chance"], pop(), 0.1, 0.3)

w = EV["wealth"]
place(w[0], thump(0.7, 1.2), 0.22)
place(w[0], bell(392, 2.4, 1.3), 0.04)
place(w[1], click(2200), 0.08)
for tw in w[2:]:
    place(tw, tone(900, 1000, 0.1, 25), 0.03)

f0 = EV["flow"]
n = N - int(f0 * SR)
x = np.arange(n) / SR
bed = band(rng.normal(0, 1, n), 1500, 7000) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.35 * x)) * np.minimum(1, x / 1.5)
place(f0, bed.astype(np.float32), 0.012)
for tb in EV["blocks"][:3]:
    place(tb, thump(1.6, 0.35), 0.13)
    place(tb, click(1500), 0.05)
place(EV["blocks"][3], bell(1046.5, 3.0, 1.0), 0.06)
place(EV["blocks"][3] + 0.1, bell(1567.98, 3.0, 1.1), 0.04)
place(EV["you"], whoosh(1.2, 200, 2500), 0.06)

# ---------------------------------------------------------------- Mischung
with wave.open(os.path.join(B, "voice.wav")) as wv:
    voice = np.frombuffer(wv.readframes(wv.getnframes()), np.int16).astype(np.float32) / 32768
voice = np.pad(voice[:N], (0, max(0, N - len(voice))))
voice = voice / (np.abs(voice).max() + 1e-6) * 0.8
envv = low(np.abs(voice), 5)
envv = np.clip(envv / (envv.max() + 1e-6) * 5, 0, 1)
duck = (1 - 0.35 * envv).astype(np.float32)
mix = sfx * duck[:, None] * 1.6 + voice[:, None] * 0.9
t = np.arange(N) / SR
mix *= np.clip((DUR - 0.15 - t) / 1.0, 0, 1)[:, None]
mix /= np.abs(mix).max() + 1e-6

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


# Lautheit exakt auf -14 LUFS (EBU R128), Spitzen per Limiter unter -2 dBFS
boost = 0.0
for _ in range(4):
    boost += -14.0 - lufs(limit(mix * 10 ** (boost / 20)))
mix = limit(mix * 10 ** (boost / 20))
os.remove(TMP)
write(os.path.join(B, "audio.wav"), mix)
print("audio.wav geschrieben:", DUR, "s")
