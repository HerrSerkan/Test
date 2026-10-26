"""Tonspur für "Beschlagnahme": Stimme + Soundeffekte (synthetisch), keine Musik.

Liest build/voice.wav, build/events.json (node render.js --events) -> schreibt build/audio.wav (Stereo).
"""
import json
import os
import wave

import numpy as np
from scipy.signal import butter, lfilter

HERE = os.path.dirname(os.path.abspath(__file__))
B = os.path.join(HERE, "build")
SR = 44100
EV = json.load(open(os.path.join(B, "events.json")))
DUR = EV["duration"]
N = int(DUR * SR)
rng = np.random.default_rng(4)
sfx = np.zeros((N, 2), np.float32)


def band(x, lo, hi):
    b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], "band")
    return lfilter(b, a, x)


def low(x, f):
    b, a = butter(2, f / (SR / 2))
    return lfilter(b, a, x)


def place(t0, sig, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N or i + len(sig) <= 0:
        return
    j = min(N, i + len(sig))
    s = sig[: j - i] * gain
    sfx[i:j, 0] += s * (1 - max(0, pan))
    sfx[i:j, 1] += s * (1 + min(0, pan))


def tone(f0, f1, L, decay, harm=(1, 0.3)):
    n = int(L * SR)
    x = np.arange(n) / SR
    ph = 2 * np.pi * np.cumsum(np.linspace(f0, f1, n)) / SR
    s = sum(g * np.sin(ph * (k + 1)) for k, g in enumerate(harm))
    return (s * np.minimum(1, x / 0.003) * np.exp(-x * decay)).astype(np.float32)


def noise_hit(L, lo, hi, decay):
    n = int(L * SR)
    x = np.arange(n) / SR
    return (band(rng.normal(0, 1, n), lo, hi) * np.exp(-x * decay)).astype(np.float32)


def whoosh(L=0.4, lo=300, hi=3000):
    n = int(L * SR)
    x = np.arange(n) / SR
    return (band(rng.normal(0, 1, n), lo, hi) * np.sin(np.pi * x / L) ** 2 * 1.4).astype(np.float32)


def step():          # Schritt auf Gras/Kies
    return noise_hit(0.09, 300, 2500, 45)


def stone_hit():     # Spitzhacke auf Stein
    a = noise_hit(0.12, 1500, 7000, 40)
    a[: int(0.1 * SR)] += tone(900, 700, 0.1, 50, (1,)) * 0.3
    return a


def pop():           # Gegenstand aufnehmen
    return tone(700, 1500, 0.08, 30, (1,))


def chest_open():
    n = int(0.35 * SR)
    x = np.arange(n) / SR
    s = np.sin(2 * np.pi * np.cumsum(140 + 60 * x / 0.35 + 20 * rng.normal(0, 1, n)) / SR)
    s = (band(s, 150, 1500) * np.sin(np.pi * x / 0.35) * 0.8).astype(np.float32)
    s[: int(0.1 * SR)] += noise_hit(0.1, 200, 1200, 30) * 0.5
    return s


def thud():
    n = int(0.4 * SR)
    x = np.arange(n) / SR
    return (np.sin(2 * np.pi * np.cumsum(50 + 80 * np.exp(-x * 18)) / SR) * np.exp(-x * 9)).astype(np.float32)


# Leise Natur-Atmosphäre (Wind, Vögel) – keine Musik
t = np.arange(N) / SR
wind = low(rng.normal(0, 1, N), 300) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * t))
sfx += (wind * 0.02)[:, None].astype(np.float32)
for tb in np.arange(1.0, DUR, 3.7):
    if rng.random() < 0.6:
        f = rng.uniform(2600, 3600)
        for k in range(rng.integers(2, 4)):
            place(tb + k * 0.12, tone(f, f * 1.15, 0.08, 25, (1,)), 0.025, rng.uniform(-0.7, 0.7))

for tc in EV["cuts"]:
    place(tc - 0.12, whoosh(0.3, 400, 4000), 0.05)
# Abbauen
a, b = EV["mine"]
for tt in np.arange(a + 0.1, b, 2 * np.pi / 9):
    place(tt, stone_hit(), 0.35, -0.2)
place(b - 0.4, pop(), 0.25)
# Schritte
for a, b in EV["walk"]:
    for tt in np.arange(a, b, 2 * np.pi / 18):
        place(tt, step(), 0.18, rng.uniform(-0.2, 0.2))
# 64 erscheint, Stapel genommen
for tt in EV["n64"]:
    place(tt, tone(880, 1320, 0.15, 14), 0.18)
place(EV["stop"], tone(500, 500, 0.12, 25, (1, 0.4)), 0.15)
for tt in EV["take"]:
    place(tt, whoosh(0.25, 800, 5000), 0.2)
    place(tt + 0.15, pop(), 0.3)
    place(tt + 0.3, tone(400, 260, 0.35, 6, (1, 0.5)), 0.12)
place(EV["pick"] - 0.2, whoosh(0.3, 1000, 6000), 0.15)
for tt in EV["chestOpen"]:
    place(tt, chest_open(), 0.35)
for k in range(6):
    place(EV["emeraldsIn"] + k * 0.06, pop(), 0.15)
# Rüstung anlegen: metallisches Klirren
for k in range(3):
    place(EV["armor"] + 0.2 + k * 0.25, tone(1800 + k * 300, 1700, 0.4, 9, (1, 0.6, 0.3)), 0.12)
place(EV["whoosh"], whoosh(1.0, 200, 2000), 0.12)
for tt in EV["sad"]:
    place(tt + 0.2, tone(330, 300, 0.6, 3, (1, 0.3)), 0.06)
place(EV["cash"], noise_hit(0.25, 2000, 8000, 12), 0.2)
place(EV["door"] - 0.2, chest_open(), 0.3)
place(EV["door"], thud(), 0.4)
place(EV["sign"], thud(), 0.25)
for tt in EV["cheer"]:
    for k in range(4):
        place(tt + 0.1 + k * 0.08, pop(), 0.1, rng.uniform(-0.5, 0.5))
place(EV["loop"], whoosh(0.5, 300, 5000), 0.15)

with wave.open(os.path.join(B, "voice.wav")) as w:
    voice = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
voice = np.pad(voice[:N], (0, max(0, N - len(voice))))
voice = voice / (np.abs(voice).max() + 1e-6) * 0.9
mix = sfx / (np.abs(sfx).max() + 1e-6) * 0.4 + voice[:, None]
mix = np.tanh(mix * 1.05) * 0.92
with wave.open(os.path.join(B, "audio.wav"), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())
print("audio.wav geschrieben:", round(DUR, 2), "s")
