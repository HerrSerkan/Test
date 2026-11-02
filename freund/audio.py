"""Ton für "Falscher Freund / Echter Freund": Effekte (Musik über tools/mix_music.py)."""
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




def splashsnd():
    n = int(0.9 * SR); x = np.arange(n) / SR
    return bp(rng.normal(0, 1, n), 300, 6000) * env(n, 0.01, 0.25) * (1 + 0.5 * np.sin(2 * np.pi * 13 * x))


def carpass():
    n = int(0.9 * SR); x = np.arange(n) / SR
    f = 90 * (1.25 - 0.5 * x / x[-1])
    eng = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.3
    return (lp(eng, 900) + bp(rng.normal(0, 1, n), 300, 3000) * 0.8) * np.sin(np.pi * x / x[-1]) ** 2


def ha(f=250):
    n = int(0.14 * SR); x = np.arange(n) / SR
    src = np.sign(np.sin(2 * np.pi * f * x)) * 0.5 + rng.normal(0, 0.2, n)
    return (bp(src, 600, 1300) + 0.5 * bp(src, 1100, 1900)) * np.sin(np.pi * x / x[-1]) ** 2


def rub():
    n = int(0.22 * SR)
    return bp(rng.normal(0, 1, n), 1500, 6000) * np.sin(np.pi * np.arange(n) / n) ** 2


def gasp():
    n = int(0.4 * SR); x = np.arange(n) / SR
    return bp(rng.normal(0, 1, n), 700, 3000) * np.sin(np.pi * x / x[-1]) * np.exp(-x * 4)


for a, b in EV["walk"]:
    t = a
    while t < b:
        place(t, thump(85, 0.03), 0.3); t += 0.31
for s in EV["splash"]:
    place(s - 0.3, carpass(), 0.6); place(s, splashsnd(), 0.6)
place(EV["gasp"], gasp(), 0.35, pan=-0.3)
t = EV["wipe"][0]
while t < EV["wipe"][1]:
    place(t, rub(), 0.3); t += 0.35
t = EV["laugh"][0]; i = 0
while t < EV["laugh"][1]:
    place(t, ha(240 + (i % 3) * 30), 0.4, pan=-0.3); t += 0.17; i += 1
place(EV["jump"], whoosh(0.4, 300, 2500), 0.4)
place(EV["flop"], thump(50, 0.15), 0.8); place(EV["flop"], splashsnd(), 0.6)
t = EV["wiggle"][0]
while t < EV["wiggle"][1]:
    place(t, splashsnd()[: int(0.15 * SR)] * 0.5, 0.3); t += 0.18
place(EV["up"], whoosh(0.3, 300, 1500), 0.25)
t = EV["laugh2"][0]; i = 0
while t < EV["laugh2"][1]:
    place(t, ha(230 + (i % 2) * 60), 0.35, pan=(-0.2 if i % 2 else 0.2)); t += 0.16; i += 1

out = out / (np.abs(out).max() + 1e-9) * 0.9
with wave.open(os.path.join(HERE, "build", "audio.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
print("audio.wav", DUR, "s")
