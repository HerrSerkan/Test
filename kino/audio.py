"""Ton für „Bin gleich da.“: Effekte (Musik kommt über tools/mix_music.py dazu)."""
import json, os, wave
import numpy as np
from scipy.signal import lfilter, butter

HERE = os.path.dirname(os.path.abspath(__file__))
EV = json.load(open(os.path.join(HERE, "build", "events.json")))
SR = 44100
DUR = EV["duration"]
N = int(DUR * SR)
out = np.zeros((N, 2), np.float32)
rng = np.random.default_rng(41)


def lp(x, fc):
    b, a = butter(2, fc / (SR / 2)); return lfilter(b, a, x)


def bp(x, lo, hi):
    b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], btype="band"); return lfilter(b, a, x)


def place(t0, sig, g=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N or i < 0:
        return
    j = min(N, i + len(sig))
    out[i:j, 0] += sig[: j - i] * g * (1 - max(0, pan))
    out[i:j, 1] += sig[: j - i] * g * (1 + min(0, pan))


def env(n, a, d):
    x = np.arange(n) / SR
    return np.minimum(1, x / max(a, 1e-4)) * np.exp(-x / d)


def slap():
    n = int(0.15 * SR)
    return (bp(rng.normal(0, 1, n), 800, 5000) * 1.4 + lp(rng.normal(0, 1, n), 300)) * env(n, 0.001, 0.025)


def tick(f=2400):
    n = int(0.04 * SR); x = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * x) * 0.5 + bp(rng.normal(0, 1, n), 2000, 7000) * 0.5) * env(n, 0.0005, 0.008)


def click():
    n = int(0.05 * SR)
    return bp(rng.normal(0, 1, n), 1500, 6000) * env(n, 0.0005, 0.006) * 1.5


def thump(f=60, d=0.08):
    n = int(0.3 * SR); x = np.arange(n) / SR
    return np.sin(2 * np.pi * (f + 60 * np.exp(-x * 30)) * x) * env(n, 0.002, d)


def whoosh(L=0.35, lo=400, hi=3000):
    n = int(L * SR); x = np.arange(n) / SR
    return bp(rng.normal(0, 1, n), lo, hi) * np.sin(np.pi * x / L) ** 2


def scratch():
    n = int(0.55 * SR); x = np.arange(n) / SR
    f = 300 + 1600 * np.abs(np.sin(2 * np.pi * 3.2 * x))
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR)
    return (bp(rng.normal(0, 1, n), 1000, 6000) * 0.6 + tone * 0.5) * np.sin(np.pi * x / x[-1])


def pop(f=700):
    n = int(0.12 * SR); x = np.arange(n) / SR
    return np.sin(2 * np.pi * (f + 900 * np.exp(-x * 40)) * x) * env(n, 0.002, 0.035)


def puff():
    n = int(0.3 * SR)
    return bp(rng.normal(0, 1, n), 300, 2500) * env(n, 0.005, 0.07)


def boom():
    n = int(1.2 * SR); x = np.arange(n) / SR
    return np.sin(2 * np.pi * (45 + 60 * np.exp(-x * 9)) * x) * env(n, 0.003, 0.4) * 1.2 + lp(rng.normal(0, 1, n), 1800) * env(n, 0.001, 0.05) * 0.5


def chime(f):
    n = int(0.7 * SR); x = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * f * k * x) / k for k in (1, 2, 3)) * env(n, 0.002, 0.22) * 0.5


# Wecker


def pling():
    n = int(0.5 * SR); x = np.arange(n) / SR
    a = np.sin(2 * np.pi * 1568 * x) * env(n, 0.002, 0.12)
    b = np.sin(2 * np.pi * 2093 * x) * env(n, 0.002, 0.18)
    b[: int(0.09 * SR)] = 0
    return (a + b * 0.9) * 0.6


def buzz():
    n = int(0.35 * SR); x = np.arange(n) / SR
    return np.sin(2 * np.pi * 150 * x) * ((x * 9) % 1 < 0.6) * np.exp(-x * 3) * 0.35


EV_shower = EV["shower"]
for t in EV["clock"]:
    place(t, tick(2600 if t < EV["climax"] else 1800), 0.11)
for t in EV["msgs"]:
    place(t, pling(), 0.55); place(t, buzz(), 0.25)
for t in EV["puffs"]:
    place(t, puff(), 0.3)
t = EV["tap"][0]
while t < EV["tap"][1]:
    place(t, thump(110, 0.03), 0.4, pan=-0.4); place(t, slap(), 0.12, pan=-0.4); t += 1 / 2.2
t = EV["run"][0]
while t < EV["run"][1]:
    place(t, thump(95, 0.03), 0.45); t += 0.11
place(EV["stumble"], thump(55, 0.12), 0.7); place(EV["stumble"] + 0.03, slap(), 0.35)
place(EV["bow"], whoosh(0.35, 300, 1500), 0.3)
place(EV["sorry"], pop(650), 0.4)
place(EV["look"], whoosh(0.25, 800, 4000), 0.35); place(EV["look"] + 0.05, tick(1200), 0.3)
place(EV["film"], chime(1046), 0.25, pan=-0.3); place(EV["film"] + 0.12, chime(1318), 0.2, pan=-0.3)
for k in range(3):
    place(EV["search"][0] + k * 0.45, whoosh(0.22, 600, 3000), 0.35)
place(EV["climax"] - 0.05, scratch(), 0.45)
place(EV["climax"], boom(), 0.8)
place(EV["climax"] + 0.02, whoosh(0.3, 500, 4000), 0.5, pan=0.5)
# Duschrauschen, solange ins Fenster gezoomt ist
a, b = EV_shower; n = int((b - a) * SR)
sh = bp(rng.normal(0, 1, n), 1500, 9000) * np.minimum(1, np.arange(n) / (0.15 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.3 * SR))
place(a, sh, 0.35, pan=0.4)
place(EV["flip"], whoosh(0.3, 800, 5000), 0.35, pan=0.5); place(EV["flip"] + 0.18, chime(1568), 0.25, pan=0.5)
for k in range(3):
    place(EV["wave"] + k * 0.2, whoosh(0.15, 1000, 4000), 0.2, pan=0.5)
place(EV["title"][0], thump(55, 0.12), 0.75); place(EV["title"][1], pling(), 0.5)
place(EV["sticker"], pop(900), 0.4)
place(EV["curtainClose"], whoosh(0.3, 400, 3000), 0.4, pan=0.5)
place(EV["out"], tick(), 0.3)

out = out / (np.abs(out).max() + 1e-9) * 0.9
with wave.open(os.path.join(HERE, "build", "audio.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
print("audio.wav", DUR, "s")
