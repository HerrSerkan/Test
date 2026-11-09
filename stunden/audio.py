"""Ton für "Gleiche 24 Stunden. Anderes Leben.": Effekte (Musik kommt über tools/mix_music.py dazu)."""
import json, os, wave
import numpy as np
from scipy.signal import lfilter, butter

HERE = os.path.dirname(os.path.abspath(__file__))
EV = json.load(open(os.path.join(HERE, "build", "events.json")))
SR = 44100
DUR = EV["duration"]
N = int(DUR * SR)
out = np.zeros((N, 2), np.float32)
rng = np.random.default_rng(43)


def lp(x, fc):
    b, a = butter(2, fc / (SR / 2)); return lfilter(b, a, x)


def bp(x, lo, hi):
    b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], btype="band"); return lfilter(b, a, x)


def noise(L):
    return rng.normal(0, 1, int(L * SR))


def place(t0, sig, g=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N or i < 0:
        return
    j = min(N, i + len(sig))
    out[i:j, 0] += sig[: j - i] * g * (1 - max(0, pan))
    out[i:j, 1] += sig[: j - i] * g * (1 + min(0, pan))


def tick(f=2600):
    x = np.arange(int(0.03 * SR)) / SR
    return np.sin(2 * np.pi * f * x) * np.exp(-x * 200)


def whoosh(L=0.4):
    x = np.arange(int(L * SR)) / SR
    return lp(noise(L), 1200) * np.sin(np.pi * x / L) ** 2 * 1.6


def key():
    x = np.arange(int(0.04 * SR)) / SR
    return bp(noise(0.04), 1500, 6000) * np.exp(-x * 150)


def alarm(L=1.2):
    s = np.zeros(int(L * SR))
    for k in range(6):
        x = np.arange(int(0.09 * SR)) / SR; i = int(k * 0.2 * SR)
        s[i:i + len(x)] += np.sign(np.sin(2 * np.pi * 2000 * x)) * 0.3
    return lp(s, 5000)


def bark():
    x = np.arange(int(0.18 * SR)) / SR
    f = 500 * np.exp(-x * 6)
    return bp(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) + noise(0.18) * 0.3, 300, 3000) * np.exp(-x * 12) * 0.6


def kick():
    x = np.arange(int(0.25 * SR)) / SR
    return np.sin(2 * np.pi * np.cumsum(50 + 90 * np.exp(-x * 30)) / SR) * np.exp(-x * 10)


def snore(L=1.3):
    x = np.arange(int(L * SR)) / SR
    return lp(noise(L), 300) * np.sin(np.pi * x / L) ** 2 * 1.4


def bell(f, L=1.6):
    x = np.arange(int(L * SR)) / SR
    return sum(np.sin(2 * np.pi * f * m * x) * np.exp(-x * d) * g for m, d, g in [(1, 2.0, 0.6), (2.76, 3.5, 0.22)])


def thump():
    x = np.arange(int(0.5 * SR)) / SR
    return np.sin(2 * np.pi * np.cumsum(60 + 70 * np.exp(-x * 25)) / SR) * np.exp(-x * 9)


place(EV["alarm"], alarm(), 0.22, pan=-0.2)
for t in EV["minuteTicks"]:
    place(t, tick(2600 if int(t * 2) % 2 else 3100), 0.05)
for t in EV["cuts"]:
    place(t - 0.1, whoosh(), 0.14)
for a, b in (EV["office"], EV["code"]):
    t = a
    while t < b:
        place(t, key(), 0.07, pan=-0.2); t += 0.07 + rng.uniform(0, 0.08)
a, b = EV["gym"]
t = a
while t < b:
    place(t, lp(noise(0.08), 500) * np.exp(-np.arange(int(0.08 * SR)) / SR * 40), 0.15); t += 0.18
for k in range(3):
    place(EV["dog"] + 0.3 + k * 0.35, bark(), 0.2, pan=0.3)
a, b = EV["party"]
t = a
while t < b:
    place(t, kick(), 0.35); t += 60 / 124
# Fernseher beim Faulen (leise Rauschen + Stimmengewirr), Schnarchen nachts
L = EV["bedLazy"] - EV["couch"]
x = np.arange(int(L * SR)) / SR
place(EV["couch"], bp(noise(L), 300, 3000) * (0.5 + 0.5 * np.sin(2 * np.pi * 3 * x) ** 2) * 0.25, 0.25, pan=0.4)
for t in np.arange(0.6, EV["wakeLazy"], 2.2):
    place(t, snore(), 0.12, pan=0.3)
for t in np.arange(EV["sleepTop"], DUR - 1, 2.2):
    place(t, snore(), 0.1, pan=-0.2)
for k, t in enumerate(EV["text"]):
    place(t, thump(), 0.5); place(t + 0.05, bell(880 * (1 + k * 0.5)), 0.06)

peak = np.abs(out).max() + 1e-6
out = np.tanh(out / peak * 1.2) * 0.9
with wave.open(os.path.join(HERE, "build", "audio.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(out, -1, 1) * 32767).astype(np.int16).tobytes())
print("audio.wav geschrieben:", DUR, "s")
