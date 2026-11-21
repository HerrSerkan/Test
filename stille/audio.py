"""Ton für "GLEICHE STILLE.": Uhr-Ticken, Ventilator, Tinnitus-Pfeifen, geflüstertes "hey", Klick."""
import os
import sys

import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "tools"))
from sfx import Track, SR  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
DUR, RING, CLICK = 14.0, 1.25, 11.0
tr = Track(DUR, seed=9)
x = np.arange(tr.n) / SR

# Uhr: tick-tack alle 0,5 s
for k, t0 in enumerate(np.arange(0.1, DUR, 0.5)):
    tr.place(t0, tr.tick(2400 if k % 2 else 1900) + tr.bp(tr.noise(0.03), 1500, 6000) * np.exp(-tr.x(0.03) * 250) * 0.6, 0.22, pan=-0.5)

# Ventilator: Rauschen + Brummen, rollt nach dem Klick aus
fan_env = np.where(x < CLICK, 1.0, np.exp(-(x - CLICK) / 0.5))
hum = np.sin(2 * np.pi * 100 * x) * 0.3 + np.sin(2 * np.pi * 200 * x) * 0.1
air = tr.lp(tr.noise(DUR), 900) * (1 + 0.15 * np.sin(2 * np.pi * 22 / 6.283 * 3 * x))
fan = (hum * 0.25 + air * 0.35) * fan_env * np.minimum(1, x / 0.3)
tr.buf[:, 0] += (fan * 0.5).astype(np.float32)
tr.buf[:, 1] += (fan * 0.3).astype(np.float32)

# Tinnitus: hoher Ton, leicht schwebend
tin = np.sin(2 * np.pi * 7200 * x + 0.8 * np.sin(2 * np.pi * 5 * x)) * np.clip((x - RING) / 0.3, 0, 1)
tin *= np.where((x > 8.45) & (x < 9.7), 1.6, 1.0) * np.where(x > 12.7, 1.5, 1.0)
tr.buf += (tin * 0.045)[:, None].astype(np.float32)

# geflüstertes "hey" (Rauschen durch zwei Formanten, vom Ventilator her)
L = 0.55
t = tr.x(L)
n = tr.noise(L)
hey = (tr.bp(n, 500, 900) * 0.6 + tr.bp(n, 1800, 2600) + tr.bp(n, 2800, 3600) * 0.5) * np.sin(np.pi * t / L) ** 1.5 * (0.4 + 0.6 * (t < 0.08))
tr.place(5.2, hey, 0.55, pan=-0.2)
tr.place(5.25, tr.glide(1200, 500, 0.4), 0.04)

# Schreck beim "hey"
tr.place(5.0, tr.thump(70, 9), 0.25)

# Klick am Ventilator
tr.place(CLICK, tr.tick(1500) * 2 + tr.bp(tr.noise(0.03), 700, 4000) * np.exp(-tr.x(0.03) * 160), 0.7)

for t0 in [0.0, 1.3, 6.25, 6.75, 8.5, 9.75, 11.75, 12.75]:
    tr.place(t0 + 0.02, tr.pop(900), 0.1)

os.makedirs(os.path.join(HERE, "build"), exist_ok=True)
tr.write(os.path.join(HERE, "build", "audio.wav"))
print("ok")
