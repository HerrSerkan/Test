"""Ton für „Rotanien – Tag 2“: Stimme + Effekte -> build/audio.wav (Musik danach über tools/mix_music.py)."""
import json, os, subprocess, wave
import numpy as np
from scipy.signal import lfilter, butter

HERE = os.path.dirname(os.path.abspath(__file__))
EV = json.load(open(os.path.join(HERE, "build", "events.json")))
SR = 44100
N = int(EV["duration"] * SR)
fx = np.zeros(N, np.float32)
rng = np.random.default_rng(5)


def bp(x, lo, hi):
    b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], btype="band"); return lfilter(b, a, x)


def lp(x, fc):
    b, a = butter(2, fc / (SR / 2)); return lfilter(b, a, x)


def env(n, a, d):
    x = np.arange(n) / SR
    return np.minimum(1, x / max(a, 1e-4)) * np.exp(-x / d)


def place(t0, sig, g=1.0):
    i = int(t0 * SR)
    if i >= N or i < 0: return
    j = min(N, i + len(sig)); fx[i:j] += sig[: j - i] * g


def pop(f=700):
    n = int(0.12 * SR); x = np.arange(n) / SR
    return np.sin(2 * np.pi * (f + 900 * np.exp(-x * 40)) * x) * env(n, 0.002, 0.035)


def ding(f=1568):
    n = int(0.7 * SR); x = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * x) + 0.5 * np.sin(2 * np.pi * f * 2.01 * x)) * env(n, 0.002, 0.18)


def whoosh(L=0.4):
    n = int(L * SR); x = np.arange(n) / SR
    return bp(rng.normal(0, 1, n), 400, 3500) * np.sin(np.pi * x / L) ** 2


def thud():
    n = int(0.6 * SR); x = np.arange(n) / SR
    return np.sin(2 * np.pi * (45 + 60 * np.exp(-x * 15)) * x) * env(n, 0.003, 0.18) + lp(rng.normal(0, 1, n), 900) * env(n, 0.002, 0.08) * 0.6


def roar(L):
    n = int(L * SR); x = np.arange(n) / SR
    return lp(rng.normal(0, 1, n), 600) * np.minimum(1, x / 0.3) * np.minimum(1, (L - x) / 0.4)


def tick(f):
    n = int(0.05 * SR)
    return np.sin(2 * np.pi * f * np.arange(n) / SR) * env(n, 0.001, 0.012)


# Raketen im Anflug und Landung
place(EV["rockets"], roar(EV["land"] - EV["rockets"]), 0.35)
place(EV["land"], thud(), 0.9); place(EV["land"] + 0.15, thud(), 0.6)
# Zähler +0 … +18
a, b = EV["count"]
for k in range(19):
    place(a + (b - a) * (k / 18) ** 0.6, tick(1200 + 40 * k), 0.25)
place(b, ding(2093), 0.35)
place(EV["card"], pop(600), 0.45)
place(EV["nur1"], thud(), 0.5)
place(EV["drei"], pop(800), 0.45)
for i, t in enumerate(EV["pops"]):
    place(t, pop(650 + 40 * (i % 4)), 0.45)
for t in EV["confetti"]:
    place(t, bp(rng.normal(0, 1, int(0.5 * SR)), 2000, 9000) * env(int(0.5 * SR), 0.005, 0.12), 0.35); place(t, ding(2093), 0.2)
place(EV["launch"], roar(1.6), 0.6); place(EV["launch"], thud(), 0.5)
place(EV["hat"], ding(1760), 0.35); place(EV["bag"], ding(1976), 0.35)
place(EV["gone"], thud(), 0.4)
for k in range(10):
    place(EV["tracks"] + k * 0.12, lp(rng.normal(0, 1, int(0.08 * SR)), 700) * env(int(0.08 * SR), 0.002, 0.02), 0.5)
n = int(1.2 * SR); x = np.arange(n) / SR
place(EV["crater"], np.sin(2 * np.pi * (70 + 8 * np.sin(2 * np.pi * 3 * x)) * x) * env(n, 0.05, 0.5), 0.5)   # Knurren
for t in EV["whooshes"]:
    place(t, whoosh(), 0.3)

raw = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(HERE, "build", "voice.wav"), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
voice = np.frombuffer(raw, np.float32)
voice = voice / (np.abs(voice).max() + 1e-9)
fx = fx / (np.abs(fx).max() + 1e-9) * 0.35
mixd = fx.copy(); mixd[: min(N, len(voice))] += voice[:N]
mixd = mixd / (np.abs(mixd).max() + 1e-9) * 0.9
with wave.open(os.path.join(HERE, "build", "audio.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.repeat(mixd[:, None], 2, 1) * 32767).astype(np.int16).tobytes())
print("audio.wav", EV["duration"], "s")
