"""Ton für „Rotanien – Tag 4“: Stimme + Effekte -> build/audio.wav (Musik danach über tools/mix_music.py)."""
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


def boom():
    n = int(1.0 * SR); x = np.arange(n) / SR
    return np.sin(2 * np.pi * (38 + 70 * np.exp(-x * 14)) * x) * env(n, 0.002, 0.3) + lp(rng.normal(0, 1, n), 2500) * env(n, 0.001, 0.06) * 0.5
def cheer(L=1.6):
    n = int(L * SR); x = np.arange(n) / SR
    c = bp(rng.normal(0, 1, n), 400, 3500) * (1 + 0.5 * lp(rng.normal(0, 1, n), 6)) * np.minimum(1, x / 0.15) * np.minimum(1, (L - x) / 0.6)
    return c
def clank():
    n = int(0.5 * SR); x = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * f * x) for f in (523, 1187, 2011)) / 3 * env(n, 0.001, 0.12) + bp(rng.normal(0, 1, n), 1000, 5000) * env(n, 0.001, 0.02)
def zap():
    n = int(0.35 * SR); x = np.arange(n) / SR
    f = 2200 * np.exp(-x * 9) + 200
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.15)
def siren(L):
    n = int(L * SR); x = np.arange(n) / SR
    f = 650 + 350 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.9 * x))
    return np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.4 * np.minimum(1, x / 0.1) * np.minimum(1, (L - x) / 0.3)
def cluck():
    n = int(0.12 * SR); x = np.arange(n) / SR
    return bp(np.sign(np.sin(2 * np.pi * (900 - 2000 * x) * x)), 700, 3000) * np.sin(np.pi * x / x[-1])
def boing():
    n = int(0.5 * SR); x = np.arange(n) / SR
    return np.sin(2 * np.pi * (180 + 120 * np.sin(2 * np.pi * 9 * x) * np.exp(-x * 5)) * x) * env(n, 0.002, 0.2)
def zip_():
    n = int(0.4 * SR); x = np.arange(n) / SR
    return bp(rng.normal(0, 1, n), 2000, 7000) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 60 * x))) * np.sin(np.pi * x / x[-1])

place(EV["poll"], pop(650), 0.45); place(EV["poll"] + 0.25, whoosh(0.6), 0.2)
place(EV["fight"], boom(), 0.5); place(EV["fight"], cheer(1.4), 0.35)
a, b = EV["count"]
place(a - 0.1, roar(b - a + 0.6), 0.25)
for k in range(24):
    place(a + (b - a) * (k / 23) ** 0.6, tick(1200 + 30 * k), 0.22)
place(b, ding(2093), 0.35)
place(EV["card"], pop(600), 0.45); place(EV["card"] + 0.5, thud(), 0.5)
place(EV["together"], cheer(1.8), 0.4)
for k in range(10):
    place(EV["ausbau"] + 0.1 + k * 0.08, pop(700 + 40 * k), 0.18)
for t in EV["builds"]:
    place(t, boom(), 0.5); place(t + 0.05, clank(), 0.4); place(t + 0.18, clank(), 0.25)
for t in EV["comments"]:
    place(t, pop(700), 0.4)
