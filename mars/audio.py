"""Ton für „Rotanien“: Stimme + Effekte -> build/audio.wav (Musik danach über tools/mix_music.py)."""
import json, os, subprocess, wave
import numpy as np
from scipy.signal import lfilter, butter

HERE = os.path.dirname(os.path.abspath(__file__))
EV = json.load(open(os.path.join(HERE, "build", "events.json")))
SR = 44100
N = int(EV["duration"] * SR)
fx = np.zeros(N, np.float32)
rng = np.random.default_rng(4)


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


land = EV["land"]
n = int(land * SR); x = np.arange(n) / SR
place(0, lp(rng.normal(0, 1, n), 500) * np.minimum(1, x / 0.3) * 0.8, 0.5)   # Raketentriebwerk
place(land, thud(), 0.9)
place(land + 0.05, bp(rng.normal(0, 1, int(1.0 * SR)), 300, 2000) * env(int(1.0 * SR), 0.01, 0.35), 0.4)
place(EV["astro"], pop(600), 0.5)
for i, t in enumerate(EV["pops"]):
    place(t, pop(650 + 40 * (i % 4)), 0.45)
for t in EV["check"]:
    place(t, ding(1760), 0.3)
place(EV["flag"], thud(), 0.5)
for t in EV["confetti"]:
    place(t, bp(rng.normal(0, 1, int(0.5 * SR)), 2000, 9000) * env(int(0.5 * SR), 0.005, 0.12), 0.35); place(t, ding(2093), 0.2)
place(EV["stamp"], thud(), 0.55)
for k in range(10):
    place(EV["crowd"] + k * 0.06, pop(900 + 50 * k), 0.12)
place(EV["book"], whoosh(0.3), 0.3); place(EV["open"], bp(rng.normal(0, 1, int(0.25 * SR)), 1500, 6000) * env(int(0.25 * SR), 0.01, 0.06), 0.4)
place(EV["cross"], whoosh(0.25), 0.4); place(EV["cross"] + 0.12, whoosh(0.25), 0.4)
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
