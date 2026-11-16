"""Ton für "Gleicher Wecker. Andere Nacht.": Effekte (Musik kommt über tools/mix_music.py dazu)."""
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


def beeps(L, f=2600):
    """Digitaler Wecker: piep-piep-piep-piep, Pause."""
    n = int(L * SR); x = np.arange(n) / SR
    ph = (x % 0.5) / 0.5
    gate = ((ph < 0.48) & (((ph * 8) % 1) < 0.55)).astype(float)
    sig = np.sign(np.sin(2 * np.pi * f * x)) * 0.35 + np.sin(2 * np.pi * f * 2 * x) * 0.15
    return lp(sig, 6000) * gate * np.minimum(1, x / 0.005)


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


def yawn(L=0.8):
    n = int(L * SR); x = np.arange(n) / SR
    f0 = 180 + 90 * np.sin(np.pi * x / L)
    src = np.sign(np.sin(2 * np.pi * np.cumsum(f0) / SR)) * 0.5 + rng.normal(0, 0.15, n)
    fo = bp(src, 500, 1100) + 0.5 * bp(src, 900, 1600)
    return fo * np.sin(np.pi * x / L) ** 1.5


def snore(L=1.0):
    n = int(L * SR); x = np.arange(n) / SR
    buzz = np.sign(np.sin(2 * np.pi * 55 * x)) * 0.4 + rng.normal(0, 0.4, n)
    return lp(buzz, 600) * np.sin(np.pi * np.clip(x / (L * 0.7), 0, 1)) ** 2


def sip():
    n = int(0.22 * SR); x = np.arange(n) / SR
    return bp(rng.normal(0, 1, n), 800, 2500) * env(n, 0.03, 0.07) * (0.6 + 0.4 * np.sin(2 * np.pi * 30 * x))


def clatter():
    n = int(0.5 * SR); x = np.arange(n) / SR
    s = np.zeros(n)
    for k, t0 in enumerate((0.0, 0.11, 0.19, 0.25)):
        i = int(t0 * SR); m = n - i
        s[i:] += (np.sin(2 * np.pi * (1800 - 200 * k) * x[:m]) * 0.5 + bp(rng.normal(0, 1, m), 1500, 8000)) * env(m, 0.0005, 0.03) / (k + 1)
    return s


def scratch():
    n = int(0.55 * SR); x = np.arange(n) / SR
    f = 300 + 1600 * np.abs(np.sin(2 * np.pi * 3.2 * x))
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR)
    return (bp(rng.normal(0, 1, n), 1000, 6000) * 0.6 + tone * 0.5) * np.sin(np.pi * x / x[-1])


def pop(f=700):
    n = int(0.12 * SR); x = np.arange(n) / SR
    return np.sin(2 * np.pi * (f + 900 * np.exp(-x * 40)) * x) * env(n, 0.002, 0.035)


def puff():
    n = int(0.3 * SR)
    return bp(rng.normal(0, 1, n), 300, 2500) * env(n, 0.005, 0.07)


def boom():
    n = int(1.2 * SR); x = np.arange(n) / SR
    return np.sin(2 * np.pi * (45 + 60 * np.exp(-x * 9)) * x) * env(n, 0.003, 0.4) * 1.2 + lp(rng.normal(0, 1, n), 1800) * env(n, 0.001, 0.05) * 0.5


def chime(f):
    n = int(0.7 * SR); x = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * f * k * x) / k for k in (1, 2, 3)) * env(n, 0.002, 0.22) * 0.5


# Wecker
place(EV["ring1"][0], beeps(EV["ring1"][1]), 0.22, pan=-0.5)
for a, b in EV["ring2"]:
    place(a, beeps(b - a, 2900), 0.24)
for a, b in EV["ring3"]:
    place(a, beeps(b - a, 2300), 0.22, pan=0.5)
for h in EV["hits"]:
    place(h, slap(), 0.55)
for t in EV["clock"]:
    place(t, tick(), 0.12)
for t in EV["lightOn"]:
    place(t, click(), 0.35)
# Hampelmänner
t = EV["jacks"][0]
while t < EV["jacks"][1]:
    place(t + 0.2, thump(70, 0.05), 0.35, pan=-0.5); t += 0.42
for t in EV["sips"]:
    place(t, sip(), 0.3, pan=-0.5)
place(EV["yawn"][0], yawn(), 0.35, pan=-0.5)
place(EV["yawn"][1], yawn(0.6), 0.25, pan=0.5)
# Schnarchen in den Snooze-Pausen
t = EV["snore"][0]
while t < EV["snore"][1]:
    if not any(a - 0.1 < t < b + 0.3 for a, b in EV["ring2"]):
        place(t, snore(0.9), 0.18)
    t += 1.3
place(EV["pillow"], whoosh(0.3, 200, 1200), 0.4)
place(EV["fly"], whoosh(0.4, 600, 4000), 0.45); place(EV["fly"] + 0.45, clatter(), 0.5)
# Panik: Rennschritte, Stolpern, Tür
t = EV["run"][0]
while t < EV["run"][1]:
    place(t, thump(90, 0.03), 0.35); t += 0.14
place(EV["stumble"], thump(55, 0.12), 0.7); place(EV["stumble"] + 0.02, slap(), 0.3)
place(EV["door"], thump(50, 0.1), 0.6); place(EV["door"], slap(), 0.4)
# Scrollen unter der Decke
t = EV["scroll"][0] + 0.3
while t < EV["scroll"][1]:
    place(t, tick(3800), 0.1, pan=0.5); t += 0.37 + 0.2 * np.sin(t * 3)
# Höhepunkt
place(EV["climax"] - 0.05, scratch(), 0.6)
place(EV["climax"], boom(), 0.8)
place(EV["curtain"] + 0.02, whoosh(0.3, 500, 4000), 0.55, pan=0.5)
place(EV["flip"], whoosh(0.3, 800, 5000), 0.35, pan=0.5); place(EV["flip"] + 0.18, chime(1568), 0.25, pan=0.5)
place(EV["lieDown"], whoosh(0.3, 200, 1000), 0.25, pan=0.5)
for i, t in enumerate(EV["bubbles"]):
    place(t, pop(600 + 80 * i), 0.4)
for t in EV["puffs"]:
    place(t, puff(), 0.35)
place(EV["title"][0], thump(55, 0.12), 0.75); place(EV["title"][1], thump(55, 0.12), 0.8)
place(EV["sticker"], pop(900), 0.4); place(EV["sticker"] + 0.05, chime(2093), 0.2)
place(EV["out"], click(), 0.4)

out = out / (np.abs(out).max() + 1e-9) * 0.9
with wave.open(os.path.join(HERE, "build", "audio.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
print("audio.wav", DUR, "s")
