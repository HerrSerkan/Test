"""Ton für "Guter Freund / Bester Freund": Effekte (Musik kommt über tools/mix_music.py dazu). Hilfen aus schleimen/audio.py."""
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
rng = np.random.default_rng(5)


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


def noise(L):
    return rng.normal(0, 1, int(L * SR))


def ts(L):
    return np.arange(int(L * SR)) / SR


def bell(f, L=1.2):
    x = ts(L)
    return sum(np.sin(2 * np.pi * f * m * x) * np.exp(-x * d) * g for m, d, g in [(1, 2.5, 0.6), (2.76, 4, 0.22), (5.4, 7, 0.1)]) * np.minimum(1, x / 0.004)


def snap():                     # Eiszapfen bricht
    x = ts(0.25)
    crack = bp(noise(0.25), 2500, 9000) * np.exp(-x * 60) * 1.5
    return crack + sum(np.sin(2 * np.pi * f * x) * np.exp(-x * 9) * 0.15 for f in (3520, 4699, 5274))


def rumble(L):                  # Platte rutscht
    x = ts(L)
    return lp(noise(L), 260) * (0.4 + 0.6 * x / L) * 3 + bp(noise(L), 600, 2000) * 0.15 * np.abs(np.sin(x * 31))


def whoosh(L=0.3, lo=500, hi=3000):
    x = ts(L)
    return bp(noise(L), lo, hi) * np.sin(np.pi * x / L) ** 2 * 1.4


def thump(f=55, d=6):
    x = ts(0.7)
    fr = f + 80 * np.exp(-x * 25)
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-x * d)


def crunch(L=0.12):             # Schnee knirscht
    x = ts(L)
    return bp(noise(L), 1200, 6000) * (rng.random(len(x)) > 0.6) * np.exp(-x * 30) * 2


def flump(L=0.7):               # Schneehaufen landet
    x = ts(L)
    return lp(noise(L), 1500) * np.exp(-x * 7) * 2.5 + bp(noise(L), 2000, 7000) * np.exp(-x * 14) * 0.6


def giggle(n=4, f0=520, gap=0.13):   # Cartoon-Kichern aus kurzen Silben
    L = n * gap + 0.2
    s = np.zeros(int(L * SR))
    for k in range(n):
        x = ts(0.1)
        f = f0 * (1 + 0.15 * np.sin(k * 2.1)) * (1 - 0.25 * x / 0.1)
        v = np.sin(2 * np.pi * np.cumsum(f) / SR)
        v = np.tanh(3 * v) * np.sin(np.pi * x / 0.1) ** 1.5
        v = bp(v, 400, 3000)
        i = int(k * gap * SR); s[i:i + len(v)] += v
    return s * 0.8


def tape_rewind(L):
    x = ts(L)
    f = 300 + 2600 * (x / L) ** 0.7 + 120 * np.sin(2 * np.pi * 23 * x)
    saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
    return bp(saw, 300, 5000) * 0.35 * np.minimum(1, x / 0.03) * np.minimum(1, (L - x) / 0.05) + bp(noise(L), 3000, 8000) * 0.08


def pop(f=700):
    x = ts(0.12)
    return np.sin(2 * np.pi * (f + 900 * np.exp(-x * 40)) * x) * np.exp(-x * 28)


def swish(L=0.2):
    x = ts(L)
    return bp(noise(L), 1500, 6000) * np.sin(np.pi * x / L) ** 2


def chime_up(t0, g=0.05):
    for k, f in enumerate([1568, 2093, 2637, 3136]):
        place(t0 + k * 0.07, bell(f, 0.9), g)


place(0.2, whoosh(0.35, 800, 4000), 0.12)
place(T["p2"] + 0.02, whoosh(0.35, 800, 4000), 0.12)
for t in EV["snaps"]:
    place(t, snap(), 0.35, pan=-0.3)
for a, h in EV["slides"]:
    place(a, rumble(h - 0.28 - a), 0.3)
    place(h - 0.28, whoosh(0.3, 300, 1500), 0.35)
for h in EV["hits"]:
    place(h, thump(), 0.8); place(h, flump(), 0.45)
# Teil 1
place(T["grab1"] + 0.45, giggle(4, 560), 0.22, pan=0.4)
place(T["slide1"] + 0.55, pop(500), 0.15, pan=0.4)
t = T["dig1"] + 0.1
while t < T["rise1"]:
    place(t, crunch(), 0.25, pan=-0.1); t += 0.11
place(T["rise1"], whoosh(0.35, 400, 2500), 0.25)
t = T["brush1"]
while t < T["happy1"] - 0.1:
    place(t, swish(), 0.12); t += 0.17
chime_up(T["happy1"], 0.045)
place(T["happy1"] + 0.1, giggle(3, 600), 0.15, pan=0.3)
# Zurückspulen
place(T["rw0"], tape_rewind(T["rw1"] - T["rw0"] + 0.05), 0.5)
place(T["p2"], bell(2637, 0.8), 0.05)
# Teil 2
place(T["laugh2"], giggle(10, 600, 0.12), 0.3, pan=0.35)
place(T["laugh2"] + 1.3, giggle(3, 560, 0.14), 0.18, pan=0.35)
place(T["think2"] + 0.15, bell(1976, 1.0), 0.07)
for k, t in enumerate(EV["steps"]):
    place(t, crunch(0.14), 0.3, pan=0.3 + 0.08 * k)
place(T["arms2"], pop(800), 0.25, pan=0.4)
place(T["arms2"] + 0.1, giggle(3, 680), 0.18, pan=0.4)
place(T["pop2"], pop(650), 0.3, pan=-0.3); place(T["pop2"] + 0.1, pop(750), 0.3, pan=0.3)
place(T["pop2"], flump(0.4), 0.2)
place(T["laughEnd"], giggle(9, 560, 0.13), 0.24, pan=-0.3)
place(T["laughEnd"] + 0.05, giggle(9, 660, 0.12), 0.24, pan=0.35)
chime_up(T["laughEnd"] + 0.05, 0.035)

peak = np.abs(out).max() + 1e-6
out = np.tanh(out / peak * 1.2) * 0.9
with wave.open(os.path.join(HERE, "build", "audio.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(out, -1, 1) * 32767).astype(np.int16).tobytes())
print("audio.wav geschrieben:", DUR, "s")
