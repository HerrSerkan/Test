"""Ton für "Frühaufsteher / Nachteule / Immer müde": Effekte (Musik kommt über tools/mix_music.py dazu)."""
import json, os, wave
import numpy as np
from scipy.signal import lfilter, butter

HERE = os.path.dirname(os.path.abspath(__file__))
EV = json.load(open(os.path.join(HERE, "build", "events.json")))
SR = 44100
DUR = EV["duration"]
N = int(DUR * SR)
out = np.zeros((N, 2), np.float32)
rng = np.random.default_rng(11)


def lp(x, fc):
    b, a = butter(2, fc / (SR / 2))
    return lfilter(b, a, x)


def bp(x, lo, hi):
    b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], btype="band")
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


def tick(f=2400, d=0.01):
    n = int(0.05 * SR)
    x = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * x) * 0.5 + bp(rng.normal(0, 1, n), 2000, 7000) * 0.6) * env(n, 0.0005, d)


def click():
    n = int(0.06 * SR)
    return bp(rng.normal(0, 1, n), 1500, 6000) * env(n, 0.0005, 0.006) * 1.5


def ring(L):
    n = int(L * SR)
    x = np.arange(n) / SR
    gate = (np.sin(2 * np.pi * 14 * x) > 0).astype(float)
    return (np.sin(2 * np.pi * 2900 * x) + 0.5 * np.sin(2 * np.pi * 3700 * x)) * gate * 0.4 * np.minimum(1, x / 0.01)


def swoosh(L=0.35):
    n = int(L * SR)
    x = np.arange(n) / SR
    e = np.sin(np.pi * x / L) ** 2
    return bp(rng.normal(0, 1, n), 500, 3000) * e


def sip():
    n = int(0.25 * SR)
    x = np.arange(n) / SR
    return bp(rng.normal(0, 1, n), 800, 2500) * env(n, 0.03, 0.08) * (0.6 + 0.4 * np.sin(2 * np.pi * 30 * x))


def chime(f=1320):
    n = int(0.8 * SR)
    x = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * f * k * x) / k for k in (1, 2, 3)) * env(n, 0.002, 0.25) * 0.5


def boom():
    n = int(1.4 * SR)
    x = np.arange(n) / SR
    s = np.sin(2 * np.pi * (45 + 60 * np.exp(-x * 9)) * x) * env(n, 0.003, 0.45)
    hit = lp(rng.normal(0, 1, n), 1800) * env(n, 0.001, 0.05)
    return s * 1.2 + hit * 0.5


def kick():
    n = int(0.25 * SR)
    x = np.arange(n) / SR
    return np.sin(2 * np.pi * (50 + 80 * np.exp(-x * 30)) * x) * env(n, 0.002, 0.08)


# Uhr: Tick bei jedem Wechsel
for t in EV["clock"][1:]:
    place(t, tick(2600 if t < EV["three"] else 1800), 0.18)
for t in EV["lampOn"] + EV["lampOff"]:
    place(t, click(), 0.3)
place(EV["alarm"][0], ring(EV["alarm"][1] - EV["alarm"][0]), 0.22, pan=0.4)
place(EV["curtainOpen"], swoosh(), 0.45)
place(EV["curtainClose"], swoosh(), 0.35)
for t in EV["sips"]:
    place(t, sip(), 0.25)
place(EV["wake"], chime(1568), 0.2, pan=-0.4)
place(EV["sparkle"], chime(1760), 0.25)
place(EV["sparkle"] + 0.08, chime(2350), 0.18)
# gedämpfter Partybass aus dem mittleren Fenster
t = EV["party"][0]
while t < EV["party"][1]:
    place(t, lp(kick(), 300), 0.5)
    t += 60 / 126
# 3 Uhr: Schlag
place(EV["three"], boom(), 0.9)
place(EV["eyes"], tick(900, 0.02), 0.3, pan=0.4)

fade = np.ones(N, np.float32)
fade[-int(0.3 * SR):] = np.linspace(1, 0, int(0.3 * SR))
out *= fade[:, None]
out = out / (np.abs(out).max() + 1e-9) * 0.9
with wave.open(os.path.join(HERE, "build", "audio.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
print("audio.wav", DUR, "s")
