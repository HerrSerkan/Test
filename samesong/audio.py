"""Ton für "SAME SONG.": eigener, synthetischer Track mit gleichem Aufbau wie das Original.

  1.2–5.6 s  einzelne Plucks, werden dichter
  5.6–7.35 s Aufbau: Snare-Roll + Rauschen + aufsteigender Riser
  7.35–10.65 s Drop: Kick, Bass, Akkorde, 16tel-Arpeggio
  10.65–14 s ruhige Plucks wie am Anfang
"""
import os
import wave

import numpy as np
from scipy.signal import butter, lfilter

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 44100
DUR = 14.0
N = int(DUR * SR)
mix = np.zeros((N, 2), np.float32)
rng = np.random.default_rng(7)
BPM = 128
BEAT = 60 / BPM
DROP, DROP_OUT = 7.35, 10.65


def lp(x, f):
    b, a = butter(2, f / (SR / 2)); return lfilter(b, a, x)


def hp(x, f):
    b, a = butter(2, f / (SR / 2), "high"); return lfilter(b, a, x)


def place(t, sig, g, pan=0.0):
    i = int(t * SR)
    if i >= N or i < 0:
        return
    j = min(N, i + len(sig))
    s = np.asarray(sig[: j - i], np.float32) * g
    mix[i:j, 0] += s * (1 - max(0, pan))
    mix[i:j, 1] += s * (1 + min(0, pan))


def hz(n):
    return 440 * 2 ** ((n - 69) / 12)


def pluck(f, L=0.9, bright=1.0):
    x = np.arange(int(L * SR)) / SR
    s = (np.sin(2 * np.pi * f * x) + 0.5 * np.sin(2 * np.pi * 2 * f * x) * np.exp(-x * 12)
         + 0.3 * bright * np.sin(2 * np.pi * 3 * f * x) * np.exp(-x * 25))
    return s * np.minimum(1, x / 0.002) * np.exp(-x * 5.5)


def kick():
    x = np.arange(int(0.4 * SR)) / SR
    f = 46 + 110 * np.exp(-x * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 8)


def snare(L=0.18):
    n = int(L * SR); x = np.arange(n) / SR
    return hp(rng.normal(0, 1, n), 1500) * np.exp(-x * 26) + 0.4 * np.sin(2 * np.pi * 190 * x) * np.exp(-x * 30)


def hat(open_=False):
    n = int((0.2 if open_ else 0.05) * SR); x = np.arange(n) / SR
    return hp(rng.normal(0, 1, n), 7500) * np.exp(-x * (16 if open_ else 90))


def saw_chord(notes, L):
    x = np.arange(int(L * SR)) / SR
    s = np.zeros_like(x)
    for n in notes:
        for d in (-0.12, 0, 0.11):           # leichte Verstimmung = "Supersaw"
            f = hz(n + d)
            s += 2 * ((x * f) % 1) - 1
    s = lp(s, 3200) / (len(notes) * 3)
    return s * np.minimum(1, x / 0.01) * np.minimum(1, (L - x) / 0.05)


def bass(f, L):
    x = np.arange(int(L * SR)) / SR
    s = np.sin(2 * np.pi * f * x) + 0.4 * np.sin(2 * np.pi * 2 * f * x)
    return lp(s, 500) * np.minimum(1, x / 0.005) * np.minimum(1, (L - x) / 0.02)


def crash():
    n = int(2.2 * SR); x = np.arange(n) / SR
    return hp(rng.normal(0, 1, n), 4000) * np.exp(-x * 2.2)


# --- Teil 1: Plucks, die dichter werden (Zeiten aus dem Original gemessen)
SCALE = [69, 72, 74, 76, 79, 81, 84]           # A-Moll-Pentatonik
intro = [1.23, 1.76, 2.06, 2.25, 2.48, 2.73, 3.08, 3.26, 3.75, 4.25, 4.6, 4.83, 5.06, 5.25, 5.43, 5.6]
mel = [0, 2, 4, 3, 2, 4, 5, 4, 2, 3, 4, 5, 4, 5, 6, 5]
for k, (t, m) in enumerate(zip(intro, mel)):
    place(t, pluck(hz(SCALE[m])), 0.32, pan=0.3 * np.sin(k * 1.7))
    place(t, pluck(hz(SCALE[m] - 12), bright=0.4), 0.12)

