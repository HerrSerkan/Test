"""Ton für "Immer schneller": eigene, ansteigende Musik + Effekte (Knopf, Motor, Überschallknall, Glas, Feuer, Wind, All)."""
import os
import sys
import wave

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "tools"))
from sfx import Track, SR  # noqa: E402

DUR = 60.4
tr = Track(DUR, seed=8)
n = tr.n
x = np.arange(n) / SR


def hz(m):
    return 440 * 2 ** ((m - 69) / 12)


def env_seg(a, b, fade=0.4):
    return np.clip((x - a) / fade, 0, 1) * np.clip((b - x) / fade, 0, 1)


# Musik: Akkordfläche + Puls, wird bis zum Weltall dichter, dann schwebend
prog = [(45, [57, 60, 64]), (41, [57, 60, 65]), (48, [55, 60, 64]), (43, [55, 59, 62])]
BPM = 100; beat = 60 / BPM; bar = 4 * beat
music = np.zeros(n)
for b in range(int(DUR / bar) + 1):
    t0 = b * bar; root, ch = prog[b % 4]
    i0 = int(t0 * SR); L = int(bar * SR); i1 = min(n, i0 + L)
    tt = np.arange(i1 - i0) / SR
    pad = sum(np.sin(2 * np.pi * hz(m) * tt + 0.3 * np.sin(2 * np.pi * 0.25 * tt)) for m in ch) / 3
    pad *= np.minimum(1, tt / 0.3) * np.minimum(1, (bar - tt) / 0.3)
    music[i0:i1] += pad * 0.35
    for k in range(8):                                    # Achtel-Puls (Bass)
        s = int((t0 + k * beat / 2) * SR); L2 = int(0.22 * SR); e = min(n, s + L2)
        if s >= n:
            break
        t2 = np.arange(e - s) / SR
        music[s:e] += np.sin(2 * np.pi * hz(root - 12) * t2) * np.exp(-t2 * 12) * 0.5
inten = np.clip(0.35 + 0.65 * (x / 34), 0, 1) * np.where(x > 35, 0.7, 1.0)
pulse_on = np.where((x > 1.0) & (x < 35), 1.0, 0.25)
music *= inten * pulse_on ** 0.3
# Kick ab 2 s bis 34 s
for k in np.arange(2.0, 34.0, beat):
    tr.place(k, tr.thump(52, 9), 0.35 * min(1, (k - 1) / 10))
# Riser zur Schallmauer und zum Weltall
for a, b in [(10.5, 14.4), (27.0, 34.8)]:
    L = b - a; t2 = tr.x(L)
    tr.place(a, tr.bp(tr.noise(L), 800, 7000) * (t2 / L) ** 2 * 0.5 + np.sin(2 * np.pi * np.cumsum(200 * 2 ** (t2 / L * 2.5)) / SR) * (t2 / L) ** 2 * 0.15, 0.6)
# Knopf + Motor
tr.place(0.6, tr.tick(1400) * 2, 0.6); tr.place(0.6, tr.thump(200, 30), 0.3)
L = 16; t2 = tr.x(L); f = 40 * 2 ** (np.minimum(t2, 14) / 3.2)
eng = (np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.3 + np.sin(2 * np.pi * np.cumsum(f * 2) / SR) * 0.3)
tr.place(0.7, tr.lp(eng, 1800) * np.minimum(1, t2 / 0.3) * np.clip((14.4 - t2 - 0.7) / 0.2, 0, 1), 0.25)
# Polizeisirene leise
for k in range(4):
    tr.place(9.6 + k * 0.55, tr.glide(700, 980, 0.27), 0.08); tr.place(9.6 + k * 0.55 + 0.27, tr.glide(980, 700, 0.27), 0.08)
# Überschallknall
L = 2.5; t2 = tr.x(L)
boom = np.sin(2 * np.pi * np.cumsum(38 + 70 * np.exp(-t2 * 8)) / SR) * np.exp(-t2 * 2.2) + tr.lp(tr.noise(L), 300) * np.exp(-t2 * 3) * 2.5
tr.place(14.42, boom, 1.0)
# Glas
for k in range(40):
    t0 = 16.9 + np.random.default_rng(k).uniform(0, 1.4)
    tr.place(t0, tr.bell(np.random.default_rng(k + 99).uniform(2500, 6500), 0.25), 0.04); tr.place(t0, tr.crunch(0.08), 0.08)
# Wind / Feuer / Plasma
wind = tr.bp(tr.noise(DUR), 200, 3000)
wenv = env_seg(14.5, 35.0, 1.5) * (0.4 + 0.6 * env_seg(20.8, 33.5, 0.6))
tr.buf[:, 0] += (wind * wenv * 0.18).astype(np.float32); tr.buf[:, 1] += (np.roll(wind, 500) * wenv * 0.18).astype(np.float32)
# All: hohe Schimmerfläche
shim = sum(np.sin(2 * np.pi * f * x + p) for f, p in [(1318, 0), (1760, 1), (1975, 2)]) / 3 * env_seg(35, 60.2, 2.0)
shim *= 0.5 + 0.5 * np.clip((x - 52) / 6, 0, 1)
tr.buf += (shim * 0.06)[:, None].astype(np.float32)
# Schlussakzent
tr.place(59.4, tr.bell(880, 1.2), 0.3)

out = tr.buf.copy()
out[:, 0] += (music * 0.5).astype(np.float32); out[:, 1] += (music * 0.5).astype(np.float32)
fade = np.clip((DUR - 0.1 - x) / 0.6, 0, 1); out *= fade[:, None]
out /= np.abs(out).max() / 0.92
os.makedirs(os.path.join(HERE, "build"), exist_ok=True)
with wave.open(os.path.join(HERE, "build", "audio.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())
print("ok")
