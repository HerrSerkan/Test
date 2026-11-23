"""Spannende Renn-Musik für "Das Zauberschul-Rennen" (instrumental, synthetisch), passend zum Ablauf des Videos.

  python3 monate/race_music.py      # liest build/events.json -> build/music_synth.wav

Abenteuer-Verfolgungsjagd in d-Moll, 150 BPM: galoppierende Staccato-Streicher, Bass, Tom-Trommeln,
Snare, Blechbläser-Stöße, Celesta-Funkeln. Intensität steigt mit jedem Rausflieger, leise in den
Bibliothek-Szenen, Trommelwirbel + Riser vor dem Ziel, Dur-Fanfare beim Sieg.
"""
import json
import os
import wave

import numpy as np
from scipy.signal import butter, lfilter

HERE = os.path.dirname(os.path.abspath(__file__))
B = os.path.join(HERE, "build")
EV = json.load(open(os.path.join(B, "events.json")))
SR = 44100
DUR = EV["duration"] + 1.0
N = int(DUR * SR)
rng = np.random.default_rng(7)
mix = np.zeros((N, 2), np.float32)
BPM = 150
beat = 60 / BPM
s16 = beat / 4

R0, FIN = EV["race"]
WIN = EV["win"]
LIBS = [(EV["cuts"][0], EV["cuts"][1]), (EV["cuts"][2], EV["cuts"][3])]
LATER = EV["cuts"][5]


def lp(x, f):
    b, a = butter(2, min(f, SR / 2 - 100) / (SR / 2)); return lfilter(b, a, x)


def bp(x, lo, hi):
    b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], "band"); return lfilter(b, a, x)