# --- Teil 2: Aufbau
t, step = 5.6, BEAT / 2
while t < DROP - 0.02:
    k = (t - 5.6) / (DROP - 5.6)
    place(t, snare(), 0.10 + 0.35 * k)
    place(t, pluck(hz(SCALE[int(k * 6.99)]), 0.3), 0.15 + 0.1 * k, pan=0.4 * np.sin(t * 9))
    step = BEAT / 2 if k < 0.35 else BEAT / 4 if k < 0.7 else BEAT / 8
    t += step
L = DROP - 5.6
x = np.arange(int(L * SR)) / SR
sweep = np.sin(2 * np.pi * np.cumsum(220 * 2 ** (x / L * 2.2)) / SR) * (x / L) ** 2
noise = hp(rng.normal(0, 1, len(x)), 2000) * (x / L) ** 2.5
place(5.6, sweep * 0.18 + noise * 0.16, 1.0)

# --- Teil 3: Drop
PROG = [(53, [65, 69, 72, 76]), (55, [67, 71, 74, 79]), (57, [69, 72, 76, 81]), (60, [67, 72, 76, 79])]   # F G Am C
place(DROP, crash(), 0.22)
bar = 4 * BEAT
nbeats = int((DROP_OUT - DROP) / BEAT + 0.5)
for b in range(nbeats):
    tb = DROP + b * BEAT
    root, chord = PROG[(b // 2) % 4]
    place(tb, kick(), 0.85)
    if b % 2 == 1:
        place(tb, snare(0.22), 0.30)
    place(tb + BEAT / 2, hat(True), 0.10, 0.3)
    place(tb + BEAT / 2 * 0.98, bass(hz(root - 12), BEAT * 0.45), 0.5)
    place(tb, saw_chord(chord, BEAT * 0.92), 0.55)
    for s in range(4):                       # 16tel-Arpeggio
        place(tb + s * BEAT / 4, pluck(hz(chord[(s + b) % 4] + 12), 0.25), 0.13, pan=0.5 * (-1) ** s)
# Sidechain-Pumpen im Drop
env = np.ones(N, np.float32)
for b in range(nbeats):
    i0 = int((DROP + b * BEAT) * SR); n = int(BEAT * SR)
    seg = 1 - 0.6 * np.exp(-np.arange(n) / SR * 11)
    env[i0:i0 + n] = seg[: max(0, min(n, N - i0))]
mix *= env[:, None] ** 0.8
# Kick nach dem Pumpen nochmal klar oben drauf
for b in range(nbeats):
    place(DROP + b * BEAT, kick(), 0.35)

# --- Teil 4: ruhige Plucks
outro = [11.1, 11.25, 11.4, 11.75, 12.0, 12.25, 12.55, 12.75, 13.1, 13.3]
mel2 = [4, 3, 2, 0, 2, 3, 2, 0, 1, 0]
place(DROP_OUT, saw_chord([57, 64, 69, 72], 3.2) * np.exp(-np.arange(int(3.2 * SR)) / SR * 1.2), 0.18)
for k, (t, m) in enumerate(zip(outro, mel2)):
    place(t, pluck(hz(SCALE[m]), 1.2), 0.3, pan=0.3 * np.sin(k * 1.3))

# einfacher Hall
d1, d2 = int(0.083 * SR), int(0.127 * SR)
wet = np.zeros_like(mix)
wet[d1:, 0] += mix[:-d1, 1] * 0.25; wet[d2:, 1] += mix[:-d2, 0] * 0.25
wet[2 * d2:] += mix[:-2 * d2] * 0.12
mix = mix + lp(wet.T, 4000).T.astype(np.float32)

fade = np.ones(N, np.float32); nf = int(0.25 * SR); fade[-nf:] = np.linspace(1, 0, nf)
mix *= fade[:, None]
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
mix /= max(1e-6, np.abs(mix).max()) / 0.89
os.makedirs(os.path.join(HERE, "build"), exist_ok=True)
with wave.open(os.path.join(HERE, "build", "audio.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
print("ok", DUR)
