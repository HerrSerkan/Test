"""Ton für "Jemand muss den ersten Schritt machen": nur Effekte, keine Musik."""
import json, os, wave
import numpy as np
from scipy.signal import lfilter

HERE = os.path.dirname(os.path.abspath(__file__))
EV = json.load(open(os.path.join(HERE, "build", "events.json")))
SR = 44100
DUR = EV["duration"]
N = int(DUR * SR)
out = np.zeros((N, 2), np.float32)
rng = np.random.default_rng(2)


def lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    return lfilter([1 - a], [1, -a], x)


def place(t0, sig, g=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N:
        return
    j = min(N, i + len(sig))
    out[i:j, 0] += sig[: j - i] * g * (1 - max(0, pan))
    out[i:j, 1] += sig[: j - i] * g * (1 + min(0, pan))


def env(n, a, d):
    x = np.arange(n) / SR
    return np.minimum(1, x / max(a, 1e-4)) * np.exp(-x / d)


def tick(f=2200, d=0.012):
    n = int(0.06 * SR)
    x = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * x) * 0.6 + lp(rng.normal(0, 1, n), 4000) * 0.5) * env(n, 0.0005, d)


def step():
    n = int(0.12 * SR)
    return lp(rng.normal(0, 1, n), 900) * env(n, 0.002, 0.03) * 2.5


def thump():
    n = int(0.35 * SR)
    x = np.arange(n) / SR
    return np.sin(2 * np.pi * (48 + 30 * np.exp(-x * 20)) * x) * env(n, 0.004, 0.09)


def swell(L, freqs):
    n = int(L * SR)
    x = np.arange(n) / SR
    e = np.sin(np.pi * np.clip(x / L, 0, 1)) ** 2
    return sum(np.sin(2 * np.pi * f * x) for f in freqs) / len(freqs) * e


# Raumklang / leiser Wind
wind = lp(rng.normal(0, 1, N), 220)
wind = wind / np.abs(wind).max() * (0.6 + 0.4 * np.sin(np.arange(N) / SR * 0.5))
out[:, 0] += wind * 0.05
out[:, 1] += np.roll(wind, 2000) * 0.05

for t in EV["dayTicks"]:
    place(t, tick(), 0.22, pan=-0.2)
for t in EV["botTicks"]:
    place(t, tick(1900), 0.22, pan=-0.2)
# Schritte
t = EV["walk"][0]
while t < EV["walk"][1]:
    place(t, step(), 0.35, pan=-0.15)
    t += 0.349
t = EV["approach"][0]
while t < EV["approach"][1] - 0.15:
    place(t, step(), 0.3, pan=0.15)
    t += 0.349
# Treffen: warmes Anschwellen + Herzschlag
place(EV["hug"] - 0.6, swell(3.5, [220, 277.2, 329.6, 440]), 0.10)
for k in range(8):
    tb = EV["hug"] + k * 0.909
    if tb < DUR - 0.4:
        place(tb, thump(), 0.55)
        place(tb + 0.22, thump(), 0.35)
# Tippen
for i in range(EV["typeChars"]):
    place(EV["type"] + i * EV["typeStep"], tick(3200, 0.006), 0.28)
place(EV["type"] + EV["typeChars"] * EV["typeStep"] + 0.1, swell(1.8, [164.8, 246.9]), 0.12)

fade = np.ones(N, np.float32)
fade[-int(0.5 * SR):] = np.linspace(1, 0, int(0.5 * SR))
out *= fade[:, None]
out = out / (np.abs(out).max() + 1e-9) * 0.9
with wave.open(os.path.join(HERE, "build", "audio.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
print("audio.wav", DUR, "s")
