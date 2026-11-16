"""Ton für "Gleiche Küche. Andere Ausrede.": Effekte (Musik kommt über tools/mix_music.py dazu). Hilfen aus mensa/audio.py."""
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


def noise(L):
    return rng.normal(0, 1, int(L * SR))


def tick(f=2600):
    n = int(0.04 * SR); x = np.arange(n) / SR
    return np.sin(2 * np.pi * f * x) * np.exp(-x * 160)


def puff():
    n = int(0.3 * SR); x = np.arange(n) / SR
    return lp(noise(0.3), 1200) * np.sin(np.pi * x / 0.3) ** 2 * 1.5


def clank(f=900):
    n = int(0.5 * SR); x = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * m * x) * np.exp(-x * d) * g for m, d, g in [(1, 12, 0.5), (2.7, 18, 0.3), (5.1, 26, 0.2)])
    return s + bp(noise(0.5), 2000, 7000) * np.exp(-x * 60) * 0.4


def splash(L=0.45):
    n = int(L * SR); x = np.arange(n) / SR
    return bp(noise(L), 800, 6000) * np.exp(-x * 7) * (0.6 + 0.4 * np.sin(x * 90))


def scrub(L=0.28):
    n = int(L * SR); x = np.arange(n) / SR
    return bp(noise(L), 1500, 6000) * (0.5 + 0.5 * np.abs(np.sin(x * 70))) * np.sin(np.pi * x / L)


def thump(f=60, d=7):
    n = int(0.6 * SR); x = np.arange(n) / SR
    fr = f + 70 * np.exp(-x * 25)
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-x * d)


def bell(f, L=1.6):
    n = int(L * SR); x = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * f * m * x) * np.exp(-x * d) * g for m, d, g in [(1, 2.0, 0.6), (2.76, 3.5, 0.22), (5.4, 6, 0.1)]) * np.minimum(1, x / 0.004)


def buzz(L):
    n = int(L * SR); x = np.arange(n) / SR
    f = 210 + 25 * np.sin(2 * np.pi * 7 * x)
    s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.25
    return lp(s, 1600) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.9 * x) ** 2)


def whistle(L):
    n = int(L * SR); x = np.arange(n) / SR
    melody = [1568, 1760, 1568, 1319, 1397, 1568]
    f = np.array([melody[int(k / (L / len(melody))) % len(melody)] for k in x])
    return np.sin(2 * np.pi * np.cumsum(f * (1 + 0.006 * np.sin(2 * np.pi * 6 * x))) / SR) * 0.35 * np.minimum(1, x / 0.05)


def bleep_robot():
    n = int(0.5 * SR); x = np.arange(n) / SR
    return np.sign(np.sin(2 * np.pi * 330 * x)) * 0.15 * env(n, 0.005, 0.2)


# Zähler: jedes Umschalten tickt, am Höhepunkt dumpfer Schlag
for t in EV["days"][:-1]:
    place(t, tick(2600), 0.22)
    place(t, clank(1100 + 80 * (t % 3)), 0.07, pan=0.05)          # neues Geschirr landet
place(EV["climax"], thump(55, 6), 0.9)
place(EV["climax"], tick(1800), 0.3)
# Sofort schrubbt jeden Tag kurz
for t in EV["scrubs"]:
    place(t, scrub(), 0.12, pan=-0.5)
    place(t + 0.3, bell(2637, 0.5), 0.03, pan=-0.5)
# Morgen spült zweimal alles auf einmal
for t in EV["washes"]:
    place(t, splash(), 0.35, pan=0.5)
    for k in range(4):
        place(t + 0.05 + k * 0.07, clank(1300 + k * 120), 0.08, pan=0.5)
# Blasen und Wölkchen
for t in EV["pops"]:
    place(t, pop(720), 0.35)
for t in EV["puffs"]:
    place(t, puff(), 0.18)
# Fliegen summen ab Tag 9, Pfeifen in der Spannung
place(EV["flies"], buzz(EV["climax"] - EV["flies"] + 1.6), 0.05, pan=0.1)
a, b = EV["whistle"]
place(a, whistle(b - a), 0.12, pan=0.05)
place(EV["robot"], bleep_robot(), 0.4)
# Hook/Rehook: leiser Tick pro Wort
for t in EV["hookWords"]:
    place(t, tick(3400), 0.08)
# Titel und Sticker
for k, t in enumerate(EV["title"]):
    place(t, thump(80, 12), 0.35); place(t, pop(600 + k * 200), 0.25)
place(EV["sticker"], pop(900), 0.35); place(EV["sticker"] + 0.05, bell(1760, 1.0), 0.06)

peak = np.abs(out).max() + 1e-6
out = np.tanh(out / peak * 1.2) * 0.9
with wave.open(os.path.join(HERE, "build", "audio.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(out, -1, 1) * 32767).astype(np.int16).tobytes())
print("audio.wav geschrieben:", DUR, "s")
