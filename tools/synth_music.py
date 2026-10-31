"""Einfacher Instrumental-Groove als Ersatz, wenn ElevenLabs Music nicht verfügbar ist.

  python3 tools/synth_music.py <ausgabe.wav> [dauer=32] [bpm=112] [stil=verspielt|cool] [seed=1]

Kick + Clap + Hi-Hat, Bass auf den Grundtönen, Marimba-Arpeggio. Ohne Gesang, gleichmäßig kräftig ab Sekunde 0,
damit tools/mix_music.py einen Ausschnitt wählen kann.
"""
import sys
import wave

import numpy as np
from scipy.signal import butter, lfilter

SR = 44100
out = sys.argv[1]
DUR = float(sys.argv[2]) if len(sys.argv) > 2 else 32.0
BPM = float(sys.argv[3]) if len(sys.argv) > 3 else 112.0
STYLE = sys.argv[4] if len(sys.argv) > 4 else "verspielt"
rng = np.random.default_rng(int(sys.argv[5]) if len(sys.argv) > 5 else 1)
N = int(DUR * SR)
mix = np.zeros((N, 2), np.float32)
beat = 60 / BPM


def lp(x, f):
    b, a = butter(2, f / (SR / 2)); return lfilter(b, a, x)


def hp(x, f):
    b, a = butter(2, f / (SR / 2), "high"); return lfilter(b, a, x)


def place(t, sig, g, pan=0.0):
    i = int(t * SR)
    if i >= N:
        return
    j = min(N, i + len(sig))
    mix[i:j, 0] += sig[: j - i] * g * (1 - max(0, pan))
    mix[i:j, 1] += sig[: j - i] * g * (1 + min(0, pan))


def hz(n):
    return 440 * 2 ** ((n - 69) / 12)


def kick():
    x = np.arange(int(0.35 * SR)) / SR
    f = 48 + 90 * np.exp(-x * 28)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 9)).astype(np.float32)


def clap():
    n = int(0.22 * SR); x = np.arange(n) / SR
    s = hp(rng.normal(0, 1, n), 900) * (np.exp(-x * 30) + 0.5 * np.exp(-np.maximum(0, x - 0.012) * 40) * (x > 0.012))
    return lp(s, 6000).astype(np.float32)


def hat(open_=False):
    n = int((0.18 if open_ else 0.05) * SR); x = np.arange(n) / SR
    return (hp(rng.normal(0, 1, n), 7000) * np.exp(-x * (18 if open_ else 90))).astype(np.float32)


def bass(f, L):
    x = np.arange(int(L * SR)) / SR
    s = np.sin(2 * np.pi * f * x) + 0.35 * np.sin(2 * np.pi * 2 * f * x)
    return (lp(s, 600) * np.minimum(1, x / 0.01) * np.exp(-x * 2.2)).astype(np.float32)


def marimba(f):
    x = np.arange(int(0.7 * SR)) / SR
    s = np.sin(2 * np.pi * f * x) + 0.25 * np.sin(2 * np.pi * 4 * f * x) * np.exp(-x * 30)
    return (s * np.minimum(1, x / 0.003) * np.exp(-x * 7)).astype(np.float32)


def keys(fs, L):
    x = np.arange(int(L * SR)) / SR
    s = sum(np.sin(2 * np.pi * f * x) + 0.2 * np.sin(2 * np.pi * 2 * f * x) for f in fs)
    return (lp(s, 2200) * np.minimum(1, x / 0.01) * np.exp(-x * 1.6) * 0.3).astype(np.float32)


if STYLE == "cool":                     # Am - F - C - G, etwas lässiger
    PROG = [(57, [69, 72, 76]), (53, [69, 72, 77]), (48, [67, 72, 76]), (55, [67, 71, 74])]
else:                                   # C - G - Am - F, verspielt
    PROG = [(48, [72, 76, 79]), (55, [71, 74, 79]), (57, [72, 76, 81]), (53, [72, 77, 81])]

bar = 4 * beat
nb = int(DUR / bar) + 1
for b in range(nb):
    t0 = b * bar
    root, chord = PROG[b % 4]
    place(t0, keys([hz(n - 12) for n in chord], bar), 0.25)
    for k in range(4):
        tb = t0 + k * beat
        place(tb, kick(), 0.9 if k in (0, 2) else 0.0)
        if k in (1, 3):
            place(tb, clap(), 0.35)
        place(tb, hat(), 0.12, 0.3); place(tb + beat / 2, hat(k == 3), 0.09, 0.3)
        place(tb, bass(hz(root - 12 + (7 if k == 3 and b % 2 else 0)), beat * 0.95), 0.55)
    # Marimba: 8tel-Arpeggio mit kleinen Pausen
    pat = [0, 1, 2, 1, 0, 2, 1, None] if b % 2 == 0 else [2, 1, 0, None, 1, 2, 0, 1]
    for k, idx in enumerate(pat):
        if idx is None:
            continue
        place(t0 + k * beat / 2, marimba(hz(chord[idx])), 0.28, pan=0.25 * np.sin(k))

# Sidechain-Pumpen auf alles außer Kick (dezent) und weicher Limiter
env = np.ones(N, np.float32)
for b in range(int(DUR / beat) + 1):
    i = int(b * beat * SR); L = int(0.18 * SR)
    if i < N:
        j = min(N, i + L)
        env[i:j] = np.minimum(env[i:j], 0.7 + 0.3 * np.linspace(0, 1, j - i))
mix *= env[:, None]
mix = np.tanh(mix / (np.abs(mix).max() + 1e-6) * 1.6) * 0.8
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())
print("Musik geschrieben:", out, f"{DUR:.1f}s @ {BPM:.0f} BPM ({STYLE})")
