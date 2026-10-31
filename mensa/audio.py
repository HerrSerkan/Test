"""Ton für "Gleicher Tisch. Anderer Grund.": Effekte (Musik kommt über tools/mix_music.py dazu)."""
import json, os, wave
import numpy as np
from scipy.signal import lfilter, butter

HERE = os.path.dirname(os.path.abspath(__file__))
EV = json.load(open(os.path.join(HERE, "build", "events.json")))
SR = 44100
DUR = EV["duration"]
N = int(DUR * SR)
out = np.zeros((N, 2), np.float32)
rng = np.random.default_rng(21)


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


def pop(f=700):
    n = int(0.12 * SR); x = np.arange(n) / SR
    return np.sin(2 * np.pi * (f + 900 * np.exp(-x * 40)) * x) * env(n, 0.002, 0.035)


def puff():
    n = int(0.3 * SR)
    return bp(rng.normal(0, 1, n), 300, 2500) * env(n, 0.005, 0.07)


def step():
    n = int(0.1 * SR)
    return lp(rng.normal(0, 1, n), 700) * env(n, 0.002, 0.025) * 2


def robot():
    n = int(0.6 * SR); x = np.arange(n) / SR
    sq = np.sign(np.sin(2 * np.pi * 220 * x)) * 0.3 + np.sign(np.sin(2 * np.pi * 330 * x)) * 0.2
    gate = ((x * 9) % 1 < 0.75).astype(float)
    return lp(sq, 2500) * gate * env(n, 0.005, 0.4)


def ha(f=260):
    n = int(0.13 * SR); x = np.arange(n) / SR
    src = np.sign(np.sin(2 * np.pi * f * x)) * 0.5 + rng.normal(0, 0.2, n)
    v = bp(src, 600, 1300) + 0.5 * bp(src, 1100, 1900)
    return v * np.sin(np.pi * x / x[-1]) ** 2


def bell(L=0.7):
    n = int(L * SR); x = np.arange(n) / SR
    tone = np.sin(2 * np.pi * 2400 * x) + 0.6 * np.sin(2 * np.pi * 3100 * x)
    clap = (np.sin(2 * np.pi * 24 * x) > 0).astype(float)
    return tone * (0.4 + 0.6 * clap) * np.minimum(1, x / 0.01) * np.minimum(1, (L - x) / 0.08) * 0.35


def whoosh(L=0.5):
    n = int(L * SR); x = np.arange(n) / SR
    return bp(rng.normal(0, 1, n), 200, 1500) * np.sin(np.pi * x / L) ** 2


def thump():
    n = int(0.4 * SR); x = np.arange(n) / SR
    return np.sin(2 * np.pi * (55 + 70 * np.exp(-x * 25)) * x) * env(n, 0.002, 0.12)


def chime(f):
    n = int(0.6 * SR); x = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * f * k * x) / k for k in (1, 2, 3)) * env(n, 0.002, 0.2) * 0.5


for i, t in enumerate(EV["pops"]):
    place(t, pop(600 + 60 * i), 0.35)
for t in EV["puffs"]:
    place(t, puff(), 0.4, pan=0.3)
for a, b in EV["steps"]:
    t = a
    while t < b:
        place(t, step(), 0.35); t += 0.24
place(EV["shyUp"], whoosh(0.3), 0.2, pan=0.4)
place(EV["greet"], robot(), 0.35, pan=0.3)
for k in range(9):
    place(EV["laugh"] + 0.05 + k * 0.17, ha(240 + (k % 3) * 40), 0.35, pan=-0.1 + 0.1 * (k % 3))
for t in (9.6, 9.8, 10.4, 10.8, 11.0, 11.3):
    place(t, ha(250), 0.22)
for t in EV["hearts"]:
    place(t, chime(1760), 0.18, pan=-0.4)
place(EV["title"][0], thump(), 0.7)
place(EV["title"][1], thump(), 0.8)
place(EV["bell"], bell(), 0.5, pan=-0.2)
for t in EV["crowd"]:
    place(t, whoosh(0.55), 0.35)

fade = np.ones(N, np.float32)
fade[-int(0.25 * SR):] = np.linspace(1, 0, int(0.25 * SR))
out *= fade[:, None]
out = out / (np.abs(out).max() + 1e-9) * 0.9
with wave.open(os.path.join(HERE, "build", "audio.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
print("audio.wav", DUR, "s")
