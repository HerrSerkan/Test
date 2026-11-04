"""Düstere, treibende Spannungsmusik (Alien-/Bedrohungs-Teil), instrumental.

  python3 tools/tension_music.py <ausgabe.wav> [dauer=26] [bpm=129] [seed=1]

G-Moll mit chromatischer Figur (G – G# – G – F#), tiefer Sub-Bass in Achteln, große Trommeln,
Staccato-Streicher in Sechzehnteln, Blechbläser-Stöße alle zwei Takte, Riser + Schlag am Anfang.
Gleichmäßig kräftig, damit tools/mix_music.py ab Sekunde 0 einen Ausschnitt nehmen kann.
"""
import sys
import wave

import numpy as np
from scipy.signal import butter, lfilter

SR = 44100
out = sys.argv[1]
DUR = float(sys.argv[2]) if len(sys.argv) > 2 else 26.0
BPM = float(sys.argv[3]) if len(sys.argv) > 3 else 129.0
rng = np.random.default_rng(int(sys.argv[4]) if len(sys.argv) > 4 else 1)
N = int(DUR * SR)
mix = np.zeros((N, 2), np.float32)
beat = 60 / BPM
s16 = beat / 4


def lp(x, f):
    b, a = butter(2, min(f, SR / 2 - 100) / (SR / 2)); return lfilter(b, a, x)


def hp(x, f):
    b, a = butter(2, f / (SR / 2), "high"); return lfilter(b, a, x)


def env(n, a, d):
    x = np.arange(n) / SR
    return np.minimum(1, x / max(a, 1e-4)) * np.exp(-x / d)


def place(t, sig, g, pan=0.0):
    i = int(t * SR)
    if i >= N or i < 0:
        return
    j = min(N, i + len(sig))
    mix[i:j, 0] += sig[: j - i] * g * (1 - max(0, pan))
    mix[i:j, 1] += sig[: j - i] * g * (1 + min(0, pan))


def hz(n):  # MIDI -> Hz
    return 440 * 2 ** ((n - 69) / 12)


def saw(f, n, det=0.0):
    x = np.arange(n) / SR
    s = 2 * ((f * x) % 1) - 1
    if det:
        s = 0.5 * s + 0.5 * (2 * ((f * (1 + det) * x) % 1) - 1)
    return s


def kick():
    n = int(0.45 * SR); x = np.arange(n) / SR
    return np.sin(2 * np.pi * (42 + 90 * np.exp(-x * 28)) * x) * env(n, 0.002, 0.22) * 1.2


def taiko():
    n = int(0.6 * SR); x = np.arange(n) / SR
    body = np.sin(2 * np.pi * (70 + 40 * np.exp(-x * 18)) * x) * env(n, 0.002, 0.18)
    skin = lp(rng.normal(0, 1, n), 1500) * env(n, 0.001, 0.04)
    return body + 0.5 * skin


def snare():
    n = int(0.35 * SR)
    noise = hp(rng.normal(0, 1, n), 1200) * env(n, 0.001, 0.09)
    tail = lp(rng.normal(0, 1, n), 3000) * env(n, 0.01, 0.25) * 0.25   # Hall-Schwanz
    return noise + tail


def hat():
    n = int(0.05 * SR)
    return hp(rng.normal(0, 1, n), 7000) * env(n, 0.0005, 0.012)


def sub(f, L):
    n = int(L * SR); x = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * x) + 0.3 * np.sin(2 * np.pi * 2 * f * x)
    return s * np.minimum(1, x / 0.005) * np.exp(-x / (L * 0.8))


def string(f, L):
    n = int(L * SR)
    return lp(saw(f, n, 0.004), 2400) * env(n, 0.004, L * 0.45)


def brass(fs, L):
    n = int(L * SR); x = np.arange(n) / SR
    s = sum(saw(f, n, 0.006) for f in fs) / len(fs)
    cutoff_env = np.minimum(1, x / 0.08)
    return lp(s, 1800) * (0.6 + 0.4 * cutoff_env) * np.minimum(1, x / 0.03) * np.exp(-x / (L * 0.6))


bar = 4 * beat
nbars = int(DUR / bar) + 1
ROOTS = [43, 44, 43, 42]                     # G1 G#1 G1 F#1 (chromatisch, bedrohlich)
OST = [55, 55, 62, 55, 56, 55, 54, 55, 55, 55, 62, 55, 58, 57, 56, 54]   # Streicher-Figur (G3 …)

# Schlag am Anfang
place(0, kick(), 1.0); place(0, taiko(), 0.8)
place(0, brass([hz(55), hz(58), hz(62)], 1.6), 0.5)

for b in range(nbars):
    t0 = b * bar
    root = ROOTS[b % 4]
    for e in range(8):                                   # Sub-Bass in Achteln, mit „Pumpen“
        place(t0 + e * beat / 2, sub(hz(root), beat / 2), 0.55 if e % 2 == 0 else 0.4)
    for k in (0, 2):
        place(t0 + k * beat, kick(), 0.9)
    for k in (1, 3):
        place(t0 + k * beat, snare(), 0.45)
    for s in range(16):
        place(t0 + s * s16, hat(), 0.12 if s % 2 else 0.2, pan=0.3)
        f = OST[s] + (root - 43)
        place(t0 + s * s16, string(hz(f), s16 * 0.9), 0.3, pan=-0.25)
        place(t0 + s * s16, string(hz(f + 12), s16 * 0.8), 0.14, pan=0.25)
    # Trommelwirbel am Taktende
    if b % 2 == 1:
        for s in (12, 13, 14, 15):
            place(t0 + s * s16, taiko(), 0.35 + 0.08 * (s - 12))
    if b % 2 == 0:
        chord = [hz(root + 12), hz(root + 15), hz(root + 19)]
        place(t0, brass(chord, bar * 0.9), 0.5)

mix /= np.abs(mix).max() + 1e-9
mix *= 0.9
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
print("Spannungsmusik geschrieben:", out, f"{DUR:.1f}s @ {BPM:.0f} BPM")