def hz(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def put(t0, sig, g=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N or i + len(sig) <= 0:
        return
    j = min(N, i + len(sig))
    s = sig[: j - i] * g
    mix[i:j, 0] += s * (1 - max(0, pan))
    mix[i:j, 1] += s * (1 + min(0, pan))


def saw(f, L, det=0.0):
    n = int(L * SR)
    x = np.arange(n) / SR
    ph = (f * (1 + det) * x) % 1.0
    return 2 * ph - 1


def env(n, a, d):
    x = np.arange(n) / SR
    return np.minimum(1, x / max(a, 1e-4)) * np.exp(-x * d)


# Intensität über die Zeit (0 = still, 1 = voll)
def intensity(t):
    if t < R0:
        return 0.3
    for a, b in LIBS:
        if a <= t < b:
            return 0.0
    if t >= LATER:
        return 0.0
    if t >= WIN:
        return 0.0
    if t >= FIN:
        return 0.95 + 0.05 * (t - FIN) / (WIN - FIN)
    return 0.55 + 0.35 * (t - R0) / (FIN - R0)


def in_lib(t):
    return any(a <= t < b for a, b in LIBS) or t >= LATER


# Akkordfolge d-Moll: Dm - Bb - C - A (je 1 Takt = 4 Schläge)
CHORDS = [[50, 53, 57], [46, 50, 53], [48, 52, 55], [45, 49, 52]]
bar = 4 * beat
nbars = int(DUR / bar) + 1

# ---------------------------------------------------------------- Streicher-Ostinato (Galopp: 8tel + zwei 16tel)
for b in range(nbars):
    ch = CHORDS[b % 4]
    for k in range(16):
        t = b * bar + k * s16
        I = intensity(t)
        if I <= 0.01 or (k % 4 == 1):           # Galopp-Rhythmus: X . X X
            continue
        pat = [0, 0, 2, 0, 1, 0, 2, 1]
        note = ch[pat[(k // 2) % 8]] + 12 + (12 if (k % 4 == 3 and I > 0.8) else 0)
        L = s16 * 0.9
        n = int(L * SR)
        s = (saw(hz(note), L) + saw(hz(note), L, 0.004)) * 0.5
        s = lp(s, 1800 + 2500 * I) * env(n, 0.003, 22)
        put(t, s.astype(np.float32), 0.055 * (0.5 + I), pan=0.25 if k % 2 else -0.25)

# ---------------------------------------------------------------- Bass (Achtel)
for b in range(nbars):
    root = CHORDS[b % 4][0] - 12
    for k in range(8):
        t = b * bar + k * beat / 2
        I = intensity(t)
        if I <= 0.01:
            continue
        L = beat / 2 * 0.9
        n = int(L * SR)
        s = lp(saw(hz(root + (12 if k % 2 else 0)), L), 500) * env(n, 0.005, 9)
        put(t, s.astype(np.float32), 0.12 * I)


# ---------------------------------------------------------------- Trommeln
def tom(f=1.0, L=0.4):
    n = int(L * SR)
    x = np.arange(n) / SR
    s = np.sin(2 * np.pi * np.cumsum((80 + 90 * np.exp(-x * 25)) * f) / SR) * np.exp(-x * 9)
    return (s + bp(rng.normal(0, 1, n), 200, 1200) * np.exp(-x * 40) * 0.3).astype(np.float32)


def snare(L=0.18):
    n = int(L * SR)
    x = np.arange(n) / SR
    s = bp(rng.normal(0, 1, n), 1500, 8000) * np.exp(-x * 22) + np.sin(2 * np.pi * 190 * x) * np.exp(-x * 30) * 0.5
    return s.astype(np.float32)


for b in range(nbars):
    for k in range(8):
        t = b * bar + k * beat / 2
        I = intensity(t)
        if I <= 0.01:
            continue
        if k in (0, 3, 4, 6):
            put(t, tom(1.0 if k != 3 else 1.25), 0.32 * I)
        if k in (2, 6) and I > 0.5:
            put(t, snare(), 0.14 * I, pan=0.1)
        if I > 0.75 and k in (1, 5):
            put(t, tom(1.6, 0.25), 0.16 * I, pan=-0.3)

# Trommelwirbel vor dem Ziel + Riser
roll_a, roll_b = FIN, WIN
t = roll_a
while t < roll_b:
    u = (t - roll_a) / (roll_b - roll_a)
    put(t, snare(0.1), 0.05 + 0.18 * u, pan=rng.uniform(-0.2, 0.2))
    t += s16 * (1.0 if u < 0.5 else 0.5)
n = int((WIN - FIN) * SR)
x = np.arange(n) / SR
riser = bp(rng.normal(0, 1, n), 800, 7000) * (x / x[-1]) ** 2.5 * 0.6
riser += np.sin(2 * np.pi * np.cumsum(np.linspace(200, 900, n)) / SR) * (x / x[-1]) ** 2 * 0.15
put(FIN, riser.astype(np.float32), 0.6)


# ---------------------------------------------------------------- Blechbläser-Stöße
def brass(notes, L, bright):
    n = int(L * SR)
    s = np.zeros(n)
    for nt in notes:
        s += saw(hz(nt), L, 0.002) + saw(hz(nt), L, -0.003)
    x = np.arange(n) / SR
    fenv = 600 + bright * 3000 * np.exp(-x * 6)
    out = np.zeros(n)
    blk = 512
    for i in range(0, n, blk):          # zeitveränderlicher Tiefpass in Blöcken
        out[i:i + blk] = lp(s[max(0, i - 2048):i + blk], float(fenv[i]))[-len(s[i:i + blk]):]
    return (out * np.minimum(1, x / 0.02) * np.exp(-x * 2.5) / len(notes)).astype(np.float32)


for b in range(0, nbars, 2):
    t = b * bar
    I = intensity(t)
    if I > 0.5:
        ch = CHORDS[b % 4]
        put(t, brass([c + 12 for c in ch], beat * 1.5, I), 0.16 * I)
        if I > 0.8:
            put(t + bar + beat * 3, brass([c + 12 for c in CHORDS[(b + 1) % 4]], beat * 0.9, I), 0.12 * I)


# ---------------------------------------------------------------- Celesta-Funkeln (Magie), auch in der Bibliothek
def celesta(f, L=1.0):
    n = int(L * SR)
    x = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * x) * np.exp(-x * 4) + 0.3 * np.sin(2 * np.pi * 2 * f * x) * np.exp(-x * 7)
    return (s * np.minimum(1, x / 0.002)).astype(np.float32)


arp = [74, 77, 81, 86, 81, 77]
k = 0
t = 0.0
while t < DUR - 1:
    lib = in_lib(t)
    if t < R0 or lib or (k % 4 == 0):
        ch = CHORDS[int(t / bar) % 4]
        note = ch[k % 3] + 24 + (12 if k % 6 == 5 else 0)
        put(t, celesta(hz(note)), (0.05 if lib or t < R0 else 0.03), pan=0.4 * np.sin(k))
    k += 1
    t += beat / 2 if (lib or t < R0) else beat

# Sanfte Fläche in den ruhigen Teilen
for (a, b) in LIBS + [(LATER, DUR), (0, R0)]:
    L = b - a
    n = int(L * SR)
    x = np.arange(n) / SR
    s = np.zeros(n)
    for nt in (50, 57, 62, 65):
        s += np.sin(2 * np.pi * hz(nt) * x) + 0.3 * np.sin(2 * np.pi * hz(nt) * 1.003 * x)
    s = lp(s, 1500) * np.minimum(1, x / 0.4) * np.clip((L - x) / 0.4, 0, 1)
    put(a, s.astype(np.float32), 0.025)


# ---------------------------------------------------------------- Schläge + Sieger-Fanfare
def boom(L=1.6):
    n = int(L * SR)
    x = np.arange(n) / SR
    s = np.sin(2 * np.pi * np.cumsum(40 + 90 * np.exp(-x * 9)) / SR) * np.exp(-x * 2.4)
    s += bp(rng.normal(0, 1, n), 100, 1500) * np.exp(-x * 10) * 0.4
    return s.astype(np.float32)


put(R0 - 0.02, boom(), 0.5)
put(R0 - 0.02, brass([62, 65, 69], 1.0, 1.0), 0.2)
put(FIN, boom(1.2), 0.35)
put(WIN, boom(2.0), 0.55)
for i, ch in enumerate([[62, 66, 69, 74], [64, 67, 71, 76], [66, 69, 74, 78]]):      # D-Dur-Fanfare
    put(WIN + i * beat * 1.5, brass(ch, beat * (1.4 if i < 2 else 4.0), 1.0), 0.28)
for i, nt in enumerate([86, 90, 93, 98, 102]):
    put(WIN + 0.1 + i * 0.12, celesta(hz(nt), 1.6), 0.06)

# ---------------------------------------------------------------- Hall + Ausgabe
for d, g in ((0.09, 0.22), (0.15, 0.15), (0.23, 0.1)):
    k = int(d * SR)
    mix[k:] += mix[:-k] * g
mix /= np.abs(mix).max() + 1e-6
mix *= 0.9
with wave.open(os.path.join(B, "music_synth.wav"), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())
print("Renn-Musik geschrieben:", round(DUR, 1), "s @", BPM, "BPM")
