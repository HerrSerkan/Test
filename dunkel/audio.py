"""Ton für "GLEICHE DUNKELHEIT.": Klick, unheimliche Fläche, Rauschen, vorbeifahrendes Auto, Schreck-Akzente."""
import os
import sys

import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "tools"))
from sfx import Track, SR  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
DUR = 14.0
tr = Track(DUR, seed=5)
x = np.arange(tr.n) / SR


def hz(n):
    return 440 * 2 ** ((n - 69) / 12)


def pad(notes, L):
    t = tr.x(L)
    s = sum(np.sin(2 * np.pi * hz(n) * t + 0.3 * np.sin(2 * np.pi * 0.3 * t)) for n in notes) / len(notes)
    return s * np.minimum(1, t / 0.8) * np.minimum(1, (L - t) / 0.8)


def musicbox(f):
    t = tr.x(1.6)
    return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t * 8)) * np.exp(-t * 2.5) * np.minimum(1, t / 0.003)


# Raumton
tr.buf += (tr.lp(tr.noise(DUR), 250) * 0.05)[:, None].astype(np.float32)
# Lichtschalter
tr.place(0.75, tr.tick(1800) * 2 + tr.bp(tr.noise(0.03), 800, 5000) * np.exp(-tr.x(0.03) * 150), 0.6)
# unheimliche Fläche ab der Gestalt
tr.place(1.8, pad([45, 52, 56], 4.3), 0.16)
tr.place(7.0, pad([44, 51, 55], 7.0), 0.17)
# Spieluhr-Töne (leicht schief)
for k, (t0, n) in enumerate([(2.0, 76), (2.6, 75), (3.2, 71), (3.8, 72), (4.6, 76), (5.2, 75), (7.4, 77), (8.0, 76), (8.6, 72),
                             (9.4, 71), (10.2, 76), (10.8, 75), (11.6, 72), (12.4, 71), (13.0, 68)]):
    tr.place(t0, musicbox(hz(n) * 1.004), 0.09, pan=0.4 * np.sin(k))
# Bildrauschen (leise, flackernd)
hiss = tr.bp(tr.noise(DUR), 3000, 12000) * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 13 * x)))
env = np.clip((x - 2.3) / 0.5, 0, 1)
env *= np.where((x > 6.0) & (x < 6.65), 0.35, 1.0)
tr.buf[:, 1] += (hiss * env * 0.05).astype(np.float32)
tr.buf[:, 0] += (hiss * env * 0.025).astype(np.float32)
# vorbeifahrendes Auto
L = 1.3
t = tr.x(L)
car = tr.lp(tr.noise(L), 700) * np.sin(np.pi * t / L) ** 2 * 1.8 + np.sin(2 * np.pi * np.cumsum(70 - 20 * t / L) / SR) * np.sin(np.pi * t / L) ** 2 * 0.4
tr.place(5.75, car, 0.5, pan=-0.3)
# Schreck-Akzente
for t0, g in [(6.95, 0.7), (9.0, 0.45)]:
    tr.place(t0, tr.thump(42, 3), g)
    tr.place(t0, pad([58, 59, 64], 1.2) * np.exp(-tr.x(1.2) * 2), 0.25)
# Blinzeln
for t0 in np.arange(8.0, 8.7, 0.17):
    tr.place(t0, tr.tick(3200), 0.05)
# Pops für Sprechblasen
for t0 in [0.0, 1.85, 2.55, 6.2, 7.0, 7.25, 8.0, 8.75, 9.0, 10.75, 11.25, 11.75]:
    tr.place(t0 + 0.02, tr.pop(850), 0.1)

os.makedirs(os.path.join(HERE, "build"), exist_ok=True)
tr.write(os.path.join(HERE, "build", "audio.wav"))
print("ok")