place(EV["wishes"][0], boing(), 0.45); place(EV["wishes"][0] + 0.15, ding(1976), 0.3)
for k in range(3): place(EV["wishes"][1] + k * 0.16, cluck(), 0.45)
place(EV["wishes"][1] + 0.15, ding(1976), 0.3)
place(EV["wishes"][2], zip_(), 0.45); place(EV["wishes"][2] + 0.15, ding(1976), 0.3)
# Schild: Hochfahren
n = int(1.4 * SR); x = np.arange(n) / SR
place(EV["shieldOn"], np.sin(2 * np.pi * np.cumsum(80 + 500 * (x / x[-1]) ** 2) / SR) * np.minimum(1, x / 0.2) * np.exp(-np.maximum(0, x - 1.1) * 8) * 0.6, 0.5)
place(EV["shieldOn"] + 0.2, boom(), 0.5)
n = int((EV["cd"][1] - EV["shieldOn"]) * SR); x = np.arange(n) / SR
place(EV["shieldOn"] + 0.6, np.sin(2 * np.pi * 110 * x) * 0.08 + np.sin(2 * np.pi * 220.5 * x) * 0.04, 1.0)   # Schild summt leise
place(EV["shieldTitle"], pop(800), 0.4)
place(EV["banner"][0], pop(650), 0.4); place(EV["banner"][1], cheer(2.0), 0.45)
# Countdown + Alarm
c0, c1 = EV["cd"]
for k in range(3): place(c0 + k * (c1 - c0) / 3, tick(1800), 0.5)
place(EV["alarm"], boom(), 0.6); place(EV["alarm"], siren(EV["lasers"][0] - EV["alarm"] + 0.5), 0.3)
n = int(3.0 * SR); x = np.arange(n) / SR
place(EV["fleet"], np.sin(2 * np.pi * (90 + 20 * np.sin(2 * np.pi * 4 * x)) * x) * np.minimum(1, x / 0.6) * np.minimum(1, (3 - x) / 0.8), 0.35)
for t in EV["lasers"]:
    place(t, zap(), 0.5); place(t + 0.1, boom(), 0.55)
n = int(1.2 * SR)
place(EV["bebt"], lp(rng.normal(0, 1, n), 120) * env(n, 0.01, 0.5) * 2, 0.6)        # Rumpeln
place(EV["flicker"], bp(rng.normal(0, 1, int(0.7 * SR)), 80, 400) * (np.sin(2 * np.pi * 28 * np.arange(int(0.7 * SR)) / SR) > 0), 0.35)
place(EV["holds"], ding(1568), 0.3)
# Funkspruch
place(EV["funkMsg"], bp(rng.normal(0, 1, int(0.6 * SR)), 1500, 5000) * env(int(0.6 * SR), 0.01, 0.2), 0.4)
def beep():
    n = int(0.12 * SR); return np.sin(2 * np.pi * 1400 * np.arange(n) / SR) * env(n, 0.002, 0.05)
for t in (EV["alien"][0] - 0.12, EV["alien"][1] - 0.05):
    place(t, beep(), 0.35)
n = int((EV["alien"][1] - EV["alien"][0]) * SR)
place(EV["alien"][0], bp(rng.normal(0, 1, n), 1500, 6000) * 0.08, 1.0)
place(EV["niemals"], boom(), 0.7); place(EV["niemals"] + 0.05, cheer(2.2), 0.55)
place(EV["plan"], pop(650), 0.4); place(EV["top"], pop(750), 0.4); place(EV["top"] + 0.25, ding(2093), 0.3)
for t in EV["whooshes"]:
    place(t, whoosh(), 0.3)

raw = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(HERE, "build", "voice.wav"), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
voice = np.frombuffer(raw, np.float32).copy()
voice = voice / (np.abs(voice).max() + 1e-9)
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

# Musik: fröhlich bis zum Schild, dann „Heroic Age“ (Kevin MacLeod, CC BY 4.0) ab Sekunde 44
def read(p):
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(r, np.float32).reshape(-1, 2)
day = read(os.path.join(HERE, "build", "music_day117.wav"))
hero = read(os.path.join(HERE, "build", "heroic_age.mp3"))[int(44 * SR):]
def norm(x): return x / (np.sqrt((x ** 2).mean()) + 1e-9) * 0.12
day, hero = norm(day), norm(hero) * 1.1
m = np.zeros((N, 2), np.float32)
tn, xf = int((EV["shieldOn"] - 0.1) * SR), int(0.35 * SR)
d = day[:min(len(day), tn + xf)]; m[:len(d)] += d * np.clip((tn + xf - np.arange(len(d))) / xf, 0, 1)[:, None]
hk = hero[: N - tn]; m[tn:tn + len(hk)] += hk * np.clip(np.arange(len(hk)) / xf, 0, 1)[:, None]
end = N - int(0.8 * SR); m[end:] *= np.linspace(1, 0, N - end)[:, None]
with wave.open(os.path.join(HERE, "build", "music.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(m / (np.abs(m).max() + 1e-9) * 0.9, -1, 1) * 32767).astype(np.int16).tobytes())
print("audio.wav + music.wav", EV["duration"], "s")
