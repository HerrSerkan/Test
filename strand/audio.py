"""Ton für "Stell dir einen Strand vor.": Effekte (Musik kommt über tools/mix_music.py dazu). Hilfen aus schnee/audio.py."""
import json, os, wave
import numpy as np
from scipy.signal import lfilter, butter

HERE = os.path.dirname(os.path.abspath(__file__))
EV = json.load(open(os.path.join(HERE, "build", "events.json")))
T = EV["T"]
SR = 44100
DUR = EV["duration"]
N = int(DUR * SR)
out = np.zeros((N, 2), np.float32)
rng = np.random.default_rng(8)


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


def ts(L):
    return np.arange(int(L * SR)) / SR


def noise(L):
    return rng.normal(0, 1, int(L * SR))


def bell(f, L=1.0):
    x = ts(L)
    return sum(np.sin(2 * np.pi * f * m * x) * np.exp(-x * d) * g for m, d, g in [(1, 3, 0.6), (2.76, 5, 0.2), (5.4, 8, 0.1)]) * np.minimum(1, x / 0.004)


def pop(f=700):
    x = ts(0.12)
    return np.sin(2 * np.pi * (f + 900 * np.exp(-x * 40)) * x) * np.exp(-x * 28)


def whoosh(L=0.3, lo=600, hi=4000):
    x = ts(L)
    return bp(noise(L), lo, hi) * np.sin(np.pi * x / L) ** 2 * 1.4


def key():
    x = ts(0.05)
    return bp(noise(0.05), 1500, 7000) * np.exp(-x * 120) * 1.5 + np.sin(2 * np.pi * 180 * x) * np.exp(-x * 90) * 0.3


def thump(f=55, d=6):
    x = ts(0.7)
    return np.sin(2 * np.pi * np.cumsum(f + 80 * np.exp(-x * 25)) / SR) * np.exp(-x * d)


def ocean(L):
    x = ts(L)
    s = lp(noise(L), 1400) * (0.35 + 0.65 * np.sin(np.pi * ((x * 0.45) % 1)) ** 2)
    return s * np.minimum(1, x / 0.6) * np.minimum(1, (L - x) / 0.4)


def boop():
    x = ts(0.35)
    f = 420 * np.exp(-x * 2.2)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 6) * np.minimum(1, x / 0.01)


def sparkle(t0, g=0.04, base=2093):
    for k, f in enumerate([1, 1.26, 1.5, 2.0, 1.5]):
        place(t0 + k * 0.06, bell(base * f, 0.7), g)


for t in EV["titles"]:
    place(t - 0.08, whoosh(0.3), 0.18)
for k in range(3):
    place(T["clouds"] + k * 0.06 + 0.1, pop(600 + 120 * k), 0.25, pan=(k - 1) * 0.6)
for k, name in enumerate(["sky", "sea", "sand", "sun", "palm", "cloud", "crab"]):
    place(T[name], bell(1568 * 2 ** (k / 7), 0.6), 0.05, pan=-0.6)
place(T["k4"], bell(3136, 0.9), 0.09, pan=-0.6); place(T["k4"], pop(900), 0.15, pan=-0.6)
place(T["shades"], whoosh(0.2, 1500, 6000), 0.15, pan=-0.6); place(T["shades"] + 0.2, bell(2637, 0.8), 0.07, pan=-0.6)
for t in EV["keys"]:
    place(t, key(), 0.25, pan=0.6)
place(T["waves"], ocean(T["vanish"] - T["waves"]), 0.12, pan=-0.3)
place(T["t4"], thump(), 0.55); sparkle(T["t4"] + 0.05, 0.05)
place(T["shrug"] + 0.05, boop(), 0.25, pan=0.6)
sparkle(T["vanish"], 0.035, 2637)
for k in range(3):
    place(T["vanish"] + (2 - k) * 0.08, pop(900 - 100 * k), 0.12, pan=(k - 1) * 0.6)

peak = np.abs(out).max() + 1e-6
out = np.tanh(out / peak * 1.2) * 0.9
with wave.open(os.path.join(HERE, "build", "audio.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(out, -1, 1) * 32767).astype(np.int16).tobytes())
print("audio.wav geschrieben:", DUR, "s")
