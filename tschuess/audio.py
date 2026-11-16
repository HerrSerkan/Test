"""Tonspur für "Wenn ihr Tschüss sagt und dann in dieselbe Richtung geht": nur Soundeffekte (synthetisch).

Liest build/events.json (node render.js --events) -> schreibt build/audio.wav (Stereo).
"""
import json
import os
import wave

import numpy as np
from scipy.ndimage import maximum_filter1d, minimum_filter1d
from scipy.signal import butter, lfilter

HERE = os.path.dirname(os.path.abspath(__file__))
B = os.path.join(HERE, "build")
SR = 44100
EV = json.load(open(os.path.join(B, "events.json")))
DUR = EV["duration"]
N = int(DUR * SR)
rng = np.random.default_rng(12)
out = np.zeros((N, 2), np.float32)


def band(x, lo, hi):
    b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], "band")
    return lfilter(b, a, x)


def low(x, f):
    b, a = butter(2, f / (SR / 2))
    return lfilter(b, a, x)


def place(t0, sig, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N or i + len(sig) <= 0:
        return
    j = min(N, i + len(sig))
    s = sig[: j - i] * gain
    out[i:j, 0] += s * (1 - max(0, pan))
    out[i:j, 1] += s * (1 + min(0, pan))


def env(n, a, d):
    x = np.arange(n) / SR
    return np.minimum(1, x / max(a, 1e-4)) * np.exp(-x * d)


def glide(f0, f1, L, d=8, harm=(1, 0.25, 0.1)):
    n = int(L * SR)
    ph = 2 * np.pi * np.cumsum(np.geomspace(f0, f1, n)) / SR
    s = sum(g * np.sin(ph * (k + 1)) for k, g in enumerate(harm))
    return (s * env(n, 0.003, d)).astype(np.float32)


def pop():
    return glide(950, 320, 0.09, 30, (1, 0.2))


def blip(f):
    return glide(f, f * 1.08, 0.07, 28, (1, 0.45, 0.15))


def step():
    n = int(0.07 * SR)
    return (low(rng.normal(0, 1, n), 1500) * env(n, 0.001, 70)).astype(np.float32)


def swish(L=0.22):
    n = int(L * SR)
    x = np.arange(n) / SR
    return (band(rng.normal(0, 1, n), 1500, 7000) * np.sin(np.pi * x / L) ** 2).astype(np.float32)


def whoosh(L, lo, hi):
    n = int(L * SR)
    x = np.arange(n) / SR
    return (band(rng.normal(0, 1, n), lo, hi) * np.sin(np.pi * x / L) ** 2 * 1.4).astype(np.float32)


def squeak():
    return glide(1700, 2700, 0.11, 18, (1, 0.3))


def bonk():
    n = int(0.6 * SR)
    x = np.arange(n) / SR
    s = np.sin(2 * np.pi * np.cumsum(180 + 260 * np.exp(-x * 9) + 25 * np.sin(2 * np.pi * 14 * x)) / SR) * env(n, 0.002, 6)
    s += band(rng.normal(0, 1, n), 600, 2500) * env(n, 0.0005, 60) * 0.8
    return s.astype(np.float32)


def chirp(f):
    return glide(f, f * 1.5, 0.06, 25, (1, 0.1))


def boom(L=1.2):
    n = int(L * SR)
    x = np.arange(n) / SR
    s = np.sin(2 * np.pi * np.cumsum(40 + 80 * np.exp(-x * 8)) / SR) * env(n, 0.002, 3)
    s += low(rng.normal(0, 1, n), 600) * env(n, 0.001, 14) * 0.5
    return s.astype(np.float32)


def stab(L=1.0):
    n = int(L * SR)
    x = np.arange(n) / SR
    s = np.zeros(n)
    for f in (220, 233.1, 311.1, 440):
        ph = 2 * np.pi * f * x
        s += np.sign(np.sin(ph)) * 0.3 + np.sin(2 * ph) * 0.2
    return (low(s, 2500) * env(n, 0.004, 3.2) * 0.5).astype(np.float32)


def chime(f, L=1.4):
    n = int(L * SR)
    x = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * m * x) * np.exp(-x * d) * g for m, d, g in [(1, 2.5, 0.6), (2.01, 4, 0.2), (3.0, 6, 0.1)])
    return (s * np.minimum(1, x / 0.004)).astype(np.float32)


def breath(L=0.8):
    n = int(L * SR)
    x = np.arange(n) / SR
    return (band(rng.normal(0, 1, n), 350, 2000) * np.sin(np.pi * x / L) ** 1.5 * np.exp(-x * 1.5)).astype(np.float32)


# ---------------------------------------------------------------- Schritte
for a, b, pace in EV["walks"]:
    tt, k = a, 0
    while tt < b:
        place(tt, step(), 0.24, pan=-0.3 if k % 2 else 0.3)
        tt += 0.2 / pace
        k += 1
# Kamera-Zoom
for tz in EV["zoom"]:
    place(tz - 0.05, whoosh(0.4, 300, 2500), 0.18)

