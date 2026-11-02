"""Ton für "Kampf, Flucht, Erstarren – oder Schleimen.": Effekte (Musik kommt über tools/mix_music.py dazu). Hilfen aus mensa/audio.py."""
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



def wind(L):
    n = int(L * SR); x = np.arange(n) / SR
    s = bp(noise(L), 250, 1400)
    return s * (0.5 + 0.5 * np.sin(2 * np.pi * 0.23 * x + 1) ** 2)


def rustle(L=0.35):
    n = int(L * SR); x = np.arange(n) / SR
    return bp(noise(L), 1500, 7000) * (0.4 + 0.6 * np.abs(np.sin(x * 55))) * np.sin(np.pi * x / L)


def sparkle():
    n = int(1.2 * SR); x = np.arange(n) / SR
    s = np.zeros(n)
    for k, f in enumerate([2637, 3136, 3520, 4186, 3136]):
        i = int(k * 0.09 * SR); m = n - i
        s[i:] += np.sin(2 * np.pi * f * x[:m]) * np.exp(-x[:m] * 6) * 0.3
    return s



def heart():
    n = int(0.3 * SR); x = np.arange(n) / SR
    b = np.sin(2 * np.pi * (50 + 40 * np.exp(-x * 30)) * x) * np.exp(-x * 18)
    i = int(0.16 * SR); b[i:] += np.sin(2 * np.pi * 45 * x[: n - i]) * np.exp(-x[: n - i] * 20) * 0.7
    return b


def thunder(L=2.4):
    n = int(L * SR); x = np.arange(n) / SR
    return lp(noise(L), 180) * np.exp(-x * 1.4) * (0.6 + 0.4 * np.abs(np.sin(x * 5))) * np.minimum(1, x / 0.05) * 4


def creak(L=0.9):
    n = int(L * SR); x = np.arange(n) / SR
    f = 380 + 160 * np.sin(x * 7) + 60 * np.sin(x * 23)
    s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * (np.abs(np.sin(x * 140)) > 0.3)
    return bp(s, 300, 2500) * np.sin(np.pi * x / L) * 0.5


def flap(L=1.0):
    n = int(L * SR); x = np.arange(n) / SR
    return lp(noise(L), 700) * (np.abs(np.sin(2 * np.pi * 7 * x)) ** 4) * np.sin(np.pi * x / L) * 1.5


def huuu(L=1.1):
    n = int(L * SR); x = np.arange(n) / SR
    f = 330 - 80 * x / L + 6 * np.sin(2 * np.pi * 5 * x)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * x / L) * 0.5 + bp(noise(L), 400, 1200) * 0.15 * np.sin(np.pi * x / L)


def rattle(L=0.5):
    n = int(L * SR); x = np.arange(n) / SR
    return bp(noise(L), 1500, 5000) * (np.abs(np.sin(x * 90)) > 0.85) * np.exp(-x * 4)


def scream(L=0.9):
    n = int(L * SR); x = np.arange(n) / SR
    s = 0
    for f0 in (523, 554, 740):                         # schräger Akkord
        f = f0 * (1 + 0.04 * np.sin(2 * np.pi * 6 * x))
        s = s + np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.2
    return bp(s, 600, 3500) * np.minimum(1, x / 0.02) * np.exp(-x * 1.6)


def powerdown(L=0.6):
    n = int(L * SR); x = np.arange(n) / SR
    f = 900 * np.exp(-x * 5)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 3) * 0.5



def step():
    n = int(0.1 * SR); x = np.arange(n) / SR
    return lp(noise(0.1), 500) * np.exp(-x * 45) * 1.6


def crackle(L=0.6):
    n = int(L * SR); x = np.arange(n) / SR
    s = bp(noise(L), 3000, 9000) * (rng.random(n) > 0.985) * 6
    return s * np.minimum(1, x / 0.05) + np.sin(2 * np.pi * 2400 * x) * np.exp(-x * 4) * 0.1


def swish(L=0.25):
    n = int(L * SR); x = np.arange(n) / SR
    return bp(noise(L), 800, 4000) * np.sin(np.pi * x / L) ** 2 * 1.5


for t in EV["titleWords"]:
    place(t, tick(3400), 0.1)
place(EV["door"], creak(0.6), 0.25)
place(EV["eyes"], bell(196, 1.0), 0.05)
place(EV["buh"], thump(60, 7), 0.7)
place(EV["buh"], huuu(0.8), 0.2)
place(EV["buh"] + 0.02, bleep_robot(), 0.3)
a, b = EV["flee"]
place(a, swish(0.4), 0.2, pan=-0.6)
t = a
while t < b:
    place(t, step(), 0.18, pan=-0.7); t += 0.1
place(EV["ice"], crackle(), 0.3, pan=0.6)
place(EV["punch"], swish(), 0.25, pan=-0.2)
place(EV["bonk"], thump(140, 22), 0.5); place(EV["bonk"], bell(1318, 0.6), 0.08)
place(EV["compliment"], pop(760), 0.3)
place(EV["blush"], bell(1568, 1.2), 0.06); place(EV["blush"] + 0.4, bell(1760, 1.2), 0.05)
place(EV["reveal"], thump(80, 12), 0.4)
for k, f in enumerate([2093, 2637, 3136, 4186]):
    place(EV["reveal"] + 0.1 + k * 0.08, bell(f, 0.8), 0.04)
for k in range(10):
    place(EV["candy"] + k * 0.1, clank(2200 + 150 * (k % 3)), 0.04, pan=0.1)
place(EV["candy"], pop(900), 0.3)
place(EV["peek"], pop(600), 0.2, pan=-0.7)
place(EV["sticker"], pop(900), 0.35); place(EV["sticker"] + 0.05, bell(1760, 1.0), 0.06)

peak = np.abs(out).max() + 1e-6
out = np.tanh(out / peak * 1.2) * 0.9
with wave.open(os.path.join(HERE, "build", "audio.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(out, -1, 1) * 32767).astype(np.int16).tobytes())
print("audio.wav geschrieben:", DUR, "s")
