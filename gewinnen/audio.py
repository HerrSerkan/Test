"""Ton für "Ich muss gewinnen / Ich will gewinnen": Regen, Schritte, Sprung, Aufprall, Jubel (Musik kommt über tools/mix_music.py dazu)."""
import json, os, wave
import numpy as np
from scipy.signal import lfilter, butter

HERE = os.path.dirname(os.path.abspath(__file__))
EV = json.load(open(os.path.join(HERE, "build", "events.json")))
SR = 44100
DUR = EV["duration"]
N = int(DUR * SR)
out = np.zeros((N, 2), np.float32)
rng = np.random.default_rng(31)


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


def step():
    n = int(0.09 * SR)
    return (lp(rng.normal(0, 1, n), 900) * 1.5 + bp(rng.normal(0, 1, n), 2000, 6000) * 0.4) * env(n, 0.001, 0.02)


def whoosh(L, lo=300, hi=2500):
    n = int(L * SR); x = np.arange(n) / SR
    return bp(rng.normal(0, 1, n), lo, hi) * np.sin(np.pi * x / L) ** 2


def impact():
    n = int(1.2 * SR); x = np.arange(n) / SR
    thud = np.sin(2 * np.pi * (45 + 50 * np.exp(-x * 20)) * x) * env(n, 0.002, 0.25)
    splash = bp(rng.normal(0, 1, n), 800, 9000) * env(n, 0.004, 0.18)
    return thud * 1.3 + splash * 0.8


def slide(L):
    n = int(L * SR); x = np.arange(n) / SR
    return bp(rng.normal(0, 1, n), 1500, 8000) * np.exp(-x / (L * 0.5))


def crowd(L, cheer):
    n = int(L * SR)
    base = bp(rng.normal(0, 1, n), 300, 2500)
    mod = 1 + 0.3 * lp(rng.normal(0, 1, n), 3)
    return base * mod * cheer


# Regen durchgehend
rain = bp(rng.normal(0, 1, N), 1500, 10000) * 0.12 + lp(rng.normal(0, 1, N), 400) * 0.06
drops = (rng.random(N) < 0.0006) * rng.normal(0, 1, N)
rain += bp(drops, 2000, 7000) * 0.6
out[:, 0] += rain; out[:, 1] += np.roll(rain, 300)
# Publikum: gedämpft, ab dem Sieg lauter Jubel
t = np.arange(N) / SR
lvl = np.where(t < 2.6, 0.25, 0.2)
for t0 in (EV["tape"][0], EV["tape"][1]):
    lvl = lvl + np.clip((t - t0) / 0.4, 0, 1) * np.clip((t0 + 3.2 - t) / 1.5, 0, 1) * (0.9 if t0 > 3 else 0.6) * (t < 2.6 if t0 < 3 else t >= 2.6)
c = crowd(DUR + 0.01, 1.0)[:N] * lvl
out[:, 0] += c * 0.5; out[:, 1] += c * 0.5
# Schritte
for t0, t1, v in EV["runWhite"]:
    tt = t0
    while tt < t1:
        place(tt, step(), 0.35, pan=0.2); place(tt + 0.13, step(), 0.25, pan=-0.2); tt += 0.3
for d in EV["dive"]:
    place(d - 0.05, whoosh(0.6, 200, 1800), 0.5)
for l in EV["land"]:
    place(l, impact(), 0.9); place(l + 0.05, slide(0.8), 0.35)
place(EV["whip"] - 0.2, whoosh(0.4, 400, 4000), 0.6)
place(EV["armUp"], whoosh(0.35, 300, 1500), 0.25)

fade = np.ones(N, np.float32)
i0 = int(EV["fade"] * SR)
fade[i0:] = np.linspace(1, 0, N - i0)
out *= fade[:, None]
out = out / (np.abs(out).max() + 1e-9) * 0.9
with wave.open(os.path.join(HERE, "build", "audio.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
print("audio.wav", DUR, "s")
