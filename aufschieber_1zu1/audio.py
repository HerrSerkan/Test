"""Ton für "Aufschieber vs. Planer": nur Effekte, keine Musik."""
import json, os, wave
import numpy as np
from scipy.signal import lfilter, butter

HERE = os.path.dirname(os.path.abspath(__file__))
EV = json.load(open(os.path.join(HERE, "build", "events.json")))
SR = 44100
DUR = EV["duration"]
N = int(DUR * SR)
out = np.zeros((N, 2), np.float32)
rng = np.random.default_rng(5)


def bp(x, lo, hi):
    b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], btype="band")
    return lfilter(b, a, x)


def lp(x, fc):
    b, a = butter(2, fc / (SR / 2))
    return lfilter(b, a, x)


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


def tear():
    n = int(0.22 * SR)
    x = np.arange(n) / SR
    crackle = (rng.random(n) < 0.08) * rng.normal(0, 1, n)
    return bp(rng.normal(0, 1, n) * 0.6 + crackle * 2, 1500, 7000) * env(n, 0.01, 0.07) * 2


def scribble(L, speed):
    n = int(L * SR)
    x = np.arange(n) / SR
    mod = 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * speed * x + np.sin(x * 7) * 2))
    return bp(rng.normal(0, 1, n), 2500, 8000) * mod * 0.8


def click(f=3000):
    n = int(0.03 * SR)
    x = np.arange(n) / SR
    return np.sin(2 * np.pi * f * x) * env(n, 0.0005, 0.004)


def ding(f):
    n = int(1.6 * SR)
    x = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * f * m * x) * np.exp(-x * d) * g for m, d, g in [(1, 2.5, 0.6), (2.0, 4, 0.25), (3.01, 6, 0.1)])


def thud():
    n = int(0.5 * SR)
    x = np.arange(n) / SR
    return np.sin(2 * np.pi * (60 + 50 * np.exp(-x * 25)) * x) * env(n, 0.003, 0.12) + lp(rng.normal(0, 1, n), 600) * env(n, 0.002, 0.05)


def whoosh(L):
    n = int(L * SR)
    x = np.arange(n) / SR
    return bp(rng.normal(0, 1, n), 400, 3000) * np.sin(np.pi * x / L) ** 2


# Raumton
room = lp(rng.normal(0, 1, N), 300)
out += (room / np.abs(room).max() * 0.03)[:, None]

for t in EV["pages"]:
    place(t - 0.02, tear(), 0.35, pan=-0.1)
for a, b in EV["planWrite"]:
    place(a, scribble(b - a, 6), 0.12, pan=0.35)
place(EV["panicWrite"][0], scribble(EV["panicWrite"][1] - EV["panicWrite"][0], 13), 0.2, pan=-0.35)
# Handy-Tippen
for a, b in [(0.2, EV["panic"] - 0.1), (EV["phone2"] + 0.4, DUR - 0.3)]:
    t = a
    while t < b:
        place(t, click(2800 + rng.random() * 800), 0.12, pan=-0.35)
        t += 0.18 + rng.random() * 0.5
# Regen + Donner
r0, r1 = 3.9, EV["due"] + 0.4
rain = bp(rng.normal(0, 1, int((r1 - r0) * SR)), 800, 6000)
x = np.arange(len(rain)) / SR
rain *= np.minimum(1, x / 0.4) * np.minimum(1, (x[-1] - x) / 0.4)
place(r0, rain, 0.08, pan=-0.3)
n = int(2.5 * SR)
x = np.arange(n) / SR
thunder = lp(rng.normal(0, 1, n), 180) * env(n, 0.02, 0.8) * 3 + bp(rng.normal(0, 1, n), 1000, 5000) * env(n, 0.001, 0.05)
place(EV["panic"] + 0.1, thunder, 0.5, pan=-0.2)
# Abgabe, Noten, Wurf, Zusammenbruch, Neustart
place(EV["due"], tear(), 0.5)
place(EV["grade"] + 0.05, ding(880), 0.25, pan=-0.3)
place(EV["grade"] + 0.12, ding(1046.5), 0.2, pan=0.3)
place(EV["throwT"], whoosh(0.6), 0.25, pan=-0.2)
place(EV["collapse"] + 0.25, thud(), 0.6, pan=-0.3)
place(EV["reset"] - 0.02, tear(), 0.45)

fade = np.ones(N, np.float32)
fade[-int(0.35 * SR):] = np.linspace(1, 0, int(0.35 * SR))
out *= fade[:, None]
out = out / (np.abs(out).max() + 1e-9) * 0.9
with wave.open(os.path.join(HERE, "build", "audio.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
print("audio.wav", DUR, "s")
