"""Tonspur für "Referat-Angst": nur Soundeffekte (synthetisch), keine Musik, keine Stimme.

Liest build/events.json (node render.js --events) -> schreibt build/audio.wav (Stereo).
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
HD, RL = EV["head"], EV["real"]
DUR = EV["duration"]
N = int(DUR * SR)
rng = np.random.default_rng(9)
t = np.arange(N) / SR
out = np.zeros((N, 2), np.float32)


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
    out[i:j, 0] += s * (1 - max(0, pan))
    out[i:j, 1] += s * (1 + min(0, pan))


def tone(f0, f1, L, decay, harm=(1, 0.3)):
    n = int(L * SR)
    x = np.arange(n) / SR
    ph = 2 * np.pi * np.cumsum(np.linspace(f0, f1, n)) / SR
    s = sum(g * np.sin(ph * (k + 1)) for k, g in enumerate(harm))
    return (s * np.minimum(1, x / 0.004) * np.exp(-x * decay)).astype(np.float32)


def clank(f=1.0):
    n = int(0.6 * SR)
    x = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * fr * f * x) * np.exp(-x * d) * g for fr, d, g in
            [(410, 9, 0.5), (1130, 14, 0.3), (2380, 22, 0.2), (160, 7, 0.4)])
    s += rng.normal(0, 1, n) * np.exp(-x * 80) * 0.4
    return s.astype(np.float32)


def thud(f=1.0):
    n = int(0.5 * SR)
    x = np.arange(n) / SR
    s = np.sin(2 * np.pi * np.cumsum((45 + 90 * np.exp(-x * 16)) * f) / SR) * np.exp(-x * 8)
    s += low(rng.normal(0, 1, n), 800) * np.exp(-x * 30) * 0.5
    return s.astype(np.float32)


def step_snd():
    n = int(0.08 * SR)
    x = np.arange(n) / SR
    return (low(rng.normal(0, 1, n), 1200) * np.exp(-x * 60)).astype(np.float32)


def whoosh(L, lo, hi):
    n = int(L * SR)
    x = np.arange(n) / SR
    return (band(rng.normal(0, 1, n), lo, hi) * np.sin(np.pi * x / L) ** 2 * 1.5).astype(np.float32)


def whisper(L=0.7):
    n = int(L * SR)
    x = np.arange(n) / SR
    syl = 0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 5.5 * x))
    s = band(rng.normal(0, 1, n), 2500, 7500) * syl * np.sin(np.pi * x / L)
    return s.astype(np.float32)


# Zeiten der Teile
h0, h1 = 0.0, EV["rew"][0][0]
r0, r1 = EV["rew"][0][1], EV["rew"][1][0]
head_env = np.interp(t, [0, HD["dark"][0], HD["dark"][1], h1, r0], [0, 0, 1, 1, 0])
real_env = np.interp(t, [0, HD["dark"][0], HD["dark"][1], r0 - 0.1, r0 + 0.2, r1, r1 + 0.3, DUR], [1, 1, 0, 0, 1, 1, 0, 0])

# ---------------------------------------------------------------- Klassenzimmer-Atmosphäre (Wirklichkeit)
amb = low(rng.normal(0, 1, N), 400) * 0.035 + band(rng.normal(0, 1, N), 900, 3000) * 0.008
out += (amb * real_env)[:, None].astype(np.float32)
for k in np.arange(0.0, DUR, 1.0):      # Uhr tickt
    place(k, tone(2400, 2400, 0.03, 120, (1,)), 0.05 + 0.04 * (real_env[min(N - 1, int(k * SR))] < 0.5), -0.3)
# Schnarchen (eingeschlafener Mitschüler)
for k in np.arange(RL["snore"][0], RL["snore"][1], 1.43):
    if real_env[min(N - 1, int(k * SR))] > 0.5:
        n = int(0.7 * SR)
        x = np.arange(n) / SR
        sn = low(rng.normal(0, 1, n), 300) * (1 + np.sin(2 * np.pi * 28 * x)) * np.sin(np.pi * x / 0.7) ** 2
        place(k, sn.astype(np.float32), 0.25, 0.1)
# Lehrerin schlürft Kaffee
n = int(0.5 * SR)
x = np.arange(n) / SR
place(RL["sip"][0] + 1.0, (band(rng.normal(0, 1, n), 1500, 6000) * np.sin(np.pi * x / 0.5) ** 2 * (0.6 + 0.4 * np.sin(2 * np.pi * 15 * x))).astype(np.float32), 0.1, 0.5)

# ---------------------------------------------------------------- Im Kopf: Dröhnen + Herzschlag
drone = (np.sin(2 * np.pi * 55 * t) + 0.5 * np.sin(2 * np.pi * 82.4 * t) + 0.3 * low(rng.normal(0, 1, N), 200))
drone *= 0.7 + 0.3 * np.sin(2 * np.pi * 0.5 * t)
out += (drone * head_env * 0.07)[:, None].astype(np.float32)
bpm_t = HD["dark"][0]
while bpm_t < h1:
    rate = 1.6 if bpm_t > HD["alarm"][0] else 1.15
    if bpm_t < HD["faint"] or bpm_t > HD["faint"] + 0.5:
        place(bpm_t, thud(0.7), 0.35)
        place(bpm_t + 0.16, thud(0.6), 0.22)
    bpm_t += 1 / rate
# Licht geht aus
place(HD["dark"][0], whoosh(0.6, 80, 600), 0.25)
place(HD["dark"][0] + 0.05, thud(0.5), 0.3)
# Tür
for td in (HD["door"], RL["start"] + 0.05):
    n = int(0.45 * SR)
    x = np.arange(n) / SR
    creak = np.sin(2 * np.pi * np.cumsum(220 + 70 * np.sin(2 * np.pi * 4 * x) + 40 * rng.normal(0, 1, n)) / SR)
    place(td, (band(creak, 200, 2200) * np.sin(np.pi * x / 0.45)).astype(np.float32), 0.08, -0.6)
# Schritte
for a, b in ((HD["walk"][0], HD["walk"][1]), (RL["walk"][0], RL["walk"][1])):
    for k in np.arange(a, b, 0.29):
        place(k, step_snd(), 0.3, -0.3)
# Flüstern
for w in EV["whispers"]:
    place(w["t"], whisper(0.8), 0.22, [-0.4, 0.0, 0.5][w["who"]])
# Sprechblasen + Karteikarten
for a, b, txt in HD["say"] + RL["say"]:
    place(a, tone(700, 1100, 0.08, 30, (1,)), 0.1)
for tp in (HD["pick"], RL["pick"]):
    place(tp - 0.1, band(rng.normal(0, 1, int(0.15 * SR)), 2000, 8000).astype(np.float32) * np.exp(-np.arange(int(0.15 * SR)) / SR * 25), 0.06)
place(HD["say"][1][0], tone(180, 140, 0.4, 6, (1, 0.5)), 0.12)   # "äh" – peinliches Tröten
# Wertungstafeln
for who, ts, n in HD["cards"]:
    place(ts, whoosh(0.18, 1500, 6000), 0.2)
    if n.startswith("6"):
        place(ts + 0.05, tone(110, 105, 0.6, 3, (1, 0.6, 0.4, 0.3)), 0.25)   # Buzzer
    else:
        place(ts + 0.05, tone(880, 880, 0.25, 12), 0.12)
# Alarm
a0, a1 = HD["alarm"]
x = np.arange(int((a1 - a0) * SR)) / SR
siren = np.sin(2 * np.pi * np.cumsum(700 + 250 * np.sign(np.sin(2 * np.pi * 2.5 * x))) / SR)
siren = band(siren, 300, 3000) * np.minimum(1, x / 0.05) * np.minimum(1, (a1 - a0 - x) / 0.3)
place(a0, siren.astype(np.float32), 0.09, 0.3)
place(HD["burst"][0], thud(1.2), 0.35)
place(HD["burst"][0] - 0.2, whoosh(0.3, 400, 4000), 0.2)
# Ohnmacht + Aufprall
place(HD["faint"], tone(600, 150, 0.5, 4, (1,)), 0.15)
place(HD["land"], thud(0.8), 0.6)
for k in range(6):                     # Karteikarten flattern
    place(HD["drop"] + k * 0.05, band(rng.normal(0, 1, int(0.08 * SR)), 3000, 9000).astype(np.float32) * np.exp(-np.arange(int(0.08 * SR)) / SR * 40), 0.1, (k - 3) * 0.2)
place(HD["land"] + 0.02, tone(2600, 2600, 0.9, 5, (1, 0.3)), 0.06)
# Zurückspulen: Bandsalat (hoch und runter)
for a, b in EV["rew"]:
    L = b - a
    n = int(L * SR)
    x = np.arange(n) / SR
    f = 300 + 1400 * np.sin(np.pi * x / L) + 200 * np.sin(2 * np.pi * 23 * x)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4 + band(rng.normal(0, 1, n), 1000, 6000) * 0.6
    s *= np.sin(np.pi * x / L) ** 0.5
    place(a, s.astype(np.float32), 0.16)
    place(b - 0.05, thud(1.0), 0.2)
# Wirklichkeit: Selfie-Auslöser, Herzchen, Glitzer
for tf in RL["flashes"]:
    if tf < r1:
        place(tf - 0.02, (band(rng.normal(0, 1, int(0.06 * SR)), 2000, 8000) * np.exp(-np.arange(int(0.06 * SR)) / SR * 70)).astype(np.float32), 0.12, -0.4)
for k in range(3):
    place(RL["hearts"][0] + k * 0.25, tone(1046 * (1 + k * 0.12), 1318 * (1 + k * 0.12), 0.25, 10, (1,)), 0.07, 0.1)
for k, f in enumerate((1568, 2093, 2637)):
    place(RL["sparkle"] + k * 0.06, tone(f, f, 0.6, 7, (1,)), 0.06, 0.1)
# Schlusssatz
for k, tt in enumerate(EV["title"]):
    place(tt - 0.15, whoosh(0.25, 600, 5000), 0.12)
    place(tt + 0.02, thud(1.0 + 0.1 * k), 0.4)
place(EV["titleOut"], whoosh(0.35, 400, 3000), 0.08)

# ---------------------------------------------------------------- Mischung
fade = np.ones(N, np.float32)
fl = int(0.3 * SR)
fade[-fl:] = np.linspace(1, 0, fl)
out *= fade[:, None]
out = np.tanh(out / (np.abs(out).max() + 1e-6) * 1.1) * 0.89
with wave.open(os.path.join(B, "audio.wav"), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(out, -1, 1) * 32767).astype(np.int16).tobytes())
print("audio.wav geschrieben:", round(DUR, 2), "s")
