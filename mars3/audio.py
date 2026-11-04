"""Ton für „Rotanien – Tag 3“: Stimme + Effekte -> build/audio.wav (Musik danach über tools/mix_music.py)."""
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


# Landung, Zähler, Karte
place(EV["land"], roar(EV["count"][1] - EV["land"] + 0.6), 0.3)
place(EV["count"][1] + 0.3, thud(), 0.6)
a, b = EV["count"]
for k in range(26):
    place(a + (b - a) * (k / 25) ** 0.6, tick(1200 + 30 * k), 0.22)
place(b, ding(2093), 0.35)
place(EV["e630"], thud(), 0.6); place(EV["e630"], ding(1760), 0.3)
place(EV["card"], pop(600), 0.45)
for i, t in enumerate(EV["pops"]):
    place(t, pop(650 + 40 * (i % 4)), 0.45)
for t in EV["dings"]:
    place(t, ding(1976), 0.35)
for t in EV["confetti"]:
    place(t, bp(rng.normal(0, 1, int(0.5 * SR)), 2000, 9000) * env(int(0.5 * SR), 0.005, 0.12), 0.35); place(t, ding(2093), 0.2)
# Laserschwert: Zisch + Brummen
n = int(1.0 * SR); x = np.arange(n) / SR
place(EV["sword"], (np.sin(2 * np.pi * 110 * x + 3 * np.sin(2 * np.pi * 6 * x)) * 0.5 + bp(rng.normal(0, 1, n), 1500, 6000) * 0.3) * env(n, 0.02, 0.5), 0.5)
# Ente: Quak
n = int(0.25 * SR); x = np.arange(n) / SR
q = bp(np.sign(np.sin(2 * np.pi * (520 - 300 * x) * x)), 600, 2400) * np.sin(np.pi * x / x[-1])
place(EV["duck"] + 0.1, q, 0.5); place(EV["duck"] + 0.4, q, 0.4)
# Nacht: Alarm + Funk-Rauschen
for k in range(4):
    n = int(0.45 * SR); x = np.arange(n) / SR
    place(EV["night"] + 0.2 + k * 0.55, np.sin(2 * np.pi * (700 + 300 * x / x[-1]) * x) * np.sin(np.pi * x / x[-1]) * 0.6, 0.35)
place(EV["funk"], bp(rng.normal(0, 1, int(0.6 * SR)), 1500, 5000) * env(int(0.6 * SR), 0.01, 0.2), 0.4)
# UFO-Flotte: tiefer Wobble
n = int(2.0 * SR); x = np.arange(n) / SR
place(EV["ufos"] - 0.6, np.sin(2 * np.pi * (180 + 40 * np.sin(2 * np.pi * 5 * x)) * x) * np.minimum(1, x / 0.4) * np.minimum(1, (2 - x) / 0.5), 0.3)
for t in EV["whooshes"]:
    place(t, whoosh(), 0.3)

raw = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(HERE, "build", "voice.wav"), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
voice = np.frombuffer(raw, np.float32).copy()
voice = voice / (np.abs(voice).max() + 1e-9)
# Alien-Funk: Ringmodulation + Bandpass + leichtes Echo
a0, a1 = int((EV["alien"][0] - 0.08) * SR), int((EV["alien"][1] - 0.1) * SR)
seg = voice[a0:a1]; x = np.arange(len(seg)) / SR
al = bp(seg * (0.55 + 0.45 * np.sin(2 * np.pi * 55 * x)), 250, 3200)
al = al + 0.35 * np.concatenate([np.zeros(int(0.09 * SR)), al[:-int(0.09 * SR)]])
al = al / (np.abs(al).max() + 1e-9) * np.abs(seg).max()
fade = np.minimum(1, np.minimum(x, x[-1] - x) / 0.03)
voice[a0:a1] = seg * (1 - fade) + al * fade
fx = fx / (np.abs(fx).max() + 1e-9) * 0.35
mixd = fx.copy(); mixd[: min(N, len(voice))] += voice[:N]
mixd = mixd / (np.abs(mixd).max() + 1e-9) * 0.9
with wave.open(os.path.join(HERE, "build", "audio.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.repeat(mixd[:, None], 2, 1) * 32767).astype(np.int16).tobytes())

# Musik: fröhlich bis zur Nacht, dann düster (Überblendung 0,8 s)
def read(p):
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(r, np.float32).reshape(-1, 2)
day, dark = read(os.path.join(HERE, "build", "music_day.wav")), read(os.path.join(HERE, "build", "music_dark.wav"))
def lufs_norm(x):
    return x / (np.sqrt((x ** 2).mean()) + 1e-9) * 0.12
day, dark = lufs_norm(day), lufs_norm(dark)
m = np.zeros((N, 2), np.float32)
tn, xf = int((EV["night"] - 0.3) * SR), int(0.8 * SR)
d = day[:min(len(day), tn + xf)]; m[:len(d)] += d * np.clip((tn + xf - np.arange(len(d))) / xf, 0, 1)[:, None]
dk = dark[: N - tn]; m[tn:tn + len(dk)] += dk * np.clip(np.arange(len(dk)) / xf, 0, 1)[:, None]
with wave.open(os.path.join(HERE, "build", "music.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(m / (np.abs(m).max() + 1e-9) * 0.9, -1, 1) * 32767).astype(np.int16).tobytes())
print("audio.wav + music.wav", EV["duration"], "s")
