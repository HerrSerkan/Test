"""Ton für "GLEICHER STURM.": Regen, zwei Donnerschläge, Vögel bei Sonne, fernes Grummeln."""
import os
import sys

import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "tools"))
from sfx import Track, SR  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
DUR, FL, DAY = 14.0, [3.0, 7.25, 12.25], 10.75
tr = Track(DUR, seed=3)
x = np.arange(tr.n) / SR

# Regen: gefiltertes Rauschen + einzelne Tropfen, endet mit der Sonne
rain = tr.bp(tr.noise(DUR), 500, 9000) * 0.22 + tr.lp(tr.noise(DUR), 400) * 0.25
env = np.clip(1 - (x - DAY) / 0.4, 0, 1) * np.minimum(1, x / 0.3)
tr.buf[:, 0] += (rain * env).astype(np.float32)
tr.buf[:, 1] += (np.roll(rain, 431) * env).astype(np.float32)
for t in np.sort(tr.rng.uniform(0, DAY, 140)):
    tr.place(t, tr.tick(tr.rng.uniform(2500, 6000)), 0.05, pan=tr.rng.uniform(-0.8, 0.8))


def thunder(big=1.0, L=3.2):
    t = tr.x(L)
    crack = tr.bp(tr.noise(L), 900, 6000) * np.exp(-t * 9) * 1.6
    roll = tr.lp(tr.noise(L), 160) * (np.exp(-t * 1.1) * (1 + 0.5 * np.sin(t * 9) * np.sin(t * 3.3))) * 4
    boom = np.sin(2 * np.pi * np.cumsum(45 + 40 * np.exp(-t * 6)) / SR) * np.exp(-t * 2.5)
    return (crack + roll + boom * 0.9) * big


tr.place(FL[0], thunder(1.0), 0.9)
tr.place(FL[1], thunder(1.15), 1.0)
# fernes Grummeln (kein Knall)
t = tr.x(2.6)
tr.place(FL[2], tr.lp(tr.noise(2.6), 120) * np.sin(np.pi * t / 2.6) * 3.5 * (1 + 0.4 * np.sin(t * 7)), 0.7)

# Vögel
for k, t0 in enumerate(np.arange(DAY + 0.15, FL[2] - 0.1, 0.32)):
    f = tr.rng.uniform(2800, 4200)
    tr.place(t0, tr.glide(f, f * 1.35, 0.09), 0.10, pan=0.5 * np.sin(k))
    tr.place(t0 + 0.11, tr.glide(f * 1.2, f * 0.9, 0.07), 0.07, pan=0.5 * np.sin(k))

# leise Pops für die Sprechblasen
for t0 in [0.0, 0.5, 0.75, 3.25, 4.8, 5.0, 5.2, 7.5, 11.0, 11.4, 11.75, 12.5]:
    tr.place(t0 + 0.02, tr.pop(900), 0.12)

os.makedirs(os.path.join(HERE, "build"), exist_ok=True)
tr.write(os.path.join(HERE, "build", "audio.wav"))
print("ok")