# Ausweichen: Wisch + Turnschuh-Quietschen
for i, td in enumerate(EV["dodges"]):
    place(td, swish(), 0.22, pan=-0.2)
    place(td + 0.03, swish(), 0.18, pan=0.2)
    place(td + 0.12, squeak(), 0.05 if i % 2 else 0.07, pan=rng.uniform(-0.3, 0.3))

# Sprechblasen: Plopp + kleines Geplapper (keine Stimme)
for b in EV["bubbles"]:
    pan = -0.25 if b["who"] == "y" else (0.25 if b["who"] == "o" else 0)
    if b["thought"]:
        place(b["t"], chime(880 if b["who"] != "both" else 587), 0.08, pan)
        place(b["t"] + 0.08, chime(1318.5), 0.05, pan)
        continue
    place(b["t"], pop(), 0.25, pan)
    base = 520 if b["who"] == "y" else 400
    for k in range(int(rng.integers(3, 7))):
        place(b["t"] + 0.08 + k * 0.075, blip(base * rng.uniform(0.85, 1.35)), 0.06, pan)

# Peinlichkeits-Balken
for m in EV["meter"]:
    if m["v"] > 150:
        continue
    f = 400 + m["v"] * 9
    place(m["t"], glide(f * (0.9 if m["up"] else 1.1), f, 0.08, 22, (1, 0.3)), 0.06 if m["up"] else 0.05)

# Zusammenstoß
place(EV["bump"], bonk(), 0.35)
for k in range(9):
    place(EV["bump"] + 0.15 + k * 0.09, chirp(rng.uniform(2600, 3600)), 0.05, pan=rng.uniform(-0.4, 0.4))
# "Nach dir"-Geste
for a, b in EV["waves"]:
    place(a, swish(0.3), 0.13, pan=0.2)
# Erleichterung
place(14.25, breath(), 0.15, pan=-0.2)

# Neuer Passant: Schock
fl = EV["flash"]
place(fl, boom(), 0.5)
place(fl, stab(), 0.32)
for k in range(8):
    place(fl + 0.25 + k * 0.11, glide(1650, 1650, 0.06, 20, (1, 0.5)), 0.07)
for k, tw in enumerate((fl + 0.47, fl + 0.77, fl + 1.07)):
    place(tw, boom(0.6), 0.3)
    place(tw, glide(300 - k * 30, 280 - k * 30, 0.4, 7, (1, 0.5, 0.25)), 0.12)

# Plattenkratzer: Musik bricht beim rosa Blitz ab
n = int(0.32 * SR)
x = np.arange(n) / SR
scr = band(rng.normal(0, 1, n), 600, 6000) * np.abs(np.sin(2 * np.pi * np.cumsum(np.linspace(24, 6, n)) / SR)) * np.sin(np.pi * x / 0.32)
place(fl - 0.3, scr.astype(np.float32), 0.35)
place(fl - 0.3, glide(900, 120, 0.3, 4, (1, 0.5)), 0.12)

t_ = np.arange(N) / SR
END_ENV = np.clip((DUR - t_) / 0.4, 0, 1).astype(np.float32)
MUSIC_ENV = (np.minimum(1, t_ / 0.1) * np.clip((fl - 0.02 - t_) / 0.04, 0, 1)).astype(np.float32)
MUSIC_LUFS = -17.5

# ---------------------------------------------------------------- Ausgabe: Effekte + Hintergrundmusik
import re
import subprocess
from scipy.ndimage import maximum_filter1d, minimum_filter1d

t = np.arange(N) / SR
TMP = os.path.join(B, "audio_tmp.wav")


def write(path, x):
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())


def lufs(x):
    write(TMP, x)
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", TMP, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", r)[-1])


def limit(x, ceil=0.8):
    pk = maximum_filter1d(np.abs(x).max(1), int(0.006 * SR))
    g = minimum_filter1d(np.minimum(1, ceil / (pk + 1e-9)), int(0.006 * SR))
    g = lfilter([0.004], [1, -0.996], g - 1) + 1
    return x * np.minimum(g, np.minimum(1, ceil / (pk + 1e-9)))[:, None]


def to_lufs(x, target, lim=True):
    gdb = 0.0
    for _ in range(4):
        y = x * 10 ** (gdb / 20)
        gdb += target - lufs(limit(y) if lim else y)
    y = x * 10 ** (gdb / 20)
    return limit(y) if lim else y


# Effekte allein auf -16 LUFS
sfx = out / (np.abs(out).max() + 1e-6)
sfx = to_lufs(sfx, -16.0)
# Hintergrundmusik (ElevenLabs Music, build/music.mp3) etwas leiser darunter
MUSIC = os.path.join(B, "music.mp3")
music = np.zeros((N, 2), np.float32)
if os.path.exists(MUSIC):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", MUSIC, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    m = np.frombuffer(raw, np.float32).reshape(-1, 2)[:N]
    music[: len(m)] = m
    music *= MUSIC_ENV[:, None]
    music = to_lufs(music, MUSIC_LUFS, lim=False)
mix = sfx + music
mix *= END_ENV[:, None]
mix = to_lufs(mix, -14.0)                  # gesamt exakt -14 LUFS (EBU R128), Spitzen unter -2 dBFS
os.remove(TMP)
write(os.path.join(B, "audio.wav"), mix)
print("audio.wav geschrieben:", DUR, "s")
